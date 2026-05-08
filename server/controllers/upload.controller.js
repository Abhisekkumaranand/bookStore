import cloudinary from "../lib/cloudinary.js";

export const uploadImage = async (req, res) => {
  try {
    const { image, folder = "bookvista" } = req.body;

    if (!image) {
      return res.status(400).json({ message: "No image provided." });
    }

    // Validate base64
    if (!image.startsWith("data:image/")) {
      return res.status(400).json({ message: "Invalid image format. Send base64 data URL." });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
      max_bytes: 10 * 1024 * 1024, // 10 MB
    });

    res.status(200).json({
      message: "Image uploaded.",
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    console.error("uploadImage error:", error.message);
    res.status(500).json({ message: "Image upload failed. Please try again." });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).json({ message: "No image provided." });
    if (!image.startsWith("data:image/")) return res.status(400).json({ message: "Invalid image format. Send base64 data URL." });

    const result = await cloudinary.uploader.upload(image, {
      folder: "bookvista/avatars",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 200, height: 200, crop: "fill", gravity: "face" }],
      max_bytes: 5 * 1024 * 1024,
    });

    res.status(200).json({
      message: "Avatar uploaded.",
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error("uploadAvatar error:", error.message);
    res.status(500).json({ message: "Avatar upload failed. Please try again." });
  }
};

export const uploadBookCover = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) return res.status(400).json({ message: "No image provided." });
    if (!image.startsWith("data:image/")) return res.status(400).json({ message: "Invalid image format. Send base64 data URL." });

    const result = await cloudinary.uploader.upload(image, {
      folder: "bookvista/covers",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
      max_bytes: 10 * 1024 * 1024,
    });

    res.status(200).json({ message: "Cover uploaded.", url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    console.error("uploadBookCover error:", error.message);
    res.status(500).json({ message: "Cover upload failed. Please try again." });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: "publicId is required." });
    }

    await cloudinary.uploader.destroy(publicId);
    res.status(200).json({ message: "Image deleted." });
  } catch (error) {
    console.error("deleteImage error:", error.message);
    res.status(500).json({ message: "Image deletion failed." });
  }
};