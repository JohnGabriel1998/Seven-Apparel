const { supabaseAdmin } = require("../config/supabase");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
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

    res.status(200).json({
      success: true,
      count: products.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
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

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
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
      seoTitle,
      seoDescription,
      seoKeywords,
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
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: seoKeywords,
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

      const { error: variantsError } = await supabaseAdmin
        .from("product_variants")
        .insert(variantsToInsert);

      if (variantsError) throw variantsError;
    }

    // Fetch the complete product with variants
    const { data: completeProduct, error: fetchError } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", product.id)
      .single();

    if (fetchError) throw fetchError;

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: completeProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
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
    if (updates.seoTitle !== undefined) dbUpdates.seo_title = updates.seoTitle;
    if (updates.seoDescription !== undefined)
      dbUpdates.seo_description = updates.seoDescription;
    if (updates.seoKeywords !== undefined)
      dbUpdates.seo_keywords = updates.seoKeywords;

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

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

    // Fetch updated product with variants
    const { data: completeProduct } = await supabaseAdmin
      .from("products")
      .select("*, product_variants(*)")
      .eq("id", id)
      .single();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: completeProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete by setting is_active to false
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_featured", true)
      .limit(parseInt(limit));

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message,
    });
  }
};

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
exports.getNewArrivals = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true)
      .eq("is_new_arrival", true)
      .order("created_at", { ascending: false })
      .limit(parseInt(limit));

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Get new arrivals error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching new arrivals",
      error: error.message,
    });
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
  try {
    const {
      q,
      category,
      gender,
      minPrice,
      maxPrice,
      limit = 20,
      offset = 0,
    } = req.query;

    const { data: products, error } = await supabaseAdmin.rpc(
      "search_products",
      {
        search_query: q || "",
        p_category: category || null,
        p_gender: gender || null,
        p_min_price: minPrice ? parseFloat(minPrice) : null,
        p_max_price: maxPrice ? parseFloat(maxPrice) : null,
        p_limit: parseInt(limit),
        p_offset: parseInt(offset),
      },
    );

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Error searching products",
      error: error.message,
    });
  }
};
