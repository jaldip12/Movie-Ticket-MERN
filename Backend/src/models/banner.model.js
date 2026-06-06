import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    ctaText: { type: String, default: "" },
    ctaUrl: { type: String, default: "" },
    position: {
      type: String,
      enum: ["hero", "strip"],
      default: "strip",
    },
    sortOrder: { type: Number, default: 0 },
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

bannerSchema.index({ isActive: 1, position: 1, sortOrder: 1 });

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;
