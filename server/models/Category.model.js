import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: [true, "Category ID is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [30, "Category ID must be at most 30 characters"],
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Category name must be at most 50 characters"],
    },
    icon: {
      type: String,
      default: "📚",
      trim: true,
    },
    description: {
      type: String,
      default: "",
      maxlength: [300, "Description must be at most 300 characters"],
    },
    coverImage: {
      type: String,
      default: "",
    },
    coverImagePublicId: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    bookCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    metaTitle: {
      type: String,
      default: "",
    },
    metaDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
categorySchema.index({ isActive: 1, sortOrder: 1 });
categorySchema.index({ name: "text", description: "text" });

// ─── Pre-save: auto-generate slug from id ─────────────────────────────────────
// ✅ One combined pre-save hook
// ✅ New way - use async, no next() needed
categorySchema.pre("save", async function () {
  if (this.isModified("id") || !this.slug) {
    this.slug = this.id
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  if (!this.metaTitle) {
    this.metaTitle = `${this.name} Books - BookVista`;
  }
  if (!this.metaDescription) {
    this.metaDescription =
      this.description ||
      `Browse the best ${this.name} books at BookVista. Affordable prices, fast delivery.`;
  }
});

// ─── Static: sync bookCount ───────────────────────────────────────────────────
categorySchema.statics.syncBookCount = async function (categoryId) {
  try {
    const Book = mongoose.model("Book");
    const count = await Book.countDocuments({
      category: categoryId,
      isActive: true,
    });
    await this.findOneAndUpdate({ id: categoryId }, { bookCount: count });
  } catch (err) {
    console.error("syncBookCount error:", err.message);
  }
};

const Category =
  mongoose.models.Category || mongoose.model("Category", categorySchema);

export default Category;