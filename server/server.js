import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// ─── Fix __dirname for ES Modules ─────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── App ──────────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      // Remove trailing slash if accidentally included in .env
      const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, "") : null;
      const renderUrl = process.env.RENDER_EXTERNAL_URL ? process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "") : null;

      const allowedOrigins = [
        clientUrl,
        renderUrl,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        `http://localhost:${PORT}`,
        `http://127.0.0.1:${PORT}`
      ].filter(Boolean);

      // Allow requests with no origin (like Postman) or allowed origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Fallback: accept all other origins to prevent deployment breakage.
        // If you want strict security, remove this else block and rely on CLIENT_URL.
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// ─── Health Check (before routes) ────────────────────────────────────────────
app.get("/api/health", (req, res) =>
  res.status(200).json({
    status: "ok",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  })
);

// ─── Dynamic Route Loader ─────────────────────────────────────────────────────
// This avoids crash if a route file is missing
const loadRoute = async (path, mountPoint) => {
  try {
    const module = await import(path);
    app.use(mountPoint, module.default);
    console.log(`✅ Route loaded: ${mountPoint}`);
  } catch (err) {
    console.warn(`⚠️  Route skipped (${mountPoint}): ${err.message}`);
  }
};

// ─── Load All Routes ──────────────────────────────────────────────────────────
const loadRoutes = async () => {
  await loadRoute("./routes/auth.routes.js", "/api/auth");
  await loadRoute("./routes/book.route.js", "/api/books");
  await loadRoute("./routes/category.route.js", "/api/categories");
  await loadRoute("./routes/cart.route.js", "/api/cart");
  await loadRoute("./routes/wishlist.route.js", "/api/wishlist");
  await loadRoute("./routes/order.route.js", "/api/orders");
  await loadRoute("./routes/contact.route.js", "/api/contact");
  await loadRoute("./routes/upload.route.js", "/api/upload");
  await loadRoute("./routes/admin.route.js", "/api/admin");
  await loadRoute("./routes/review.route.js", "/api/reviews");
  await loadRoute("./routes/coupon.route.js", "/api/coupons");
  await loadRoute("./routes/payment.route.js", "/api/payments");
  await loadRoute("./routes/analytics.route.js", "/api/analytics");
  await loadRoute("./routes/newsletter.route.js", "/api/newsletter");
  app.use(express.static(path.join(__dirname, "../client/dist")));

  // ─── Serve Frontend in Production ──────────────────────────────────────────
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });


  // ─── 404 Handler ───────────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
  });



  // ─── Global Error Handler ───────────────────────────────────────────────────
  app.use((err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err.message);

    let statusCode = err.statusCode || err.status || 500;
    let message = err.message || "Internal Server Error";

    if (err.name === "CastError") { statusCode = 404; message = "Resource not found."; }
    if (err.name === "ValidationError") {
      statusCode = 400;
      message = Object.values(err.errors).map((e) => e.message).join(". ");
    }
    if (err.code === 11000) {
      statusCode = 409;
      const field = Object.keys(err.keyValue || {})[0];
      message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : "Value"} already exists.`;
    }
    if (err.name === "JsonWebTokenError") { statusCode = 401; message = "Invalid token."; }
    if (err.name === "TokenExpiredError") { statusCode = 401; message = "Token expired."; }
    if (err.code === "LIMIT_FILE_SIZE") { statusCode = 400; message = "File too large. Max 5MB."; }

    res.status(statusCode).json({
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
  });
};

// ─── Connect DB & Start ───────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // Connect DB
    const { connectDB } = await import("./lib/db.js");
    await connectDB();

    // Load routes
    await loadRoutes();

    // Listen
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();