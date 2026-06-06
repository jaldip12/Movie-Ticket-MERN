import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  listMyWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
} from "../controller/wishlist.controller.js";

const router = Router();

router.get("/", isAuthenticated, listMyWishlist);
router.post("/", isAuthenticated, addToWishlist);
router.delete("/:movieId", isAuthenticated, removeFromWishlist);
router.get("/:movieId", isAuthenticated, isInWishlist);

export default router;
