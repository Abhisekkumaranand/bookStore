import express from "express";
import Category from "../models/Category.model.js";
import Book from "../models/Book.model.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ─── Public: Get All Active Categories ───────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("getCategories error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Public: Get Single Category ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({
      id: req.params.id,
      isActive: true,
    }).lean();

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    // Get book count for this category
    const bookCount = await Book.countDocuments({
      category: req.params.id,
      isActive: true,
    });

    res.status(200).json({
      success: true,
      category: { ...category, bookCount },
    });
  } catch (error) {
    console.error("getCategory error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Admin: Create Category ───────────────────────────────────────────────────
router.post("/", protectRoute, adminRoute, async (req, res) => {
  try {
    const category = await Category.create(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    console.error("createCategory error:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      return res.status(409).json({
        success: false,
        message: `Category with this ${field} already exists.`,
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Admin: Update Category ───────────────────────────────────────────────────
router.put("/:id", protectRoute, adminRoute, async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.status(200).json({
      success: true,
      message: "Category updated.",
      category,
    });
  } catch (error) {
    console.error("updateCategory error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Category ID or slug already exists.",
      });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Admin: Soft Delete Category ─────────────────────────────────────────────
router.delete("/:id", protectRoute, adminRoute, async (req, res) => {
  try {
    // Check if books exist under this category
    const bookCount = await Book.countDocuments({
      category: req.params.id,
      isActive: true,
    });

    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${bookCount} active book(s). Reassign books first.`,
      });
    }

    const category = await Category.findOneAndUpdate(
      { id: req.params.id },
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted.",
    });
  } catch (error) {
    console.error("deleteCategory error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// ─── Admin: Sync Book Counts ──────────────────────────────────────────────────
router.post(
  "/sync-counts",
  protectRoute,
  adminRoute,
  async (req, res) => {
    try {
      const categories = await Category.find({}).lean();

      const updates = await Promise.all(
        categories.map(async (cat) => {
          const count = await Book.countDocuments({
            category: cat.id,
            isActive: true,
          });
          return Category.findByIdAndUpdate(cat._id, { bookCount: count });
        })
      );

      res.status(200).json({
        success: true,
        message: `Book counts synced for ${updates.length} categories.`,
      });
    } catch (error) {
      console.error("syncCounts error:", error.message);
      res.status(500).json({ success: false, message: "Server error." });
    }
  }
);

export default router;