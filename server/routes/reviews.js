const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getReviewStats,
  getRecentReviews,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/product/:productId', getProductReviews);

router.route('/')
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.put('/:id/helpful', protect, markHelpful);

// Admin endpoints
router.get('/admin/stats', protect, authorize('admin'), getReviewStats);
router.get('/admin/recent', protect, authorize('admin'), getRecentReviews);

module.exports = router;
