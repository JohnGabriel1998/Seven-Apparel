const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  excerpt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  featuredImage: {
    url: String,
    alt: String
  },
  images: [String],
  category: {
    type: String,
    enum: ['style-tips', 'trends', 'how-to', 'lookbook', 'news'],
    required: true
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  publishedAt: Date,
  viewCount: {
    type: Number,
    default: 0
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Generate slug before saving
blogSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
