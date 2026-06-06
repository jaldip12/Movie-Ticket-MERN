import Seating from "../models/Seating.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";

const ALLOWED_SEAT_TYPES = ["regular", "recliner", "wheelchair", "loveseat", "companion"];
const ALLOWED_UNAVAIL_STYLES = ["hidden", "broken"];

const fail = (res, status, message) =>
  res.status(status).json(new ApiResponse(status, null, message));

const isPosInt = (v) => Number.isInteger(v) && v >= 1;
const isNonNegInt = (v) => Number.isInteger(v) && v >= 0;

// A → 0, Z → 25, AA → 26… (mirrors the frontend rowLabelFor helper).
function rowLabelFor(index) {
  let n = index;
  let label = "";
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

// Normalises one section payload from the editor. Returns either the cleaned
// section, or { error: "..." } describing the first validation failure.
//
// Out-of-range entries (rows that don't exist for the section's row count, or
// seat numbers > columns) are silently dropped, not rejected. Defence-in-depth
// against stale data from a buggy client.
function cleanSection(raw) {
  if (!raw?.name?.trim()) return { error: "Each section must have a name" };

  const rows = Number(raw.rows);
  const columns = Number(raw.columns);
  if (!isPosInt(rows)) return { error: "rows must be an integer >= 1" };
  if (!isPosInt(columns)) return { error: "columns must be an integer >= 1" };

  const price = Number(raw.price);
  if (!Number.isFinite(price) || price < 0) {
    return { error: "price must be a number >= 0" };
  }

  const validRowLabels = new Set(
    Array.from({ length: rows }, (_, i) => rowLabelFor(i))
  );
  const isValidRow = (r) => validRowLabels.has(String(r));
  const isValidSeatNum = (n) =>
    Number.isInteger(n) && n >= 1 && n <= columns;

  const aisles = Array.isArray(raw.aisles)
    ? Array.from(
        new Set(
          raw.aisles
            .map(Number)
            .filter((n) => Number.isInteger(n) && n >= 0 && n < columns)
        )
      ).sort((a, b) => a - b)
    : [];

  const seatRefList = (list, label) => {
    if (!Array.isArray(list)) return [];
    const cleaned = [];
    for (const entry of list) {
      if (!entry?.row) return { error: `${label} entries need a row` };
      if (!isValidRow(entry.row)) continue; // drop out-of-range row
      const seats = Array.from(
        new Set(
          (Array.isArray(entry.seats) ? entry.seats : [])
            .map(Number)
            .filter(isValidSeatNum)
        )
      ).sort((a, b) => a - b);
      if (seats.length === 0) continue;
      cleaned.push({ row: String(entry.row), seats });
    }
    return cleaned;
  };

  const unavailableSeats = seatRefList(raw.unavailableSeats, "unavailableSeats");
  if (unavailableSeats.error) return unavailableSeats;
  const blockedSeats = seatRefList(raw.blockedSeats, "blockedSeats");
  if (blockedSeats.error) return blockedSeats;

  const seatTypes = Array.isArray(raw.seatTypes)
    ? raw.seatTypes
        .filter(
          (t) =>
            t?.row &&
            isValidRow(t.row) &&
            isValidSeatNum(Number(t.seat))
        )
        .map((t) => ({
          row: String(t.row),
          seat: Number(t.seat),
          type: ALLOWED_SEAT_TYPES.includes(t.type) ? t.type : "regular",
        }))
    : [];

  const rowOverrides = Array.isArray(raw.rowOverrides)
    ? raw.rowOverrides
        .filter((o) => o?.row && isValidRow(o.row))
        .map((o) => ({
          row: String(o.row),
          ...(isPosInt(Number(o.columns)) ? { columns: Number(o.columns) } : {}),
          ...(Array.isArray(o.aisles)
            ? {
                aisles: Array.from(
                  new Set(
                    o.aisles
                      .map(Number)
                      .filter((n) => Number.isInteger(n) && n >= 0)
                  )
                ).sort((a, b) => a - b),
              }
            : {}),
        }))
    : [];

  const unavailableStyle = ALLOWED_UNAVAIL_STYLES.includes(raw.unavailableStyle)
    ? raw.unavailableStyle
    : "hidden";

  const rowLabels = Array.isArray(raw.rowLabels)
    ? raw.rowLabels.map((s) => String(s).trim()).filter(Boolean)
    : [];

  return {
    name: raw.name.trim(),
    rows,
    columns,
    price,
    aisles,
    unavailableSeats,
    blockedSeats,
    seatTypes,
    rowOverrides,
    unavailableStyle,
    rowLabels,
  };
}

function cleanSections(sections, res) {
  if (!Array.isArray(sections) || sections.length === 0) {
    fail(res, 400, "At least one section is required");
    return null;
  }
  const out = [];
  for (const raw of sections) {
    const cleaned = cleanSection(raw);
    if (cleaned.error) {
      fail(res, 400, cleaned.error);
      return null;
    }
    out.push(cleaned);
  }
  return out;
}

const createSeatingPlan = asyncHandler(async (req, res) => {
  const { name, sections } = req.body;
  if (!name?.trim()) return fail(res, 400, "Name is required");

  const cleaned = cleanSections(sections, res);
  if (!cleaned) return undefined;

  const seatingPlan = await Seating.create({
    name: name.trim(),
    sections: cleaned,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, seatingPlan, "Seating plan created successfully"));
});

const updateSeatingPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, sections } = req.body;
  if (!name?.trim()) return fail(res, 400, "Name is required");

  const cleaned = cleanSections(sections, res);
  if (!cleaned) return undefined;

  const updatedPlan = await Seating.findOneAndUpdate(
    { id },
    { name: name.trim(), sections: cleaned },
    { new: true, runValidators: true }
  );

  if (!updatedPlan) return fail(res, 404, "Seating plan not found");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlan, "Seating plan updated successfully"));
});

const deleteSeatingPlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deletedPlan = await Seating.findOneAndDelete({ id });
  if (!deletedPlan) return fail(res, 404, "Seating plan not found");
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Seating plan deleted successfully"));
});

const getAllSeatingPlans = asyncHandler(async (req, res) => {
  const seatingPlans = await Seating.find({}).sort({ name: 1 });
  // Empty list is a valid response, not 404 — the UI handles "no plans yet".
  return res
    .status(200)
    .json(new ApiResponse(200, seatingPlans, "Seating plans retrieved successfully"));
});

const getSeatingPlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const seatingPlan = await Seating.findOne({ id });
  if (!seatingPlan) return fail(res, 404, "Seating plan not found");
  return res
    .status(200)
    .json(new ApiResponse(200, seatingPlan, "Seating plan retrieved successfully"));
});

const getSeatingPlanByName = asyncHandler(async (req, res) => {
  const { name } = req.params;
  if (!name?.trim()) return fail(res, 400, "Seating plan name is required");
  const seatingPlan = await Seating.findOne({ name: name.trim() });
  if (!seatingPlan) {
    return fail(res, 404, `No seating plan found with name: ${name}`);
  }
  return res
    .status(200)
    .json(new ApiResponse(200, seatingPlan, "Seating plan retrieved successfully"));
});

export {
  createSeatingPlan,
  updateSeatingPlan,
  deleteSeatingPlan,
  getAllSeatingPlans,
  getSeatingPlanById,
  getSeatingPlanByName,
};
