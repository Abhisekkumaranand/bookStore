import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import Category from "../models/Category.model.js";

const categories = [
  {
    id: "fiction",
    name: "Fiction",
    icon: "📖",
    description: "Novels, short stories, and literary fiction from around the world.",
    sortOrder: 1,
    metaTitle: "Fiction Books - BookVista",
    metaDescription: "Explore bestselling fiction books at unbeatable prices.",
  },
  {
    id: "self-help",
    name: "Self Help",
    icon: "🌱",
    description: "Personal growth, habits, motivation and mindset books.",
    sortOrder: 2,
    metaTitle: "Self Help Books - BookVista",
    metaDescription: "Transform your life with the best self-help books.",
  },
  {
    id: "business",
    name: "Business",
    icon: "💼",
    description: "Entrepreneurship, management, leadership and marketing.",
    sortOrder: 3,
    metaTitle: "Business Books - BookVista",
    metaDescription: "Level up your career with top business books.",
  },
  {
    id: "finance",
    name: "Finance",
    icon: "💰",
    description: "Investing, personal finance, money management and economics.",
    sortOrder: 4,
    metaTitle: "Finance Books - BookVista",
    metaDescription: "Master money with the best finance and investing books.",
  },
  {
    id: "history",
    name: "History",
    icon: "🏛️",
    description: "World history, biographies, culture and civilizations.",
    sortOrder: 5,
    metaTitle: "History Books - BookVista",
    metaDescription: "Discover history through the best books on BookVista.",
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    description: "Physics, biology, technology, space and popular science.",
    sortOrder: 6,
    metaTitle: "Science Books - BookVista",
    metaDescription: "Explore the universe with top science books.",
  },
  {
    id: "children",
    name: "Children",
    icon: "🧸",
    description: "Picture books, middle grade, young adult and educational books.",
    sortOrder: 7,
    metaTitle: "Children Books - BookVista",
    metaDescription: "Best books for kids of all ages.",
  },
  {
    id: "comics",
    name: "Comics",
    icon: "💥",
    description: "Manga, graphic novels, comic strips and illustrated stories.",
    sortOrder: 8,
    metaTitle: "Comics & Manga - BookVista",
    metaDescription: "Browse the best comics and manga at BookVista.",
  },
];

const run = async () => {
  try {
    await connectDB();
    await Category.deleteMany({});
    console.log("🗑️  Existing categories deleted.");

    const inserted = await Category.insertMany(categories);
    console.log(`✅ ${inserted.length} categories seeded successfully.`);

    console.log("\n📋 Seeded categories:");
    categories.forEach((c) =>
      console.log(`  ${c.icon}  ${c.id.padEnd(12)} | ${c.name}`)
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Category seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();