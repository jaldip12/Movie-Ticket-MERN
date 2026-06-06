import mongoose from "mongoose";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import FnbItem from "../models/fnbItem.model.js";
import Coupon from "../models/coupon.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";
import {
  emitSeatsLocked,
  emitSeatsBooked,
  emitSeatsReleased,
} from "../utils/realtime.js";
import { deliverTicket } from "../utils/notifier.js";

const LOCK_DURATION_MS = 5 * 60 * 1000;

/**
 * Build a lookup map of "rowLetter" -> { sectionIndex, price } for the given
 * seating plan. Row letters are assigned continuously across sections in the
 * order the sections appear (mirrors the frontend `numberToLetter(previousRows + rowIndex)`
 * logic in ShowSeatingLayout). Section 0 occupies letters 0..rows-1, then
 * section 1 picks up where section 0 left off, etc.
 */
const buildRowToPriceMap = (seatingPlan) => {
  const map = new Map();
  if (!seatingPlan || !Array.isArray(seatingPlan.sections)) return map;
  let cursor = 0;
  seatingPlan.sections.forEach((section, sectionIndex) => {
    const rows = section.rows || 0;
    for (let i = 0; i < rows; i++) {
      const letter = String.fromCharCode(65 + cursor);
      map.set(letter, { sectionIndex, price: section.price || 0 });
      cursor += 1;
    }
  });
  return map;
};

/**
 * Compute the per-seat subtotal for a list of seat labels (e.g. "A5", "B12")
 * using the show's seating plan section pricing. Throws if any seat label
 * references an unknown row.
 */
const computeSeatsTotal = (seats, seatingPlan) => {
  const rowMap = buildRowToPriceMap(seatingPlan);
  let total = 0;
  for (const seat of seats) {
    const match = /^([A-Z]+)(\d+)$/.exec(seat);
    if (!match) {
      throw new ApiError(400, `Invalid seat label: ${seat}`);
    }
    const rowLetter = match[1];
    const entry = rowMap.get(rowLetter);
    if (!entry) {
      throw new ApiError(400, `Seat ${seat} does not map to any section`);
    }
    total += entry.price;
  }
  return total;
};

const createBooking = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body;

  if (!mongoose.isValidObjectId(showId)) {
    throw new ApiError(400, "Invalid showId");
  }

  if (
    !Array.isArray(seats) ||
    seats.length === 0 ||
    !seats.every((s) => typeof s === "string" && s.trim().length > 0)
  ) {
    throw new ApiError(400, "seats must be a non-empty array of non-empty strings");
  }

  const requested = seats.map((s) => s.trim());

  const show = await Show.findById(showId).populate({
    path: "screenId",
    populate: { path: "seatingPlanId" },
  });

  if (!show || !show.isActive) {
    throw new ApiError(404, "Show not found");
  }

  const now = new Date();
  const activeLocks = (show.lockedSeats || []).filter(
    (l) => l.lockedUntil && new Date(l.lockedUntil) > now
  );
  const lockedLabels = new Set(activeLocks.map((l) => l.seat));
  const bookedLabels = new Set(show.bookedSeats || []);
  const unavailable = requested.filter(
    (s) => bookedLabels.has(s) || lockedLabels.has(s)
  );

  if (unavailable.length > 0) {
    throw new ApiError(
      409,
      "Some seats are already booked: " + unavailable.join(", "),
      unavailable
    );
  }

  const seatingPlan = show.screenId?.seatingPlanId;
  const seatsTotal = computeSeatsTotal(requested, seatingPlan);

  const lockedUntil = new Date(now.getTime() + LOCK_DURATION_MS);
  const newLockEntries = requested.map((seat) => ({ seat, lockedUntil }));

  // Atomic re-check: ensure none of the requested seats appear in bookedSeats
  // or in any active lock at the moment of update. A parallel request that
  // already locked one of these seats will fail this match.
  // NOTE: bookedSeats is [String], so use $nin (not $elemMatch which only
  // applies to arrays of subdocuments). lockedSeats IS an array of subdocs,
  // so $elemMatch is correct there.
  const reserved = await Show.findOneAndUpdate(
    {
      _id: showId,
      bookedSeats: { $nin: requested },
      lockedSeats: {
        $not: {
          $elemMatch: {
            seat: { $in: requested },
            lockedUntil: { $gt: now },
          },
        },
      },
    },
    { $push: { lockedSeats: { $each: newLockEntries } } },
    { new: true }
  );

  if (!reserved) {
    throw new ApiError(
      409,
      "Some seats were just taken. Please re-select.",
      requested
    );
  }

  const booking = await Booking.create({
    userId: req.user._id,
    showId,
    seats: requested,
    seatsTotal,
    totalAmount: seatsTotal,
    status: "locked",
    lockedUntil,
  });

  emitSeatsLocked(showId, requested, lockedUntil);

  const populated = await Booking.findById(booking._id).populate("showId");

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Seats locked successfully"));
});

const confirmBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fnbItems: fnbItemsInput, couponCode } = req.body || {};

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const booking = await Booking.findById(id);
  if (!booking || booking.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== "locked") {
    throw new ApiError(400, "Only locked bookings can be confirmed");
  }

  const now = new Date();
  if (!booking.lockedUntil || new Date(booking.lockedUntil) <= now) {
    throw new ApiError(410, "Lock expired. Please re-select seats.");
  }

  const show = await Show.findById(booking.showId).populate({
    path: "screenId",
    select: "cinemaId seatingPlanId",
  });
  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  const showCinemaId = show.screenId?.cinemaId?.toString?.() || null;

  // ---- F&B handling ----
  const resolvedFnbItems = [];
  let fnbTotal = 0;

  if (Array.isArray(fnbItemsInput) && fnbItemsInput.length > 0) {
    for (const entry of fnbItemsInput) {
      const itemId = entry?.itemId;
      const quantity = Number(entry?.quantity);
      if (!mongoose.isValidObjectId(itemId)) {
        throw new ApiError(400, `Invalid fnb itemId: ${itemId}`);
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        throw new ApiError(400, "fnb quantity must be a positive number");
      }

      const item = await FnbItem.findById(itemId);
      if (!item || item.isAvailable === false) {
        throw new ApiError(400, "F&B item is not available");
      }
      if (item.cinemaId && showCinemaId && item.cinemaId.toString() !== showCinemaId) {
        throw new ApiError(400, `${item.name} is not available at this cinema`);
      }

      const lineTotal = (item.price || 0) * quantity;
      fnbTotal += lineTotal;
      resolvedFnbItems.push({
        itemId: item._id,
        name: item.name,
        price: item.price,
        quantity,
      });
    }
  }

  // ---- Coupon handling ----
  let appliedCoupon = null;
  let discount = 0;

  if (couponCode && typeof couponCode === "string" && couponCode.trim().length > 0) {
    const code = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      throw new ApiError(400, "Invalid coupon code");
    }
    if (coupon.isActive === false) {
      throw new ApiError(400, "Coupon is not active");
    }
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      throw new ApiError(400, "Coupon is not yet valid");
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      throw new ApiError(400, "Coupon has expired");
    }
    if (
      typeof coupon.usageLimit === "number" &&
      coupon.usageLimit > 0 &&
      typeof coupon.usedCount === "number" &&
      coupon.usedCount >= coupon.usageLimit
    ) {
      throw new ApiError(400, "Coupon usage limit reached");
    }
    if (coupon.firstBookingOnly) {
      const prior = await Booking.countDocuments({
        userId: req.user._id,
        status: "confirmed",
      });
      if (prior > 0) {
        throw new ApiError(400, "Coupon is only valid on your first booking");
      }
    }

    const subtotal = booking.seatsTotal + fnbTotal;

    if (typeof coupon.minTotal === "number" && coupon.minTotal > 0 && subtotal < coupon.minTotal) {
      throw new ApiError(
        400,
        `Coupon requires a minimum spend of ₹${coupon.minTotal}`
      );
    }

    if (coupon.type === "percent") {
      discount = (subtotal * (coupon.value || 0)) / 100;
    } else if (coupon.type === "flat") {
      discount = coupon.value || 0;
    } else {
      throw new ApiError(400, "Unsupported coupon type");
    }

    if (typeof coupon.maxDiscount === "number" && coupon.maxDiscount > 0) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    discount = Math.min(discount, subtotal);
    discount = Math.max(0, Math.round(discount));

    appliedCoupon = { code: coupon.code, discountAmount: discount, _id: coupon._id };
  }

  // ---- Convenience fee + GST (Indian cinema convention) ----
  // Convenience fee is a flat ₹30 per booking. GST (18%) applies to the
  // convenience fee only — never to the ticket price itself. The UI splits
  // GST into CGST 9% + SGST 9%, but we store it as a single rounded amount.
  const subtotal = Math.max(0, booking.seatsTotal + fnbTotal - discount);
  const convenienceFee = 30;
  // GST 18% on convenience fee (CGST 9% + SGST 9%). Stored to 2 decimals so
  // the per-booking total isn't off by paise when ₹30 × 0.18 = ₹5.40 rounds to 5.
  const gstAmount = Math.round(convenienceFee * 0.18 * 100) / 100;
  const finalTotal =
    Math.round((subtotal + convenienceFee + gstAmount) * 100) / 100;

  const fnbPin =
    resolvedFnbItems.length > 0
      ? String(Math.floor(1000 + Math.random() * 9000))
      : null;

  // Atomically move seats from lockedSeats -> bookedSeats. Pull any locks on
  // these seats (regardless of who locked them — should only be us, but safe)
  // and addToSet the seats to bookedSeats.
  const moved = await Show.findOneAndUpdate(
    { _id: booking.showId },
    {
      $pull: { lockedSeats: { seat: { $in: booking.seats } } },
      $addToSet: { bookedSeats: { $each: booking.seats } },
    },
    { new: true }
  );

  if (!moved) {
    throw new ApiError(500, "Failed to confirm seats");
  }

  const update = {
    status: "confirmed",
    lockedUntil: null,
    fnbItems: resolvedFnbItems,
    fnbPin,
    fnbTotal,
    couponDiscount: discount,
    convenienceFee,
    gstAmount,
    totalAmount: finalTotal,
  };

  if (appliedCoupon) {
    // Mirror the discount on both the legacy `appliedCoupon.discountAmount`
    // (kept for backwards compat with existing bookings) and the new
    // top-level `couponDiscount` field set above.
    update.appliedCoupon = {
      code: appliedCoupon.code,
      discountAmount: appliedCoupon.discountAmount,
    };
  }

  const updated = await Booking.findByIdAndUpdate(booking._id, { $set: update }, {
    new: true,
  }).populate("showId");

  if (appliedCoupon) {
    await Coupon.updateOne({ _id: appliedCoupon._id }, { $inc: { usedCount: 1 } });
  }

  emitSeatsBooked(booking.showId, booking.seats);

  // Deeply populate for the ticket logger. Wrapped — never blocks response.
  try {
    const populatedBooking = await Booking.findById(booking._id)
      .populate("userId", "firstname lastname email number phone mobile")
      .populate({
        path: "showId",
        populate: [
          { path: "movieId", select: "title" },
          {
            path: "screenId",
            select: "name cinemaId",
            populate: { path: "cinemaId", select: "name city" },
          },
        ],
      });
    deliverTicket(populatedBooking);
  } catch (err) {
    console.error("[booking] ticket population failed:", err.message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Booking confirmed successfully"));
});

const listMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate("showId");

  return res
    .status(200)
    .json(new ApiResponse(200, bookings, "Bookings fetched successfully"));
});

const getMyBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const booking = await Booking.findById(id).populate("showId");

  if (!booking || booking.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Booking not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, booking, "Booking fetched successfully"));
});

const listAllBookings = asyncHandler(async (req, res) => {
  const { showId, userId, status } = req.query;

  const filter = {};

  if (showId) {
    if (!mongoose.isValidObjectId(showId)) {
      throw new ApiError(400, "Invalid showId filter");
    }
    filter.showId = showId;
  }

  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId filter");
    }
    filter.userId = userId;
  }

  if (status) {
    if (!["pending", "locked", "confirmed", "cancelled"].includes(status)) {
      throw new ApiError(400, "Invalid status filter");
    }
    filter.status = status;
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("showId")
      .populate("userId", "email firstname lastname"),
    Booking.countDocuments(filter),
  ]);

  const pageCount = Math.ceil(total / limit) || 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { items, total, page, pageCount },
        "Bookings fetched successfully"
      )
    );
});

const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const booking = await Booking.findById(id);

  if (!booking || booking.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== "confirmed" && booking.status !== "locked") {
    throw new ApiError(400, "Only locked or confirmed bookings can be cancelled");
  }

  let updatedBooking;

  if (booking.status === "locked") {
    // Just release the lock; no transaction needed.
    await Show.updateOne(
      { _id: booking.showId },
      { $pull: { lockedSeats: { seat: { $in: booking.seats } } } }
    );

    updatedBooking = await Booking.findByIdAndUpdate(
      booking._id,
      { $set: { status: "cancelled", lockedUntil: null } },
      { new: true }
    ).populate("showId");
  } else {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await Show.updateOne(
          { _id: booking.showId },
          { $pullAll: { bookedSeats: booking.seats } },
          { session }
        );

        updatedBooking = await Booking.findByIdAndUpdate(
          booking._id,
          { $set: { status: "cancelled" } },
          { new: true, session }
        ).populate("showId");
      });
    } finally {
      await session.endSession();
    }
  }

  emitSeatsReleased(booking.showId, booking.seats);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBooking, "Booking cancelled successfully"));
});

/**
 * Admin-only ticket validation at the cinema gate. Looks up the booking by id,
 * marks it as used (sets `usedAt`) and returns the populated booking. If the
 * booking has already been validated, returns the existing record with an
 * `alreadyUsed: true` flag so the gate UI can show a warning instead of
 * mistakenly admitting the holder a second time.
 */
const validateBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.body || {};

  if (!bookingId || !mongoose.isValidObjectId(bookingId)) {
    throw new ApiError(400, "Invalid bookingId");
  }

  const booking = await Booking.findById(bookingId).populate({
    path: "showId",
    populate: [
      { path: "movieId" },
      {
        path: "screenId",
        populate: [{ path: "cinemaId" }, { path: "seatingPlanId" }],
      },
    ],
  }).populate("userId", "firstname lastname email phone");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  if (booking.status !== "confirmed") {
    throw new ApiError(
      400,
      `Booking is not confirmed (status: ${booking.status})`
    );
  }

  // Race-safe: atomic conditional update. Two concurrent scans race to the
  // same {usedAt: null} match — only one wins and gets the updated doc back;
  // the other gets null and is told it was already validated.
  const now = new Date();
  const claimed = await Booking.findOneAndUpdate(
    { _id: booking._id, usedAt: null },
    { $set: { usedAt: now } },
    { new: true }
  );

  if (!claimed) {
    // Re-read to surface the original used time
    const refreshed = await Booking.findById(booking._id).select("usedAt");
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          booking,
          alreadyUsed: true,
          usedAt: refreshed?.usedAt || booking.usedAt,
        },
        `Already validated at ${new Date(refreshed?.usedAt || booking.usedAt).toLocaleTimeString(
          "en-IN",
          { hour: "2-digit", minute: "2-digit", hour12: true }
        )}`
      )
    );
  }

  // Surface the claimed timestamp on the populated doc so the response is consistent
  booking.usedAt = claimed.usedAt;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { booking, alreadyUsed: false },
        "Booking validated successfully"
      )
    );
});

/**
 * Public, unauthenticated ticket view. Returns ONLY safe fields suitable for
 * a sharable ticket URL — no email, no phone. Intended to back the `/t/:id`
 * page in the frontend.
 */
const getPublicTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid booking id");
  }

  const booking = await Booking.findById(id)
    .populate({
      path: "showId",
      populate: [
        { path: "movieId" },
        {
          path: "screenId",
          populate: [{ path: "cinemaId" }, { path: "seatingPlanId" }],
        },
      ],
    })
    .populate("userId", "firstname lastname");

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  const show = booking.showId || {};
  const movie = show.movieId || {};
  const screen = show.screenId || {};
  const cinema = screen.cinemaId || {};
  const user = booking.userId || {};

  const safe = {
    _id: booking._id,
    status: booking.status,
    seats: booking.seats || [],
    seatsTotal: booking.seatsTotal || 0,
    fnbTotal: booking.fnbTotal || 0,
    couponDiscount: booking.couponDiscount || 0,
    convenienceFee: booking.convenienceFee || 0,
    gstAmount: booking.gstAmount || 0,
    totalAmount: booking.totalAmount,
    appliedCoupon: booking.appliedCoupon
      ? {
          code: booking.appliedCoupon.code || null,
          discountAmount: booking.appliedCoupon.discountAmount || 0,
        }
      : null,
    fnbItems: (booking.fnbItems || []).map((it) => ({
      name: it.name,
      price: it.price,
      quantity: it.quantity,
    })),
    fnbPin: booking.fnbPin || null,
    createdAt: booking.createdAt,
    usedAt: booking.usedAt || null,
    user: {
      firstname: user.firstname || null,
      lastname: user.lastname || null,
    },
    show: {
      date: show.date || null,
      time: show.time || null,
      movie: {
        title: movie.title || null,
        poster: movie.poster || null,
        certification: movie.certification || null,
      },
      cinema: {
        name: cinema.name || null,
        city: cinema.city || null,
        address: cinema.address || null,
      },
      screen: {
        name: screen.name || null,
      },
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, safe, "Ticket fetched successfully"));
});

export {
  createBooking,
  confirmBooking,
  listMyBookings,
  getMyBooking,
  listAllBookings,
  cancelBooking,
  validateBooking,
  getPublicTicket,
};
