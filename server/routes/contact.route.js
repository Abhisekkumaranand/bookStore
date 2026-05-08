import express from "express";
import {
  submitContact,
  getAllContacts,
  updateContactStatus,
} from "../controllers/contact.controller.js";
import { optionalAuth, protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Public (attach user if logged in) ───────────────────────────────────────
router.post("/", optionalAuth, submitContact);

// ─── Admin ────────────────────────────────────────────────────────────────────
router.get("/", protectRoute, adminRoute, getAllContacts);
router.put("/:id", protectRoute, adminRoute, updateContactStatus);

export default router;