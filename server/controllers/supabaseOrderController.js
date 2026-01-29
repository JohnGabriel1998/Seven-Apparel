const { supabaseAdmin } = require("../config/supabase");

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (error || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check ownership (unless admin)
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      couponCode,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items",
      });
    }

    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: req.user.id,
        shipping_full_name: shippingAddress.fullName,
        shipping_phone: shippingAddress.phone,
        shipping_street: shippingAddress.street,
        shipping_address_line_1: shippingAddress.addressLine1,
        shipping_address_line_2: shippingAddress.addressLine2,
        shipping_city: shippingAddress.city,
        shipping_state: shippingAddress.state,
        shipping_zip_code: shippingAddress.zipCode,
        shipping_country: shippingAddress.country,
        payment_method: paymentMethod,
        subtotal,
        discount_amount: discount?.amount || 0,
        discount_coupon_code: discount?.couponCode || couponCode,
        shipping_cost: shippingCost,
        tax,
        total,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId || item.product,
      name: item.name,
      image: item.image,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update product stock
    for (const item of items) {
      await supabaseAdmin.rpc("decrease_product_stock", {
        p_product_id: item.productId || item.product,
        p_color: item.color,
        p_size: item.size,
        p_quantity: item.quantity,
      });
    }

    // Record coupon usage if applicable
    if (couponCode || discount?.couponCode) {
      const code = couponCode || discount.couponCode;
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("id")
        .eq("code", code.toUpperCase())
        .single();

      if (coupon) {
        await supabaseAdmin.rpc("record_coupon_usage", {
          p_coupon_id: coupon.id,
          p_user_id: req.user.id,
          p_order_id: order.id,
        });
      }
    }

    // Clear user's cart
    const { data: cart } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", req.user.id)
      .single();

    if (cart) {
      await supabaseAdmin.from("cart_items").delete().eq("cart_id", cart.id);
    }

    // Fetch complete order with items
    const { data: completeOrder } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order.id)
      .single();

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: completeOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, carrier, notes } = req.body;

    const updates = { status };
    if (trackingNumber) updates.tracking_number = trackingNumber;
    if (carrier) updates.carrier = carrier;
    if (notes) updates.notes = notes;

    // Handle delivered status
    if (status === "delivered") {
      updates.is_delivered = true;
      updates.delivered_at = new Date().toISOString();
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

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
      error: error.message,
    });
  }
};

// @desc    Update payment status
// @route   PUT /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentResult } = req.body;

    const updates = {
      payment_status: paymentStatus,
    };

    if (paymentStatus === "paid") {
      updates.is_paid = true;
      updates.paid_at = new Date().toISOString();
    }

    if (paymentResult) {
      updates.payment_result_id = paymentResult.id;
      updates.payment_result_status = paymentResult.status;
      updates.payment_result_email = paymentResult.email;
    }

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .update(updates)
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    if (error) throw error;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated",
      data: order,
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating payment status",
      error: error.message,
    });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("orders")
      .select("*, order_items(*), profiles(name, email)", { count: "exact" });

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: orders, error, count } = await query;

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
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    // Get the order
    const { data: order, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (fetchError || !order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check ownership (unless admin)
    if (order.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled (status: ${order.status})`,
      });
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    if (updateError) throw updateError;

    // Restore product stock
    for (const item of order.order_items) {
      await supabaseAdmin
        .from("product_variants")
        .update({
          stock: supabaseAdmin.raw("stock + ?", [item.quantity]),
        })
        .eq("product_id", item.product_id)
        .eq("color", item.color)
        .eq("size", item.size);
    }

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};
