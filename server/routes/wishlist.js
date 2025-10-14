const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');

    res.status(200).json({
      success: true,
      count: user.wishlist.length,
      data: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Add to wishlist
// @route   POST /api/wishlist/:productId
// @access  Private
router.post('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const product = await Product.findById(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (user.wishlist.includes(req.params.productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    await user.populate('wishlist');

    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.wishlist = user.wishlist.filter(
      item => item.toString() !== req.params.productId
    );

    await user.save();
    await user.populate('wishlist');

    res.status(200).json({
      success: true,
      data: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
