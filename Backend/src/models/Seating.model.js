import mongoose from "mongoose";

const seatingSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sections: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        rows: {
          type: Number,
          required: true,
          min: 1,
          default: 10,
        },
        columns: {
          type: Number,
          required: true,
          min: 1,
          default: 10,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
          default: 0,
        },
        unavailableSeats: [
          {
            row: {
              type: String,
              required: true,
            },
            seats: [
              {
                type: Number,
                required: true,
                min: 1,
              },
            ],
          },
        ],
        bookedSeats: [
          {
            row: {
              type: String,
              required: true,
            },
            seats: [
              {
                type: Number,
                required: true,
                min: 1,
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Generate unique ID starting from 100
seatingSchema.pre("save", async function (next) {
  if (!this.id) {
    const lastSeating = await mongoose
      .model("Seating")
      .findOne()
      .sort({ id: -1 });
    this.id = lastSeating ? lastSeating.id + 1 : 100;
  }
  next();
});

const Seating = mongoose.model("Seating", seatingSchema);
export default Seating;
