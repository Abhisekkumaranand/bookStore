import express from "express";
import {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCoupon,
  getPublicCoupons,
} from "../controllers/coupon.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import rateLimit from "express-rate-limit";

// ─── Rate limiter for coupon validation ───────────────────────────────────────
const couponValidateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many coupon validation attempts. Please try again later.",
  },
});

const router = express.Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get("/public", getPublicCoupons);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.post(
  "/validate",
  protectRoute,
  couponValidateLimiter,
  validateCoupon
);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get("/", protectRoute, adminRoute, getAllCoupons);
router.post("/", protectRoute, adminRoute, createCoupon);
router.put("/:id", protectRoute, adminRoute, updateCoupon);
router.delete("/:id", protectRoute, adminRoute, deleteCoupon);
router.patch("/:id/toggle", protectRoute, adminRoute, toggleCoupon);

export default router;