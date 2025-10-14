const Review = require('../models/Review');
const Product = require('../models/Product');

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { sort, page = 1, limit = 10 } = req.query;

    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };
    if (sort === 'helpful') sortOption = { helpful: -1 };

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ 
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'name avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({ 
      product: req.params.productId,
      status: 'approved'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { product, rating, title, comment, size, color, fit, quality, comfort } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    const review = await Review.create({
      product,
      user: req.user.id,
      rating,
      title,
      comment,
      size,
      color,
      fit,
      quality,
      comfort
    });

    // Update product rating
    await updateProductRating(product);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    if (review.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Update product rating
    await updateProductRating(review.product);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const productId = review.product;
    await review.deleteOne();

    // Update product rating
    await updateProductRating(productId);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked this review as helpful
    if (review.helpfulBy.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'You have already marked this review as helpful'
      });
    }

    review.helpful += 1;
    review.helpfulBy.push(req.user.id);
    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, status: 'approved' });
  
  if (reviews.length === 0) {
    await Product.findByIdAndUpdate(productId, {
      'rating.average': 0,
      'rating.count': 0
    });
    return;
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;

  await Product.findByIdAndUpdate(productId, {
    'rating.average': averageRating,
    'rating.count': reviews.length
  });
};
