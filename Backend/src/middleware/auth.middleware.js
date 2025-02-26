import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    if (res.headersSent) {
      return next(); // Skip sending headers again
    }
    const token =
      req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");

      // console.log(token)
    if (!token) {
      return res.status(401).json(new ApiError(401, "Missing token"));
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decodedToken)

    const user = await User.findById(decodedToken?.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json(new ApiError(401, "user not found"));
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json(new ApiError(401, "Unauthorized request"));
  }
};
