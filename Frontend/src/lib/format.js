// Shared formatting helpers for admin (and beyond).
// All helpers return "—" on bad/missing input.

const DASH = "—";

export const formatINR = (n) => {
  try {
    if (n === null || n === undefined || n === "") return DASH;
    const num = Number(n);
    if (Number.isNaN(num)) return DASH;
    return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  } catch {
    return DASH;
  }
};

export const formatDate = (d) => {
  try {
    if (!d) return DASH;
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return DASH;
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return DASH;
  }
};

export const formatDateTime = (d) => {
  try {
    if (!d) return DASH;
    const date = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(date.getTime())) return DASH;
    const datePart = date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    const timePart = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${datePart} · ${timePart}`;
  } catch {
    return DASH;
  }
};

// "HH:MM" → "7:30 PM"
export const formatTime = (timeStr) => {
  try {
    if (!timeStr) return DASH;
    const [hh, mm] = String(timeStr).split(":");
    const h = parseInt(hh, 10);
    const m = parseInt(mm, 10);
    if (Number.isNaN(h) || Number.isNaN(m)) return DASH;
    const ref = new Date();
    ref.setHours(h, m, 0, 0);
    return ref.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return DASH;
  }
};
