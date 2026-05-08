import Review from "../models/Review.model.js";
import Book from "../models/Book.model.js";
import Order from "../models/Order.model.js";

// ─── Get Reviews for a Book ───────────────────────────────────────────────────
export const getBookReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "newest" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      highest: { rating: -1 },
      lowest: { rating: 1 },
      helpful: { helpfulVotes: -1 },
    };

    const [reviews, total] = await Promise.all([
      Review.find({ book: req.params.bookId, isActive: true })
        .populate("user", "name avatar")
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(Number(limit)),
      Review.countDocuments({ book: req.params.bookId, isActive: true }),
    ]);

    res.status(200).json({
      reviews,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("getBookReviews error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Get My Reviews ───────────────────────────────────────────────────────────
export const getMyReview = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id, isActive: true })
      .populate("book", "title coverImage")
      .sort({ createdAt: -1 });
    res.status(200).json({ reviews, total: reviews.length });
  } catch (error) {
    console.error("getMyReview error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Create Review ────────────────────────────────────────────────────────────
export const createReview = async (req, res) => {
  try {
    const { bookId, rating, comment, title } = req.body;

    if (!bookId || !rating || !comment) {
      return res.status(400).json({ message: "bookId, rating and comment are required." });
    }

    const book = await Book.findOne({ _id: bookId, isActive: true });
    if (!book) return res.status(404).json({ message: "Book not found." });

    // One review per user per book
    const existing = await Review.findOne({ user: req.user._id, book: bookId });
    if (existing) {
      return res.status(400).json({ message: "You have already reviewed this book." });
    }

    // Verified purchase check
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      "items.book": bookId,
      orderStatus: "delivered",
    });

    const review = await Review.create({
      user: req.user._id,
      book: bookId,
      rating: Number(rating),
      comment,
      title: title || "",
      isVerifiedPurchase: !!hasPurchased,
    });

    // Update book rating
    const allReviews = await Review.find({ book: bookId, isActive: true });
    book.numReviews = allReviews.length;
    book.rating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await book.save();

    await review.populate("user", "name avatar");
    res.status(201).json({ message: "Review submitted.", review });
  } catch (error) {
    console.error("createReview error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this book." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Update Review ────────────────────────────────────────────────────────────
export const updateReview = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found." });

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    if (rating) review.rating = Number(rating);
    if (comment) review.comment = comment;
    if (title !== undefined) review.title = title;

    await review.save();

    // Recalculate book rating
    const book = await Book.findById(review.book);
    const allReviews = await Review.find({ book: review.book, isActive: true });
    book.rating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await book.save();

    res.status(200).json({ message: "Review updated.", review });
  } catch (error) {
    console.error("updateReview error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Delete Review ────────────────────────────────────────────────────────────
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found." });

    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized." });
    }

    review.isActive = false;
    await review.save();

    // Recalculate book rating
    const book = await Book.findById(review.book);
    const allReviews = await Review.find({ book: review.book, isActive: true });
    book.numReviews = allReviews.length;
    book.rating =
      allReviews.length > 0
        ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
        : 0;
    await book.save();

    res.status(200).json({ message: "Review deleted." });
  } catch (error) {
    console.error("deleteReview error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Vote Helpful ─────────────────────────────────────────────────────────────
export const voteHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found." });
    res.status(200).json({ message: "Marked as helpful.", helpfulVotes: review.helpfulVotes });
  } catch (error) {
    console.error("voteHelpful error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};