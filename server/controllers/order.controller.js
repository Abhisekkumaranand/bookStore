import Order from "../models/Order.model.js";
import Cart from "../models/Cart.model.js";
import Book from "../models/Book.model.js";
import { sendOrderConfirmationEmail } from "../lib/email.js";

// ─── Place Order ──────────────────────────────────────────────────────────────
export const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = "cod", notes = "" } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required." });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.book"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Validate stock & build order items
    const orderItems = [];
    for (const item of cart.items) {
      const book = item.book;
      if (!book || !book.isActive) {
        return res.status(400).json({ message: `"${item.book?.title}" is no longer available.` });
      }
      if (book.stock < item.quantity) {
        return res.status(400).json({
          message: `Only ${book.stock} copies of "${book.title}" available.`,
        });
      }
      orderItems.push({
        book: book._id,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        price: book.price,
        quantity: item.quantity,
      });
    }

    const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const shippingCharge = subtotal >= 499 ? 0 : 49;
    const total = subtotal + shippingCharge;

    // Estimated delivery: 3–5 business days
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCharge,
      total,
      estimatedDelivery,
      notes,
    });

    // Decrement stock
    for (const item of orderItems) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail({
      to: req.user.email,
      name: req.user.name,
      orderId: order._id,
      items: orderItems,
      total,
    }).catch(console.error);

    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (error) {
    console.error("placeOrder error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Get My Orders ────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.status(200).json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("getMyOrders error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Get Order by ID ──────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phone"
    );

    if (!order) return res.status(404).json({ message: "Order not found." });

    // Only owner or admin can view
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("getOrderById error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Cancel Order ─────────────────────────────────────────────────────────────
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized." });
    }

    const cancellableStatuses = ["placed", "confirmed"];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Cannot cancel an order that is "${order.orderStatus}".`,
      });
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    order.cancelReason = req.body.reason || "Cancelled by user";

    // Restore stock
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { stock: item.quantity },
      });
    }

    await order.save();
    res.status(200).json({ message: "Order cancelled.", order });
  } catch (error) {
    console.error("cancelOrder error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Admin: Get All Orders ────────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;

    const skip = (Number(page) - 1) * Number(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user", "name email phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("getAllOrders error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Admin: Update Order Status ───────────────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;

    const validStatuses = [
      "placed", "confirmed", "packed",
      "shipped", "out_for_delivery", "delivered",
      "cancelled", "returned",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    order.orderStatus = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (status === "delivered") {
      order.deliveredAt = new Date();
      order.paymentStatus = "paid";
    }
    if (status === "cancelled") {
      order.cancelledAt = new Date();
    }

    await order.save();
    res.status(200).json({ message: "Order status updated.", order });
  } catch (error) {
    console.error("updateOrderStatus error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};