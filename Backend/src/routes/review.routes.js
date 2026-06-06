import { Router } from "express";
import {
  listReviewsForMovie,
  createReview,
  updateMyReview,
  deleteMyReview,
  adminListReviews,
  adminToggleHide,
} from "../controller/review.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public
router.get("/movie/:movieId", listReviewsForMovie);

// Auth (admin routes are declared first so the static "admin" segment is
// matched before the dynamic "/me/:id" if it ever gets refactored).
router.get("/admin", isAuthenticated, requireRole("admin"), adminListReviews);
router.patch(
  "/admin/:id/hide",
  isAuthenticated,
  requireRole("admin"),
  adminToggleHide
);

// Authenticated end-user
router.post("/", isAuthenticated, createReview);
router.patch("/me/:id", isAuthenticated, updateMyReview);
router.delete("/me/:id", isAuthenticated, deleteMyReview);

export default router;
