import express from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  createCODOrder,
  getPaymentConfig,
  razorpayWebhook,
} from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Webhook (raw body needed, no auth) ──────────────────────────────────────
router.post(
  "/webhook/razorpay",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

// ─── Public config ────────────────────────────────────────────────────────────
router.get("/config", getPaymentConfig);

// ─── Protected ────────────────────────────────────────────────────────────────
router.use(protectRoute);

router.post("/razorpay/create-order", createRazorpayOrder);
router.post("/razorpay/verify", verifyPayment);
router.post("/cod", createCODOrder);

export default router;