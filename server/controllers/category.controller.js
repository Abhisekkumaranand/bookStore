import Category from "../models/Category.model.js";

export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error("listCategories error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export const createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ message: "Category created.", category });
  } catch (error) {
    console.error("createCategory error:", error.message);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Category ID already exists." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.status(200).json({ message: "Category updated.", category });
  } catch (error) {
    console.error("updateCategory error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.status(200).json({ message: "Category deleted." });
  } catch (error) {
    console.error("deleteCategory error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};