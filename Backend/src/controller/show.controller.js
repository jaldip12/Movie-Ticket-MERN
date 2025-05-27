import mongoose from "mongoose";
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
   
    if (!shows?.length) {
        throw new ApiResponse(404, "",`No shows found for movie: ${title}`);
    }

    return res.status(200).json(
        new ApiResponse(200, shows, "Shows fetched successfully")
    );
});
 
const bookSeats = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body;
  console.log("Booking request:", req.body);
  console.log("Show ID:", showId);
  // Input validation
  if (!showId || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({ success: false, message: "showId and seats are required" });
  }

  
  // Format seats into "A5", "B10" etc.
  let formattedSeats;
  try {
    formattedSeats = seats.map(seat => {
      if (typeof seat === "object" && seat.row && seat.number) {
        return `${seat.row}${seat.number}`;
      } else if (typeof seat === "string") {
        return seat.trim();
      } else {
        throw new Error("Invalid seat format");
      }
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  // Start MongoDB transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const show = await Show.findById(showId).session(session);
    if (!show) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Show not found" });
    }

    // Check for already booked seats
    const alreadyBooked = formattedSeats.filter(seat => show.bookedSeats.includes(seat));
    const newSeats = formattedSeats.filter(seat => !show.bookedSeats.includes(seat));

    if (alreadyBooked.length > 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({
        success: false,
        message: `Some seats are already booked: ${alreadyBooked.join(", ")}`,
        alreadyBooked,
      });
    }

    // Add only new unbooked seats
    show.bookedSeats.push(...newSeats);
    await show.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: "Seats booked successfully",
      bookedSeats: show.bookedSeats,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("Booking error:", err);
    return res.status(500).json({
      success: false,
      message: "Error booking seats. Please try again.",
    });
  }
});

export default bookSeats;

const getBookedSeats = asyncHandler(async (req, res) => {
    const { showId } = req.params;

    if (!showId) {
        throw new ApiResponse(400, "", "Show ID is required");
    }

    const show = await Show.findById(showId);
    if (!show) {
        throw new ApiResponse(404, "", "Show not found");
    }

    return res.status(200).json(
        new ApiResponse(200, show.bookedSeats, "Booked seats fetched successfully")
    );
});

export {
    createShow,
    getShows,
    getShowsByMovie,
    bookSeats,
    getBookedSeats
};
