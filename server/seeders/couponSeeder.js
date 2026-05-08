import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import Coupon from "../models/Coupon.model.js";

const coupons = [
  {
    code: "WELCOME10",
    description: "10% off on your first order",
    discountType: "percentage",
    discountValue: 10,
    maxDiscountAmount: 100,
    minOrderAmount: 199,
    usageLimit: 1000,
    perUserLimit: 1,
    isActive: true,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: "FLAT50",
    description: "Flat ₹50 off on orders above ₹499",
    discountType: "fixed",
    discountValue: 50,
    minOrderAmount: 499,
    usageLimit: 500,
    perUserLimit: 2,
    isActive: true,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
  {
    code: "BOOKS20",
    description: "20% off up to ₹200",
    discountType: "percentage",
    discountValue: 20,
    maxDiscountAmount: 200,
    minOrderAmount: 399,
    usageLimit: 200,
    perUserLimit: 1,
    isActive: true,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  },
  {
    code: "FREESHIP",
    description: "Free shipping on any order",
    discountType: "fixed",
    discountValue: 49,
    minOrderAmount: 0,
    usageLimit: null,
    perUserLimit: 3,
    isActive: true,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
];

const run = async () => {
  try {
    await connectDB();
    await Coupon.deleteMany({});
    console.log("🗑️  Existing coupons deleted.");
    const inserted = await Coupon.insertMany(coupons);
    console.log(`✅ ${inserted.length} coupons seeded.`);

    console.log("\n🎟️  Available coupon codes:");
    coupons.forEach((c) =>
      console.log(`  ${c.code.padEnd(12)} | ${c.description}`)
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Coupon seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();