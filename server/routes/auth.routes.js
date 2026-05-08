import express from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  addAddress,
  deleteAddress,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Public ───────────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ─── Protected ────────────────────────────────────────────────────────────────
router.use(protectRoute);

router.get("/me", getMe);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

// Addresses
router.post("/addresses", addAddress);
router.delete("/addresses/:addressId", deleteAddress);

export default router;