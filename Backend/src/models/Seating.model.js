import mongoose from "mongoose";

// Sparse exception entry: which seat numbers (within a row's column space)
// have a special state. Used by `unavailableSeats`, `blockedSeats`, etc.
const seatRefSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    seats: [{ type: Number, required: true, min: 1 }],
  },
  { _id: false }
);

// One entry per non-default seat, e.g. row B seat 7 is a recliner.
const seatTypeSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    seat: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      enum: ["regular", "recliner", "wheelchair", "loveseat", "companion"],
      default: "regular",
    },
  },
  { _id: false }
);

// Per-row escape hatch for the 5% asymmetric case (e.g. last row of EXECUTIVE
// in the BookMyShow screenshot is shorter and has its own aisle position).
const rowOverrideSchema = new mongoose.Schema(
  {
    row: { type: String, required: true },
    columns: { type: Number, min: 1 },
    aisles: [{ type: Number, min: 0 }],
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rows: { type: Number, required: true, min: 1, default: 10 },
    columns: { type: Number, required: true, min: 1, default: 10 },
    price: { type: Number, required: true, min: 0, default: 0 },

    // Section-wide aisle column indices: a visual gap is rendered AFTER each
    // listed column. Numbering is preserved across aisles (LTR-skip-aisles).
    aisles: { type: [Number], default: [] },

    // Physically absent / broken — by default rendered as an invisible gap.
    unavailableSeats: { type: [seatRefSchema], default: [] },

    // Greyed-but-visible (sold-out look, not bookable).
    blockedSeats: { type: [seatRefSchema], default: [] },

    // Per-seat type overrides — sparse list, default everywhere is "regular".
    seatTypes: { type: [seatTypeSchema], default: [] },

    // Per-row dimension/aisle overrides for asymmetric halls.
    rowOverrides: { type: [rowOverrideSchema], default: [] },

    // How to render `unavailableSeats`: hide them entirely, or show a faded
    // "out of order" cell.
    unavailableStyle: {
      type: String,
      enum: ["hidden", "broken"],
      default: "hidden",
    },

    // Optional explicit row labels. If empty/null, labels auto-generate as
    // A,B,C,...,Z,AA,AB,... — so you're never capped at 26 rows.
    rowLabels: { type: [String], default: [] },
  },
  { _id: false }
);

const seatingSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    sections: { type: [sectionSchema], default: [] },
  },
  { timestamps: true }
);

// Generate a sequential numeric id starting at 100 if none supplied. Kept for
// backwards compatibility with admin URLs like /admin/seating/edit/:id.
seatingSchema.pre("validate", async function (next) {
  if (!this.id) {
    const last = await mongoose
      .model("Seating")
      .findOne()
      .sort({ id: -1 });
    this.id = last ? last.id + 1 : 100;
  }
  next();
});

const Seating = mongoose.model("Seating", seatingSchema);
export default Seating;
