import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    bookedSeats: [
      {
        type: String,
      },
    ],
    lockedSeats: [
      {
        seat: {
          type: String,
          required: true,
        },
        lockedUntil: {
          type: Date,
          required: true,
        },
      },
    ],
    format: {
      type: String,
      enum: ["2D", "3D", "IMAX", "IMAX 3D", "4DX", "Dolby Atmos"],
      default: "2D",
    },
    language: {
      type: String,
      trim: true,
      default: "",
    },
    subtitles: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

showSchema.index({ movieId: 1, date: 1 });

const Show = mongoose.model("Show", showSchema);
export default Show;
