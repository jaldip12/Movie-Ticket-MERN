import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const isAdminAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res
                .status(401)
                .json(new ApiResponse(401, null, "Authentication required"));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.admin = { _id: decoded.id };
        next();
    } catch (error) {
        return res
            .status(401)
            .json(new ApiResponse(401, null, "Invalid or expired token"));
    }
};
