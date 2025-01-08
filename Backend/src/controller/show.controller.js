import Show from "../models/show.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponce.js";

const createShow = asyncHandler(async (req, res) => {
    const { movieName, date, time, seatingLayoutName } = req.body;

    if (!movieName || !date || !time || !seatingLayoutName) {
        throw new ApiError(400, "All fields are required");
        
        
    }

    const show = await Show.create({
        movieName,
        date,
        time,
        seatingLayoutName
    });

    return res.status(201).json(
        new ApiResponse(201, show, "Show created successfully")
    );
});

const getShows = asyncHandler(async (req, res) => {
    const shows = await Show.find();

    return res.status(200).json(
        new ApiResponse(200, shows, "Shows fetched successfully")
    );
});

const getShowsByMovie = asyncHandler(async (req, res) => {
    const { movieTitle } = req.params;

    if (!movieTitle) {
        throw new ApiError(400, "Movie title is required");
    }

    const shows = await Show.find({ movieName: { $regex: movieTitle, $options: 'i' } });

    if (!shows || shows.length === 0) {
        throw new ApiError(404, "No shows found for this movie");
    }

    return res.status(200).json(
        new ApiResponse(200, shows, "Shows fetched successfully")
    );
});

export {
    createShow,
    getShows,
    getShowsByMovie
};
