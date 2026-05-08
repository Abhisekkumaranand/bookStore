import User from "../models/User.model.js";
import Book from "../models/Book.model.js";
import Order from "../models/Order.model.js";
import Contact from "../models/Contact.model.js";
import Review from "../models/Review.model.js";

// ─── Dashboard Stats ──────────────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalUsers,
      totalBooks,
      totalOrders,
      totalRevenue,
      monthOrders,
      lastMonthOrders,
      monthRevenue,
      lastMonthRevenue,
      newContacts,
      lowStockBooks,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Book.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Order.countDocuments({
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
      }),
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
            paymentStatus: "paid",
          },
        },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Contact.countDocuments({ status: "new" }),
      Book.find({ isActive: true, stock: { $lte: 5 } })
        .select("title stock coverImage")
        .limit(5),
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5),
      Order.aggregate([
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
      ]),
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const thisMonthRevenue = monthRevenue[0]?.total || 0;
    const prevMonthRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth =
      prevMonthRevenue > 0
        ? (((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100).toFixed(1)
        : 100;
    const orderGrowth =
      lastMonthOrders > 0
        ? (((monthOrders - lastMonthOrders) / lastMonthOrders) * 100).toFixed(1)
        : 100;

    res.status(200).json({
      stats: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRevenue: revenue,
        monthOrders,
        monthRevenue: thisMonthRevenue,
        revenueGrowth: Number(revenueGrowth),
        orderGrowth: Number(orderGrowth),
        newContacts,
      },
      lowStockBooks,
      recentOrders,
      ordersByStatus,
    });
  } catch (error) {
    console.error("getDashboardStats error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Revenue Chart (last 6 months) ───────────────────────────────────────────
export const getRevenueChart = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const chart = data.map((d) => ({
      month: months[d._id.month - 1],
      year: d._id.year,
      revenue: d.revenue,
      orders: d.orders,
    }));

    res.status(200).json(chart);
  } catch (error) {
    console.error("getRevenueChart error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Get All Users (Admin) ────────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password -refreshToken -resetPasswordToken")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    console.error("getAllUsers error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Update User Role / Status (Admin) ───────────────────────────────────────
export const updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id && isActive === false) {
      return res.status(400).json({ message: "Cannot deactivate your own account." });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save({ validateBeforeSave: false });
    res.status(200).json({ message: "User updated.", user: user.toPublicJSON() });
  } catch (error) {
    console.error("updateUser error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// Alias changeUserRole to updateUser for backward compatibility with routes
export const changeUserRole = updateUser;

// ─── Toggle User Active Status (Admin) ────────────────────────────────────────
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id && user.isActive === true) {
      return res.status(400).json({ message: "Cannot deactivate your own account." });
    }

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}.`, user: user.toPublicJSON() });
  } catch (error) {
    console.error("toggleUserActive error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};

// ─── Top Selling Books ────────────────────────────────────────────────────────
export const getTopSellingBooks = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.book",
          title: { $first: "$items.title" },
          totalSold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error("getTopSellingBooks error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};