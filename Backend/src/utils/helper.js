import { ApiError } from "./apierror.js";

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, "Access denied"));
  }
  next();
};

const isAdmin = requireRole("admin");

export { requireRole, isAdmin };
