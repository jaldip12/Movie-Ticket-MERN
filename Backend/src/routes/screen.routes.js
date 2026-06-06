import { Router } from "express";
import {
  createScreen,
  listScreens,
  getScreen,
  updateScreen,
  deleteScreen,
} from "../controller/screen.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public reads
router.get("/", listScreens);
router.get("/:id", getScreen);

// Admin writes
router.post("/", isAuthenticated, requireRole("admin"), createScreen);
router.patch("/:id", isAuthenticated, requireRole("admin"), updateScreen);
router.delete("/:id", isAuthenticated, requireRole("admin"), deleteScreen);

export default router;
