const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const { protect, adminOnly } = require("../middleware/supabaseAuth");

// Generate order number
function generateOrderNumber() {
  const prefix = "ORD";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: orders, error, count } = await query;

    if (error) throw error;

    // Transform orders
    const transformedOrders = orders.map((order) => ({
      _id: order.id,
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      items:
        order.order_items?.map((item) => ({
          _id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image,
          variantInfo: item.variant_info,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })) || [],
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));

    res.status(200).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: transformedOrders,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("orders")
      .select(
        `
        *,
        order_items(*),
        profiles:user_id (id, name, email)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%`);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: orders, error, count } = await query;

    if (error) throw error;

    const transformedOrders = orders.map((order) => ({
      _id: order.id,
      id: order.id,
      orderNumber: order.order_number,
      user: order.profiles
        ? {
            _id: order.profiles.id,
            name: order.profiles.name || order.profiles.email,
            email: order.profiles.email,
          }
        : null,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      items: order.order_items || [],
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shipping_address,
      createdAt: order.created_at,
    }));

    res.status(200).json({
      success: true,
      count: orders.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: transformedOrders,
      orders: transformedOrders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id);

    // Non-admin can only view their own orders
    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const transformedOrder = {
      _id: order.id,
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      items:
        order.order_items?.map((item) => ({
          _id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          productImage: item.product_image,
          variantInfo: item.variant_info,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })) || [],
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      shippingAddress: order.shipping_address,
      billingAddress: order.billing_address,
      trackingNumber: order.tracking_number,
      estimatedDelivery: order.estimated_delivery,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    res.status(200).json({
      success: true,
      data: transformedOrder,
      order: transformedOrder,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
    });
  }
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode,
      notes,
    } = req.body;

    // Get cart items
    const { data: cartItems, error: cartError } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        *,
        products (id, name, price, images, total_stock, is_active),
        product_variants (id, color, size, sku, stock)
      `,
      )
      .eq("user_id", userId);

    if (cartError) throw cartError;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of cartItems) {
      if (!item.products || !item.products.is_active) {
        return res.status(400).json({
          success: false,
          message: `Product no longer available: ${item.products?.name || "Unknown"}`,
        });
      }

      const price = item.products.price;
      const itemTotal = price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.products.name,
        product_image: item.products.images?.[0] || null,
        variant_info: item.product_variants
          ? {
              color: item.product_variants.color,
              size: item.product_variants.size,
            }
          : null,
        quantity: item.quantity,
        price: price,
        total: itemTotal,
      });
    }

    // Apply coupon if provided
    let discount = 0;
    let couponId = null;
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const validFrom = new Date(coupon.valid_from);
        const validUntil = new Date(coupon.valid_until);

        if (
          now >= validFrom &&
          now <= validUntil &&
          (coupon.usage_limit === null ||
            coupon.usage_count < coupon.usage_limit) &&
          subtotal >= (coupon.minimum_order_amount || 0)
        ) {
          couponId = coupon.id;
          if (coupon.discount_type === "percentage") {
            discount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount) {
              discount = Math.min(discount, coupon.max_discount_amount);
            }
          } else {
            discount = coupon.discount_value;
          }

          // Update coupon usage
          await supabaseAdmin
            .from("coupons")
            .update({ usage_count: coupon.usage_count + 1 })
            .eq("id", coupon.id);
        }
      }
    }

    const shippingCost = subtotal >= 2000 ? 0 : 150; // Free shipping over ₱2000
    const tax = 0; // Adjust as needed
    const total = subtotal - discount + shippingCost + tax;

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        order_number: generateOrderNumber(),
        status: "pending",
        payment_status: "pending",
        payment_method: paymentMethod || "cod",
        coupon_id: couponId,
        subtotal,
        shipping_cost: shippingCost,
        tax,
        discount,
        total,
        shipping_address: shippingAddress,
        billing_address: billingAddress || shippingAddress,
        notes,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    // Clear cart
    await supabaseAdmin.from("cart_items").delete().eq("user_id", userId);

    // Update stock
    for (const item of cartItems) {
      if (item.variant_id) {
        const { data: variant } = await supabaseAdmin
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .single();

        await supabaseAdmin
          .from("product_variants")
          .update({ stock: variant.stock - item.quantity })
          .eq("id", item.variant_id);
      }
    }

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        _id: order.id,
        id: order.id,
        orderNumber: order.order_number,
        total: order.total,
        status: order.status,
      },
      order: {
        _id: order.id,
        orderNumber: order.order_number,
        total: order.total,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating order",
    });
  }
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const updates = { status };
    if (trackingNumber) updates.tracking_number = trackingNumber;
    if (estimatedDelivery) updates.estimated_delivery = estimatedDelivery;

    // Update payment status based on order status
    if (status === "delivered") {
      updates.payment_status = "paid";
    } else if (status === "cancelled") {
      updates.payment_status = "cancelled";
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
    });
  }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === "admin";

    // Get order
    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id);

    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    const { data: order, error: findError } = await query.single();

    if (findError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`,
      });
    }

    // Cancel order
    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        status: "cancelled",
        payment_status: "cancelled",
      })
      .eq("id", id);

    if (updateError) throw updateError;

    // Restore stock
    for (const item of order.order_items || []) {
      if (item.variant_id) {
        const { data: variant } = await supabaseAdmin
          .from("product_variants")
          .select("stock")
          .eq("id", item.variant_id)
          .single();

        if (variant) {
          await supabaseAdmin
            .from("product_variants")
            .update({ stock: variant.stock + item.quantity })
            .eq("id", item.variant_id);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
    });
  }
});

module.exports = router;
