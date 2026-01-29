const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const { protect, adminOnly } = require("../middleware/supabaseAuth");

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
router.post("/validate", protect, async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    // Check validity period
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);

    if (now < validFrom) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not yet active",
      });
    }

    if (now > validUntil) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    // Check usage limit
    if (
      coupon.usage_limit !== null &&
      coupon.usage_count >= coupon.usage_limit
    ) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached",
      });
    }

    // Check minimum order
    if (coupon.minimum_order_amount && subtotal < coupon.minimum_order_amount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₱${coupon.minimum_order_amount}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discount_type === "percentage") {
      discount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    } else {
      discount = coupon.discount_value;
    }

    res.status(200).json({
      success: true,
      data: {
        code: coupon.code,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
        calculatedDiscount: discount,
        maxDiscount: coupon.max_discount_amount,
        minimumOrder: coupon.minimum_order_amount,
        description: coupon.description,
      },
    });
  } catch (error) {
    console.error("Validate coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Error validating coupon",
    });
  }
});

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
// @access  Private/Admin
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("coupons")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (active === "true") {
      query = query.eq("is_active", true);
    } else if (active === "false") {
      query = query.eq("is_active", false);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: coupons, error, count } = await query;

    if (error) throw error;

    const transformedCoupons = coupons.map((c) => ({
      _id: c.id,
      id: c.id,
      code: c.code,
      description: c.description,
      discountType: c.discount_type,
      discountValue: c.discount_value,
      maxDiscountAmount: c.max_discount_amount,
      minimumOrderAmount: c.minimum_order_amount,
      validFrom: c.valid_from,
      validUntil: c.valid_until,
      usageLimit: c.usage_limit,
      usageCount: c.usage_count,
      isActive: c.is_active,
      createdAt: c.created_at,
    }));

    res.status(200).json({
      success: true,
      count: coupons.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: transformedCoupons,
      coupons: transformedCoupons,
    });
  } catch (error) {
    console.error("Get coupons error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching coupons",
    });
  }
});

// @desc    Get single coupon (admin)
// @route   GET /api/coupons/:id
// @access  Private/Admin
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: coupon.id,
        ...coupon,
      },
    });
  } catch (error) {
    console.error("Get coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching coupon",
    });
  }
});

// @desc    Create coupon (admin)
// @route   POST /api/coupons
// @access  Private/Admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      minimumOrderAmount,
      validFrom,
      validUntil,
      usageLimit,
      isActive = true,
    } = req.body;

    // Check if code already exists
    const { data: existing } = await supabaseAdmin
      .from("coupons")
      .select("id")
      .eq("code", code.toUpperCase())
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .insert({
        code: code.toUpperCase(),
        description,
        discount_type: discountType,
        discount_value: discountValue,
        max_discount_amount: maxDiscountAmount,
        minimum_order_amount: minimumOrderAmount,
        valid_from: validFrom,
        valid_until: validUntil,
        usage_limit: usageLimit,
        is_active: isActive,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating coupon",
    });
  }
});

// @desc    Update coupon (admin)
// @route   PUT /api/coupons/:id
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const dbUpdates = {};
    if (updates.code !== undefined) dbUpdates.code = updates.code.toUpperCase();
    if (updates.description !== undefined)
      dbUpdates.description = updates.description;
    if (updates.discountType !== undefined)
      dbUpdates.discount_type = updates.discountType;
    if (updates.discountValue !== undefined)
      dbUpdates.discount_value = updates.discountValue;
    if (updates.maxDiscountAmount !== undefined)
      dbUpdates.max_discount_amount = updates.maxDiscountAmount;
    if (updates.minimumOrderAmount !== undefined)
      dbUpdates.minimum_order_amount = updates.minimumOrderAmount;
    if (updates.validFrom !== undefined)
      dbUpdates.valid_from = updates.validFrom;
    if (updates.validUntil !== undefined)
      dbUpdates.valid_until = updates.validUntil;
    if (updates.usageLimit !== undefined)
      dbUpdates.usage_limit = updates.usageLimit;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data: coupon, error } = await supabaseAdmin
      .from("coupons")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      data: coupon,
    });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating coupon",
    });
  }
});

// @desc    Delete coupon (admin)
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Delete coupon error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting coupon",
    });
  }
});

module.exports = router;
