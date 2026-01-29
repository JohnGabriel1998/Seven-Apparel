const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const { protect, adminOnly } = require("../middleware/supabaseAuth");

// @desc    Get all users for admin (admin/all route)
// @route   GET /api/users/admin/all
// @access  Private/Admin
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (role) {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: users, error, count } = await query;

    if (error) throw error;

    const transformedUsers = users.map((u) => ({
      _id: u.id,
      id: u.id,
      email: u.email,
      name: u.name || u.email,
      phone: u.phone,
      avatar: u.avatar,
      role: u.role,
      isActive: u.is_active,
      createdAt: u.created_at,
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: transformedUsers,
      users: transformedUsers,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// @desc    Get user stats for admin
// @route   GET /api/users/admin/stats
// @access  Private/Admin
router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: adminUsers },
      { data: recentUsers },
    ] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabaseAdmin
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin"),
      supabaseAdmin
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        adminUsers: adminUsers || 0,
        recentUsers: (recentUsers || []).map((u) => ({
          _id: u.id,
          id: u.id,
          name: u.name || u.email,
          email: u.email,
          role: u.role,
          createdAt: u.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user stats",
    });
  }
});

// @desc    Update user status (admin)
// @route   PUT /api/users/admin/:userId/status
// @access  Private/Admin
router.put("/admin/:userId/status", protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        _id: user.id,
        id: user.id,
        isActive: user.is_active,
      },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user status",
    });
  }
});

// @desc    Update user role (admin)
// @route   PUT /api/users/admin/:userId/role
// @access  Private/Admin
router.put("/admin/:userId/role", protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'user' or 'admin'",
      });
    }

    const { data: user, error } = await supabaseAdmin
      .from("profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        _id: user.id,
        id: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user role",
    });
  }
});

// @desc    Delete user (admin)
// @route   DELETE /api/users/admin/:userId
// @access  Private/Admin
router.delete("/admin/:userId", protect, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    if (userId === adminId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Soft delete - deactivate user
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: false })
      .eq("id", userId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
});

// @desc    Get all users (admin)
// @route   GET /api/users
// @access  Private/Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (role) {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: users, error, count } = await query;

    if (error) throw error;

    const transformedUsers = users.map((u) => ({
      _id: u.id,
      id: u.id,
      email: u.email,
      name: u.name || u.email,
      phone: u.phone,
      avatar: u.avatar,
      role: u.role,
      isActive: u.is_active,
      createdAt: u.created_at,
    }));

    res.status(200).json({
      success: true,
      count: users.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: transformedUsers,
      users: transformedUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
});

// @desc    Get single user (admin)
// @route   GET /api/users/:id
// @access  Private/Admin
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get user's order stats
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("total, status")
      .eq("user_id", id);

    const orderStats = {
      totalOrders: orders?.length || 0,
      completedOrders:
        orders?.filter((o) => o.status === "delivered").length || 0,
      totalSpent: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
    };

    res.status(200).json({
      success: true,
      data: {
        _id: user.id,
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        isActive: user.is_active,
        addresses: user.addresses || [],
        preferences: user.preferences,
        createdAt: user.created_at,
        lastLogin: user.last_login,
        orderStats,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
});

// @desc    Update user (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const fullName =
        `${updates.firstName || ""} ${updates.lastName || ""}`.trim();
      if (fullName) dbUpdates.name = fullName;
    }
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.role !== undefined) dbUpdates.role = updates.role;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data: user, error } = await supabaseAdmin
      .from("profiles")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: {
        _id: user.id,
        ...user,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating user",
    });
  }
});

// @desc    Delete/deactivate user (admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // Prevent self-deletion
    if (id === adminId) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete your own account",
      });
    }

    // Soft delete - deactivate user
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
});

// @desc    Get user's orders (admin)
// @route   GET /api/users/:id/orders
// @access  Private/Admin
router.get("/:id/orders", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const {
      data: orders,
      error,
      count,
    } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .eq("user_id", id)
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user orders",
    });
  }
});

module.exports = router;
