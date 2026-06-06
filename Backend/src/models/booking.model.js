import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },
    seats: [
      {
        type: String,
        required: true,
      },
    ],
    seatsTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    fnbTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponDiscount: {
      // Positive number — the discount amount applied to this booking.
      // Mirrors `appliedCoupon.discountAmount` for easier querying / aggregations.
      type: Number,
      default: 0,
      min: 0,
    },
    convenienceFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    gstAmount: {
      // GST charged on the convenience fee only (Indian cinema convention).
      // Stored as a single number; the UI splits it into CGST 9% + SGST 9%.
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      // Final grand total after all line items:
      // seatsTotal + fnbTotal − couponDiscount + convenienceFee + gstAmount
      type: Number,
      required: true,
      min: 0,
    },
    fnbItems: {
      type: [
        {
          itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FnbItem",
          },
          name: { type: String },
          price: { type: Number },
          quantity: { type: Number },
        },
      ],
      default: [],
    },
    appliedCoupon: {
      code: { type: String },
      discountAmount: { type: Number },
    },
    fnbPin: {
      type: String,
      default: null,
    },
    lockedUntil: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["pending", "locked", "confirmed", "cancelled"],
      default: "pending",
    },
    paymentRef: {
      type: String,
    },
    usedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, lockedUntil: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
