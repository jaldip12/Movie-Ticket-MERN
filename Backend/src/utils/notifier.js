/**
 * Lightweight ticket "delivery" used as a stand-in for SMS/email/WhatsApp
 * until those integrations land. Logs a formatted ticket to stdout so we
 * can verify the booking pipeline end-to-end without external services.
 *
 * Always swallows its own errors — booking confirmation must never fail
 * because the notifier failed.
 */

const safe = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string" && value.trim() === "") return "—";
  return value;
};

const formatDate = (value) => {
  if (!value) return "—";
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toISOString().split("T")[0];
  } catch {
    return "—";
  }
};

const deliverTicket = (populatedBooking) => {
  try {
    if (!populatedBooking) return;

    const b = populatedBooking;
    const user = b.userId || {};
    const show = b.showId || {};
    const movie = show.movieId || {};
    const screen = show.screenId || {};
    const cinema = screen.cinemaId || {};

    const id = safe(b._id?.toString?.() || b._id);
    const firstname = safe(user.firstname);
    const lastname = safe(user.lastname);
    const email = safe(user.email);
    const number = safe(user.number ?? user.phone ?? user.mobile);
    const title = safe(movie.title);
    const date = formatDate(show.date);
    const time = safe(show.time);
    const cinemaName = safe(cinema.name);
    const city = safe(cinema.city);
    const screenName = safe(screen.name);

    const seats =
      Array.isArray(b.seats) && b.seats.length > 0 ? b.seats.join(", ") : "—";

    let fnbLine = "—";
    if (Array.isArray(b.fnbItems) && b.fnbItems.length > 0) {
      const parts = b.fnbItems
        .map((i) => `${safe(i.name)} x${safe(i.quantity)}`)
        .join(", ");
      const pin = b.fnbPin ? ` (PIN: ${b.fnbPin})` : "";
      fnbLine = `${parts}${pin}`;
    }

    let couponLine = "—";
    if (b.appliedCoupon && b.appliedCoupon.code) {
      const disc = b.appliedCoupon.discountAmount || 0;
      couponLine = `${b.appliedCoupon.code} (-₹${disc})`;
    }

    const total = b.totalAmount != null ? `₹${b.totalAmount}` : "—";

    const lines = [
      "====== TICKET ======",
      `Booking ID:    ${id}`,
      `User:          ${firstname} ${lastname} (${email}) +${number}`,
      `Movie:         ${title}`,
      `Date / time:   ${date} ${time}`,
      `Cinema:        ${cinemaName}, ${city}`,
      `Screen:        ${screenName}`,
      `Seats:         ${seats}`,
      `F&B:           ${fnbLine}`,
      `Coupon:        ${couponLine}`,
      `Total:         ${total}`,
      "====================",
    ];

    console.log(lines.join("\n"));
  } catch (err) {
    try {
      console.error("[notifier] deliverTicket failed:", err.message);
    } catch {
      // never throw out of the notifier
    }
  }
};

export { deliverTicket };
