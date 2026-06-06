import { Router } from "express";
import {
  createBooking,
  confirmBooking,
  listMyBookings,
  getMyBooking,
  listAllBookings,
  cancelBooking,
  validateBooking,
  getPublicTicket,
} from "../controller/booking.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { requireRole } from "../utils/helper.js";

const router = Router();

// Public, unauthenticated sharable ticket view.
// Declared first so it cannot be shadowed by any auth-protected route below.
router.get("/public/:id", getPublicTicket);

router.post("/", isAuthenticated, createBooking);
router.get("/me", isAuthenticated, listMyBookings);
router.get("/me/:id", isAuthenticated, getMyBooking);
router.post("/me/:id/confirm", isAuthenticated, confirmBooking);
router.post("/me/:id/cancel", isAuthenticated, cancelBooking);
router.get("/", isAuthenticated, requireRole("admin"), listAllBookings);
router.post(
  "/validate",
  isAuthenticated,
  requireRole("admin"),
  validateBooking
);

export default router;
