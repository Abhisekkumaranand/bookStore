import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  toggleUserActive,
  changeUserRole,
  getRevenueChart,
  getTopSellingBooks,
} from "../controllers/admin.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute, adminRoute);

router.get("/stats", getDashboardStats);
router.get("/revenue-chart", getRevenueChart);
router.get("/top-selling-books", getTopSellingBooks);
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-active", toggleUserActive);
router.put("/users/:id/role", changeUserRole);

export default router;