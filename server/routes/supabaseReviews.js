const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const {
  protect,
  optionalAuth,
  adminOnly,
} = require("../middleware/supabaseAuth");

// @desc    Get review stats (admin)
// @route   GET /api/reviews/admin/stats
// @access  Private/Admin
router.get("/admin/stats", protect, adminOnly, async (req, res) => {
  try {
    const [
      { count: totalReviews },
      { count: pendingReviews },
      { count: approvedReviews },
      { data: ratingData },
    ] = await Promise.all([
      supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", false),
      supabaseAdmin
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("is_approved", true),
      supabaseAdmin.from("reviews").select("rating"),
    ]);

    const averageRating = ratingData?.length
      ? ratingData.reduce((sum, r) => sum + r.rating, 0) / ratingData.length
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalReviews: totalReviews || 0,
        pendingReviews: pendingReviews || 0,
        approvedReviews: approvedReviews || 0,
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Get review stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching review stats",
    });
  }
});

// @desc    Get recent reviews (admin)
// @route   GET /api/reviews/admin/recent
// @access  Private/Admin
router.get("/admin/recent", protect, adminOnly, async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select(
        `
        *,
        profiles:user_id (id, name, avatar),
        products:product_id (id, name, images)
      `,
      )
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    const transformedReviews = (reviews || []).map((review) => ({
      _id: review.id,
      id: review.id,
      user: review.profiles
        ? {
            _id: review.profiles.id,
            name: review.profiles.name || "Anonymous",
            avatar: review.profiles.avatar,
          }
        : { name: "Anonymous" },
      product: review.products
        ? {
            _id: review.products.id,
            name: review.products.name,
            images: review.products.images || [],
          }
        : null,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      isApproved: review.is_approved,
      createdAt: review.created_at,
    }));

    res.status(200).json({
      success: true,
      data: transformedReviews,
      reviews: transformedReviews,
    });
  } catch (error) {
    console.error("Get recent reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recent reviews",
    });
  }
});

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get("/product/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = "created_at" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const {
      data: reviews,
      error,
      count,
    } = await supabaseAdmin
      .from("reviews")
      .select(
        `
        *,
        profiles:user_id (id, name, avatar)
      `,
        { count: "exact" },
      )
      .eq("product_id", productId)
      .eq("is_approved", true)
      .order(sortBy, { ascending: false })
      .range(offset, offset + parseInt(limit) - 1);

    if (error) throw error;

    // Get rating distribution
    const { data: allReviews } = await supabaseAdmin
      .from("reviews")
      .select("rating")
      .eq("product_id", productId)
      .eq("is_approved", true);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    allReviews?.forEach((r) => {
      distribution[r.rating]++;
      totalRating += r.rating;
    });
    const averageRating = allReviews?.length
      ? totalRating / allReviews.length
      : 0;

    const transformedReviews = reviews.map((review) => ({
      _id: review.id,
      id: review.id,
      user: review.profiles
        ? {
            _id: review.profiles.id,
            name: review.profiles.name || "Anonymous",
            avatar: review.profiles.avatar,
          }
        : { name: "Anonymous" },
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images || [],
      isVerifiedPurchase: review.is_verified_purchase,
      helpfulCount: review.helpful_count,
      createdAt: review.created_at,
    }));

    res.status(200).json({
      success: true,
      count: reviews.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      averageRating: Math.round(averageRating * 10) / 10,
      distribution,
      data: transformedReviews,
      reviews: transformedReviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
    });
  }
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, comment, images } = req.body;

    // Check if product exists
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed
    const { data: existingReview } = await supabaseAdmin
      .from("reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Check if verified purchase
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, order_items!inner(product_id)")
      .eq("user_id", userId)
      .eq("status", "delivered")
      .eq("order_items.product_id", productId)
      .maybeSingle();

    const isVerifiedPurchase = !!order;

    // Create review
    const { data: review, error: createError } = await supabaseAdmin
      .from("reviews")
      .insert({
        user_id: userId,
        product_id: productId,
        rating,
        title,
        comment,
        images: images || [],
        is_verified_purchase: isVerifiedPurchase,
        is_approved: true, // Auto-approve, or set to false for moderation
      })
      .select()
      .single();

    if (createError) throw createError;

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating review",
    });
  }
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, title, comment, images } = req.body;

    // Check if review exists and belongs to user
    const { data: review, error: findError } = await supabaseAdmin
      .from("reviews")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (findError || !review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    const updates = {};
    if (rating !== undefined) updates.rating = rating;
    if (title !== undefined) updates.title = title;
    if (comment !== undefined) updates.comment = comment;
    if (images !== undefined) updates.images = images;

    const { data: updatedReview, error: updateError } = await supabaseAdmin
      .from("reviews")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) throw updateError;

    res.status(200).json({
      success: true,
      message: "Review updated",
      data: updatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating review",
    });
  }
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const isAdmin = req.user.role === "admin";

    let query = supabaseAdmin.from("reviews").delete().eq("id", id);

    // Non-admin can only delete their own reviews
    if (!isAdmin) {
      query = query.eq("user_id", userId);
    }

    const { error } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting review",
    });
  }
});

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Public
router.post("/:id/helpful", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: review } = await supabaseAdmin
      .from("reviews")
      .select("helpful_count")
      .eq("id", id)
      .single();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await supabaseAdmin
      .from("reviews")
      .update({ helpful_count: (review.helpful_count || 0) + 1 })
      .eq("id", id);

    res.status(200).json({
      success: true,
      message: "Marked as helpful",
    });
  } catch (error) {
    console.error("Mark helpful error:", error);
    res.status(500).json({
      success: false,
      message: "Error marking review",
    });
  }
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
router.get("/my-reviews", protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: reviews, error } = await supabaseAdmin
      .from("reviews")
      .select(
        `
        *,
        products:product_id (id, name, images)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const transformedReviews = reviews.map((review) => ({
      _id: review.id,
      id: review.id,
      product: review.products
        ? {
            _id: review.products.id,
            name: review.products.name,
            image: review.products.images?.[0],
          }
        : null,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      images: review.images,
      isApproved: review.is_approved,
      createdAt: review.created_at,
    }));

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: transformedReviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
    });
  }
});

module.exports = router;
