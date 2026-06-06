import { Router } from "express";
import { subscribeNotification } from "../controller/movieNotification.controller.js";

const router = Router();

// Public — relies on the global rate limiter mounted in app.js
router.post("/", subscribeNotification);

export default router;
