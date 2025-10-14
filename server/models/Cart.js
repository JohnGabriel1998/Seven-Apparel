const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    items: [cartItemSchema],
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update timestamp on save
cartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate total
cartSchema.methods.getTotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
};

// Get item count
cartSchema.methods.getItemCount = function () {
  return this.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);
};

module.exports = mongoose.model("Cart", cartSchema);
