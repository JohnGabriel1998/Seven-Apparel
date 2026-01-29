const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const { protect } = require("../middleware/supabaseAuth");

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: wishlistItems, error } = await supabaseAdmin
      .from("wishlists")
      .select(
        `
        *,
        products (
          id, name, price, compare_at_price, images, category, brand,
          rating_average, rating_count, is_active, total_stock
        )
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;

    const items = wishlistItems
      .filter((item) => item.products && item.products.is_active)
      .map((item) => ({
        _id: item.id,
        id: item.id,
        addedAt: item.added_at,
        product: {
          _id: item.products.id,
          id: item.products.id,
          name: item.products.name,
          price: item.products.price,
          compareAtPrice: item.products.compare_at_price,
          images: item.products.images,
          category: item.products.category,
          brand: item.products.brand,
          rating: {
            average: item.products.rating_average,
            count: item.products.rating_count,
          },
          inStock: item.products.total_stock > 0,
        },
      }));

    res.status(200).json({
      success: true,
      count: items.length,
      data: items,
      wishlist: items,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching wishlist",
    });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .eq("is_active", true)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if already in wishlist
    const { data: existing } = await supabaseAdmin
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // Add to wishlist
    const { error: insertError } = await supabaseAdmin
      .from("wishlists")
      .insert({
        user_id: userId,
        product_id: productId,
      });

    if (insertError) throw insertError;

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error adding to wishlist",
    });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete("/:productId", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const { error } = await supabaseAdmin
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error removing from wishlist",
    });
  }
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
router.get("/check/:productId", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const { data: existing } = await supabaseAdmin
      .from("wishlists")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    res.status(200).json({
      success: true,
      inWishlist: !!existing,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking wishlist",
    });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
      .from("wishlists")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Wishlist cleared",
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Error clearing wishlist",
    });
  }
});

module.exports = router;
