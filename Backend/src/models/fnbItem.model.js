import mongoose from "mongoose";

const fnbItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      enum: ["popcorn", "drinks", "snacks", "combo"],
      required: true,
    },
    veg: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "",
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      default: null,
    },
  },
  { timestamps: true }
);

fnbItemSchema.index({ cinemaId: 1, category: 1 });

const FnbItem = mongoose.model("FnbItem", fnbItemSchema);
export default FnbItem;
