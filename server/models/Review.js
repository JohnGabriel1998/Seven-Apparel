const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    trim: true
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment']
  },
  images: [String],
  size: String,
  color: String,
  fit: {
    type: String,
    enum: ['runs-small', 'true-to-size', 'runs-large']
  },
  quality: {
    type: Number,
    min: 1,
    max: 5
  },
  comfort: {
    type: Number,
    min: 1,
    max: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  helpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Ensure user can only review a product once
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
