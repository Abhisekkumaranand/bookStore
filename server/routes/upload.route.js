import express from "express";
import {
  uploadImage,
  uploadBookCover,
  uploadAvatar,
  deleteImage,
} from "../controllers/upload.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import {
  uploadAvatar as avatarMiddleware,
  uploadCover as coverMiddleware,
  uploadSingle as singleMiddleware,
  handleUploadError,
  requireFile,
} from "../middleware/upload.middleware.js";

const router = express.Router();

// ─── Avatar upload — any authenticated user ───────────────────────────────────
router.post(
  "/avatar",
  protectRoute,
  avatarMiddleware.single("image"),
  handleUploadError,
  requireFile,
  uploadAvatar
);

// ─── Book cover — admin only ──────────────────────────────────────────────────
router.post(
  "/book-cover",
  protectRoute,
  adminRoute,
  coverMiddleware.single("image"),
  handleUploadError,
  requireFile,
  uploadBookCover
);

// ─── Generic image — admin only ───────────────────────────────────────────────
router.post(
  "/image",
  protectRoute,
  adminRoute,
  singleMiddleware.single("image"),
  handleUploadError,
  requireFile,
  uploadImage
);

// ─── Delete image — admin only ────────────────────────────────────────────────
router.delete("/image", protectRoute, adminRoute, deleteImage);

export default router;