import mongoose from "mongoose";
import Cinema from "../models/cinema.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

const createCinema = asyncHandler(async (req, res) => {
  const { name, city, address, chain, logo, themeColor } = req.body || {};

  if (!name?.trim() || !city?.trim() || !address?.trim()) {
    throw new ApiError(400, "name, city and address are required");
  }

  const trimmedName = name.trim();
  const trimmedCity = city.trim();
  const trimmedAddress = address.trim();

  const existing = await Cinema.findOne({
    name: trimmedName,
    city: trimmedCity,
  });
  if (existing) {
    throw new ApiError(
      409,
      "A cinema with the same name already exists in this city"
    );
  }

  try {
    const cinema = await Cinema.create({
      name: trimmedName,
      city: trimmedCity,
      address: trimmedAddress,
      chain: typeof chain === "string" ? chain.trim() : "",
      logo: typeof logo === "string" ? logo.trim() : "",
      themeColor: typeof themeColor === "string" ? themeColor.trim() : "",
    });

    return res
      .status(201)
      .json(new ApiResponse(201, cinema, "Cinema created successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(
        409,
        "A cinema with the same name already exists in this city"
      );
    }
    throw err;
  }
});

const listCinemas = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const filter = { isActive: true };

  if (city && city.trim()) {
    filter.city = city.trim();
  }

  const cinemas = await Cinema.find(filter).sort({ city: 1, name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, cinemas, "Cinemas fetched successfully"));
});

const listCities = asyncHandler(async (req, res) => {
  const cities = await Cinema.distinct("city", { isActive: true });
  cities.sort((a, b) => a.localeCompare(b));

  return res
    .status(200)
    .json(new ApiResponse(200, cities, "Cities fetched successfully"));
});

const getCinema = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid cinema id");
  }

  const cinema = await Cinema.findOne({ _id: id, isActive: true });
  if (!cinema) {
    throw new ApiError(404, "Cinema not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cinema, "Cinema fetched successfully"));
});

const updateCinema = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid cinema id");
  }

  const { name, city, address, chain, logo, themeColor, isActive } =
    req.body || {};
  const update = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      throw new ApiError(400, "name must be a non-empty string");
    }
    update.name = name.trim();
  }
  if (city !== undefined) {
    if (typeof city !== "string" || !city.trim()) {
      throw new ApiError(400, "city must be a non-empty string");
    }
    update.city = city.trim();
  }
  if (address !== undefined) {
    if (typeof address !== "string" || !address.trim()) {
      throw new ApiError(400, "address must be a non-empty string");
    }
    update.address = address.trim();
  }
  if (chain !== undefined) {
    if (typeof chain !== "string") {
      throw new ApiError(400, "chain must be a string");
    }
    update.chain = chain.trim();
  }
  if (logo !== undefined) {
    if (typeof logo !== "string") {
      throw new ApiError(400, "logo must be a string");
    }
    update.logo = logo.trim();
  }
  if (themeColor !== undefined) {
    if (typeof themeColor !== "string") {
      throw new ApiError(400, "themeColor must be a string");
    }
    update.themeColor = themeColor.trim();
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
    const cinema = await Cinema.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!cinema) {
      throw new ApiError(404, "Cinema not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, cinema, "Cinema updated successfully"));
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(
        409,
        "A cinema with the same name already exists in this city"
      );
    }
    throw err;
  }
});

const deleteCinema = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid cinema id");
  }

  const cinema = await Cinema.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!cinema) {
    throw new ApiError(404, "Cinema not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cinema, "Cinema deleted successfully"));
});

export {
  createCinema,
  listCinemas,
  listCities,
  getCinema,
  updateCinema,
  deleteCinema,
};
