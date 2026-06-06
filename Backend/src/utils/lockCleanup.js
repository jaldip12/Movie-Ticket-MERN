import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import { emitSeatsReleased } from "./realtime.js";

const CLEANUP_INTERVAL_MS = 60 * 1000;

/**
 * Periodically expire any "locked" bookings whose lockedUntil has passed:
 * pulls their seats off the Show.lockedSeats array, marks the booking
 * as cancelled, and clears lockedUntil. A single tick processes all
 * currently-expired locks in parallel.
 *
 * After all expired bookings have been processed, emits one `seats:released`
 * event per affected show with the union of seats released for that show.
 */
const runOnce = async () => {
  const now = new Date();
  const expired = await Booking.find({
    status: "locked",
    lockedUntil: { $lte: now },
  });

  if (expired.length === 0) return 0;

  // Aggregate released seats per show for batched emits at the end.
  const releasedByShow = new Map();

  await Promise.all(
    expired.map(async (booking) => {
      try {
        await Show.updateOne(
          { _id: booking.showId },
          { $pull: { lockedSeats: { seat: { $in: booking.seats } } } }
        );
        await Booking.updateOne(
          { _id: booking._id, status: "locked" },
          { $set: { status: "cancelled", lockedUntil: null } }
        );

        const showKey = String(booking.showId);
        const existing = releasedByShow.get(showKey) || new Set();
        (booking.seats || []).forEach((s) => existing.add(s));
        releasedByShow.set(showKey, existing);
      } catch (err) {
        console.error(
          `[lockCleanup] failed to expire booking ${booking._id}:`,
          err.message
        );
      }
    })
  );

  for (const [showId, seatSet] of releasedByShow) {
    const seats = Array.from(seatSet);
    if (seats.length > 0) {
      emitSeatsReleased(showId, seats);
    }
  }

  return expired.length;
};

const startLockCleanup = () => {
  setInterval(async () => {
    try {
      const cleaned = await runOnce();
      if (cleaned > 0) {
        console.log(`[lockCleanup] expired ${cleaned} locked booking(s)`);
      }
    } catch (err) {
      console.error("[lockCleanup] tick failed:", err.message);
    }
  }, CLEANUP_INTERVAL_MS);

  console.log(
    `[lockCleanup] running every ${CLEANUP_INTERVAL_MS / 1000}s`
  );
};

export { startLockCleanup };
