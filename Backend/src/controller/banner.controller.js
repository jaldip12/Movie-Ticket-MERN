import mongoose from "mongoose";
import Banner from "../models/banner.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

const ALLOWED_FIELDS = [
  "title",
  "image",
  "ctaText",
  "ctaUrl",
  "position",
  "sortOrder",
  "validFrom",
  "validUntil",
  "isActive",
];

const pickAllowed = (body = {}) => {
  const out = {};
  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      out[key] = body[key];
    }
  }
  return out;
};

const listActiveBanners = asyncHandler(async (req, res) => {
  const { position } = req.query;
  const now = new Date();

  const filter = {
    isActive: true,
    $and: [
      { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
      { $or: [{ validUntil: null }, { validUntil: { $gte: now } }] },
    ],
  };

  if (position && ["hero", "strip"].includes(position)) {
    filter.position = position;
  }

  const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, banners, "Banners fetched successfully"));
});

const adminListBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort({
    isActive: -1,
    position: 1,
    sortOrder: 1,
    createdAt: -1,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, banners, "All banners fetched successfully"));
});

const adminCreateBanner = asyncHandler(async (req, res) => {
  const {
    title,
    image,
    ctaText,
    ctaUrl,
    position,
    sortOrder,
    validFrom,
    validUntil,
    isActive,
  } = req.body || {};

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new ApiError(400, "title is required");
  }
  if (!image || typeof image !== "string" || !image.trim()) {
    throw new ApiError(400, "image is required");
  }

  const finalPosition =
    position && ["hero", "strip"].includes(position) ? position : "strip";

  const banner = await Banner.create({
    title: title.trim(),
    image: image.trim(),
    ctaText: typeof ctaText === "string" ? ctaText : "",
    ctaUrl: typeof ctaUrl === "string" ? ctaUrl : "",
    position: finalPosition,
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
    validFrom: validFrom ? new Date(validFrom) : null,
    validUntil: validUntil ? new Date(validUntil) : null,
    isActive: typeof isActive === "boolean" ? isActive : true,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, banner, "Banner created successfully"));
});

const adminUpdateBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid banner id");
  }

  const updates = pickAllowed(req.body || {});

  if (Object.prototype.hasOwnProperty.call(updates, "position")) {
    if (!["hero", "strip"].includes(updates.position)) {
      throw new ApiError(400, "position must be 'hero' or 'strip'");
    }
  }

  if (Object.prototype.hasOwnProperty.call(updates, "validFrom")) {
    updates.validFrom = updates.validFrom ? new Date(updates.validFrom) : null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "validUntil")) {
    updates.validUntil = updates.validUntil
      ? new Date(updates.validUntil)
      : null;
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  const banner = await Banner.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, banner, "Banner updated successfully"));
});

const adminDeleteBanner = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid banner id");
  }

  const banner = await Banner.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!banner) {
    throw new ApiError(404, "Banner not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, banner, "Banner deleted successfully"));
});

export {
  listActiveBanners,
  adminListBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
};
