import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },
    text: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    isVerifiedBooking: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for fast public listing queries
reviewSchema.index({ movieId: 1, isHidden: 1, createdAt: -1 });
// Enforce one review per user per movie
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
