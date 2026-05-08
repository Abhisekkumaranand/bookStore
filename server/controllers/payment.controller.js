import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.model.js";
import Book from "../models/Book.model.js";
import { sendOrderConfirmationEmail } from "../lib/email.js";

// ─── Init Razorpay ────────────────────────────────────────────────────────────
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials not configured.");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const calcTotals = (items) => {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingCharge = subtotal > 499 ? 0 : 49;
  const total = subtotal + shippingCharge;
  return { subtotal, shippingCharge, total };
};

const validateCartItems = async (cartItems) => {
  const validated = [];
  for (const item of cartItems) {
    const book = await Book.findById(item.id || item.book);
    if (!book) throw new Error(`Book "${item.title}" not found.`);
    if (!book.isActive) throw new Error(`Book "${book.title}" is no longer available.`);
    if (book.stock < item.quantity) {
      throw new Error(`Only ${book.stock} copies of "${book.title}" available.`);
    }
    validated.push({
      book: book._id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      price: book.price,
      quantity: item.quantity,
    });
  }
  return validated;
};

const decrementStock = async (items) => {
  for (const item of items) {
    await Book.findByIdAndUpdate(item.book, {
      $inc: { stock: -item.quantity },
    });
  }
};

// ─── Create Razorpay Order ────────────────────────────────────────────────────
export const createRazorpayOrder = async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Cart is empty." });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required." });
    }

    const validatedItems = await validateCartItems(items);
    const { subtotal, shippingCharge, total } = calcTotals(validatedItems);

    const razorpay = getRazorpay();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: `bv_${Date.now()}`,
      notes: { userId: req.user._id.toString() },
    });

    // Persist order in DB with pending status
    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("createRazorpayOrder error:", error.message);
    res.status(400).json({ message: error.message || "Failed to create order." });
  }
};

// ─── Verify Payment ───────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details." });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: "failed" });
      return res.status(400).json({ message: "Payment verification failed. Invalid signature." });
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "paid",
        status: "confirmed",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
      { new: true }
    ).populate("user", "name email");

    if (!order) return res.status(404).json({ message: "Order not found." });

    // Decrement stock
    await decrementStock(order.items);

    // Send confirmation email
    sendOrderConfirmationEmail({
      to: order.user.email,
      name: order.user.name,
      orderId: order.orderId,
      items: order.items,
      total: order.total,
    }).catch(console.error);

    res.status(200).json({ message: "Payment verified successfully.", order });
  } catch (error) {
    console.error("verifyPayment error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── COD Order ────────────────────────────────────────────────────────────────
export const createCODOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ message: "Cart is empty." });
    }
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required." });
    }

    const validatedItems = await validateCartItems(items);
    const { subtotal, shippingCharge, total } = calcTotals(validatedItems);

    // COD max limit
    if (total > 10000) {
      return res.status(400).json({ message: "COD is not available for orders above ₹10,000." });
    }

    const order = await Order.create({
      user: req.user._id,
      items: validatedItems,
      shippingAddress,
      subtotal,
      shippingCharge,
      total,
      paymentMethod: "cod",
      paymentStatus: "pending",
      status: "confirmed",
      notes: notes || "",
    });

    // Decrement stock
    await decrementStock(validatedItems);

    const populatedOrder = await Order.findById(order._id).populate("user", "name email");

    sendOrderConfirmationEmail({
      to: populatedOrder.user.email,
      name: populatedOrder.user.name,
      orderId: populatedOrder.orderId,
      items: populatedOrder.items,
      total: populatedOrder.total,
    }).catch(console.error);

    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (error) {
    console.error("createCODOrder error:", error.message);
    res.status(400).json({ message: error.message || "Failed to place order." });
  }
};

// ─── Get Payment Config ───────────────────────────────────────────────────────
export const getPaymentConfig = async (req, res) => {
  res.status(200).json({
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
    currency: "INR",
    codAvailable: true,
    codLimit: 10000,
    freeShippingAbove: 499,
    shippingCharge: 49,
  });
};

// ─── Razorpay Webhook ─────────────────────────────────────────────────────────
export const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(200).json({ received: true });

    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({ message: "Invalid webhook signature." });
    }

    const { event, payload } = req.body;

    if (event === "payment.captured") {
      const paymentId = payload.payment.entity.id;
      const razorpayOrderId = payload.payment.entity.order_id;

      await Order.findOneAndUpdate(
        { razorpayOrderId },
        { paymentStatus: "paid", razorpayPaymentId: paymentId, status: "confirmed" }
      );
    }

    if (event === "payment.failed") {
      const razorpayOrderId = payload.payment.entity.order_id;
      await Order.findOneAndUpdate({ razorpayOrderId }, { paymentStatus: "failed" });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error.message);
    res.status(500).json({ message: "Webhook error." });
  }
};