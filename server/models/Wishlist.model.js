import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    coverImage: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      default: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: {
      type: [wishlistItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
wishlistSchema.index({ "items.book": 1 });

// ─── Virtuals ─────────────────────────────────────────────────────────────────
wishlistSchema.virtual("totalItems").get(function () {
  return this.items.length;
});

wishlistSchema.virtual("totalValue").get(function () {
  return this.items.reduce((sum, item) => sum + item.price, 0);
});

wishlistSchema.virtual("totalSavings").get(function () {
  return this.items.reduce(
    (sum, item) => sum + (item.mrp - item.price),
    0
  );
});

// ─── Instance method: check if book is wishlisted ─────────────────────────────
wishlistSchema.methods.hasBook = function (bookId) {
  return this.items.some(
    (item) => item.book.toString() === bookId.toString()
  );
};

// ─── Instance method: add book ────────────────────────────────────────────────
wishlistSchema.methods.addBook = function (bookData) {
  if (!this.hasBook(bookData.book || bookData._id)) {
    this.items.push({
      book: bookData._id || bookData.book,
      title: bookData.title,
      author: bookData.author,
      coverImage: bookData.coverImage || "",
      price: bookData.price,
      mrp: bookData.mrp || 0,
      category: bookData.category || "",
      rating: bookData.rating || 0,
      stock: bookData.stock || 0,
    });
  }
};

// ─── Instance method: remove book ────────────────────────────────────────────
wishlistSchema.methods.removeBook = function (bookId) {
  this.items = this.items.filter(
    (item) => item.book.toString() !== bookId.toString()
  );
};

const Wishlist =
  mongoose.models.Wishlist || mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;