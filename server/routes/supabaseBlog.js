const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const {
  protect,
  adminOnly,
  optionalAuth,
} = require("../middleware/supabaseAuth");

// @desc    Get all published blog posts
// @route   GET /api/blog
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("blog_posts")
      .select(
        `
        *,
        profiles:author_id (id, name, avatar)
      `,
        { count: "exact" },
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (category) {
      query = query.eq("category", category);
    }

    if (tag) {
      query = query.contains("tags", [tag]);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: posts, error, count } = await query;

    if (error) throw error;

    const transformedPosts = posts.map((post) => ({
      _id: post.id,
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featured_image,
      category: post.category,
      tags: post.tags || [],
      author: post.profiles
        ? {
            _id: post.profiles.id,
            name: post.profiles.name || "",
            avatar: post.profiles.avatar,
          }
        : null,
      viewCount: post.view_count,
      publishedAt: post.published_at,
      createdAt: post.created_at,
    }));

    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: transformedPosts,
      posts: transformedPosts,
    });
  } catch (error) {
    console.error("Get blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog posts",
    });
  }
});

// @desc    Get all blog posts (admin)
// @route   GET /api/blog/admin/all
// @access  Private/Admin
router.get("/admin/all", protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = supabaseAdmin
      .from("blog_posts")
      .select(
        `
        *,
        profiles:author_id (id, name, avatar)
      `,
        { count: "exact" },
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    query = query.range(offset, offset + parseInt(limit) - 1);

    const { data: posts, error, count } = await query;

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: posts.length,
      total: count,
      totalPages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page),
      data: posts,
    });
  } catch (error) {
    console.error("Get all blog posts error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog posts",
    });
  }
});

// @desc    Get single blog post by slug
// @route   GET /api/blog/:slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .select(
        `
        *,
        profiles:author_id (id, name, avatar)
      `,
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error || !post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment view count
    await supabaseAdmin
      .from("blog_posts")
      .update({ view_count: (post.view_count || 0) + 1 })
      .eq("id", post.id);

    const transformedPost = {
      _id: post.id,
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      featuredImage: post.featured_image,
      category: post.category,
      tags: post.tags || [],
      author: post.profiles
        ? {
            _id: post.profiles.id,
            name: post.profiles.name || "",
            avatar: post.profiles.avatar,
          }
        : null,
      viewCount: post.view_count + 1,
      publishedAt: post.published_at,
      createdAt: post.created_at,
    };

    res.status(200).json({
      success: true,
      data: transformedPost,
      post: transformedPost,
    });
  } catch (error) {
    console.error("Get blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching blog post",
    });
  }
});

// @desc    Create blog post
// @route   POST /api/blog
// @access  Private/Admin
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const authorId = req.user.id;
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      category,
      tags,
      status = "draft",
    } = req.body;

    // Generate slug if not provided
    const postSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const { data: existing } = await supabaseAdmin
      .from("blog_posts")
      .select("id")
      .eq("slug", postSlug)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A post with this slug already exists",
      });
    }

    const postData = {
      title,
      slug: postSlug,
      excerpt,
      content,
      featured_image: featuredImage,
      category,
      tags: tags || [],
      author_id: authorId,
      status,
    };

    if (status === "published") {
      postData.published_at = new Date().toISOString();
    }

    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .insert(postData)
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Blog post created successfully",
      data: post,
    });
  } catch (error) {
    console.error("Create blog post error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error creating blog post",
    });
  }
});

// @desc    Update blog post
// @route   PUT /api/blog/:id
// @access  Private/Admin
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get current post
    const { data: currentPost } = await supabaseAdmin
      .from("blog_posts")
      .select("status, published_at")
      .eq("id", id)
      .single();

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
    if (updates.excerpt !== undefined) dbUpdates.excerpt = updates.excerpt;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.featuredImage !== undefined)
      dbUpdates.featured_image = updates.featuredImage;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.status !== undefined) {
      dbUpdates.status = updates.status;
      // Set published_at when first published
      if (updates.status === "published" && !currentPost.published_at) {
        dbUpdates.published_at = new Date().toISOString();
      }
    }

    const { data: post, error } = await supabaseAdmin
      .from("blog_posts")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Blog post updated successfully",
      data: post,
    });
  } catch (error) {
    console.error("Update blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating blog post",
    });
  }
});

// @desc    Delete blog post
// @route   DELETE /api/blog/:id
// @access  Private/Admin
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Blog post deleted successfully",
    });
  } catch (error) {
    console.error("Delete blog post error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting blog post",
    });
  }
});

// @desc    Get blog categories
// @route   GET /api/blog/meta/categories
// @access  Public
router.get("/meta/categories", async (req, res) => {
  try {
    const { data: posts } = await supabaseAdmin
      .from("blog_posts")
      .select("category")
      .eq("status", "published")
      .not("category", "is", null);

    const categories = [
      ...new Set(posts?.map((p) => p.category).filter(Boolean)),
    ];

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
    });
  }
});

module.exports = router;
