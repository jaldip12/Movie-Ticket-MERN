import mongoose from "mongoose";
import Screen from "../models/screen.model.js";
import Cinema from "../models/cinema.model.js";
import Seating from "../models/Seating.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

const createScreen = asyncHandler(async (req, res) => {
  const { cinemaId, name, seatingPlanId } = req.body || {};

  if (!cinemaId || !name?.trim() || !seatingPlanId) {
    throw new ApiError(
      400,
      "cinemaId, name and seatingPlanId are required"
    );
  }

  if (!mongoose.isValidObjectId(cinemaId)) {
    throw new ApiError(400, "Invalid cinemaId");
  }
  if (!mongoose.isValidObjectId(seatingPlanId)) {
    throw new ApiError(400, "Invalid seatingPlanId");
  }

  const cinema = await Cinema.findById(cinemaId);
  if (!cinema || !cinema.isActive) {
    throw new ApiError(404, "Cinema not found or inactive");
  }

  const seatingPlan = await Seating.findById(seatingPlanId);
  if (!seatingPlan) {
    throw new ApiError(404, "Seating plan not found");
  }

  const trimmedName = name.trim();

  const existing = await Screen.findOne({
    cinemaId,
    name: trimmedName,
  });
  if (existing) {
    throw new ApiError(
      409,
      "A screen with the same name already exists for this cinema"
    );
  }

  try {
    const screen = await Screen.create({
      cinemaId,
      name: trimmedName,
      seatingPlanId,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, screen, "Screen created successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(
        409,
        "A screen with the same name already exists for this cinema"
      );
    }
    throw err;
  }
});

const listScreens = asyncHandler(async (req, res) => {
  const { cinemaId } = req.query;
  const filter = { isActive: true };

  if (cinemaId) {
    if (!mongoose.isValidObjectId(cinemaId)) {
      throw new ApiError(400, "Invalid cinemaId");
    }
    filter.cinemaId = cinemaId;
  }

  const screens = await Screen.find(filter)
    .populate("cinemaId", "name city")
    .populate("seatingPlanId", "name")
    .sort({ createdAt: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, screens, "Screens fetched successfully"));
});

const getScreen = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid screen id");
  }

  const screen = await Screen.findById(id)
    .populate("cinemaId", "name city")
    .populate("seatingPlanId", "name");

  if (!screen) {
    throw new ApiError(404, "Screen not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, screen, "Screen fetched successfully"));
});

const updateScreen = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid screen id");
  }

  const { name, seatingPlanId, isActive } = req.body || {};
  const update = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "name must be a non-empty string");
    }
    update.name = name.trim();
  }
  if (seatingPlanId !== undefined) {
    if (!mongoose.isValidObjectId(seatingPlanId)) {
      throw new ApiError(400, "Invalid seatingPlanId");
    }
    const seatingPlan = await Seating.findById(seatingPlanId);
    if (!seatingPlan) {
      throw new ApiError(404, "Seating plan not found");
    }
    update.seatingPlanId = seatingPlanId;
  }
  if (isActive !== undefined) {
    if (typeof isActive !== "boolean") {
      throw new ApiError(400, "isActive must be a boolean");
    }
    update.isActive = isActive;
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  try {
    const screen = await Screen.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!screen) {
      throw new ApiError(404, "Screen not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, screen, "Screen updated successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(
        409,
        "A screen with the same name already exists for this cinema"
      );
    }
    throw err;
  }
});

const deleteScreen = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid screen id");
  }

  const screen = await Screen.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!screen) {
    throw new ApiError(404, "Screen not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, screen, "Screen deleted successfully"));
});

export {
  createScreen,
  listScreens,
  getScreen,
  updateScreen,
  deleteScreen,
};
