const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const {
  protect,
  adminOnly,
  optionalAuth,
} = require("../middleware/supabaseAuth");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      gender,
      brand,
      minPrice,
      maxPrice,
      search,
      sortBy = "created_at",
      sortOrder = "desc",
      featured,
      newArrivals,
      onSale,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("products")
      .select("*, product_variants(*)", { count: "exact" })
      .eq("is_active", true);

    // Apply filters
    if (category) query = query.eq("category", category);
    if (gender) query = query.eq("gender", gender);
    if (brand) query = query.eq("brand", brand);
    if (minPrice) query = query.gte("price", parseFloat(minPrice));
    if (maxPrice) query = query.lte("price", parseFloat(maxPrice));
    if (featured === "true") query = query.eq("is_featured", true);
    if (newArrivals === "true") query = query.eq("is_new_arrival", true);
    if (onSale === "true") query = query.eq("is_on_sale", true);

    // Search
    if (search) {
      query = query.or(
        `name.ilike.%${search}%,description.ilike.%${search}%,brand.ilike.%${search}%`,
      );
    }

    // Sorting
    const validSortFields = ["created_at", "price", "name", "rating_average"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
    query = query.order(sortField, { ascending: sortOrder === "asc" });

    // Pagination
    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: products, error, count } = await query;

    if (error) throw error;

    // Transform data to match frontend expectations
    const transformedProducts = products.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compare_at_price,
      images: p.images || [],
      category: p.category,
      subcategory: p.subcategory,
      gender: p.gender,
      brand: p.brand,
      colors: p.colors || [],
      sizes: p.sizes || [],
      totalStock: p.total_stock,
      material: p.material,
      careInstructions: p.care_instructions,
      tags: p.tags || [],
      rating: {
        average: p.rating_average,
        count: p.rating_count,
      },
      isFeatured: p.is_featured,
      isNewArrival: p.is_new_arrival,
      isBestSeller: p.is_best_seller,
      isOnSale: p.is_on_sale,
      variants:
        p.product_variants?.map((v) => ({
          _id: v.id,
          color: v.color,
          size: v.size,
          sku: v.sku,
          stock: v.stock,
          images: v.images,
        })) || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: transformedProducts,
      products: transformedProducts, // For compatibility
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(parseInt(limit));

    if (error) throw error;

    const transformedProducts = products.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      compareAtPrice: p.compare_at_price,
      images: p.images || [],
      category: p.category,
      gender: p.gender,
      brand: p.brand,
      colors: p.colors || [],
      sizes: p.sizes || [],
      totalStock: p.total_stock,
      rating: {
        average: p.rating_average,
        count: p.rating_count,
      },
      isFeatured: p.is_featured,
      isNewArrival: p.is_new_arrival,
      variants:
        p.product_variants?.map((v) => ({
          _id: v.id,
          color: v.color,
          size: v.size,
          stock: v.stock,
        })) || [],
    }));

    res.status(200).json({
      success: true,
      count: products.length,
      data: transformedProducts,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
    });
  }
});

// @desc    Get recommended products
// @route   GET /api/products/recommended
// @access  Public
router.get("/recommended", async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("is_active", true)
      .order("rating_average", { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    const transformedProducts = products.map((p) => ({
      _id: p.id,
      id: p.id,
      name: p.name,
      price: p.price,
      compareAtPrice: p.compare_at_price,
      images: p.images || [],
      category: p.category,
      brand: p.brand,
      rating: {
        average: p.rating_average,
        count: p.rating_count,
      },
    }));

    res.status(200).json({
      success: true,
      data: transformedProducts,
      products: transformedProducts,
    });
  } catch (error) {
    console.error("Get recommended products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching recommended products",
    });
  }
});

// @desc    Get low stock products (admin)
// @route   GET /api/products/admin/low-stock
// @access  Private/Admin
router.get("/admin/low-stock", protect, adminOnly, async (req, res) => {
  try {
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("is_active", true)
      .lte("total_stock", 10)
      .order("total_stock", { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get low stock error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching low stock products",
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const transformedProduct = {
      _id: product.id,
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compare_at_price,
      images: product.images || [],
      category: product.category,
      subcategory: product.subcategory,
      gender: product.gender,
      brand: product.brand,
      colors: product.colors || [],
      sizes: product.sizes || [],
      totalStock: product.total_stock,
      material: product.material,
      careInstructions: product.care_instructions,
      sizeGuide: product.size_guide,
      tags: product.tags || [],
      rating: {
        average: product.rating_average,
        count: product.rating_count,
      },
      isFeatured: product.is_featured,
      isNewArrival: product.is_new_arrival,
      isBestSeller: product.is_best_seller,
      isOnSale: product.is_on_sale,
      variants:
        product.product_variants?.map((v) => ({
          _id: v.id,
          color: v.color,
          size: v.size,
          sku: v.sku,
          stock: v.stock,
          images: v.images,
        })) || [],
      createdAt: product.created_at,
      updatedAt: product.updated_at,
    };

    res.status(200).json({
      success: true,
      data: transformedProduct,
      product: transformedProduct,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
    });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      images,
      category,
      subcategory,
      gender,
      brand,
      colors,
      sizes,
      variants,
      material,
      careInstructions,
      sizeGuide,
      tags,
      isFeatured,
      isNewArrival,
      isOnSale,
    } = req.body;

    // Insert product
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .insert({
        name,
        description,
        price,
        compare_at_price: compareAtPrice,
        images: images || [],
        category,
        subcategory,
        gender,
        brand,
        colors: colors || [],
        sizes: sizes || [],
        material,
        care_instructions: careInstructions,
        size_guide: sizeGuide,
        tags: tags || [],
        is_featured: isFeatured || false,
        is_new_arrival: isNewArrival || false,
        is_on_sale: isOnSale || false,
      })
      .select()
      .single();

    if (productError) throw productError;

    // Insert variants if provided
    if (variants && variants.length > 0) {
      const variantsToInsert = variants.map((v) => ({
        product_id: product.id,
        color: v.color || "",
        size: v.size,
        sku: v.sku,
        stock: v.stock || 0,
        images: v.images || [],
      }));

      await supabaseAdmin.from("product_variants").insert(variantsToInsert);
    }

    // Fetch complete product
    const { data: completeProduct } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", product.id)
      .single();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: completeProduct,
      product: completeProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating product",
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Map camelCase to snake_case
    const dbUpdates = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.description !== undefined)
      dbUpdates.description = updates.description;
    if (updates.price !== undefined) dbUpdates.price = updates.price;
    if (updates.compareAtPrice !== undefined)
      dbUpdates.compare_at_price = updates.compareAtPrice;
    if (updates.images !== undefined) dbUpdates.images = updates.images;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.subcategory !== undefined)
      dbUpdates.subcategory = updates.subcategory;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.colors !== undefined) dbUpdates.colors = updates.colors;
    if (updates.sizes !== undefined) dbUpdates.sizes = updates.sizes;
    if (updates.material !== undefined) dbUpdates.material = updates.material;
    if (updates.careInstructions !== undefined)
      dbUpdates.care_instructions = updates.careInstructions;
    if (updates.sizeGuide !== undefined)
      dbUpdates.size_guide = updates.sizeGuide;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.isFeatured !== undefined)
      dbUpdates.is_featured = updates.isFeatured;
    if (updates.isNewArrival !== undefined)
      dbUpdates.is_new_arrival = updates.isNewArrival;
    if (updates.isOnSale !== undefined) dbUpdates.is_on_sale = updates.isOnSale;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    // Update variants if provided
    if (updates.variants) {
      // Delete existing variants
      await supabaseAdmin
        .from("product_variants")
        .delete()
        .eq("product_id", id);

      // Insert new variants
      if (updates.variants.length > 0) {
        const variantsToInsert = updates.variants.map((v) => ({
          product_id: id,
          color: v.color || "",
          size: v.size,
          sku: v.sku,
          stock: v.stock || 0,
          images: v.images || [],
        }));

        await supabaseAdmin.from("product_variants").insert(variantsToInsert);
      }
    }

    // Fetch updated product
    const { data: completeProduct } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .single();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: completeProduct,
      product: completeProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error updating product",
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
    });
  }
});

module.exports = router;
