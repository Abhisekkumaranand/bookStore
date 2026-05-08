import Book from "../models/Book.model.js";
import Review from "../models/Review.model.js";
import Order from "../models/Order.model.js";

// ─── List / Search / Filter ───────────────────────────────────────────────────
export const listBooks = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };

    // Keyword search
    if (keyword) {
      filter.$text = { $search: keyword };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Sort options
    const sortMap = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating: { rating: -1 },
      newest: { createdAt: -1 },
      relevance: keyword ? { score: { $meta: "textScore" } } : { createdAt: -1 },
    };
    const sortOption = sortMap[sort] || sortMap.relevance;

    const skip = (Number(page) - 1) * Number(limit);

    const [books, total] = await Promise.all([
      Book.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .select("-reviews"),
      Book.countDocuments(filter),
    ]);

    res.status(200).json({
      books,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("listBooks error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Get single book ──────────────────────────────────────────────────────────
export const getBook = async (req, res) => {
  try {
    const book = await Book.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("reviews.user", "name avatar");

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("getBook error:", error.message);
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Book not found." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Featured ─────────────────────────────────────────────────────────────────
export const getFeatured = async (req, res) => {
  try {
    const books = await Book.find({ isFeatured: true, isActive: true })
      .sort({ rating: -1 })
      .limit(8)
      .select("-reviews");
    res.status(200).json(books);
  } catch (error) {
    console.error("getFeatured error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── New Arrivals ─────────────────────────────────────────────────────────────
export const getNewArrivals = async (req, res) => {
  try {
    const books = await Book.find({ isNewArrival: true, isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .select("-reviews");
    res.status(200).json(books);
  } catch (error) {
    console.error("getNewArrivals error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Top Rated ────────────────────────────────────────────────────────────────
export const getTopRated = async (req, res) => {
  try {
    const books = await Book.find({ isActive: true, numReviews: { $gte: 5 } })
      .sort({ rating: -1 })
      .limit(8)
      .select("-reviews");
    res.status(200).json(books);
  } catch (error) {
    console.error("getTopRated error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Recommendations ─────────────────────────────────────────────────────────
export const getRecommendations = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).select("category tags");
    if (!book) return res.status(404).json({ message: "Book not found." });

    const recommendations = await Book.find({
      _id: { $ne: book._id },
      isActive: true,
      $or: [
        { category: book.category },
        { tags: { $in: book.tags } },
      ],
    })
      .sort({ rating: -1 })
      .limit(8)
      .select("-reviews");

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("getRecommendations error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Create Book (Admin) ──────────────────────────────────────────────────────
export const createBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json({ message: "Book created.", book });
  } catch (error) {
    console.error("createBook error:", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Update Book (Admin) ──────────────────────────────────────────────────────
export const updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) return res.status(404).json({ message: "Book not found." });
    res.status(200).json({ message: "Book updated.", book });
  } catch (error) {
    console.error("updateBook error:", error.message);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Delete Book (Admin) ──────────────────────────────────────────────────────
export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: "Book not found." });
    res.status(200).json({ message: "Book deleted." });
  } catch (error) {
    console.error("deleteBook error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Add Review ───────────────────────────────────────────────────────────────
export const addReview = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required." });
    }

    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    // Check if already reviewed
    const alreadyReviewed = book.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed) {
      return res.status(400).json({ message: "You have already reviewed this book." });
    }

    // Check verified purchase
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "items.book": book._id,
      orderStatus: "delivered",
    });

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
      title: title || "",
      isVerifiedPurchase: !!hasPurchased,
    };

    book.reviews.push(review);
    book.numReviews = book.reviews.length;
    book.rating =
      book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length;

    await book.save();
    res.status(201).json({ message: "Review added.", rating: book.rating, numReviews: book.numReviews });
  } catch (error) {
    console.error("addReview error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Delete Review (Admin or owner) ──────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found." });

    const review = book.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: "Review not found." });

    // Only admin or review owner can delete
    if (
      req.user.role !== "admin" &&
      review.user.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized." });
    }

    book.reviews.pull(req.params.reviewId);
    book.numReviews = book.reviews.length;
    book.rating =
      book.reviews.length > 0
        ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length
        : 0;

    await book.save();
    res.status(200).json({ message: "Review deleted." });
  } catch (error) {
    console.error("deleteReview error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};