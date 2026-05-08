import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { connectDB } from "../lib/db.js";
import Book from "../models/Book.model.js";

const books = [
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description:
      "A magical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found.",
    price: 199,
    mrp: 350,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/51Z0nLAfLmL._SX331_BO1,204,203,200_.jpg",
    category: "fiction",
    tags: ["bestseller", "inspirational", "philosophy"],
    rating: 4.8,
    numReviews: 12500,
    stock: 50,
    publisher: "HarperCollins",
    language: "English",
    pages: 197,
    isbn: "978-0062315007",
    year: 1988,
    isFeatured: true,
    isNewArrival: false,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "No matter your goals, Atomic Habits offers a proven framework for improving every day.",
    price: 399,
    mrp: 599,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/51-nXsSRfZL._SX329_BO1,204,203,200_.jpg",
    category: "self-help",
    tags: ["habits", "productivity", "bestseller"],
    rating: 4.9,
    numReviews: 9800,
    stock: 35,
    publisher: "Avery",
    language: "English",
    pages: 320,
    isbn: "978-0735211292",
    year: 2018,
    isFeatured: true,
    isNewArrival: false,
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    description:
      "What the rich teach their kids about money that the poor and middle class do not.",
    price: 299,
    mrp: 450,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/51hMB24b3rL._SX329_BO1,204,203,200_.jpg",
    category: "finance",
    tags: ["money", "investing", "personal finance"],
    rating: 4.7,
    numReviews: 15000,
    stock: 40,
    publisher: "Plata Publishing",
    language: "English",
    pages: 336,
    isbn: "978-1612680194",
    year: 1997,
    isFeatured: true,
    isNewArrival: false,
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description: "Timeless lessons on wealth, greed, and happiness.",
    price: 349,
    mrp: 499,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/41r6F3LpOGL._SX327_BO1,204,203,200_.jpg",
    category: "finance",
    tags: ["money", "psychology", "finance"],
    rating: 4.8,
    numReviews: 7600,
    stock: 25,
    publisher: "Harriman House",
    language: "English",
    pages: 256,
    isbn: "978-0857197689",
    year: 2020,
    isFeatured: false,
    isNewArrival: true,
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    author: "J.K. Rowling",
    description:
      "Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat.",
    price: 449,
    mrp: 599,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/51UoqRAxwEL._SX331_BO1,204,203,200_.jpg",
    category: "fiction",
    tags: ["fantasy", "magic", "classic"],
    rating: 4.9,
    numReviews: 50000,
    stock: 60,
    publisher: "Bloomsbury",
    language: "English",
    pages: 352,
    isbn: "978-1408855652",
    year: 1997,
    isFeatured: true,
    isNewArrival: false,
  },
  {
    title: "The Lean Startup",
    author: "Eric Ries",
    description: "How constant innovation creates radically successful businesses.",
    price: 399,
    mrp: 550,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/51T-sMqSMiL._SX329_BO1,204,203,200_.jpg",
    category: "business",
    tags: ["startup", "entrepreneurship", "business"],
    rating: 4.6,
    numReviews: 6200,
    stock: 20,
    publisher: "Crown Business",
    language: "English",
    pages: 336,
    isbn: "978-0307887894",
    year: 2011,
    isFeatured: false,
    isNewArrival: false,
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    description: "A bold and wide-ranging exploration of the history of humankind.",
    price: 499,
    mrp: 699,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/41yu2qXhXXL._SX324_BO1,204,203,200_.jpg",
    category: "history",
    tags: ["history", "science", "bestseller"],
    rating: 4.7,
    numReviews: 22000,
    stock: 30,
    publisher: "Harper",
    language: "English",
    pages: 443,
    isbn: "978-0062316097",
    year: 2011,
    isFeatured: true,
    isNewArrival: false,
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    description: "Notes on startups, or how to build the future.",
    price: 349,
    mrp: 499,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/41LvAMdtqRL._SX329_BO1,204,203,200_.jpg",
    category: "business",
    tags: ["startup", "innovation", "technology"],
    rating: 4.6,
    numReviews: 8900,
    stock: 18,
    publisher: "Crown Business",
    language: "English",
    pages: 224,
    isbn: "978-0804139021",
    year: 2014,
    isFeatured: false,
    isNewArrival: true,
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    description: "Rules for focused success in a distracted world.",
    price: 329,
    mrp: 499,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/41atsb2YHyL._SX329_BO1,204,203,200_.jpg",
    category: "self-help",
    tags: ["productivity", "focus", "career"],
    rating: 4.7,
    numReviews: 5400,
    stock: 22,
    publisher: "Grand Central Publishing",
    language: "English",
    pages: 304,
    isbn: "978-1455586691",
    year: 2016,
    isFeatured: false,
    isNewArrival: true,
  },
  {
    title: "1984",
    author: "George Orwell",
    description:
      "A dystopian novel set in Airstrip One, a province of the superstate Oceania in a world of perpetual war.",
    price: 229,
    mrp: 349,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/41aM4xOZxaL._SX277_BO1,204,203,200_.jpg",
    category: "fiction",
    tags: ["dystopia", "classic", "political"],
    rating: 4.8,
    numReviews: 35000,
    stock: 55,
    publisher: "Signet Classic",
    language: "English",
    pages: 328,
    isbn: "978-0451524935",
    year: 1949,
    isFeatured: false,
    isNewArrival: false,
  },
  {
    title: "Think and Grow Rich",
    author: "Napoleon Hill",
    description:
      "After studying over 500 self-made millionaires, Hill reveals the secret to their success.",
    price: 249,
    mrp: 399,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/41aQPTCmeLL._SX331_BO1,204,203,200_.jpg",
    category: "self-help",
    tags: ["wealth", "mindset", "classic"],
    rating: 4.6,
    numReviews: 21000,
    stock: 35,
    publisher: "Dover Publications",
    language: "English",
    pages: 238,
    isbn: "978-0486277714",
    year: 1937,
    isFeatured: false,
    isNewArrival: false,
  },
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
      "A novel of the Jazz Age that explores themes of decadence, idealism, and the American Dream.",
    price: 199,
    mrp: 299,
    coverImage:
      "https://images-na.ssl-images-amazon.com/images/I/41iers%2BhlSL._SX324_BO1,204,203,200_.jpg",
    category: "fiction",
    tags: ["classic", "literary fiction", "american"],
    rating: 4.5,
    numReviews: 18000,
    stock: 45,
    publisher: "Scribner",
    language: "English",
    pages: 180,
    isbn: "978-0743273565",
    year: 1925,
    isFeatured: false,
    isNewArrival: false,
  },
];

const run = async () => {
  try {
    await connectDB();
    await Book.deleteMany({});
    console.log("🗑️  Existing books deleted.");
    const inserted = await Book.insertMany(books);
    console.log(`✅ ${inserted.length} books seeded successfully.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Book seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

run();