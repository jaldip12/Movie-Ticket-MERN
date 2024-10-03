import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    poster: { type: String, required: true, trim: true },
    rating: { 
        type: Number, 
        min: 0, 
        max: 10, 
        default: 0 
    },
    votes: { type: Number, default: 0 },
    certification: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    genres: [{ type: String, required: true, trim: true }],
    releaseDate: { type: Date, required: true },
    duration: { type: Number, required: true },
}, { timestamps: true });

// Export the model
const Movie = mongoose.model("Movie", movieSchema);
export default Movie;
