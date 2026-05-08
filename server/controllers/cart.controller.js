import Cart from "../models/Cart.model.js";
import Book from "../models/Book.model.js";

// ─── Helper: get or create cart ───────────────────────────────────────────────
export const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// ─── Get Cart ─────────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.book", "title author coverImage price mrp stock isActive")
      .lean({ virtuals: true });

    if (!cart) {
      return res.status(200).json({
        items: [],
        subtotal: 0,
        shippingCharge: 0,
        total: 0,
        totalItems: 0,
      });
    }

    // Filter out inactive/deleted books
    const validItems = cart.items.filter(
      (item) => item.book && item.book.isActive
    );

    const subtotal = validItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCharge = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;

    res.status(200).json({
      items: validItems,
      subtotal,
      shippingCharge,
      total: subtotal + shippingCharge,
      totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("getCart error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Add to Cart ──────────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { bookId, quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "bookId is required." });
    }
    if (quantity < 1 || !Number.isInteger(Number(quantity))) {
      return res.status(400).json({ message: "Quantity must be a positive integer." });
    }

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found." });
    if (!book.isActive) return res.status(400).json({ message: "Book is not available." });
    if (book.stock === 0) return res.status(400).json({ message: "Book is out of stock." });

    const cart = await getOrCreateCart(req.user._id);
    const existingIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      cart.items[existingIndex].quantity = Math.min(newQty, book.stock);
    } else {
      cart.items.push({
        book: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        price: book.price,
        mrp: book.mrp,
        stock: book.stock,
        quantity: Math.min(Number(quantity), book.stock),
      });
    }

    await cart.save();
    await cart.populate("items.book", "title author coverImage price mrp stock");

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCharge = subtotal >= 499 ? 0 : 49;

    res.status(200).json({
      message: "Added to cart.",
      items: cart.items,
      subtotal,
      shippingCharge,
      total: subtotal + shippingCharge,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("addToCart error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Update Cart Item Quantity ────────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1." });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    // Validate against current stock
    const book = await Book.findById(cart.items[itemIndex].book);
    if (book && Number(quantity) > book.stock) {
      return res.status(400).json({
        message: `Only ${book.stock} copies available.`,
      });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCharge = subtotal >= 499 ? 0 : 49;

    res.status(200).json({
      message: "Cart updated.",
      items: cart.items,
      subtotal,
      shippingCharge,
      total: subtotal + shippingCharge,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("updateCartItem error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Remove Cart Item ─────────────────────────────────────────────────────────
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found." });

    const beforeLength = cart.items.length;
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== itemId
    );

    if (cart.items.length === beforeLength) {
      return res.status(404).json({ message: "Item not found in cart." });
    }

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCharge = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 49;

    res.status(200).json({
      message: "Item removed from cart.",
      items: cart.items,
      subtotal,
      shippingCharge,
      total: subtotal + shippingCharge,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("removeFromCart error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Clear Cart ───────────────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [] },
      { upsert: true }
    );

    res.status(200).json({
      message: "Cart cleared.",
      items: [],
      subtotal: 0,
      shippingCharge: 0,
      total: 0,
      totalItems: 0,
    });
  } catch (error) {
    console.error("clearCart error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Sync Cart (from localStorage on login) ───────────────────────────────────
export const syncCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: "items array is required." });
    }

    const cart = await getOrCreateCart(req.user._id);

    for (const clientItem of items) {
      const book = await Book.findById(clientItem.id || clientItem.book);
      if (!book || !book.isActive) continue;

      const existingIndex = cart.items.findIndex(
        (i) => i.book.toString() === book._id.toString()
      );

      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + Number(clientItem.quantity);
        cart.items[existingIndex].quantity = Math.min(newQty, book.stock);
      } else {
        cart.items.push({
          book: book._id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage,
          price: book.price,
          mrp: book.mrp,
          stock: book.stock,
          quantity: Math.min(Number(clientItem.quantity) || 1, book.stock),
        });
      }
    }

    await cart.save();

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const shippingCharge = subtotal >= 499 ? 0 : 49;

    res.status(200).json({
      message: "Cart synced.",
      items: cart.items,
      subtotal,
      shippingCharge,
      total: subtotal + shippingCharge,
      totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  } catch (error) {
    console.error("syncCart error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};