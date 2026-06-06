import { Router } from "express";
import {
  createSeatingPlan,
  updateSeatingPlan,
  deleteSeatingPlan,
  getAllSeatingPlans,
  getSeatingPlanById,
  getSeatingPlanByName,
} from "../controller/seating.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public reads (used by the user-facing seat picker)
router.get("/seatingplans", getAllSeatingPlans);
router.get("/seatingplans/:id", getSeatingPlanById);
router.get("/seatingplans/name/:name", getSeatingPlanByName);

// Admin writes
router.post(
  "/seatingplans",
  isAuthenticated,
  requireRole("admin"),
  createSeatingPlan
);
router.put(
  "/seatingplans/:id",
  isAuthenticated,
  requireRole("admin"),
  updateSeatingPlan
);
router.delete(
  "/seatingplans/:id",
  isAuthenticated,
  requireRole("admin"),
  deleteSeatingPlan
);

export default router;
