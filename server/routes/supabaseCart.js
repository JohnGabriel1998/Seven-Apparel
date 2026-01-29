const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const { protect, adminOnly } = require("../middleware/supabaseAuth");

// Helper function to get or create user's cart
async function getOrCreateCart(userId) {
  // First try to get existing cart
  const { data: existingCart, error: fetchError } = await supabaseAdmin
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingCart) {
    return existingCart.id;
  }

  // Create new cart if doesn't exist
  const { data: newCart, error: createError } = await supabaseAdmin
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (createError) throw createError;
  return newCart.id;
}

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get or create cart
    const cartId = await getOrCreateCart(userId);

    // Get cart items with product info
    const { data: cartItems, error } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        *,
        products:product_id (
          id, name, price, compare_at_price, images, category, brand, is_active
        )
      `,
      )
      .eq("cart_id", cartId);

    if (error) throw error;

    // Calculate totals
    let subtotal = 0;
    const items = (cartItems || [])
      .map((item) => {
        const productPrice = item.products?.price || item.price || 0;
        const itemTotal = productPrice * item.quantity;
        subtotal += itemTotal;

        return {
          _id: item.id,
          id: item.id,
          product: item.products
            ? {
                _id: item.products.id,
                id: item.products.id,
                name: item.products.name,
                price: item.products.price,
                compareAtPrice: item.products.compare_at_price,
                images: item.products.images,
                category: item.products.category,
                brand: item.products.brand,
              }
            : null,
          name: item.name,
          image: item.image,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price: productPrice,
          total: itemTotal,
        };
      })
      .filter((item) => item.product !== null || item.name);

    res.status(200).json({
      success: true,
      data: {
        items,
        subtotal,
        itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching cart",
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      productId,
      color = "Default",
      size = "One Size",
      quantity = 1,
    } = req.body;

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, images, total_stock, is_active")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Get or create cart
    const cartId = await getOrCreateCart(userId);

    // Check if item already in cart (same product, color, size)
    const { data: existingItem } = await supabaseAdmin
      .from("cart_items")
      .select("*")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .eq("color", color)
      .eq("size", size)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      const { error: updateError } = await supabaseAdmin
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", existingItem.id);

      if (updateError) throw updateError;
    } else {
      // Add new item
      const { error: insertError } = await supabaseAdmin
        .from("cart_items")
        .insert({
          cart_id: cartId,
          product_id: productId,
          name: product.name,
          image:
            product.images && product.images.length > 0
              ? product.images[0]
              : "",
          color,
          size,
          quantity,
          price: product.price,
        });

      if (insertError) throw insertError;
    }

    // Return updated cart
    const { data: cartItems } = await supabaseAdmin
      .from("cart_items")
      .select(
        `
        *,
        products:product_id (id, name, price, compare_at_price, images, category, brand)
      `,
      )
      .eq("cart_id", cartId);

    let subtotal = 0;
    const items = (cartItems || []).map((item) => {
      const price = item.products?.price || item.price || 0;
      subtotal += price * item.quantity;
      return {
        _id: item.id,
        id: item.id,
        product: item.products
          ? {
              _id: item.products.id,
              id: item.products.id,
              name: item.products.name,
              price: item.products.price,
              images: item.products.images,
            }
          : null,
        name: item.name,
        image: item.image,
        color: item.color,
        size: item.size,
        quantity: item.quantity,
        price,
      };
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      data: {
        items,
        subtotal,
        itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to cart",
    });
  }
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put("/:itemId", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Get user's cart
    const cartId = await getOrCreateCart(userId);

    // Check if item exists and belongs to user's cart
    const { data: cartItem, error: findError } = await supabaseAdmin
      .from("cart_items")
      .select("*")
      .eq("id", itemId)
      .eq("cart_id", cartId)
      .single();

    if (findError || !cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Update quantity
    const { error: updateError } = await supabaseAdmin
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.error("Update cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating cart",
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete("/:itemId", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    // Get user's cart
    const cartId = await getOrCreateCart(userId);

    const { error } = await supabaseAdmin
      .from("cart_items")
      .delete()
      .eq("id", itemId)
      .eq("cart_id", cartId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing from cart",
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's cart
    const { data: cart } = await supabaseAdmin
      .from("carts")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (cart) {
      const { error } = await supabaseAdmin
        .from("cart_items")
        .delete()
        .eq("cart_id", cart.id);

      if (error) throw error;
    }

    res.status(200).json({
      success: true,
      message: "Cart cleared",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing cart",
    });
  }
});

module.exports = router;
