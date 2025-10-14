const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} = require("../controllers/cartController");

// All cart routes require authentication
router.use(protect);

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get("/", getCart);

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post("/", addToCart);

// @desc    Sync local cart with server
// @route   POST /api/cart/sync
// @access  Private
router.post("/sync", syncCart);

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put("/:itemId", updateCartItem);

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete("/:itemId", removeFromCart);

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete("/", clearCart);

// Old validation endpoint (kept for backwards compatibility)
router.post("/validate", async (req, res) => {
  try {
    const Product = require("../models/Product");
    const { items } = req.body;

    const validatedItems = [];
    const errors = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        errors.push(`Product ${item.productId} not found`);
        continue;
      }

      const variant = product.variants.find(
        (v) => v.color.name === item.color && v.size === item.size
      );

      if (!variant) {
        errors.push(`Variant not found for ${product.name}`);
        continue;
      }

      if (variant.stock < item.quantity) {
        errors.push(
          `Insufficient stock for ${product.name}. Available: ${variant.stock}`
        );
      }

      validatedItems.push({
        ...item,
        currentPrice: product.price,
        available: variant.stock >= item.quantity,
        stock: variant.stock,
      });
    }

    res.status(200).json({
      success: true,
      data: validatedItems,
      errors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
