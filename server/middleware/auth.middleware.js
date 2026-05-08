import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// ─── Verify Access Token ──────────────────────────────────────────────────────
export const protectRoute = async (req, res, next) => {
  try {
    // 1. Get token from cookie or Authorization header
    let token = req.cookies?.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated. Please log in." });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      }
      return res.status(401).json({ message: "Invalid token. Please log in again." });
    }

    // 3. Check user still exists & is active
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact support." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// ─── Admin only ───────────────────────────────────────────────────────────────
export const adminRoute = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ message: "Access denied. Admins only." });
};

// ─── Optional auth (attach user if token present, don't block if not) ─────────
export const optionalAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (user && user.isActive) req.user = user;

    next();
  } catch {
    // token invalid — just continue without user
    next();
  }
};