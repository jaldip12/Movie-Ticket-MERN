import { Router } from "express";
import { getPresignedUrl } from "../controller/upload.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

router.post("/presign", isAuthenticated, requireRole("admin"), getPresignedUrl);

export default router;
