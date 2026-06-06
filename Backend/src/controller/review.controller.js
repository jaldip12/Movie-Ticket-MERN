import mongoose from "mongoose";
import Review from "../models/review.model.js";
import Movie from "../models/movie.model.js";
import Booking from "../models/booking.model.js";
import Show from "../models/show.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

/**
 * Recompute the aggregate rating + vote count on the Movie document. The
 * review scale is 1-5 but the existing Movie schema is 0-10, so we multiply
 * the average by 2 to keep movie cards rendering consistently.
 */
const recomputeMovieRating = async (movieId) => {
  if (!mongoose.isValidObjectId(movieId)) return;
  const movieObjectId = new mongoose.Types.ObjectId(movieId);
  const result = await Review.aggregate([
    { $match: { movieId: movieObjectId, isHidden: false } },
    {
      $group: {
        _id: null,
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = result[0]?.avg ?? 0;
  const count = result[0]?.count ?? 0;
  // Convert 1-5 scale -> 0-10 scale; round to one decimal for display.
  const scaled = Math.round(avg * 2 * 10) / 10;

  await Movie.updateOne(
    { _id: movieObjectId },
    { $set: { rating: scaled, votes: count } }
  );
};

/**
 * Public — list non-hidden reviews for a single movie, with pagination.
 */
const listReviewsForMovie = asyncHandler(async (req, res) => {
  const { movieId } = req.params;
  if (!mongoose.isValidObjectId(movieId)) {
    throw new ApiError(400, "Invalid movieId");
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
  const skip = (page - 1) * limit;

  const filter = { movieId, isHidden: false };

  const [items, total, agg] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "firstname"),
    Review.countDocuments(filter),
    Review.aggregate([
      {
        $match: {
          movieId: new mongoose.Types.ObjectId(movieId),
          isHidden: false,
        },
      },
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  const average = agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : 0;
  const pageCount = Math.ceil(total / limit) || 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { items, total, page, pageCount, average },
        "Reviews fetched successfully"
      )
    );
});

/**
 * Auth — create a review. The user must have at least one confirmed booking
 * for a show of this movie.
 */
const createReview = asyncHandler(async (req, res) => {
  const { movieId, rating, text } = req.body || {};

  if (!mongoose.isValidObjectId(movieId)) {
    throw new ApiError(400, "Invalid movieId");
  }

  const ratingNum = Number(rating);
  if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    throw new ApiError(400, "Rating must be an integer between 1 and 5");
  }

  const trimmedText = typeof text === "string" ? text.trim() : "";
  if (trimmedText.length > 1000) {
    throw new ApiError(400, "Review text must be 1000 characters or fewer");
  }

  // Verify the user has a confirmed booking for a show of this movie.
  const showsForMovie = await Show.find({ movieId }).select("_id");
  const showIds = showsForMovie.map((s) => s._id);

  const matchingBooking = await Booking.findOne({
    userId: req.user._id,
    status: "confirmed",
    showId: { $in: showIds },
  }).select("_id");

  if (!matchingBooking) {
    throw new ApiError(
      403,
      "Only viewers who completed a booking can review"
    );
  }

  // Already reviewed?
  const existing = await Review.findOne({
    userId: req.user._id,
    movieId,
  }).select("_id");
  if (existing) {
    throw new ApiError(
      409,
      "You have already reviewed this movie. Edit your existing review instead."
    );
  }

  const review = await Review.create({
    userId: req.user._id,
    movieId,
    rating: ratingNum,
    text: trimmedText,
    isVerifiedBooking: true,
  });

  await recomputeMovieRating(movieId);

  const populated = await Review.findById(review._id).populate(
    "userId",
    "firstname"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Review created successfully"));
});

/**
 * Auth — owner-only update of a review's rating and/or text.
 */
const updateMyReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid review id");
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }
  if (review.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only edit your own review");
  }

  const update = {};

  if (req.body?.rating !== undefined) {
    const ratingNum = Number(req.body.rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new ApiError(400, "Rating must be an integer between 1 and 5");
    }
    update.rating = ratingNum;
  }

  if (req.body?.text !== undefined) {
    const trimmedText =
      typeof req.body.text === "string" ? req.body.text.trim() : "";
    if (trimmedText.length > 1000) {
      throw new ApiError(400, "Review text must be 1000 characters or fewer");
    }
    update.text = trimmedText;
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "Nothing to update");
  }

  const updated = await Review.findByIdAndUpdate(
    id,
    { $set: update },
    { new: true, runValidators: true }
  ).populate("userId", "firstname");

  await recomputeMovieRating(review.movieId);

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Review updated successfully"));
});

/**
 * Auth — owner-only hard-delete of a review.
 */
const deleteMyReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid review id");
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }
  if (review.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only delete your own review");
  }

  const movieId = review.movieId;
  await Review.deleteOne({ _id: id });
  await recomputeMovieRating(movieId);

  return res
    .status(200)
    .json(new ApiResponse(200, { _id: id }, "Review deleted successfully"));
});

/**
 * Admin — list all reviews with optional filters and pagination.
 */
const adminListReviews = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.movieId) {
    if (!mongoose.isValidObjectId(req.query.movieId)) {
      throw new ApiError(400, "Invalid movieId filter");
    }
    filter.movieId = req.query.movieId;
  }

  if (req.query.isHidden !== undefined && req.query.isHidden !== "") {
    if (req.query.isHidden === "true") filter.isHidden = true;
    else if (req.query.isHidden === "false") filter.isHidden = false;
    else throw new ApiError(400, "isHidden must be 'true' or 'false'");
  }

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit, 10) || 20, 1);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "firstname email")
      .populate("movieId", "title poster"),
    Review.countDocuments(filter),
  ]);

  const pageCount = Math.ceil(total / limit) || 0;

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { items, total, page, pageCount },
        "Reviews fetched successfully"
      )
    );
});

/**
 * Admin — toggle the hidden flag on a review. Hidden reviews don't count
 * toward the movie's aggregate rating, so we recompute after the flip.
 */
const adminToggleHide = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid review id");
  }

  if (typeof req.body?.isHidden !== "boolean") {
    throw new ApiError(400, "isHidden must be a boolean");
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  review.isHidden = req.body.isHidden;
  await review.save();

  await recomputeMovieRating(review.movieId);

  const populated = await Review.findById(id)
    .populate("userId", "firstname email")
    .populate("movieId", "title poster");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populated,
        `Review ${review.isHidden ? "hidden" : "unhidden"} successfully`
      )
    );
});

export {
  listReviewsForMovie,
  createReview,
  updateMyReview,
  deleteMyReview,
  adminListReviews,
  adminToggleHide,
};
