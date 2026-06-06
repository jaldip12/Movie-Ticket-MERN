import mongoose from "mongoose";
import Movie from "../models/movie.model.js";
import Booking from "../models/booking.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

// Module-scope flag — once we know Atlas Search isn't available, don't keep
// retrying it on every search request. Reset when the process restarts.
let atlasSearchAvailable = true;

const ALLOWED_FIELDS = [
  "title",
  "poster",
  "certification",
  "language",
  "languages",
  "genres",
  "releaseDate",
  "duration",
  "description",
  "trailerUrl",
  "isNowShowing",
  "isFeatured",
  "isActive",
  "rating",
  "votes",
];

const pickAllowed = (body = {}) => {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
};

const listMovies = asyncHandler(async (req, res) => {
  const { nowShowing, featured, search, genre, language } = req.query;

  const filter = { isActive: true };

  if (nowShowing === "true") filter.isNowShowing = true;
  else if (nowShowing === "false") filter.isNowShowing = false;

  if (featured === "true") filter.isFeatured = true;
  else if (featured === "false") filter.isFeatured = false;

  if (search && search.trim()) {
    filter.title = { $regex: search.trim(), $options: "i" };
  }

  if (genre && genre.trim()) {
    filter.genres = genre.trim();
  }

  if (language && language.trim()) {
    filter.$or = [
      { language: language.trim() },
      { languages: language.trim() },
    ];
  }

  const movies = await Movie.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, movies, "Movies fetched successfully"));
});

const getMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid movie id");
  }

  const movie = await Movie.findById(id);

  if (!movie || movie.isActive === false) {
    throw new ApiError(404, "Movie not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, movie, "Movie fetched successfully"));
});

const createMovie = asyncHandler(async (req, res) => {
  const {
    title,
    poster,
    certification,
    language,
    languages,
    genres,
    releaseDate,
    duration,
    description,
    trailerUrl,
    isNowShowing,
    isFeatured,
  } = req.body;

  const required = { title, poster, certification, language, genres, releaseDate, duration };
  const missing = Object.entries(required)
    .filter(([, v]) => {
      if (v === undefined || v === null) return true;
      if (typeof v === "string" && !v.trim()) return true;
      if (Array.isArray(v) && v.length === 0) return true;
      return false;
    })
    .map(([k]) => k);

  if (missing.length) {
    throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  }

  const existing = await Movie.findOne({
    $expr: { $eq: [{ $toLower: "$title" }, title.toLowerCase()] },
  });
  if (existing) {
    throw new ApiError(409, "A movie with this title already exists");
  }

  const movie = await Movie.create({
    title,
    poster,
    certification,
    language,
    languages: Array.isArray(languages) ? languages : [],
    genres,
    releaseDate,
    duration,
    description: description ?? "",
    trailerUrl: trailerUrl ?? "",
    isNowShowing: isNowShowing ?? false,
    isFeatured: isFeatured ?? false,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, movie, "Movie created successfully"));
});

const updateMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid movie id");
  }

  const updates = pickAllowed(req.body);

  const movie = await Movie.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, movie, "Movie updated successfully"));
});

const deleteMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid movie id");
  }

  const movie = await Movie.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!movie) {
    throw new ApiError(404, "Movie not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, movie, "Movie deleted successfully"));
});

const SEARCH_PROJECTION = {
  title: 1,
  poster: 1,
  certification: 1,
  language: 1,
  languages: 1,
  genres: 1,
  rating: 1,
  releaseDate: 1,
  duration: 1,
};

const searchMovies = asyncHandler(async (req, res) => {
  const rawQ = typeof req.query.q === "string" ? req.query.q : "";
  const q = rawQ.trim();

  let limit = parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = 10;
  if (limit > 50) limit = 50;

  if (!q) {
    return res
      .status(200)
      .json(new ApiResponse(200, { items: [] }, "No query provided"));
  }

  let items = null;

  // Try Atlas Search first (only while we still believe it's available).
  if (atlasSearchAvailable) {
    try {
      items = await Movie.aggregate([
        {
          $search: {
            index: "movies_search",
            text: {
              query: q,
              path: ["title", "description", "genres", "language", "languages"],
              fuzzy: { maxEdits: 1 },
            },
          },
        },
        { $match: { isActive: true } },
        { $limit: limit },
        { $project: SEARCH_PROJECTION },
      ]);
    } catch (err) {
      // Most likely cause in dev: the `movies_search` index has not been
      // created in Atlas yet. Log once and fall back to regex from now on.
      atlasSearchAvailable = false;
      console.warn(
        "[movies/search] Atlas Search unavailable, falling back to regex:",
        err?.message || err
      );
      items = null;
    }
  }

  // Regex fallback (also used when Atlas Search throws OR returns zero hits —
  // a not-yet-created `movies_search` index returns empty silently on some tiers).
  if (items === null || items.length === 0) {
    items = await Movie.find({
      isActive: true,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { genres: q },
        { language: q },
      ],
    })
      .sort({ rating: -1 })
      .limit(limit)
      .select(
        "title poster certification language languages genres rating releaseDate duration"
      );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { items }, "Search results"));
});

const listTrending = asyncHandler(async (req, res) => {
  let days = parseInt(req.query.days, 10);
  if (!Number.isFinite(days) || days <= 0) days = 7;
  if (days > 90) days = 90;

  let limit = parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = 8;
  if (limit > 50) limit = 50;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const aggregated = await Booking.aggregate([
    { $match: { status: "confirmed", createdAt: { $gte: since } } },
    {
      $group: {
        _id: "$showId",
        seats: { $sum: { $size: { $ifNull: ["$seats", []] } } },
      },
    },
    {
      $lookup: {
        from: "shows",
        localField: "_id",
        foreignField: "_id",
        as: "show",
      },
    },
    { $unwind: "$show" },
    {
      $group: {
        _id: "$show.movieId",
        bookingsCount: { $sum: "$seats" },
      },
    },
    {
      $lookup: {
        from: "movies",
        localField: "_id",
        foreignField: "_id",
        as: "movie",
      },
    },
    { $unwind: "$movie" },
    { $match: { "movie.isActive": true } },
    { $sort: { bookingsCount: -1 } },
    { $limit: limit },
    {
      $project: {
        _id: "$movie._id",
        title: "$movie.title",
        poster: "$movie.poster",
        rating: "$movie.rating",
        certification: "$movie.certification",
        language: "$movie.language",
        languages: "$movie.languages",
        genres: "$movie.genres",
        duration: "$movie.duration",
        releaseDate: "$movie.releaseDate",
        bookingsCount: 1,
      },
    },
  ]);

  let items = aggregated;

  if (!items || items.length === 0) {
    // Fresh DB / no bookings yet — keep the strip non-empty so the landing
    // page still has something to show.
    const fallback = await Movie.find({
      isNowShowing: true,
      isActive: true,
    })
      .sort({ rating: -1 })
      .limit(limit)
      .select(
        "title poster rating certification language languages genres duration releaseDate"
      )
      .lean();

    items = fallback.map((m) => ({ ...m, bookingsCount: 0 }));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { items }, "Trending movies fetched"));
});

const listComingSoon = asyncHandler(async (req, res) => {
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit <= 0) limit = 20;
  if (limit > 100) limit = 100;

  const now = new Date();

  const items = await Movie.find({
    isActive: true,
    isNowShowing: false,
    releaseDate: { $gte: now },
  })
    .sort({ releaseDate: 1 })
    .limit(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, items, "Coming soon movies fetched"));
});

export {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  listTrending,
  listComingSoon,
};
