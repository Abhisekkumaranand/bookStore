import express from "express";
import {
  getBookReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
  getMyReview,
} from "../controllers/review.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.get("/book/:bookId", getBookReviews);

// ─── Protected ────────────────────────────────────────────────────────────────
router.use(protectRoute);

router.get("/book/:bookId/my-review", getMyReview);
router.post("/book/:bookId", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);
router.post("/:reviewId/helpful", voteHelpful);

export default router;