import Movie from "../models/movie.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";

const addmovie = asyncHandler(async (req, res) => {
    const { title, poster, certification, language, releaseDate, duration, genres } = req.body;

    if (!title || !poster || !certification || !language || !releaseDate || !duration || !genres) {
        return res.status(400).json(new ApiResponse(400, null, "All fields are required"));
    }

    const movieExists = await Movie.findOne({ title });
    if (movieExists) {
        return res.status(409).json(new ApiResponse(409, null, "Movie already exists"));
    }

    const movie = await Movie.create({
        title,
        poster,
        certification,
        language,
        releaseDate,
        duration,
        genres
    });

    res.status(201).json(new ApiResponse(201, movie, "Movie added successfully"));
});

const getmovies = asyncHandler(async (req, res) => {
    const movies = await Movie.find({}).limit(4);
    
    if (!movies || movies.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No movies found"));
    }

    res.status(200).json(new ApiResponse(200, movies, "Movies retrieved successfully"));
});

const getallmovies = asyncHandler(async (req, res) => {
    const movies = await Movie.find({});
    if (!movies || movies.length === 0) {
        return res.status(404).json(new ApiResponse(404, null, "No movies found"));
    }
    res.status(200).json(new ApiResponse(200, movies, "Movies retrieved successfully"));
});

export { addmovie,getmovies,getallmovies };