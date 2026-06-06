import { ApiError } from "../utils/apierror.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json(new ApiError(401, "Missing token"));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decodedToken?.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json(new ApiError(401, "user not found"));
    }
    req.user = user;
    next();
  } catch {
    // Don't log the JWT error — it can leak token contents into server logs
    // and an unauthenticated request isn't actionable for ops.
    return res.status(401).json(new ApiError(401, "Unauthorized request"));
  }
};
