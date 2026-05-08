import Order from "../models/Order.model.js";
import User from "../models/User.model.js";

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);

    res.status(200).json({
      success: true,
      totalUsers,
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (error) {
    console.error("getAnalytics error:", error.message);
    res.status(500).json({ message: "Server error." });
  }
};