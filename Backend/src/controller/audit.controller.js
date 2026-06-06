import mongoose from "mongoose";
import AuditLog from "../models/auditLog.model.js";
import { asyncHandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/apiresponce.js";
import { ApiError } from "../utils/apierror.js";

const ALLOWED_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

const listAuditLog = asyncHandler(async (req, res) => {
  const { userId, method } = req.query;

  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);
  if (!Number.isFinite(page) || page < 1) page = 1;
  if (!Number.isFinite(limit) || limit < 1) limit = 50;
  if (limit > 200) limit = 200;

  const filter = {};
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    filter.userId = userId;
  }
  if (method) {
    const upper = String(method).toUpperCase();
    if (!ALLOWED_METHODS.has(upper)) {
      throw new ApiError(400, "Invalid method filter");
    }
    filter.method = upper;
  }

  const total = await AuditLog.countDocuments(filter);
  const items = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({ path: "userId", select: "firstname email" })
    .lean();

  const pageCount = Math.max(1, Math.ceil(total / limit));

  return res.status(200).json(
    new ApiResponse(
      200,
      { items, total, page, pageCount },
      "Audit log fetched successfully"
    )
  );
});

export { listAuditLog };
