import mongoose from "mongoose";
import MovieNotification from "../models/movieNotification.model.js";
import Movie from "../models/movie.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

// Basic email regex — matches the "looks like an email" minimum.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const subscribeNotification = asyncHandler(async (req, res) => {
  const { movieId, email } = req.body || {};

  if (!movieId || !mongoose.isValidObjectId(movieId)) {
    throw new ApiError(400, "Valid movieId is required");
  }

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    throw new ApiError(400, "A valid email address is required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Verify the movie exists and is upcoming.
  const movie = await Movie.findById(movieId).select("_id isActive");
  if (!movie || movie.isActive === false) {
    throw new ApiError(404, "Movie not found");
  }

  // Idempotent upsert — repeated subscribes don't error.
  const subscription = await MovieNotification.findOneAndUpdate(
    { movieId, email: normalizedEmail },
    { $setOnInsert: { movieId, email: normalizedEmail } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribed: true, _id: subscription._id },
        "We'll let you know when this movie is out!"
      )
    );
});

export { subscribeNotification };
