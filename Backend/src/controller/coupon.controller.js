import mongoose from "mongoose";
import Coupon from "../models/coupon.model.js";
import Booking from "../models/booking.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

// ---------- Admin: List ----------
const adminListCoupons = asyncHandler(async (req, res) => {
  const { search, isActive } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 20));

  const filter = {};

  if (typeof search === "string" && search.trim()) {
    const term = search.trim().toUpperCase();
    // Match code containing the term (codes are uppercase). Escape regex specials.
    const escaped = term.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    filter.code = { $regex: escaped, $options: "i" };
  }

  if (isActive !== undefined) {
    if (isActive === "true") filter.isActive = true;
    else if (isActive === "false") filter.isActive = false;
  }

  const total = await Coupon.countDocuments(filter);
  const items = await Coupon.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      { items, total, page, pageCount },
      "Coupons fetched successfully"
    )
  );
});

// ---------- Admin: Create ----------
const adminCreateCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    type,
    value,
    minTotal,
    maxDiscount,
    validFrom,
    validUntil,
    usageLimit,
    firstBookingOnly,
    isActive,
  } = req.body || {};

  if (!code || typeof code !== "string" || !code.trim()) {
    throw new ApiError(400, "code is required");
  }
  if (!type || !["percent", "flat"].includes(type)) {
    throw new ApiError(400, "type must be 'percent' or 'flat'");
  }
  if (value === undefined || value === null || typeof value !== "number" || Number.isNaN(value)) {
    throw new ApiError(400, "value is required and must be a number");
  }

  if (type === "percent") {
    if (!(value > 0 && value <= 100)) {
      throw new ApiError(400, "percent value must be between 0 (exclusive) and 100");
    }
  } else if (type === "flat") {
    if (!(value > 0)) {
      throw new ApiError(400, "flat value must be greater than 0");
    }
  }

  const normalizedCode = code.trim().toUpperCase();

  const existing = await Coupon.findOne({ code: normalizedCode });
  if (existing) {
    throw new ApiError(409, "A coupon with this code already exists");
  }

  const doc = {
    code: normalizedCode,
    type,
    value,
  };

  if (minTotal !== undefined && minTotal !== null) {
    if (typeof minTotal !== "number" || minTotal < 0) {
      throw new ApiError(400, "minTotal must be a non-negative number");
    }
    doc.minTotal = minTotal;
  }
  if (maxDiscount !== undefined && maxDiscount !== null) {
    if (typeof maxDiscount !== "number" || maxDiscount < 0) {
      throw new ApiError(400, "maxDiscount must be a non-negative number");
    }
    doc.maxDiscount = maxDiscount;
  }
  if (validFrom !== undefined && validFrom !== null && validFrom !== "") {
    const d = new Date(validFrom);
    if (Number.isNaN(d.getTime())) {
      throw new ApiError(400, "validFrom must be a valid date");
    }
    doc.validFrom = d;
  }
  if (validUntil !== undefined && validUntil !== null && validUntil !== "") {
    const d = new Date(validUntil);
    if (Number.isNaN(d.getTime())) {
      throw new ApiError(400, "validUntil must be a valid date");
    }
    doc.validUntil = d;
  }
  if (doc.validFrom && doc.validUntil && doc.validFrom > doc.validUntil) {
    throw new ApiError(400, "validFrom cannot be after validUntil");
  }
  if (usageLimit !== undefined && usageLimit !== null) {
    if (typeof usageLimit !== "number" || !Number.isInteger(usageLimit) || usageLimit < 1) {
      throw new ApiError(400, "usageLimit must be a positive integer");
    }
    doc.usageLimit = usageLimit;
  }
  if (firstBookingOnly !== undefined) {
    if (typeof firstBookingOnly !== "boolean") {
      throw new ApiError(400, "firstBookingOnly must be a boolean");
    }
    doc.firstBookingOnly = firstBookingOnly;
  }
  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean");
    }
    doc.isActive = isActive;
  }

  try {
    const created = await Coupon.create(doc);
    return res
      .status(201)
      .json(new ApiResponse(201, created, "Coupon created successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, "A coupon with this code already exists");
    }
    throw err;
  }
});

// ---------- Admin: Update ----------
const adminUpdateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid coupon id");
  }

  const allowed = [
    "type",
    "value",
    "minTotal",
    "maxDiscount",
    "validFrom",
    "validUntil",
    "usageLimit",
    "firstBookingOnly",
    "isActive",
  ];

  const update = {};
  const body = req.body || {};

  for (const key of allowed) {
    if (body[key] === undefined) continue;
    update[key] = body[key];
  }

  // Explicitly reject code changes to surface the issue rather than silently dropping
  if (body.code !== undefined) {
    throw new ApiError(400, "code is immutable once created");
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // Determine effective type for validation (incoming or existing)
  const existing = await Coupon.findById(id);
  if (!existing) {
    throw new ApiError(404, "Coupon not found");
  }

  const effectiveType = update.type ?? existing.type;
  if (update.type !== undefined && !["percent", "flat"].includes(update.type)) {
    throw new ApiError(400, "type must be 'percent' or 'flat'");
  }

  if (update.value !== undefined) {
    if (typeof update.value !== "number" || Number.isNaN(update.value)) {
      throw new ApiError(400, "value must be a number");
    }
    if (effectiveType === "percent") {
      if (!(update.value > 0 && update.value <= 100)) {
        throw new ApiError(400, "percent value must be between 0 (exclusive) and 100");
      }
    } else if (effectiveType === "flat") {
      if (!(update.value > 0)) {
        throw new ApiError(400, "flat value must be greater than 0");
      }
    }
  }

  if (update.minTotal !== undefined) {
    if (update.minTotal === null) {
      update.minTotal = 0;
    } else if (typeof update.minTotal !== "number" || update.minTotal < 0) {
      throw new ApiError(400, "minTotal must be a non-negative number");
    }
  }

  if (update.maxDiscount !== undefined && update.maxDiscount !== null) {
    if (typeof update.maxDiscount !== "number" || update.maxDiscount < 0) {
      throw new ApiError(400, "maxDiscount must be a non-negative number");
    }
  }

  if (update.validFrom !== undefined && update.validFrom !== null && update.validFrom !== "") {
    const d = new Date(update.validFrom);
    if (Number.isNaN(d.getTime())) {
      throw new ApiError(400, "validFrom must be a valid date");
    }
    update.validFrom = d;
  } else if (update.validFrom === "" || update.validFrom === null) {
    update.validFrom = null;
  }

  if (update.validUntil !== undefined && update.validUntil !== null && update.validUntil !== "") {
    const d = new Date(update.validUntil);
    if (Number.isNaN(d.getTime())) {
      throw new ApiError(400, "validUntil must be a valid date");
    }
    update.validUntil = d;
  } else if (update.validUntil === "" || update.validUntil === null) {
    update.validUntil = null;
  }

  if (update.usageLimit !== undefined && update.usageLimit !== null) {
    if (
      typeof update.usageLimit !== "number" ||
      !Number.isInteger(update.usageLimit) ||
      update.usageLimit < 1
    ) {
      throw new ApiError(400, "usageLimit must be a positive integer");
    }
  }

  if (update.firstBookingOnly !== undefined && typeof update.firstBookingOnly !== "boolean") {
    throw new ApiError(400, "firstBookingOnly must be a boolean");
  }
  if (update.isActive !== undefined && typeof update.isActive !== "boolean") {
    throw new ApiError(400, "isActive must be a boolean");
  }

  const coupon = await Coupon.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

// ---------- Admin: Delete (soft) ----------
const adminDeleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid coupon id");
  }

  const coupon = await Coupon.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon deactivated"));
});

// ---------- User: Validate ----------
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, baseAmount } = req.body || {};

  if (!code || typeof code !== "string" || !code.trim()) {
    throw new ApiError(400, "Invalid code");
  }
  if (
    baseAmount === undefined ||
    baseAmount === null ||
    typeof baseAmount !== "number" ||
    Number.isNaN(baseAmount) ||
    baseAmount < 0
  ) {
    throw new ApiError(400, "baseAmount must be a non-negative number");
  }

  const normalized = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: normalized });

  if (!coupon) {
    throw new ApiError(400, "Invalid code");
  }
  if (!coupon.isActive) {
    throw new ApiError(400, "Inactive");
  }

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    throw new ApiError(400, "Not yet active");
  }
  if (coupon.validUntil && now > coupon.validUntil) {
    throw new ApiError(400, "Expired");
  }

  if (
    coupon.usageLimit !== null &&
    coupon.usageLimit !== undefined &&
    coupon.usedCount >= coupon.usageLimit
  ) {
    throw new ApiError(400, "Usage limit reached");
  }

  if (baseAmount < (coupon.minTotal || 0)) {
    throw new ApiError(400, `Minimum order ₹${coupon.minTotal}`);
  }

  if (coupon.firstBookingOnly) {
    const priorBookings = await Booking.countDocuments({
      userId: req.user._id,
      status: "confirmed",
    });
    if (priorBookings > 0) {
      throw new ApiError(400, "First-booking only — you've already booked");
    }
  }

  // Compute discount
  let discount = 0;
  if (coupon.type === "percent") {
    discount = (baseAmount * coupon.value) / 100;
  } else if (coupon.type === "flat") {
    discount = coupon.value;
  }

  if (
    coupon.maxDiscount !== null &&
    coupon.maxDiscount !== undefined &&
    discount > coupon.maxDiscount
  ) {
    discount = coupon.maxDiscount;
  }
  if (discount > baseAmount) discount = baseAmount;
  if (discount < 0) discount = 0;

  // Round to 2 decimals to avoid float weirdness
  discount = Math.round(discount * 100) / 100;
  const finalTotal = Math.round((baseAmount - discount) * 100) / 100;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        valid: true,
        discount,
        finalTotal,
        code: coupon.code,
      },
      "Coupon valid"
    )
  );
});

export {
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  validateCoupon,
};
