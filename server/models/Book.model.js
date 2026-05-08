import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title too long"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    mrp: {
      type: Number,
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"],
    },
    coverImage: {
      type: String,
      required: [true, "Cover image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "fiction",
        "self-help",
        "business",
        "finance",
        "history",
        "science",
        "children",
        "comics",
        "academic",
        "programming",
        "regional",
      ],
    },
    tags: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    stock: { type: Number, default: 10, min: 0 },
    publisher: { type: String, trim: true, default: "" },
    language: { type: String, default: "English" },
    pages: { type: Number, min: 1 },
    isbn: { type: String, trim: true, default: "" },
    year: { type: Number },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
bookSchema.index({ title: "text", author: "text", tags: "text" });
bookSchema.index({ category: 1 });
bookSchema.index({ price: 1 });
bookSchema.index({ rating: -1 });
bookSchema.index({ createdAt: -1 });
bookSchema.index({ isFeatured: 1 });
bookSchema.index({ isNewArrival: 1 });

// ─── Virtual: discount % ──────────────────────────────────────────────────────
bookSchema.virtual("discountPercent").get(function () {
  if (!this.mrp || this.mrp === 0) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});

const Book = mongoose.model("Book", bookSchema);
export default Book;