import Coupon from "../models/Coupon.model.js";

// ─── Simple validation helper ─────────────────────────────────────────────────
export const validateBody = (requiredFields) => (req, res, next) => {
  const missing = requiredFields.filter(
    (field) =>
      req.body[field] === undefined ||
      req.body[field] === null ||
      req.body[field] === ""
  );

  if (missing.length > 0) {
    return res.status(400).json({
      message: `Missing required fields: ${missing.join(", ")}.`,
    });
  }

  next();
};

// ─── Sanitize pagination params ───────────────────────────────────────────────
export const sanitizePagination = (req, res, next) => {
  let page = parseInt(req.query.page, 10);
  let limit = parseInt(req.query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  req.query.page = page;
  req.query.limit = limit;

  next();
};

// ─── Validate MongoDB ObjectId ────────────────────────────────────────────────
export const validateObjectId = (paramName = "id") => (req, res, next) => {
  const id = req.params[paramName];
  if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
    return res.status(400).json({ message: `Invalid ${paramName}.` });
  }
  next();
};

// ─── Create Coupon ────────────────────────────────────────────────────────────
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ message: "Coupon created successfully.", coupon });
  } catch (error) {
    console.error("createCoupon error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Coupon code already exists." });
    }
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Get All Coupons (Admin) ──────────────────────────────────────────────────
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ coupons, total: coupons.length });
  } catch (error) {
    console.error("getAllCoupons error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Get Public Coupons ───────────────────────────────────────────────────────
export const getPublicCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, expiresAt: { $gt: new Date() } })
      .select("-usedBy -usedCount")
      .sort({ createdAt: -1 });
    res.status(200).json({ coupons });
  } catch (error) {
    console.error("getPublicCoupons error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Validate Coupon ──────────────────────────────────────────────────────────
export const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) return res.status(400).json({ message: "Coupon code is required." });

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code." });

    if (!coupon.isValid) {
      return res.status(400).json({ message: "Coupon is expired or inactive." });
    }

    if (orderAmount && orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}.` });
    }

    const discountAmount = orderAmount ? coupon.calculateDiscount(orderAmount) : coupon.discountValue;

    res.status(200).json({ message: "Coupon applied successfully.", coupon, discountAmount });
  } catch (error) {
    console.error("validateCoupon error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Update Coupon (Admin) ────────────────────────────────────────────────────
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.status(200).json({ message: "Coupon updated successfully.", coupon });
  } catch (error) {
    console.error("updateCoupon error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Delete Coupon (Admin) ────────────────────────────────────────────────────
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });
    res.status(200).json({ message: "Coupon deleted successfully." });
  } catch (error) {
    console.error("deleteCoupon error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Toggle Coupon Status (Admin) ─────────────────────────────────────────────
export const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found." });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({ message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'}.`, coupon });
  } catch (error) {
    console.error("toggleCoupon error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};