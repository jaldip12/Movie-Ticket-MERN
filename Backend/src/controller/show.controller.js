import Show from "../models/show.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponce.js";

const createShow = asyncHandler(async (req, res) => {
    const { movieId, date, time, seatingLayoutId } = req.body;

    if (!movieId || !date || !time || !seatingLayoutId) {
        throw new ApiError(400, "All fields are required");
    }

    const show = await Show.create({
        movieId,
        date,
        time,
        seatingLayoutId
    });

    return res.status(201).json(
        new ApiResponse(201, show, "Show created successfully")
    );
});

const getShows = asyncHandler(async (req, res) => {
    const shows = await Show.find()
        .populate('movieId')
        .populate('seatingLayoutId');

    return res.status(200).json(
        new ApiResponse(200, shows, "Shows fetched successfully")
    );
});

const getShowsByMovie = asyncHandler(async (req, res) => {
    const { movieId } = req.params;

    if (!movieId) {
        throw new ApiError(400, "Movie ID is required");
    }

    const shows = await Show.find({ movieId })
        .populate('movieId')
        .populate('seatingLayoutId');

    return res.status(200).json(
        new ApiResponse(200, shows, "Shows fetched successfully")
    );
});

export {
    createShow,
    getShows,
    getShowsByMovie
};
