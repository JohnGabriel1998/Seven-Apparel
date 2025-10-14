# Payment Processing System - Multi-Gateway Integration

## Overview

Comprehensive payment processing system with support for multiple payment methods, real-time payment confirmation, and automated email notifications.

## Supported Payment Methods

### 1. **Credit Card** 💳

- Direct card payment processing
- Secure card validation (Luhn algorithm)
- CVV and expiry date verification
- Real-time transaction processing
- **Production Integration:** Stripe, Square, or similar

### 2. **PayPal** 💳

- PayPal account payment
- Email-based authentication
- Redirect flow to PayPal
- **Production Integration:** PayPal REST API

### 3. **GCash** 📱

- Philippine mobile wallet
- Mobile number verification
- SMS notification support
- **Production Integration:** GCash API

### 4. **PayMaya** 💰

- Philippine digital wallet
- Mobile and email verification
- Instant payment confirmation
- **Production Integration:** PayMaya API

## System Architecture

### Backend Components

#### 1. Payment Service (`server/services/paymentService.js`)

```javascript
processPayment(paymentMethod, paymentData)
├── processCreditCardPayment()
├── processPayPalPayment()
├── processGCashPayment()
└── processPayMayaPayment()
```

**Features:**

- Method-specific validation
- Simulated payment processing (development)
- Transaction ID generation
- Error handling and logging
- Ready for production API integration

**Validation Functions:**

- `isValidCardNumber()` - Luhn algorithm validation
- `isValidExpiryDate()` - Expiry validation
- `isValidPhilippineNumber()` - Philippine mobile format

#### 2. Email Service (`server/config/email.js`)

```javascript
├── sendOrderConfirmationEmail()
└── sendPaymentConfirmationEmail()
```

**Features:**

- Beautiful HTML email templates
- Order details with itemized list
- Shipping information
- Payment method display
- Transaction tracking
- Professional branding

**Email Templates:**

- Order confirmation email
- Payment confirmation email
- Responsive design
- Dark mode friendly
- Brand colors (Seven Apparel red)

#### 3. Order Controller Updates

**Integrated Payment Flow:**

```
Create Order (Pending)
↓
Process Payment
↓
├─ Success → Update order (Paid/Processing) → Update stock → Send email
└─ Failure → Update order (Failed/Cancelled) → Return error
```

### Frontend Components

#### 1. Payment Method Selection

**Visual Payment Options:**

- Credit Card icon
- PayPal icon (💳)
- GCash icon (📱)
- PayMaya icon (💰)

**Interactive UI:**

- Click to select payment method
- Visual active state (primary border/background)
- Smooth transitions
- Responsive grid layout

#### 2. Payment Forms

**Credit Card Form:**

- Card number (formatted with spaces)
- Cardholder name
- Expiry date (MM/YY format)
- CVV code
- Real-time validation

**PayPal Form:**

- Email address
- Redirect notification

**GCash Form:**

- Mobile number (11 digits)
- Format: 09XXXXXXXXX
- SMS notification info

**PayMaya Form:**

- Mobile number (11 digits)
- Email address
- Redirect notification

#### 3. Enhanced Features

- Loading animation during payment processing
- Success/failure toasts
- Email confirmation notice
- Secure payment badges
- Amount display on submit button

## Payment Flow

### 1. User Journey

```
Cart → Checkout → Shipping Info → Payment Method Selection
↓
Choose Payment Method
↓
Fill Payment Details
↓
Click "Pay $XX.XX"
↓
Loading Animation (Processing Payment...)
↓
├─ Success Path:
│   ├─ Payment Processed ✓
│   ├─ Order Confirmed ✓
│   ├─ Stock Updated ✓
│   ├─ Email Sent 📧
│   └─ Order Confirmation Page
│
└─ Failure Path:
    ├─ Payment Failed ✗
    ├─ Error Message Displayed
    └─ Retry Option
```

### 2. Technical Flow

```
Frontend: Submit Payment
↓
Backend: Validate Request
↓
Backend: Create Order (Pending)
↓
Payment Service: Process Payment
↓
├─ Payment Gateway API Call
├─ Validate Response
└─ Generate Transaction ID
↓
Success?
├─ Yes:
│   ├─ Update Order Status (Paid/Processing)
│   ├─ Update Product Stock
│   ├─ Send Confirmation Email
│   └─ Return Success Response
│
└─ No:
    ├─ Update Order Status (Failed/Cancelled)
    ├─ Log Error
    └─ Return Error Response
```

## API Integration

### Order Creation Endpoint

**POST `/api/orders`**

**Request Body:**

```json
{
  "items": [...],
  "shippingAddress": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "addressLine1": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "paymentMethod": "credit_card|paypal|gcash|paymaya",
  "paymentDetails": {
    // Method-specific fields
  },
  "subtotal": 100.00,
  "shippingCost": 10.00,
  "tax": 8.00,
  "total": 118.00,
  "shippingMethod": "Standard"
}
```

**Payment Details by Method:**

**Credit Card:**

```json
{
  "cardNumber": "1234567890123456",
  "cardName": "JOHN DOE",
  "expiryDate": "12/25",
  "cvv": "123"
}
```

**PayPal:**

```json
{
  "email": "john@example.com"
}
```

**GCash:**

```json
{
  "phoneNumber": "09123456789"
}
```

**PayMaya:**

```json
{
  "phoneNumber": "09123456789",
  "email": "john@example.com"
}
```

**Success Response:**

```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "orderNumber": "SA25103456",
    "paymentStatus": "paid",
    "status": "processing",
    "transactionId": "CC_1634567890_abc123"
    // ... other order fields
  },
  "payment": {
    "status": "success",
    "transactionId": "CC_1634567890_abc123",
    "message": "Payment processed successfully"
  }
}
```

**Failure Response:**

```json
{
  "success": false,
  "message": "Payment processing failed: Invalid card number",
  "orderId": "order_id",
  "payment": {
    "status": "failed",
    "message": "Invalid card number"
  }
}
```

## Email Configuration

### Setup (Gmail Example)

1. **Enable 2-Factor Authentication** on your Gmail account

2. **Generate App Password:**

   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"

3. **Update `.env` file:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_generated_app_password
SUPPORT_EMAIL=support@sevenapparel.com
FRONTEND_URL=http://localhost:5173
```

### Alternative Email Providers

**SendGrid:**

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**Mailgun:**

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_username
EMAIL_PASSWORD=your_mailgun_password
```

**AWS SES:**

```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your_ses_smtp_username
EMAIL_PASSWORD=your_ses_smtp_password
```

## Email Templates

### Order Confirmation Email

**Sent:** Immediately after successful payment

**Contains:**

- 🎉 Order confirmation header
- Order number and date
- Payment method
- Itemized order list
- Total amount
- Shipping address
- Estimated delivery (3-5 business days)
- Track order button
- Support contact

**Design:**

- Professional gradient header (red theme)
- Responsive HTML template
- Clear typography
- Branded colors
- Call-to-action button

### Payment Confirmation Email

**Sent:** For separate payment notifications (optional)

**Contains:**

- ✅ Payment confirmed header
- Transaction ID
- Amount paid
- Payment method
- Order number
- Date and time
- View order button

## Production Integration Guide

### Step 1: Choose Payment Providers

**For Credit Cards:**

- **Stripe** (Recommended)
- **Square**
- **Authorize.Net**

**For PayPal:**

- PayPal REST API
- PayPal SDK

**For Philippine Methods:**

- GCash API Partner Program
- PayMaya Developer Portal

### Step 2: Get API Credentials

Each provider requires:

- API Key / Secret Key
- Merchant ID
- Webhook URL (for callbacks)

### Step 3: Update Environment Variables

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_MODE=live

# GCash
GCASH_API_KEY=...
GCASH_MERCHANT_ID=...

# PayMaya
PAYMAYA_PUBLIC_KEY=...
PAYMAYA_SECRET_KEY=...
```

### Step 4: Replace Simulated Code

**Example: Stripe Integration**

```javascript
// In paymentService.js
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const processCreditCardPayment = async (paymentData) => {
  try {
    const { cardNumber, expiryDate, cvv, amount } = paymentData;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        orderNumber: paymentData.orderNumber,
      },
    });

    // Confirm payment
    const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
      payment_method: {
        card: {
          number: cardNumber,
          exp_month: parseInt(expiryDate.split("/")[0]),
          exp_year: parseInt("20" + expiryDate.split("/")[1]),
          cvc: cvv,
        },
      },
    });

    return {
      success: true,
      transactionId: confirmed.id,
      paymentMethod: "credit_card",
      amount,
      message: "Payment processed successfully",
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      paymentMethod: "credit_card",
    };
  }
};
```

### Step 5: Set Up Webhooks

**Purpose:** Handle asynchronous payment updates

**Stripe Webhook Example:**

```javascript
// In routes/webhooks.js
router.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      // Update order status
      await updateOrderPaymentStatus(
        paymentIntent.metadata.orderNumber,
        "paid"
      );
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});
```

## Security Best Practices

### 1. **Never Store Sensitive Data**

- ❌ Do NOT store full card numbers
- ❌ Do NOT store CVV codes
- ✅ Store only last 4 digits (if needed)
- ✅ Store transaction IDs from gateway

### 2. **Use HTTPS in Production**

```javascript
// In server.js
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.header("x-forwarded-proto") !== "https") {
      res.redirect(`https://${req.header("host")}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. **Validate All Inputs**

- ✅ Server-side validation
- ✅ Client-side validation
- ✅ Sanitize data
- ✅ Check payment amounts

### 4. **PCI Compliance**

- Use payment gateway SDK (tokenization)
- Never log card details
- Encrypt all sensitive data in transit
- Regular security audits

### 5. **Rate Limiting**

```javascript
const rateLimit = require("express-rate-limit");

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many payment attempts, please try again later",
});

router.post("/orders", protect, paymentLimiter, createOrder);
```

## Testing

### Test Cards (Development)

**Stripe Test Cards:**

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Insufficient funds: `4000 0000 0000 9995`

**Test Expiry:** Any future date (e.g., 12/25)
**Test CVV:** Any 3 digits (e.g., 123)

### Test Scenarios

1. **Successful Payment:**

   - Use valid card/details
   - Verify order created with "paid" status
   - Check email sent
   - Verify stock updated

2. **Failed Payment:**

   - Use invalid card/details
   - Verify order marked as "failed"
   - Check error message displayed
   - Verify stock NOT updated

3. **Different Payment Methods:**

   - Test each payment method
   - Verify method-specific validation
   - Check transaction ID format

4. **Email Delivery:**
   - Check inbox for order confirmation
   - Verify all details correct
   - Test links in email
   - Check spam folder if needed

## Monitoring & Logging

### Payment Logs

```javascript
console.log(`💳 Processing ${paymentMethod} payment for order ${orderNumber}`);
console.log(`✅ Payment successful: ${transactionId}`);
console.log(`❌ Payment failed: ${errorMessage}`);
```

### Email Logs

```javascript
console.log(`📧 Order confirmation email sent to ${email}`);
console.log(`✅ Email sent successfully`);
console.log(`❌ Email sending failed: ${error}`);
```

### Error Tracking

Consider integrating:

- **Sentry** for error monitoring
- **LogRocket** for session replay
- **DataDog** for APM

## Troubleshooting

### Email Not Sending

**Check:**

1. `.env` file configuration
2. Email credentials correct
3. Less secure app access (Gmail)
4. App password generated (Gmail 2FA)
5. Firewall/antivirus blocking SMTP
6. Check spam folder

**Test Email:**

```javascript
// Test in Node REPL or separate script
const { sendOrderConfirmationEmail } = require("./config/email");

sendOrderConfirmationEmail({
  email: "test@example.com",
  fullName: "Test User",
  orderNumber: "TEST123",
  items: [
    { name: "Test Item", price: 10, quantity: 1, color: "Red", size: "M" },
  ],
  total: 10,
  shippingAddress: {
    /* ... */
  },
  paymentMethod: "credit_card",
});
```

### Payment Processing Issues

**Check:**

1. Payment service returning correct format
2. Transaction ID generated
3. Order status updated correctly
4. Stock update successful
5. Network timeouts (increase if needed)

**Debug Mode:**

```javascript
// Add to paymentService.js
if (process.env.NODE_ENV === "development") {
  console.log("Payment Data:", JSON.stringify(paymentData, null, 2));
  console.log("Payment Result:", JSON.stringify(result, null, 2));
}
```

### Frontend Issues

**Check:**

1. Payment method selected
2. Form validation passing
3. API endpoint correct
4. Error handling working
5. Loading states displaying

**Browser Console:**

```javascript
// Check network tab for API calls
// Check console for errors
// Verify request payload
```

## Performance Optimization

### 1. Async Email Sending

```javascript
// Don't wait for email to complete
sendOrderConfirmationEmail(data).catch((err) =>
  console.error("Email error:", err)
);
```

### 2. Database Indexing

```javascript
// In Order model
orderNumberIndex: true;
transactionIdIndex: true;
userIndex: true;
```

### 3. Caching

```javascript
// Cache payment method configurations
const redis = require("redis");
const client = redis.createClient();
```

## Future Enhancements

### Planned Features:

- [ ] Cryptocurrency payments (Bitcoin, Ethereum)
- [ ] Buy Now Pay Later (Klarna, Afterpay)
- [ ] Subscription payments
- [ ] Recurring billing
- [ ] Refund processing
- [ ] Partial refunds
- [ ] Payment analytics dashboard
- [ ] Multi-currency support
- [ ] Dynamic currency conversion
- [ ] Payment receipt download
- [ ] Invoice generation
- [ ] Loyalty points integration
- [ ] Gift card support

## Summary

### ✅ Implemented Features:

**Payment Methods:**

- ✅ Credit Card processing
- ✅ PayPal integration (ready)
- ✅ GCash support
- ✅ PayMaya support

**Email System:**

- ✅ Order confirmation emails
- ✅ Payment confirmation emails
- ✅ Beautiful HTML templates
- ✅ Responsive design

**Security:**

- ✅ Input validation
- ✅ Secure processing
- ✅ Error handling
- ✅ Transaction tracking

**User Experience:**

- ✅ Multiple payment options
- ✅ Visual payment selection
- ✅ Real-time validation
- ✅ Loading animations
- ✅ Success/failure notifications
- ✅ Email confirmations

**Developer Experience:**

- ✅ Modular architecture
- ✅ Easy to extend
- ✅ Comprehensive logging
- ✅ Production-ready structure
- ✅ Detailed documentation

The payment system is now fully functional for development and ready for production integration with real payment gateways! 🎉
