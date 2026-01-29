const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const { protect, adminOnly } = require("../middleware/supabaseAuth");

// @desc    Get analytics summary (admin)
// @route   GET /api/analytics/summary
// @access  Private/Admin
router.get("/summary", protect, adminOnly, async (req, res) => {
  try {
    const { startDate, endDate, period = "month" } = req.query;

    // Get date range
    let start, end;
    const now = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      switch (period) {
        case "week":
          start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "year":
          start = new Date(now.getFullYear(), 0, 1);
          break;
        case "month":
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      end = now;
    }

    // Total revenue
    const { data: revenueData } = await supabaseAdmin
      .from("orders")
      .select("total")
      .eq("status", "delivered")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    const totalRevenue =
      revenueData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    // Total orders
    const { count: totalOrders } = await supabaseAdmin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    // Total customers
    const { count: totalCustomers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");

    // New customers this period
    const { count: newCustomers } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    // Total products
    const { count: totalProducts } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Order status breakdown
    const { data: orderStatusData } = await supabaseAdmin
      .from("orders")
      .select("status")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString());

    const ordersByStatus =
      orderStatusData?.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}) || {};

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.status(200).json({
      success: true,
      data: {
        period: { start, end },
        revenue: {
          total: totalRevenue,
          average: averageOrderValue,
        },
        orders: {
          total: totalOrders || 0,
          byStatus: ordersByStatus,
        },
        customers: {
          total: totalCustomers || 0,
          new: newCustomers || 0,
        },
        products: {
          total: totalProducts || 0,
        },
      },
    });
  } catch (error) {
    console.error("Get analytics summary error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching analytics",
    });
  }
});

// @desc    Get sales chart data (admin)
// @route   GET /api/analytics/sales-chart
// @access  Private/Admin
router.get("/sales-chart", protect, adminOnly, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    const now = new Date();
    let start;
    let groupBy;

    switch (period) {
      case "week":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = "day";
        break;
      case "year":
        start = new Date(now.getFullYear(), 0, 1);
        groupBy = "month";
        break;
      case "month":
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        groupBy = "day";
    }

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("total, created_at")
      .gte("created_at", start.toISOString())
      .order("created_at", { ascending: true });

    // Group by date
    const salesByDate = {};
    orders?.forEach((order) => {
      const date = new Date(order.created_at);
      let key;

      if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        key = date.toISOString().split("T")[0];
      }

      if (!salesByDate[key]) {
        salesByDate[key] = { date: key, revenue: 0, orders: 0 };
      }
      salesByDate[key].revenue += order.total || 0;
      salesByDate[key].orders += 1;
    });

    const chartData = Object.values(salesByDate);

    res.status(200).json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error("Get sales chart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales chart",
    });
  }
});

// @desc    Get top selling products (admin)
// @route   GET /api/analytics/top-products
// @access  Private/Admin
router.get("/top-products", protect, adminOnly, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: orderItems } = await supabaseAdmin.from("order_items")
      .select(`
        product_id,
        product_name,
        quantity,
        total
      `);

    // Aggregate by product
    const productSales = {};
    orderItems?.forEach((item) => {
      if (!productSales[item.product_id]) {
        productSales[item.product_id] = {
          productId: item.product_id,
          productName: item.product_name,
          totalQuantity: 0,
          totalRevenue: 0,
        };
      }
      productSales[item.product_id].totalQuantity += item.quantity;
      productSales[item.product_id].totalRevenue += item.total;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error("Get top products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top products",
    });
  }
});

// @desc    Get low stock products (admin)
// @route   GET /api/analytics/low-stock
// @access  Private/Admin
router.get("/low-stock", protect, adminOnly, async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const { data: products } = await supabaseAdmin
      .from("products")
      .select("id, name, images, total_stock, category")
      .eq("is_active", true)
      .lte("total_stock", parseInt(threshold))
      .order("total_stock", { ascending: true })
      .limit(20);

    const transformedProducts =
      products?.map((p) => ({
        _id: p.id,
        id: p.id,
        name: p.name,
        image: p.images?.[0],
        stock: p.total_stock,
        category: p.category,
      })) || [];

    res.status(200).json({
      success: true,
      count: products?.length || 0,
      data: transformedProducts,
    });
  } catch (error) {
    console.error("Get low stock error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching low stock products",
    });
  }
});

// @desc    Get recent orders (admin)
// @route   GET /api/analytics/recent-orders
// @access  Private/Admin
router.get("/recent-orders", protect, adminOnly, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        profiles:user_id (name, email)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    const transformedOrders =
      orders?.map((o) => ({
        _id: o.id,
        id: o.id,
        orderNumber: o.order_number,
        customer: o.profiles
          ? {
              name: o.profiles.name || o.profiles.email,
              email: o.profiles.email,
            }
          : null,
        total: o.total,
        status: o.status,
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
      })) || [];

    res.status(200).json({
      success: true,
      data: transformedOrders,
    });
  } catch (error) {
    console.error("Get recent orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent orders",
    });
  }
});

module.exports = router;
