const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Order = require("../models/Order");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get all users with stats (Admin)
// @route   GET /api/users/admin/all
// @access  Private/Admin
router.get("/admin/all", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id });
        const orderCount = orders.length;
        const totalSpent = orders
          .filter((order) => order.paymentStatus === "paid")
          .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        return { ...user.toObject(), orderCount, totalSpent };
      })
    );
    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get user statistics (Admin)
// @route   GET /api/users/admin/stats
// @access  Private/Admin
router.get("/admin/stats", protect, authorize("admin"), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalUsers, activeUsers, adminUsers, newUsersThisMonth] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ createdAt: { $gte: startOfMonth } }),
      ]);
    res.json({ totalUsers, activeUsers, adminUsers, newUsersThisMonth });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Update user status (Admin)
// @route   PUT /api/users/admin/:id/status
// @access  Private/Admin
router.put(
  "/admin/:id/status",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { isActive } = req.body;
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isActive },
        { new: true }
      ).select("-password");
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @desc    Update user role (Admin)
// @route   PUT /api/users/admin/:id/role
// @access  Private/Admin
router.put("/admin/:id/role", protect, authorize("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Delete user (Admin)
// @route   DELETE /api/users/admin/:id
// @access  Private/Admin
router.delete("/admin/:id", protect, authorize("admin"), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Get all users (Admin)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
router.post("/addresses", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
router.put("/addresses/:addressId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, req.body);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
router.delete("/addresses/:addressId", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.pull(req.params.addressId);
    await user.save();

    res.status(200).json({
      success: true,
      data: user.addresses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Submit style quiz
// @route   POST /api/users/style-quiz
// @access  Private
router.post("/style-quiz", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.stylePreferences = {
      ...req.body,
      quiz_completed: true,
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.stylePreferences,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
