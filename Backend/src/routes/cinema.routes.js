import { Router } from "express";
import {
  createCinema,
  listCinemas,
  listCities,
  getCinema,
  updateCinema,
  deleteCinema,
} from "../controller/cinema.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public reads
router.get("/", listCinemas);
router.get("/cities", listCities);
router.get("/:id", getCinema);

// Admin writes
router.post("/", isAuthenticated, requireRole("admin"), createCinema);
router.patch("/:id", isAuthenticated, requireRole("admin"), updateCinema);
router.delete("/:id", isAuthenticated, requireRole("admin"), deleteCinema);

export default router;
