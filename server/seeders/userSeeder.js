import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import User from "../models/User.model.js";

const users = [
  {
    name: "Admin User",
    email: "admin@bookvista.in",
    phone: "9999999999",
    password: "Admin@1234",
    role: "admin",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Arjun Sharma",
    email: "arjun@example.com",
    phone: "9876543210",
    password: "User@1234",
    role: "user",
    isVerified: true,
    isActive: true,
  },
  {
    name: "Priya Patel",
    email: "priya@example.com",
    phone: "9123456789",
    password: "User@1234",
    role: "user",
    isVerified: true,
    isActive: true,
  },
];

const run = async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    console.log("🗑️  Existing users deleted.");

    const inserted = await User.create(users);
    console.log(`✅ ${inserted.length} users seeded successfully.`);

    console.log("\n📋 Seeded credentials:");
    console.log("─".repeat(55));
    users.forEach((u) => {
      console.log(
        `  ${u.role.toUpperCase().padEnd(6)} | ${u.email.padEnd(25)} | ${u.password}`
      );
    });
    console.log("─".repeat(55));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ User seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();