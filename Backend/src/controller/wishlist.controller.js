import mongoose from "mongoose";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";
import Wishlist from "../models/wishlist.model.js";
import Movie from "../models/movie.model.js";

const listMyWishlist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const items = await Wishlist.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate({
      path: "movieId",
      // Only surface fields the wishlist UI actually renders so we don't ship
      // the whole movie blob for every entry.
      select:
        "title poster rating votes certification language languages genres releaseDate duration isActive isNowShowing isFeatured",
    });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "Wishlist fetched successfully"));
});

const addToWishlist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const { movieId } = req.body || {};
  if (!movieId || !mongoose.isValidObjectId(movieId)) {
    throw new ApiError(400, "Valid movieId is required");
  }

  const movie = await Movie.findById(movieId).select("isActive");
  if (!movie || movie.isActive === false) {
    throw new ApiError(404, "Movie not found");
  }

  // Upsert keeps this idempotent — calling twice from the heart toggle is fine.
  const item = await Wishlist.findOneAndUpdate(
    { userId: req.user._id, movieId },
    { $setOnInsert: { userId: req.user._id, movieId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, item, "Added to wishlist"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const { movieId } = req.params;
  if (!movieId || !mongoose.isValidObjectId(movieId)) {
    throw new ApiError(400, "Valid movieId is required");
  }

  // Idempotent — return 200 whether or not the row existed. The toggle UI
  // doesn't need to know "already gone" vs "just removed".
  await Wishlist.deleteOne({ userId: req.user._id, movieId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Removed from wishlist"));
});

const isInWishlist = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Not authenticated");
  }

  const { movieId } = req.params;
  if (!movieId || !mongoose.isValidObjectId(movieId)) {
    throw new ApiError(400, "Valid movieId is required");
  }

  const found = await Wishlist.exists({
    userId: req.user._id,
    movieId,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isWishlisted: Boolean(found) },
        "Wishlist status"
      )
    );
});

export { listMyWishlist, addToWishlist, removeFromWishlist, isInWishlist };
