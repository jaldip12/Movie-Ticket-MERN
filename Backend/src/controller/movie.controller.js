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

export { addmovie };