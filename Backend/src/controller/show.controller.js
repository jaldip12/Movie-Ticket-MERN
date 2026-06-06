import mongoose from "mongoose";
import Show from "../models/show.model.js";
import Movie from "../models/movie.model.js";
import Screen from "../models/screen.model.js";
import Cinema from "../models/cinema.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

const SHOW_POPULATE = [
  { path: "movieId", select: "title poster duration certification" },
  {
    path: "screenId",
    populate: [
      { path: "cinemaId", select: "name city" },
      { path: "seatingPlanId", select: "name" },
    ],
  },
];

const createShow = asyncHandler(async (req, res) => {
  const { movieId, screenId, date, time, format, language, subtitles } = req.body;

  if (!movieId || !screenId || !date || !time) {
    throw new ApiError(400, "movieId, screenId, date and time are required");
  }

  if (!mongoose.isValidObjectId(movieId)) {
    throw new ApiError(400, "Invalid movieId");
  }

  if (!mongoose.isValidObjectId(screenId)) {
    throw new ApiError(400, "Invalid screenId");
  }

  const movie = await Movie.findById(movieId);
  if (!movie || !movie.isActive) {
    throw new ApiError(400, "Movie not found or inactive");
  }

  const screen = await Screen.findById(screenId);
  if (!screen || !screen.isActive) {
    throw new ApiError(400, "Screen not found or inactive");
  }

  const show = await Show.create({
    movieId,
    screenId,
    date,
    time,
    ...(format !== undefined && { format }),
    ...(language !== undefined && { language }),
    ...(subtitles !== undefined && { subtitles }),
  });

  const populated = await Show.findById(show._id).populate(SHOW_POPULATE);

  return res
    .status(201)
    .json(new ApiResponse(201, populated, "Show created successfully"));
});

const listShows = asyncHandler(async (req, res) => {
  const { movieId, city, date, cinemaId } = req.query;

  const filter = { isActive: true };

  if (movieId) {
    if (!mongoose.isValidObjectId(movieId)) {
      throw new ApiError(400, "Invalid movieId");
    }
    filter.movieId = movieId;
  }

  if (date) {
    const dayStart = new Date(date);
    if (Number.isNaN(dayStart.getTime())) {
      throw new ApiError(400, "Invalid date");
    }
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    filter.date = { $gte: dayStart, $lt: dayEnd };
  }

  let cinemaIds = null;

  if (city) {
    const cinemas = await Cinema.find({ city, isActive: true }).select("_id");
    cinemaIds = cinemas.map((c) => c._id);
  }

  if (cinemaId) {
    if (!mongoose.isValidObjectId(cinemaId)) {
      throw new ApiError(400, "Invalid cinemaId");
    }
    if (cinemaIds) {
      cinemaIds = cinemaIds.filter((id) => id.toString() === cinemaId);
    } else {
      cinemaIds = [cinemaId];
    }
  }

  if (cinemaIds) {
    if (cinemaIds.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "Shows fetched successfully"));
    }
    const screens = await Screen.find({
      cinemaId: { $in: cinemaIds },
      isActive: true,
    }).select("_id");
    const screenIds = screens.map((s) => s._id);
    if (screenIds.length === 0) {
      return res
        .status(200)
        .json(new ApiResponse(200, [], "Shows fetched successfully"));
    }
    filter.screenId = { $in: screenIds };
  }

  const shows = await Show.find(filter)
    .sort({ date: 1, time: 1 })
    .populate(SHOW_POPULATE);

  return res
    .status(200)
    .json(new ApiResponse(200, shows, "Shows fetched successfully"));
});

const getShow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid show id");
  }

  const show = await Show.findById(id).populate(SHOW_POPULATE);

  if (!show || !show.isActive) {
    throw new ApiError(404, "Show not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, show, "Show fetched successfully"));
});

const updateShow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid show id");
  }

  const { movieId, screenId, date, time, isActive, format, language, subtitles } = req.body;
  const update = {};

  if (movieId !== undefined) {
    if (!mongoose.isValidObjectId(movieId)) {
      throw new ApiError(400, "Invalid movieId");
    }
    const movie = await Movie.findById(movieId);
    if (!movie || !movie.isActive) {
      throw new ApiError(400, "Movie not found or inactive");
    }
    update.movieId = movieId;
  }

  if (screenId !== undefined) {
    if (!mongoose.isValidObjectId(screenId)) {
      throw new ApiError(400, "Invalid screenId");
    }
    const screen = await Screen.findById(screenId);
    if (!screen || !screen.isActive) {
      throw new ApiError(400, "Screen not found or inactive");
    }
    update.screenId = screenId;
  }

  if (date !== undefined) update.date = date;
  if (time !== undefined) update.time = time;
  if (isActive !== undefined) update.isActive = isActive;
  if (format !== undefined) update.format = format;
  if (language !== undefined) update.language = language;
  if (subtitles !== undefined) update.subtitles = subtitles;

  const show = await Show.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).populate(SHOW_POPULATE);

  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, show, "Show updated successfully"));
});

const deleteShow = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid show id");
  }

  const show = await Show.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!show) {
    throw new ApiError(404, "Show not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { _id: show._id }, "Show deleted successfully"));
});

export { createShow, listShows, getShow, updateShow, deleteShow };
