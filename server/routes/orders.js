const express = require("express");
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  updateOrderToPaid,
} = require("../controllers/orderController");
const { protect, authorize } = require("../middleware/auth");
const Order = require("../models/Order");

// Admin routes
router.get("/admin/all", protect, authorize("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const [
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      revenueData,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "pending" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
    res.json({
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue: revenueData.length > 0 ? revenueData[0].total : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: Date.now() },
        { new: true }
      ).populate("user", "name email");
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.put(
  "/admin/:id/payment",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { paymentStatus } = req.body;
      const order = await Order.findByIdAndUpdate(
        req.params.id,
        { paymentStatus, updatedAt: Date.now() },
        { new: true }
      ).populate("user", "name email");
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

router.delete(
  "/admin/:id",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      await Order.findByIdAndDelete(req.params.id);
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// User routes
router
  .route("/")
  .post(protect, createOrder)
  .get(protect, authorize("admin"), getAllOrders);

// Get logged-in user's orders - MUST be before /:id route
router.get("/my", protect, getMyOrders);
router.get("/my-orders", protect, getMyOrders); // Keep for backward compatibility

router.route("/:id").get(protect, getOrder);

router.put("/:id/status", protect, authorize("admin"), updateOrderStatus);
router.put("/:id/pay", protect, updateOrderToPaid);

module.exports = router;
