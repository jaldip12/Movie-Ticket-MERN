import mongoose from "mongoose";
import FnbItem from "../models/fnbItem.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

const ALLOWED_CATEGORIES = ["popcorn", "drinks", "snacks", "combo"];

const isTrueFlag = (value) => {
  if (value === undefined || value === null) return false;
  const str = String(value).toLowerCase();
  return str === "1" || str === "true" || str === "yes";
};

/**
 * Public list endpoint with admin escape hatches.
 *
 * Query params:
 *  - cinemaId           ObjectId | "" : if present, return chain-wide + cinema-specific.
 *                                       If absent, return chain-wide only.
 *  - cinemaScope=all    bypass the cinemaId filter entirely (admin: all items across cinemas).
 *  - includeInactive=1  bypass the isAvailable filter (admin: include soft-deleted items).
 */
const listFnbItems = asyncHandler(async (req, res) => {
  const { cinemaId, cinemaScope, includeInactive } = req.query;

  const filter = {};

  // Availability filter (default: only available items)
  if (!isTrueFlag(includeInactive)) {
    filter.isAvailable = true;
  }

  // Cinema scope
  if (cinemaScope === "all") {
    // No cinema filter — admin "all" mode.
  } else if (cinemaId && String(cinemaId).trim()) {
    if (!mongoose.isValidObjectId(cinemaId)) {
      throw new ApiError(400, "Invalid cinemaId");
    }
    filter.$or = [{ cinemaId: null }, { cinemaId }];
  } else {
    filter.cinemaId = null;
  }

  const items = await FnbItem.find(filter).sort({ category: 1, name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, items, "F&B items fetched successfully"));
});

const getFnbItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid F&B item id");
  }

  const item = await FnbItem.findById(id);
  if (!item) {
    throw new ApiError(404, "F&B item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, "F&B item fetched successfully"));
});

const createFnbItem = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    category,
    veg,
    image,
    isAvailable,
    cinemaId,
  } = req.body || {};

  if (typeof name !== "string" || !name.trim()) {
    throw new ApiError(400, "name is required");
  }
  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    throw new ApiError(400, "price is required");
  }
  const numericPrice = Number(price);
  if (numericPrice < 0) {
    throw new ApiError(400, "price must be >= 0");
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    throw new ApiError(
      400,
      `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`
    );
  }

  const payload = {
    name: name.trim(),
    description:
      typeof description === "string" ? description.trim() : "",
    price: numericPrice,
    category,
    veg: typeof veg === "boolean" ? veg : true,
    image: typeof image === "string" ? image.trim() : "",
  };

  if (typeof isAvailable === "boolean") {
    payload.isAvailable = isAvailable;
  }

  if (cinemaId !== undefined && cinemaId !== null && cinemaId !== "") {
    if (!mongoose.isValidObjectId(cinemaId)) {
      throw new ApiError(400, "Invalid cinemaId");
    }
    payload.cinemaId = cinemaId;
  } else {
    payload.cinemaId = null;
  }

  const item = await FnbItem.create(payload);

  return res
    .status(201)
    .json(new ApiResponse(201, item, "F&B item created successfully"));
});

const updateFnbItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid F&B item id");
  }

  const allowed = [
    "name",
    "description",
    "price",
    "category",
    "veg",
    "image",
    "isAvailable",
    "cinemaId",
  ];

  const update = {};
  const body = req.body || {};

  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(body, key)) continue;
    const value = body[key];

    switch (key) {
      case "name": {
        if (typeof value !== "string" || !value.trim()) {
          throw new ApiError(400, "name must be a non-empty string");
        }
        update.name = value.trim();
        break;
      }
      case "description": {
        if (typeof value !== "string") {
          throw new ApiError(400, "description must be a string");
        }
        update.description = value.trim();
        break;
      }
      case "price": {
        const num = Number(value);
        if (Number.isNaN(num) || num < 0) {
          throw new ApiError(400, "price must be a number >= 0");
        }
        update.price = num;
        break;
      }
      case "category": {
        if (!ALLOWED_CATEGORIES.includes(value)) {
          throw new ApiError(
            400,
            `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`
          );
        }
        update.category = value;
        break;
      }
      case "veg": {
        if (typeof value !== "boolean") {
          throw new ApiError(400, "veg must be a boolean");
        }
        update.veg = value;
        break;
      }
      case "image": {
        if (typeof value !== "string") {
          throw new ApiError(400, "image must be a string");
        }
        update.image = value.trim();
        break;
      }
      case "isAvailable": {
        if (typeof value !== "boolean") {
          throw new ApiError(400, "isAvailable must be a boolean");
        }
        update.isAvailable = value;
        break;
      }
      case "cinemaId": {
        if (value === null || value === "") {
          update.cinemaId = null;
        } else {
          if (!mongoose.isValidObjectId(value)) {
            throw new ApiError(400, "Invalid cinemaId");
          }
          update.cinemaId = value;
        }
        break;
      }
      default:
        break;
    }
  }

  if (Object.keys(update).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const item = await FnbItem.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  if (!item) {
    throw new ApiError(404, "F&B item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, "F&B item updated successfully"));
});

const deleteFnbItem = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid F&B item id");
  }

  const item = await FnbItem.findByIdAndUpdate(
    id,
    { isAvailable: false },
    { new: true }
  );

  if (!item) {
    throw new ApiError(404, "F&B item not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, item, "F&B item deleted successfully"));
});

export {
  listFnbItems,
  getFnbItem,
  createFnbItem,
  updateFnbItem,
  deleteFnbItem,
};
