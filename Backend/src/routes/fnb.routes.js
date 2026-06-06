import { Router } from "express";
import {
  listFnbItems,
  getFnbItem,
  createFnbItem,
  updateFnbItem,
  deleteFnbItem,
} from "../controller/fnb.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public reads
router.get("/", listFnbItems);
router.get("/:id", getFnbItem);

// Admin writes
router.post("/", isAuthenticated, requireRole("admin"), createFnbItem);
router.patch("/:id", isAuthenticated, requireRole("admin"), updateFnbItem);
router.delete("/:id", isAuthenticated, requireRole("admin"), deleteFnbItem);

export default router;
