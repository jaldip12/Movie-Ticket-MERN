import Show from "../models/show.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";

const createShow = asyncHandler(async (req, res) => {
    const { movieName, date, time, seatingLayoutName } = req.body;

    if (!movieName || !date || !time || !seatingLayoutName) {
        throw new ApiResponse(400, "","All fields are required");
        
        
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
    const { title } = req.query;
    
    if (!title?.trim()) {
        throw new ApiResponse(400,"", "Movie title is required");
    }

    const shows = await Show.find({
        movieName: { 
            $regex: title.trim(),
            $options: 'i'
        }
    }).sort({ date: 1 });
    console.log(shows);
    if (!shows?.length) {
        throw new ApiResponse(404, "",`No shows found for movie: ${title}`);
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
