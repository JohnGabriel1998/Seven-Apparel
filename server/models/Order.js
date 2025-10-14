const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      // Not required here because it's auto-generated in pre-save hook
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        image: String,
        color: String,
        size: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      fullName: String,
      phone: String,
      street: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "debit_card",
        "gcash",
        "paymaya",
        "paypal",
        "apple_pay",
        "cod",
      ],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      email_address: String,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    discount: {
      amount: {
        type: Number,
        default: 0,
      },
      couponCode: String,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
    trackingNumber: String,
    shippingMethod: {
      type: String,
      // Allow flexible shipping method values
      default: "standard",
    },
    estimatedDelivery: Date,
    notes: String,
    statusHistory: [
      {
        status: String,
        timestamp: Date,
        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    this.orderNumber = `SA${year}${month}${random}`;
  }
  // Sync totalAmount with total if not set
  if (!this.totalAmount && this.total) {
    this.totalAmount = this.total;
  } else if (this.totalAmount && !this.total) {
    this.total = this.totalAmount;
  }
  // Sync paymentStatus with isPaid
  if (this.isPaid && this.paymentStatus === "pending") {
    this.paymentStatus = "paid";
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
