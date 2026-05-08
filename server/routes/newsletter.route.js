import express from "express";
import {
  subscribe,
  unsubscribe,
  getAllSubscribers,
} from "../controllers/newsletter.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

// ─── Rate limiter for newsletter ──────────────────────────────────────────────
import rateLimit from "express-rate-limit";

const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many subscription attempts. Please try again after an hour.",
  },
});

const unsubscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/subscribe", newsletterLimiter, subscribe);
router.get("/unsubscribe", unsubscribeLimiter, unsubscribe);
router.post("/unsubscribe", unsubscribeLimiter, unsubscribe);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/", protectRoute, adminRoute, getAllSubscribers);

export default router;