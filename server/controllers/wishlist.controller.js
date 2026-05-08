import Wishlist from "../models/Wishlist.model.js";
import Book from "../models/Book.model.js";

// ─── Helper: get or create wishlist ──────────────────────────────────────────
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, items: [] });
  }
  return wishlist;
};

// ─── Get Wishlist ─────────────────────────────────────────────────────────────
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: "items.book",
        select:
          "title author coverImage price mrp rating stock category isActive",
      })
      .lean({ virtuals: true });

    if (!wishlist) {
      return res.status(200).json({
        success: true,
        items: [],
        totalItems: 0,
        totalValue: 0,
        totalSavings: 0,
      });
    }

    // Filter out deleted or inactive books
    const activeItems = wishlist.items.filter(
      (item) => item.book && item.book.isActive
    );

    const totalValue = activeItems.reduce(
      (sum, item) => sum + (item.book?.price || item.price),
      0
    );
    const totalSavings = activeItems.reduce(
      (sum, item) =>
        sum + ((item.book?.mrp || item.mrp) - (item.book?.price || item.price)),
      0
    );

    res.status(200).json({
      success: true,
      items: activeItems,
      totalItems: activeItems.length,
      totalValue,
      totalSavings: Math.max(0, totalSavings),
    });
  } catch (error) {
    console.error("getWishlist error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Add to Wishlist ──────────────────────────────────────────────────────────
export const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "bookId is required." });
    }

    // Validate book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }
    if (!book.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Book is no longer available." });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);

    // Check already wishlisted
    const alreadyExists = wishlist.items.some(
      (item) => item.book.toString() === bookId
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Book is already in your wishlist.",
        wishlisted: true,
      });
    }

    // Add item
    wishlist.items.push({
      book: book._id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage || "",
      price: book.price,
      mrp: book.mrp || 0,
      category: book.category || "",
      rating: book.rating || 0,
      stock: book.stock || 0,
      addedAt: new Date(),
    });

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Book added to wishlist.",
      wishlisted: true,
      totalItems: wishlist.items.length,
    });
  } catch (error) {
    console.error("addToWishlist error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Remove from Wishlist ─────────────────────────────────────────────────────
export const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found." });
    }

    const beforeCount = wishlist.items.length;
    wishlist.items = wishlist.items.filter(
      (item) => item.book.toString() !== bookId
    );

    if (wishlist.items.length === beforeCount) {
      return res.status(404).json({
        success: false,
        message: "Book not found in wishlist.",
      });
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Book removed from wishlist.",
      wishlisted: false,
      totalItems: wishlist.items.length,
    });
  } catch (error) {
    console.error("removeFromWishlist error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Toggle Wishlist ──────────────────────────────────────────────────────────
export const toggleWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "bookId is required." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }
    if (!book.isActive) {
      return res
        .status(400)
        .json({ success: false, message: "Book is no longer available." });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);

    const existingIndex = wishlist.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    let wishlisted;
    let message;

    if (existingIndex > -1) {
      // Remove
      wishlist.items.splice(existingIndex, 1);
      wishlisted = false;
      message = "Removed from wishlist.";
    } else {
      // Add
      wishlist.items.push({
        book: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage || "",
        price: book.price,
        mrp: book.mrp || 0,
        category: book.category || "",
        rating: book.rating || 0,
        stock: book.stock || 0,
        addedAt: new Date(),
      });
      wishlisted = true;
      message = "Added to wishlist.";
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message,
      wishlisted,
      totalItems: wishlist.items.length,
    });
  } catch (error) {
    console.error("toggleWishlist error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Clear Wishlist ───────────────────────────────────────────────────────────
export const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Wishlist cleared.",
      items: [],
      totalItems: 0,
    });
  } catch (error) {
    console.error("clearWishlist error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Check if Book is Wishlisted ──────────────────────────────────────────────
export const checkWishlisted = async (req, res) => {
  try {
    const { bookId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id }).lean();

    const wishlisted = wishlist
      ? wishlist.items.some((item) => item.book.toString() === bookId)
      : false;

    res.status(200).json({
      success: true,
      wishlisted,
      bookId,
    });
  } catch (error) {
    console.error("checkWishlisted error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Move Wishlist Item to Cart ───────────────────────────────────────────────
export const moveToCart = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res
        .status(400)
        .json({ success: false, message: "bookId is required." });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ success: false, message: "Book not found." });
    }
    if (book.stock === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Book is out of stock." });
    }

    // Import Cart dynamically to avoid circular deps
    const { default: Cart } = await import("../models/Cart.model.js");

    // Add to cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const existingCartItem = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingCartItem > -1) {
      cart.items[existingCartItem].quantity = Math.min(
        cart.items[existingCartItem].quantity + 1,
        book.stock
      );
    } else {
      cart.items.push({
        book: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage || "",
        price: book.price,
        mrp: book.mrp || 0,
        stock: book.stock,
        quantity: 1,
      });
    }

    await cart.save();

    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        (item) => item.book.toString() !== bookId
      );
      await wishlist.save();
    }

    res.status(200).json({
      success: true,
      message: `"${book.title}" moved to cart.`,
      wishlistTotal: wishlist ? wishlist.items.length : 0,
    });
  } catch (error) {
    console.error("moveToCart error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Get Wishlist Count ───────────────────────────────────────────────────────
export const getWishlistCount = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .select("items")
      .lean();

    res.status(200).json({
      success: true,
      count: wishlist ? wishlist.items.length : 0,
    });
  } catch (error) {
    console.error("getWishlistCount error:", error.message);
    res.status(500).json({ success: false, message: "Server error." });
  }
};