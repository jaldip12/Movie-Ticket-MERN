import mongoose from "mongoose";

const movieNotificationSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

movieNotificationSchema.index({ movieId: 1, email: 1 }, { unique: true });

const MovieNotification = mongoose.model(
  "MovieNotification",
  movieNotificationSchema
);
export default MovieNotification;
