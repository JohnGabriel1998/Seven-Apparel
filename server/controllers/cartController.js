const Cart = require("../models/Cart");
const Product = require("../models/Product");

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, color, size, quantity, name, image, price } = req.body;

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check variant stock
    const variant = product.variants.find(
      (v) => v.color === color && v.size === size
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Product variant not found",
      });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${variant.stock}`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      if (variant.stock < newQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${variant.stock}`,
        });
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        name,
        image,
        color,
        size,
        quantity,
        price,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: existingItemIndex > -1 ? "Cart updated" : "Added to cart",
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    if (quantity <= 0) {
      // Remove item if quantity is 0
      cart.items.pull(itemId);
    } else {
      // Check stock
      const product = await Product.findById(item.product);
      const variant = product.variants.find(
        (v) => v.color === item.color && v.size === item.size
      );

      if (variant.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock. Available: ${variant.stock}`,
        });
      }

      item.quantity = quantity;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart",
    });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items.pull(itemId);
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing from cart",
    });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
    });
  }
};

// @desc    Sync local cart with server (on login)
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res) => {
  try {
    const { items } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Merge local cart items with server cart
    for (const localItem of items) {
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.product.toString() === localItem.productId &&
          item.color === localItem.color &&
          item.size === localItem.size
      );

      if (existingItemIndex > -1) {
        // Keep the higher quantity
        cart.items[existingItemIndex].quantity = Math.max(
          cart.items[existingItemIndex].quantity,
          localItem.quantity
        );
      } else {
        // Add local item to server cart
        cart.items.push({
          product: localItem.productId,
          name: localItem.name,
          image: localItem.image,
          color: localItem.color,
          size: localItem.size,
          quantity: localItem.quantity,
          price: localItem.price,
        });
      }
    }

    await cart.save();

    res.status(200).json({
      success: true,
      data: cart,
      message: "Cart synced successfully",
    });
  } catch (error) {
    console.error("Sync cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error syncing cart",
    });
  }
};
