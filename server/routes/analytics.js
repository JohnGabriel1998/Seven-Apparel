const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getDashboard,
  getSalesAnalytics,
  getRevenueStats,
} = require("../controllers/analyticsController");

// @desc    Get dashboard analytics (Admin)
// @route   GET /api/analytics/dashboard
// @access  Private/Admin
router.get("/dashboard", protect, authorize("admin"), getDashboard);

// @desc    Get sales analytics (Admin)
// @route   GET /api/analytics/sales
// @access  Private/Admin
router.get("/sales", protect, authorize("admin"), getSalesAnalytics);

// @desc    Get revenue statistics (Admin)
// @route   GET /api/analytics/revenue
// @access  Private/Admin
router.get("/revenue", protect, authorize("admin"), getRevenueStats);

module.exports = router;
