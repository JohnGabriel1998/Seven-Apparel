const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
exports.getDashboard = async (req, res) => {
  try {
    // Get total revenue from paid orders (to match analytics page)
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get total products count
    const totalProducts = await Product.countDocuments();

    // Get total users count (excluding admins)
    const totalUsers = await User.countDocuments({ role: "user" });

    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(10)
      .select("orderNumber user totalAmount status createdAt");

    // Get low stock products (totalStock < 10)
    const lowStockProducts = await Product.find({ totalStock: { $lt: 10 } })
      .sort({ totalStock: 1 })
      .limit(10)
      .select("name totalStock images");

    res.json({
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      lowStockProducts,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private/Admin
exports.getSalesAnalytics = async (req, res) => {
  try {
    const { period = "30days" } = req.query;

    let startDate = new Date();
    switch (period) {
      case "7days":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "1year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Sales by day
    const salesByDay = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Sales by category
    const salesByCategory = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$productInfo.category",
          totalSales: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
          itemsSold: { $sum: "$items.quantity" },
        },
      },
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: "cancelled" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $project: {
          name: "$productInfo.name",
          totalQuantity: 1,
          totalRevenue: 1,
          image: { $arrayElemAt: ["$productInfo.images", 0] },
        },
      },
    ]);

    res.json({
      salesByDay,
      salesByCategory,
      topProducts,
      period,
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get revenue statistics
// @route   GET /api/analytics/revenue
// @access  Private/Admin
exports.getRevenueStats = async (req, res) => {
  try {
    // Today's revenue
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart },
          status: { $ne: "cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // This month's revenue
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: { $ne: "cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    // This year's revenue
    const yearStart = new Date();
    yearStart.setMonth(0, 1);
    yearStart.setHours(0, 0, 0, 0);

    const yearRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: yearStart },
          status: { $ne: "cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      today: todayRevenue.length > 0 ? todayRevenue[0].total : 0,
      thisMonth: monthRevenue.length > 0 ? monthRevenue[0].total : 0,
      thisYear: yearRevenue.length > 0 ? yearRevenue[0].total : 0,
    });
  } catch (error) {
    console.error("Revenue stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
