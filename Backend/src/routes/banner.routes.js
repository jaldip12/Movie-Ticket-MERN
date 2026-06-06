import { Router } from "express";
import {
  listActiveBanners,
  adminListBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
} from "../controller/banner.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public — active banners only
router.get("/", listActiveBanners);

// Admin
router.get("/admin", isAuthenticated, requireRole("admin"), adminListBanners);
router.post("/admin", isAuthenticated, requireRole("admin"), adminCreateBanner);
router.patch(
  "/admin/:id",
  isAuthenticated,
  requireRole("admin"),
  adminUpdateBanner
);
router.delete(
  "/admin/:id",
  isAuthenticated,
  requireRole("admin"),
  adminDeleteBanner
);

export default router;
