const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/product/:productId', getProductReviews);

router.route('/')
  .post(protect, createReview);

router.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

router.put('/:id/helpful', protect, markHelpful);

module.exports = router;
