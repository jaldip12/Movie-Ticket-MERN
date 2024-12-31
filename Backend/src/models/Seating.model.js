import mongoose from "mongoose";

const seatingSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      default: function() {
        return Math.floor(Math.random() * 900) + 100; // Random number from 100-999
      }
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sections: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      rows: {
        type: Number,
        required: true,
        min: 1,
      },
      columns: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      unavailableSeats: [{
        row: {
          type: String,
          required: true,
        },
        seats: [{
          type: Number,
          required: true,
          min: 1,
        }],
      }],
    }],
  },
  { timestamps: true }
);

const Seating = mongoose.model("Seating", seatingSchema);
export default Seating;
