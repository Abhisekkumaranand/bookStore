import express from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  checkWishlisted,
  moveToCart,
  getWishlistCount,
} from "../controllers/wishlist.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// All wishlist routes require authentication
router.use(protectRoute);

// ─── Get wishlist & count ─────────────────────────────────────────────────────
router.get("/", getWishlist);
router.get("/count", getWishlistCount);

// ─── Check single book ────────────────────────────────────────────────────────
router.get("/check/:bookId", checkWishlisted);

// ─── Add / Toggle ─────────────────────────────────────────────────────────────
router.post("/add", addToWishlist);
router.post("/toggle", toggleWishlist);

// ─── Move to cart ─────────────────────────────────────────────────────────────
router.post("/move-to-cart", moveToCart);

// ─── Remove / Clear ───────────────────────────────────────────────────────────
router.delete("/clear", clearWishlist);
router.delete("/:bookId", removeFromWishlist);

export default router;