import { Router } from "express";
import { listAuditLog } from "../controller/audit.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

router.get("/", isAuthenticated, requireRole("admin"), listAuditLog);

export default router;
