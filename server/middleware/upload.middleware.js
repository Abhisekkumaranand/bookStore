import multer from "multer";
import path from "path";

// ─── Allowed MIME types ───────────────────────────────────────────────────────
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
];

// ─── File filter ──────────────────────────────────────────────────────────────
const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isAllowedMime = ALLOWED_IMAGE_TYPES.includes(file.mimetype);
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);

  if (isAllowedMime && isAllowedExt) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS.join(", ")}`
      ),
      false
    );
  }
};

// ─── Memory Storage (for Cloudinary streaming) ────────────────────────────────
const memoryStorage = multer.memoryStorage();

// ─── Size limits ──────────────────────────────────────────────────────────────
const SIZE_LIMITS = {
  avatar: 2 * 1024 * 1024,    // 2MB
  cover: 5 * 1024 * 1024,     // 5MB
  general: 10 * 1024 * 1024,  // 10MB
};

// ─── Multer instances ─────────────────────────────────────────────────────────

// Avatar upload (2MB max)
export const uploadAvatar = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: SIZE_LIMITS.avatar,
    files: 1,
  },
});

// Book cover upload (5MB max)
export const uploadCover = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: SIZE_LIMITS.cover,
    files: 1,
  },
});

// General single image upload (10MB max)
export const uploadSingle = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: SIZE_LIMITS.general,
    files: 1,
  },
});

// Multiple images upload (max 5 files, 5MB each)
export const uploadMultiple = multer({
  storage: memoryStorage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: SIZE_LIMITS.cover,
    files: 5,
  },
});

// ─── Multer Error Handler Middleware ──────────────────────────────────────────
export const handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
          success: false,
          message: "File too large. Please check the size limit.",
        });
      case "LIMIT_FILE_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many files. Maximum 5 files allowed.",
        });
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          success: false,
          message: `Unexpected field: ${err.field}. Use the correct field name.`,
        });
      case "LIMIT_FIELD_KEY":
        return res.status(400).json({
          success: false,
          message: "Field name too long.",
        });
      case "LIMIT_PART_COUNT":
        return res.status(400).json({
          success: false,
          message: "Too many form parts.",
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
    }
  }

  // Custom file filter errors
  if (err.message && err.message.startsWith("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next(err);
};

// ─── Check file exists middleware ─────────────────────────────────────────────
export const requireFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded. Please select a file.",
    });
  }
  next();
};

// ─── Check multiple files exist middleware ─────────────────────────────────────
export const requireFiles = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No files uploaded. Please select at least one file.",
    });
  }
  next();
};

// ─── File size validator middleware ───────────────────────────────────────────
export const validateFileSize = (maxSizeBytes) => (req, res, next) => {
  if (req.file && req.file.size > maxSizeBytes) {
    const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return res.status(400).json({
      success: false,
      message: `File size exceeds ${maxMB}MB limit.`,
    });
  }
  next();
};

// ─── Combined middleware helpers ──────────────────────────────────────────────

// Single avatar upload with validation
export const avatarUpload = [
  uploadAvatar.single("image"),
  handleUploadError,
  requireFile,
];

// Single book cover upload with validation
export const bookCoverUpload = [
  uploadCover.single("image"),
  handleUploadError,
  requireFile,
];

// General single image with validation
export const generalUpload = [
  uploadSingle.single("image"),
  handleUploadError,
  requireFile,
];

// Multiple images with validation
export const multipleUpload = [
  uploadMultiple.array("images", 5),
  handleUploadError,
  requireFiles,
];

export default {
  uploadAvatar,
  uploadCover,
  uploadSingle,
  uploadMultiple,
  handleUploadError,
  requireFile,
  requireFiles,
  validateFileSize,
  avatarUpload,
  bookCoverUpload,
  generalUpload,
  multipleUpload,
};