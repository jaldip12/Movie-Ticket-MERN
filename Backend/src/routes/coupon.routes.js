import { Router } from "express";
import {
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  validateCoupon,
} from "../controller/coupon.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// User: validate a coupon
router.post("/validate", isAuthenticated, validateCoupon);

// Admin CRUD
router.get("/", isAuthenticated, requireRole("admin"), adminListCoupons);
router.post("/", isAuthenticated, requireRole("admin"), adminCreateCoupon);
router.patch("/:id", isAuthenticated, requireRole("admin"), adminUpdateCoupon);
router.delete("/:id", isAuthenticated, requireRole("admin"), adminDeleteCoupon);

export default router;
