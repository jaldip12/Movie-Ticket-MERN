import { Router } from "express";
import {
  createShow,
  listShows,
  getShow,
  updateShow,
  deleteShow,
} from "../controller/show.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public reads
router.get("/", listShows);
router.get("/:id", getShow);

// Admin: manage shows
router.post("/", isAuthenticated, requireRole("admin"), createShow);
router.patch("/:id", isAuthenticated, requireRole("admin"), updateShow);
router.delete("/:id", isAuthenticated, requireRole("admin"), deleteShow);

export default router;
