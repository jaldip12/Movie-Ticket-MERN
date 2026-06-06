import mongoose from "mongoose";

const screenSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    seatingPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seating",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

screenSchema.index({ cinemaId: 1, name: 1 }, { unique: true });

const Screen = mongoose.model("Screen", screenSchema);
export default Screen;
