import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import {
  registeruser,
  getUser,
  logout,
  me,
  adminListUsers,
  adminUpdateUser,
  requestOtp,
  loginWithOtp,
  updateMe,
  changeMyPassword,
  deleteMe,
  updateNotificationPreferences,
} from "../controller/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    statusCode: 429,
    success: false,
    message: "Too many attempts, try again later",
  },
});

router.post("/register", authLimiter, registeruser);
router.post("/login", authLimiter, getUser);
router.post("/otp/request", authLimiter, requestOtp);
router.post("/otp/verify", authLimiter, loginWithOtp);
router.post("/logout", isAuthenticated, logout);
router.get("/me", isAuthenticated, me);
router.patch("/me", isAuthenticated, updateMe);
router.patch("/me/notifications", isAuthenticated, updateNotificationPreferences);
router.post("/me/password", isAuthenticated, changeMyPassword);
router.delete("/me", isAuthenticated, deleteMe);

router.get(
  "/admin",
  isAuthenticated,
  requireRole("admin"),
  adminListUsers
);
router.patch(
  "/admin/:id",
  isAuthenticated,
  requireRole("admin"),
  adminUpdateUser
);

export default router;
