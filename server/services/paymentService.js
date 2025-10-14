/**
 * Payment Service
 * Handles integration with multiple payment gateways
 * Supports: Credit Card, PayPal, GCash, PayMaya
 */

// Simulated payment processing for demonstration
// In production, replace with actual API integrations

/**
 * Process Credit Card Payment
 * In production: Integrate with Stripe, Square, or similar
 */
const processCreditCardPayment = async (paymentData) => {
  const { cardNumber, cardName, expiryDate, cvv, amount, orderNumber } =
    paymentData;

  console.log("💳 Credit Card Payment Data:", {
    cardNumber: cardNumber ? `****${cardNumber.slice(-4)}` : "undefined",
    cardName,
    expiryDate,
    cvv: cvv ? "***" : "undefined",
    amount,
    orderNumber,
  });

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validate card number (basic Luhn algorithm check)
    if (!isValidCardNumber(cardNumber)) {
      console.error("❌ Card validation failed: Invalid card number");
      throw new Error("Invalid card number");
    }

    // Validate expiry date
    if (!isValidExpiryDate(expiryDate)) {
      console.error("❌ Expiry validation failed:", expiryDate);
      throw new Error("Card has expired");
    }

    // Simulate payment processing
    // In production: Call Stripe API
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const charge = await stripe.charges.create({ ... });

    const transactionId = `CC_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success: true,
      transactionId,
      paymentMethod: "credit_card",
      amount,
      message: "Payment processed successfully",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Credit card payment error:", error);
    return {
      success: false,
      message: error.message || "Payment processing failed",
      paymentMethod: "credit_card",
    };
  }
};

/**
 * Process PayPal Payment
 * In production: Integrate with PayPal REST API
 */
const processPayPalPayment = async (paymentData) => {
  const { email, amount, orderNumber } = paymentData;

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In production: Use PayPal SDK
    // const paypal = require('@paypal/checkout-server-sdk');
    // Create and execute payment

    const transactionId = `PP_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success: true,
      transactionId,
      paymentMethod: "paypal",
      amount,
      message: "PayPal payment processed successfully",
      timestamp: new Date().toISOString(),
      paypalEmail: email,
    };
  } catch (error) {
    console.error("PayPal payment error:", error);
    return {
      success: false,
      message: error.message || "PayPal payment failed",
      paymentMethod: "paypal",
    };
  }
};

/**
 * Process GCash Payment
 * In production: Integrate with GCash API
 */
const processGCashPayment = async (paymentData) => {
  const { phoneNumber, amount, orderNumber } = paymentData;

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Validate Philippine mobile number
    if (!isValidPhilippineNumber(phoneNumber)) {
      throw new Error("Invalid GCash mobile number");
    }

    // In production: Call GCash API
    // const gcash = require('gcash-sdk');
    // Create payment request and redirect to GCash

    const transactionId = `GC_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success: true,
      transactionId,
      paymentMethod: "gcash",
      amount,
      message: "GCash payment processed successfully",
      timestamp: new Date().toISOString(),
      phoneNumber: phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3"),
    };
  } catch (error) {
    console.error("GCash payment error:", error);
    return {
      success: false,
      message: error.message || "GCash payment failed",
      paymentMethod: "gcash",
    };
  }
};

/**
 * Process PayMaya Payment
 * In production: Integrate with PayMaya API
 */
const processPayMayaPayment = async (paymentData) => {
  const { phoneNumber, email, amount, orderNumber } = paymentData;

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // Validate Philippine mobile number
    if (!isValidPhilippineNumber(phoneNumber)) {
      throw new Error("Invalid PayMaya mobile number");
    }

    // In production: Call PayMaya API
    // const paymaya = require('paymaya-sdk');
    // Create payment token and process

    const transactionId = `PM_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    return {
      success: true,
      transactionId,
      paymentMethod: "paymaya",
      amount,
      message: "PayMaya payment processed successfully",
      timestamp: new Date().toISOString(),
      phoneNumber: phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, "$1-$2-$3"),
    };
  } catch (error) {
    console.error("PayMaya payment error:", error);
    return {
      success: false,
      message: error.message || "PayMaya payment failed",
      paymentMethod: "paymaya",
    };
  }
};

/**
 * Main payment processor - routes to appropriate payment method
 */
const processPayment = async (paymentMethod, paymentData) => {
  console.log(
    `💳 Processing ${paymentMethod} payment for order ${paymentData.orderNumber}`
  );
  console.log("📦 Payment Data Keys:", Object.keys(paymentData));

  switch (paymentMethod) {
    case "credit_card":
      return await processCreditCardPayment(paymentData);

    case "paypal":
      return await processPayPalPayment(paymentData);

    case "gcash":
      return await processGCashPayment(paymentData);

    case "paymaya":
      return await processPayMayaPayment(paymentData);

    default:
      return {
        success: false,
        message: "Unsupported payment method",
        paymentMethod,
      };
  }
};

// Validation Helpers

/**
 * Validate credit card number using Luhn algorithm
 */
const isValidCardNumber = (cardNumber) => {
  const sanitized = cardNumber.replace(/\s/g, "");

  if (!/^\d{13,19}$/.test(sanitized)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate card expiry date
 */
const isValidExpiryDate = (expiryDate) => {
  if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
    return false;
  }

  const [month, year] = expiryDate.split("/").map((num) => parseInt(num, 10));
  const now = new Date();
  const currentYear = now.getFullYear() % 100; // Get last 2 digits
  const currentMonth = now.getMonth() + 1;

  if (month < 1 || month > 12) {
    return false;
  }

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
};

/**
 * Validate Philippine mobile number
 */
const isValidPhilippineNumber = (phoneNumber) => {
  // Remove all non-digit characters
  const sanitized = phoneNumber.replace(/\D/g, "");

  // Philippine mobile numbers: 09xx-xxx-xxxx or +639xx-xxx-xxxx
  // Should be 10 digits starting with 09, or 11 digits starting with 9, or 12 digits starting with 639
  return /^(09\d{9}|9\d{9}|639\d{9})$/.test(sanitized);
};

/**
 * Get payment method display name
 */
const getPaymentMethodName = (method) => {
  const names = {
    credit_card: "Credit Card",
    paypal: "PayPal",
    gcash: "GCash",
    paymaya: "PayMaya",
  };
  return names[method] || method;
};

/**
 * Verify payment status (for webhook processing)
 */
const verifyPaymentStatus = async (transactionId, paymentMethod) => {
  // In production: Query the payment gateway API to verify transaction
  console.log(`🔍 Verifying payment: ${transactionId} via ${paymentMethod}`);

  // Simulate verification
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    verified: true,
    transactionId,
    paymentMethod,
    status: "completed",
  };
};

module.exports = {
  processPayment,
  processCreditCardPayment,
  processPayPalPayment,
  processGCashPayment,
  processPayMayaPayment,
  verifyPaymentStatus,
  getPaymentMethodName,
  isValidCardNumber,
  isValidExpiryDate,
  isValidPhilippineNumber,
};
