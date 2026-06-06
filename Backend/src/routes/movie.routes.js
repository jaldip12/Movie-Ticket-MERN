import { Router } from "express";
import {
  listMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
  searchMovies,
  listTrending,
  listComingSoon,
} from "../controller/movie.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public reads
router.get("/", listMovies);
// NOTE: /search and /trending must be declared BEFORE /:id, otherwise the
// dynamic segment swallows the literal paths.
router.get("/search", searchMovies);
router.get("/trending", listTrending);
router.get("/coming-soon", listComingSoon);
router.get("/:id", getMovie);

// Admin writes
router.post("/", isAuthenticated, requireRole("admin"), createMovie);
router.patch("/:id", isAuthenticated, requireRole("admin"), updateMovie);
router.delete("/:id", isAuthenticated, requireRole("admin"), deleteMovie);

export default router;
