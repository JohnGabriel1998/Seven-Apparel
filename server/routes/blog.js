const express = require("express");
const router = express.Router();
const Blog = require("../models/Blog");
const { protect, authorize } = require("../middleware/auth");

// @desc    Get all blog posts
// @route   GET /api/blog
// @access  Public
router.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 10, includeAll } = req.query;

    let query = {};

    // If includeAll is not set, only show published posts (for public)
    if (!includeAll) {
      query.status = "published";
    }

    if (category) query.category = category;

    const skip = (page - 1) * limit;

    const posts = await Blog.find(query)
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Get single blog post
// @route   GET /api/blog/:slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const post = await Blog.findOne({ slug: req.params.slug })
      .populate("author", "name avatar")
      .populate("relatedProducts");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    // Increment view count
    post.viewCount += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Create blog post (Admin)
// @route   POST /api/blog
// @access  Private/Admin
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const post = await Blog.create({
      ...req.body,
      author: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Update blog post (Admin)
// @route   PUT /api/blog/:id
// @access  Private/Admin
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Delete blog post (Admin)
// @route   DELETE /api/blog/:id
// @access  Private/Admin
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const post = await Blog.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Blog post not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
