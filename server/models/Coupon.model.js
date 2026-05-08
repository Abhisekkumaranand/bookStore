import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Code must be at most 20 characters"],
    },
    description: {
      type: String,
      default: "",
      maxlength: [200, "Description must be at most 200 characters"],
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
      default: "percentage",
    },
    discountValue: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [1, "Discount value must be at least 1"],
    },
    maxDiscountAmount: {
      type: Number,
      default: null, // null = no cap
    },
    minOrderAmount: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },
    usedCount: {
      type: Number,
      default: 0,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    perUserLimit: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    applicableCategories: {
      type: [String],
      default: [], // empty = all categories
    },
    applicableBooks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Book",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
couponSchema.index({ isActive: 1, expiresAt: 1 });

// ─── Virtual: isExpired ───────────────────────────────────────────────────────
couponSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date();
});

couponSchema.virtual("isValid").get(function () {
  return (
    this.isActive &&
    !this.isExpired &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
});

// ─── Instance method: calculate discount ──────────────────────────────────────
couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (!this.isValid) return 0;
  if (orderAmount < this.minOrderAmount) return 0;

  let discount = 0;
  if (this.discountType === "percentage") {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maxDiscountAmount !== null) {
      discount = Math.min(discount, this.maxDiscountAmount);
    }
  } else {
    discount = this.discountValue;
  }

  return Math.min(discount, orderAmount);
};

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;