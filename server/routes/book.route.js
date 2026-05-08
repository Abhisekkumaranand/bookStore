import express from "express";
import {
  listBooks,
  getBook,
  getFeatured,
  getNewArrivals,
  getTopRated,
  getRecommendations,
  createBook,
  updateBook,
  deleteBook,
  addReview,
  deleteReview,
} from "../controllers/book.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get("/", listBooks);
router.get("/featured", getFeatured);
router.get("/new-arrivals", getNewArrivals);
router.get("/top-rated", getTopRated);
router.get("/:id", getBook);
router.get("/:id/recommendations", getRecommendations);

// ─── Protected ────────────────────────────────────────────────────────────────
router.post("/:id/reviews", protectRoute, addReview);
router.delete("/:id/reviews/:reviewId", protectRoute, deleteReview);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.post("/", protectRoute, adminRoute, createBook);
router.put("/:id", protectRoute, adminRoute, updateBook);
router.delete("/:id", protectRoute, adminRoute, deleteBook);

export default router;