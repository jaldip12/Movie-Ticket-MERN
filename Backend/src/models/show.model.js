import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    seatingLayoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SeatingLayout',
        required: true
    }
}, { timestamps: true });

const Show = mongoose.model("Show", showSchema);
export default Show;
