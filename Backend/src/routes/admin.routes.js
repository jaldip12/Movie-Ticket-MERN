import { Router } from "express";
import {
  getStats,
  exportBookingsCSV,
  exportUsersCSV,
} from "../controller/admin.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

router.get("/stats", isAuthenticated, requireRole("admin"), getStats);
router.get(
  "/export/bookings",
  isAuthenticated,
  requireRole("admin"),
  exportBookingsCSV
);
router.get(
  "/export/users",
  isAuthenticated,
  requireRole("admin"),
  exportUsersCSV
);

export default router;
