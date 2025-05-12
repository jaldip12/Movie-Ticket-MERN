import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movieName: {
      type: String,
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
    seatingLayoutName: {
      type: String,
      required: true,
    },
    bookedSeats: [
      {
        type: String,
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Show = mongoose.model("Show", showSchema);
export default Show;
