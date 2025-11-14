const Order = require("../models/Order");
const Product = require("../models/Product");
const { processPayment } = require("../services/paymentService");
const { sendOrderConfirmationEmail } = require("../config/email");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod,
      paymentDetails,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      shippingMethod,
    } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.name} not found`,
        });
      }

      // Handle both color.name (object) and color (string) formats
      const variant = product.variants.find((v) => {
        const variantColor =
          typeof v.color === "object" ? v.color.name : v.color;
        const itemColor =
          typeof item.color === "object" ? item.color.name : item.color;
        return variantColor === itemColor && v.size === item.size;
      });

      if (!variant) {
        return res.status(400).json({
          success: false,
          message: `Variant not found for ${item.name} (${item.color}, ${item.size})`,
        });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${variant.stock}, Requested: ${item.quantity}`,
        });
      }
    }

    // Create order first (with pending payment status)
    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      discount,
      shippingCost,
      tax,
      total,
      shippingMethod,
      paymentStatus: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: new Date(),
        },
      ],
    });

    // Process payment based on payment method
    let paymentResult;
    const paymentData = {
      ...paymentDetails,
      amount: total,
      orderNumber: order.orderNumber,
      email: shippingAddress.email || req.user.email,
    };

    paymentResult = await processPayment(paymentMethod, paymentData);

    // Handle payment result
    if (paymentResult.success) {
      // Check if payment requires user action (e.g., redirect to GCash)
      if (paymentResult.requiresAction && paymentResult.paymentUrl) {
        // Payment requires user to complete on GCash
        order.transactionId = paymentResult.transactionId;
        order.paymentStatus = "pending"; // Keep as pending until user completes payment
        order.paymentResult = {
          id: paymentResult.transactionId,
          status: "pending",
          paymentUrl: paymentResult.paymentUrl,
        };
        await order.save();

        // Return payment URL for frontend redirect
        return res.status(200).json({
          success: true,
          data: order,
          payment: {
            status: "pending",
            requiresAction: true,
            paymentUrl: paymentResult.paymentUrl,
            transactionId: paymentResult.transactionId,
            message: paymentResult.message,
          },
        });
      }

      // Payment succeeded immediately
      order.paymentStatus = "paid";
      order.isPaid = true;
      order.paidAt = new Date();
      order.transactionId = paymentResult.transactionId;
      order.status = "processing"; // Move to processing after successful payment
      order.statusHistory.push({
        status: "processing",
        timestamp: new Date(),
      });
      await order.save();

      // Update product stock
      for (const item of items) {
        const product = await Product.findById(item.product);

        // Handle both color.name (object) and color (string) formats
        const variant = product.variants.find((v) => {
          const variantColor =
            typeof v.color === "object" ? v.color.name : v.color;
          const itemColor =
            typeof item.color === "object" ? item.color.name : item.color;
          return variantColor === itemColor && v.size === item.size;
        });

        if (variant) {
          variant.stock -= item.quantity;
          product.totalStock -= item.quantity;
          product.soldCount = (product.soldCount || 0) + item.quantity;
          await product.save();
        }
      }

      // Send order confirmation email (async, don't wait)
      sendOrderConfirmationEmail({
        email: shippingAddress.email || req.user.email,
        fullName: shippingAddress.fullName,
        orderNumber: order.orderNumber,
        items: items.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
        })),
        total: total,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
      }).catch((err) => console.error("Email error:", err));

      res.status(201).json({
        success: true,
        data: order,
        payment: {
          status: "success",
          transactionId: paymentResult.transactionId,
          message: paymentResult.message,
        },
      });
    } else {
      // Payment failed - update order status
      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.statusHistory.push({
        status: "cancelled",
        timestamp: new Date(),
        note: `Payment failed: ${paymentResult.message}`,
      });
      await order.save();

      res.status(402).json({
        success: false,
        message: paymentResult.message || "Payment processing failed",
        orderId: order._id,
        payment: {
          status: "failed",
          message: paymentResult.message,
        },
      });
    }
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("items.product", "name images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name images");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Make sure user is order owner or admin
    if (
      order.user._id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;

    // Add to status history
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note,
    });

    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "processing";
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      email_address: req.body.email_address,
    };

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
