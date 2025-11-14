const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please provide product description"],
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      enum: [
        "men",
        "women",
        "kids",
        "accessories",
        "tops",
        "bottoms",
        "dresses",
        "outerwear",
        "shoes",
        "activewear",
      ],
    },
    subcategory: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["men", "women", "unisex", "kids", "male", "female"],
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    variants: [
      {
        color: {
          type: String,
          default: "",
        },
        size: {
          type: String,
          uppercase: true,
        },
        sku: String,
        stock: {
          type: Number,
          default: 0,
        },
        images: [String],
      },
    ],
    colors: [
      {
        name: String,
        hex: String,
      },
    ],
    sizes: [
      {
        type: String,
        enum: ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"],
      },
    ],
    totalStock: {
      type: Number,
      default: 0,
    },
    material: String,
    careInstructions: [String],
    sizeGuide: {
      type: mongoose.Schema.Types.Mixed,
    },
    tags: [
      {
        type: String,
      },
    ],
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to normalize data
productSchema.pre("save", function (next) {
  // Normalize images: convert strings to objects
  if (this.images && Array.isArray(this.images)) {
    this.images = this.images.map((img) => {
      if (typeof img === "string") {
        return { url: img, alt: this.name };
      }
      return img;
    });
  }

  // Normalize variant sizes to uppercase and colors to strings
  if (this.variants && Array.isArray(this.variants)) {
    this.variants = this.variants.map((variant) => {
      // Normalize size to uppercase
      if (variant.size) {
        variant.size = variant.size.toUpperCase();
      }
      // Normalize color: convert object to string (just the name)
      if (variant.color && typeof variant.color === "object") {
        variant.color = variant.color.name || JSON.stringify(variant.color);
      }
      return variant;
    });
  }

  // Calculate total stock from variants
  if (this.variants && Array.isArray(this.variants)) {
    this.totalStock = this.variants.reduce(
      (total, variant) => total + (variant.stock || 0),
      0
    );
  }

  next();
});

// Index for search
productSchema.index({ name: "text", description: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
