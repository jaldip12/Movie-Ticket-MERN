/**
 * Pure seat-layout helpers, shared between the admin editor and the booking
 * renderer. No React, no DOM — just data → data transforms.
 *
 * Schema reference (one section):
 *   { name, rows, columns, price,
 *     aisles[], unavailableSeats[], blockedSeats[], seatTypes[],
 *     rowOverrides[], unavailableStyle, rowLabels[] }
 */

// A → 0, Z → 25, AA → 26, AB → 27, ...
export function rowLabelFor(index, customLabels) {
  if (Array.isArray(customLabels) && customLabels[index]) {
    return customLabels[index];
  }
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

export function generateRowLabels(rowCount, customLabels) {
  return Array.from({ length: rowCount }, (_, i) =>
    rowLabelFor(i, customLabels)
  );
}

// Pad a number with leading zeros to the width implied by the section's max.
export function padSeatNumber(num, total) {
  const width = String(Math.max(2, total || 0)).length;
  return String(num).padStart(width, "0");
}

// Lookup helpers — accept the section + a row label and return predicates.
function seatRefHas(list, rowLabel, seatNum) {
  if (!Array.isArray(list)) return false;
  for (const entry of list) {
    if (entry?.row === rowLabel && Array.isArray(entry.seats)) {
      if (entry.seats.includes(seatNum)) return true;
    }
  }
  return false;
}

// Last-match-wins: lets callers bulk-fill a section ("everything is recliner")
// and then add overrides at the end ("but B4+B5 are loveseats") without
// having to deduplicate first.
function seatTypeFor(list, rowLabel, seatNum) {
  if (!Array.isArray(list)) return "regular";
  let last = "regular";
  for (const t of list) {
    if (t?.row === rowLabel && t.seat === seatNum) {
      last = t.type || "regular";
    }
  }
  return last;
}

/**
 * Expand a section into the visual grid the renderer iterates over.
 * Returns { rows: [{ label, cells: [...] }], maxCols, totalSeats }.
 *
 * Cell types:
 *   - { kind: "seat", row, num, type, price }      bookable seat
 *   - { kind: "blocked", row, num }                 visible-greyed-not-bookable
 *   - { kind: "broken", row, num }                  show as faded "out of order"
 *   - { kind: "empty" }                             nothing rendered (gap)
 *   - { kind: "aisle" }                             aisle gap
 *
 * Options:
 *   - forceUnavailableVisible: render unavailable seats as "broken" even when
 *     the section's unavailableStyle is "hidden". The editor uses this so an
 *     admin can always click a unavailable cell to restore it; the booking
 *     page leaves it false to honour the configured style.
 */
export function expandSection(section, options = {}) {
  const { forceUnavailableVisible = false } = options;
  const rowCount = Number(section?.rows) || 0;
  const sectionCols = Number(section?.columns) || 0;
  const sectionAisles = Array.isArray(section?.aisles) ? section.aisles : [];
  const overrides = Array.isArray(section?.rowOverrides)
    ? section.rowOverrides
    : [];
  const unavailableStyle =
    forceUnavailableVisible || section?.unavailableStyle === "broken"
      ? "broken"
      : "hidden";
  const labels = generateRowLabels(rowCount, section?.rowLabels);

  const out = [];
  let maxCols = sectionCols;
  let totalSeats = 0;

  for (let r = 0; r < rowCount; r += 1) {
    const rowLabel = labels[r];
    const override = overrides.find((o) => o.row === rowLabel) || {};
    const cols = Number.isInteger(override.columns) && override.columns > 0
      ? override.columns
      : sectionCols;
    const aisles = Array.isArray(override.aisles) ? override.aisles : sectionAisles;
    const aisleSet = new Set(aisles);
    if (cols > maxCols) maxCols = cols;

    const cells = [];
    for (let c = 1; c <= cols; c += 1) {
      // Aisle gap rendered AFTER column (c-1).
      // We emit BEFORE column c if aisleSet contains (c-1).
      if (aisleSet.has(c - 1)) {
        cells.push({ kind: "aisle" });
      }

      const seatNum = c;
      const isUnavailable = seatRefHas(section.unavailableSeats, rowLabel, seatNum);
      if (isUnavailable) {
        cells.push(
          unavailableStyle === "broken"
            ? { kind: "broken", row: rowLabel, num: seatNum }
            : { kind: "empty" }
        );
        continue;
      }
      const isBlocked = seatRefHas(section.blockedSeats, rowLabel, seatNum);
      if (isBlocked) {
        cells.push({ kind: "blocked", row: rowLabel, num: seatNum });
        continue;
      }
      const type = seatTypeFor(section.seatTypes, rowLabel, seatNum);
      cells.push({
        kind: "seat",
        row: rowLabel,
        num: seatNum,
        type,
        price: Number(section.price) || 0,
      });
      totalSeats += 1;
    }
    out.push({ label: rowLabel, cells });
  }

  return { rows: out, maxCols, totalSeats };
}

/**
 * Section-level capacity + max-gross. Used by the editor's summary strip.
 */
export function sectionStats(section) {
  const { totalSeats } = expandSection(section);
  return {
    seats: totalSeats,
    gross: totalSeats * (Number(section.price) || 0),
  };
}

/**
 * Whole-plan summary across sections.
 */
export function planStats(plan) {
  const sections = Array.isArray(plan?.sections) ? plan.sections : [];
  let seats = 0;
  let gross = 0;
  for (const s of sections) {
    const stats = sectionStats(s);
    seats += stats.seats;
    gross += stats.gross;
  }
  return { seats, gross, sectionCount: sections.length };
}
