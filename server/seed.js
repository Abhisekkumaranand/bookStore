import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "./models/Category.model.js";
import Coupon from "./models/Coupon.model.js";
import Newsletter from "./models/Newsletter.model.js";
import Book from "./models/Book.model.js";

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected.");

    // 1. Clear existing data
    console.log("🧹 Clearing existing Categories, Books, Coupons, and Newsletters...");
    await Category.deleteMany();
    await Book.deleteMany();
    await Coupon.deleteMany();
    await Newsletter.deleteMany();

    // 2. Seed Categories
    const categories = [
      {
        id: "fiction",
        name: "Fiction",
        icon: "📚",
        description: "Fictional books and novels to spark your imagination.",
        sortOrder: 1,
        isActive: true,
      },
      {
        id: "academic",
        name: "Academic",
        icon: "🎓",
        description: "Academic and educational resources.",
        sortOrder: 2,
        isActive: true,
      },
      {
        id: "self-help",
        name: "Self-Help",
        icon: "💡",
        description: "Books to help you grow and improve.",
        sortOrder: 3,
        isActive: true,
      },
      {
        id: "programming",
        name: "Programming",
        icon: "💻",
        description: "Software development and coding.",
        sortOrder: 4,
        isActive: true,
      },
      {
        id: "science",
        name: "Science & Technology",
        icon: "🔬",
        description: "Scientific explorations, physics, and tech guides.",
        sortOrder: 5,
        isActive: true,
      },
      {
        id: "history",
        name: "History",
        icon: "🏛️",
        description: "Historical events and biographies.",
        sortOrder: 6,
        isActive: true,
      },
      {
        id: "children",
        name: "Children",
        icon: "🧸",
        description: "Kids books and bedtime stories.",
        sortOrder: 7,
        isActive: true,
      },
      {
        id: "regional",
        name: "Regional",
        icon: "🌏",
        description: "Regional language books and literature.",
        sortOrder: 8,
        isActive: true,
      },
    ];

    // Drop stale indexes first to avoid duplicate key errors
    await mongoose.connection.collection("categories").dropIndexes();
    console.log("✅ Category indexes dropped.");

    // ✅ Use new + save() to properly trigger pre-save hooks
    for (const cat of categories) {
      const newCat = new Category(cat);
      await newCat.save();
    }
    console.log("✅ Categories seeded successfully.");

    // 3. Seed Books
    const cover = (seed) => `https://picsum.photos/seed/book-${seed}/400/600`;

    const books = [
      {
        title: "The Midnight Library",
        author: "Matt Haig",
        category: "fiction",
        price: 299,
        mrp: 499,
        rating: 4.6,
        numReviews: 1240,
        stock: 12,
        language: "English",
        publisher: "Canongate",
        year: 2020,
        pages: 304,
        isbn: "9781786892737",
        isFeatured: true,
        isNewArrival: true,
        tags: ["bestseller", "philosophy"],
        description:
          "Between life and death there is a library, and within that library, the shelves go on forever.",
      },
      {
        title: "Atomic Habits",
        author: "James Clear",
        category: "self-help",
        price: 349,
        mrp: 699,
        rating: 4.8,
        numReviews: 5320,
        stock: 30,
        language: "English",
        publisher: "Random House",
        year: 2018,
        pages: 320,
        isbn: "9781847941831",
        isFeatured: true,
        isNewArrival: false,
        tags: ["bestseller", "productivity"],
        description:
          "Tiny changes, remarkable results. An easy and proven way to build good habits.",
      },
      {
        title: "Clean Code",
        author: "Robert C. Martin",
        category: "programming",
        price: 599,
        mrp: 899,
        rating: 4.7,
        numReviews: 980,
        stock: 8,
        language: "English",
        publisher: "Prentice Hall",
        year: 2008,
        pages: 464,
        isbn: "9780132350884",
        isFeatured: true,
        isNewArrival: false,
        tags: ["software", "classic"],
        description: "A handbook of agile software craftsmanship.",
      },
      {
        title: "Sapiens",
        author: "Yuval Noah Harari",
        category: "history",
        price: 399,
        mrp: 799,
        rating: 4.6,
        numReviews: 4210,
        stock: 20,
        language: "English",
        publisher: "Harper",
        year: 2014,
        pages: 464,
        isbn: "9780062316097",
        isFeatured: true,
        isNewArrival: false,
        tags: ["history", "anthropology"],
        description: "A brief history of humankind.",
      },
      {
        title: "A Brief History of Time",
        author: "Stephen Hawking",
        category: "science",
        price: 299,
        mrp: 499,
        rating: 4.5,
        numReviews: 2100,
        stock: 14,
        language: "English",
        publisher: "Bantam",
        year: 1988,
        pages: 256,
        isbn: "9780553380163",
        isFeatured: false,
        isNewArrival: false,
        tags: ["physics", "cosmos"],
        description: "From the Big Bang to black holes.",
      },
      {
        title: "The Pragmatic Programmer",
        author: "David Thomas",
        category: "programming",
        price: 549,
        mrp: 799,
        rating: 4.7,
        numReviews: 870,
        stock: 10,
        language: "English",
        publisher: "Addison-Wesley",
        year: 1999,
        pages: 352,
        isbn: "9780201616224",
        isFeatured: false,
        isNewArrival: true,
        tags: ["software"],
        description: "Your journey to mastery.",
      },
      {
        title: "1984",
        author: "George Orwell",
        category: "fiction",
        price: 199,
        mrp: 399,
        rating: 4.7,
        numReviews: 9800,
        stock: 50,
        language: "English",
        publisher: "Penguin",
        year: 1949,
        pages: 328,
        isbn: "9780451524935",
        isFeatured: true,
        isNewArrival: false,
        tags: ["classic", "dystopia"],
        description: "A dystopian social science fiction novel.",
      },
      {
        title: "The Subtle Art of Not Giving a F*ck",
        author: "Mark Manson",
        category: "self-help",
        price: 279,
        mrp: 499,
        rating: 4.4,
        numReviews: 3400,
        stock: 25,
        language: "English",
        publisher: "HarperOne",
        year: 2016,
        pages: 224,
        isbn: "9780062457714",
        isFeatured: false,
        isNewArrival: true,
        tags: ["mindset"],
        description: "A counterintuitive approach to living a good life.",
      },
      {
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        category: "academic",
        price: 199,
        mrp: 350,
        rating: 4.8,
        numReviews: 5600,
        stock: 40,
        language: "English",
        publisher: "Universities Press",
        year: 1999,
        pages: 180,
        isbn: "9788173711466",
        isFeatured: true,
        isNewArrival: false,
        tags: ["biography", "indian"],
        description: "An autobiography of A.P.J. Abdul Kalam.",
      },
      {
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J.K. Rowling",
        category: "children",
        price: 449,
        mrp: 799,
        rating: 4.9,
        numReviews: 12000,
        stock: 35,
        language: "English",
        publisher: "Bloomsbury",
        year: 1997,
        pages: 336,
        isbn: "9780747532699",
        isFeatured: true,
        isNewArrival: true,
        tags: ["fantasy", "children"],
        description: "The first book in the Harry Potter series.",
      },
      {
        title: "Cosmos",
        author: "Carl Sagan",
        category: "science",
        price: 449,
        mrp: 699,
        rating: 4.7,
        numReviews: 1500,
        stock: 9,
        language: "English",
        publisher: "Random House",
        year: 1980,
        pages: 396,
        isbn: "9780345539434",
        isFeatured: false,
        isNewArrival: false,
        tags: ["astronomy"],
        description: "A personal voyage through the universe.",
      },
      {
        title: "Ikigai",
        author: "Hector Garcia",
        category: "self-help",
        price: 249,
        mrp: 399,
        rating: 4.5,
        numReviews: 4100,
        stock: 22,
        language: "English",
        publisher: "Penguin",
        year: 2017,
        pages: 208,
        isbn: "9780143130727",
        isFeatured: false,
        isNewArrival: true,
        tags: ["japanese", "lifestyle"],
        description: "The Japanese secret to a long and happy life.",
      },
    ].map((b, i) => ({ ...b, coverImage: cover(i + 1) }));

    await Book.insertMany(books);
    console.log("✅ Books seeded successfully.");

    // 4. Seed Coupons
    const coupons = [
      {
        code: "WELCOME50",
        description: "Get ₹50 off on your first order!",
        discountType: "fixed",
        discountValue: 50,
        minOrderAmount: 200,
        expiresAt: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ),
        isActive: true,
      },
    ];
    await Coupon.insertMany(coupons);
    console.log("✅ Coupons seeded successfully.");

    // 5. Seed Newsletter
    await Newsletter.create({ email: "test@bookvista.com" });
    console.log("✅ Newsletter dummy data seeded successfully.");

    console.log("\n🌱 All requested seeds executed successfully!");
    process.exit(0);
  } catch (error) {
    // ✅ Show full error stack
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedDatabase();