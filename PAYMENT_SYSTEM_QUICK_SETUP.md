# Payment System Quick Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Configure Email Service

1. **Open** `server/.env` file

2. **Add email configuration** (Gmail example):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=your_app_password_here
SUPPORT_EMAIL=support@sevenapparel.com
FRONTEND_URL=http://localhost:5173
```

3. **For Gmail users:**
   - Enable 2-Factor Authentication
   - Generate App Password:
     1. Go to: https://myaccount.google.com/security
     2. Click "2-Step Verification"
     3. Scroll to "App passwords"
     4. Generate password for "Mail"
     5. Copy the 16-character password
     6. Paste into `EMAIL_PASSWORD` in `.env`

### Step 2: Install Dependencies (if needed)

```bash
cd server
npm install
```

_Note: All required packages (nodemailer, etc.) are already in package.json_

### Step 3: Restart the Server

```bash
# Stop current server (Ctrl+C)
npm start
```

### Step 4: Test the System

1. **Open your browser** and navigate to the app
2. **Add items to cart**
3. **Go to checkout**
4. **Fill shipping information**
5. **Select a payment method:**
   - Credit Card
   - PayPal
   - GCash
   - PayMaya
6. **Fill payment details:**
   - **Credit Card:** Use `4242 4242 4242 4242`, exp: 12/25, CVV: 123
   - **PayPal:** Enter any valid email
   - **GCash:** Enter 11-digit number (09123456789)
   - **PayMaya:** Enter 11-digit number and email
7. **Click "Pay $XX.XX"**
8. **Wait for success message**
9. **Check your email** for order confirmation!

## ✅ What's Working

### Payment Processing:

- ✅ Credit Card validation
- ✅ PayPal payment
- ✅ GCash payment
- ✅ PayMaya payment
- ✅ Real-time processing simulation
- ✅ Transaction ID generation
- ✅ Order status updates

### Email Notifications:

- ✅ Order confirmation email (with all details)
- ✅ Beautiful HTML template
- ✅ Itemized order list
- ✅ Shipping information
- ✅ Payment method display
- ✅ Track order link

### User Experience:

- ✅ Multiple payment method selection
- ✅ Payment-specific forms
- ✅ Real-time validation
- ✅ Loading animation during processing
- ✅ Success/failure notifications
- ✅ Email sent confirmation
- ✅ Order confirmation page

## 📧 Email Configuration Options

### Option 1: Gmail (Recommended for Testing)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.gmail@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
```

### Option 2: Outlook/Hotmail

```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your.email@outlook.com
EMAIL_PASSWORD=your_password
```

### Option 3: SendGrid (Production)

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your_api_key_here
```

### Option 4: No Email (Testing)

_If you don't configure email:_

- Orders will still work
- Payment will process
- Console will show: "Email service not configured - skipping"
- Everything else functions normally

## 🧪 Test Payment Details

### Credit Card (All cards work in development)

```
Card Number: 4242 4242 4242 4242
Cardholder: JOHN DOE
Expiry: 12/25
CVV: 123
```

### PayPal

```
Email: any valid email format
```

### GCash

```
Mobile: 09123456789 (any 11-digit starting with 09)
```

### PayMaya

```
Mobile: 09123456789
Email: any valid email format
```

## 🎯 Payment Flow

```
1. User selects payment method
   ↓
2. Fills payment details
   ↓
3. Clicks "Pay $XX.XX"
   ↓
4. Loading animation appears
   ↓
5. Payment processed (~2 seconds)
   ↓
6. Success messages:
   - "Payment successful! Order confirmed 🎉"
   - "Confirmation email sent to email@example.com 📧"
   ↓
7. Redirected to order confirmation
   ↓
8. Email arrives in inbox
```

## 📧 Email Template Preview

**Subject:** Order Confirmation - SA25103456

**Content:**

```
🎉 Order Confirmed!
Thank you for your purchase

Hi John Doe,

Your order has been successfully placed and is being processed!

Order Details:
Order Number: SA25103456
Payment Method: Credit Card
Order Date: October 11, 2025, 8:42 PM

Items Ordered:
------------------------
Product Name
Color: Black | Size: M | Qty: 1
$50.00

Total: $64.00
------------------------

Shipping Address:
John Doe
123 Main Street
City, State 12345
Philippines
Phone: 1234567890

📦 Estimated Delivery: 3-5 business days

[Track Your Order Button]
```

## 🔧 Troubleshooting

### Email Not Sending?

**Check these:**

1. ✅ `.env` file has EMAIL\_\* variables
2. ✅ Gmail App Password generated (not regular password)
3. ✅ 2-Factor Authentication enabled on Gmail
4. ✅ No typos in email configuration
5. ✅ Firewall not blocking port 587
6. ✅ Check spam/junk folder

**Test email configuration:**

```javascript
// In Node.js terminal
const { sendOrderConfirmationEmail } = require("./server/config/email");

sendOrderConfirmationEmail({
  email: "your.email@gmail.com",
  fullName: "Test User",
  orderNumber: "TEST123",
  items: [{ name: "Test", price: 10, quantity: 1, color: "Red", size: "M" }],
  total: 10,
  shippingAddress: {
    fullName: "Test",
    addressLine1: "123 St",
    city: "City",
    state: "State",
    zipCode: "12345",
    country: "Country",
  },
  paymentMethod: "credit_card",
});
```

### Payment Not Processing?

**Check:**

1. ✅ Server running (port 5000)
2. ✅ Network tab shows POST to `/api/orders`
3. ✅ Response code (201 = success, 402 = payment failed, 500 = server error)
4. ✅ Console logs show payment processing messages
5. ✅ All required payment fields filled

### Common Issues:

**Issue:** "Failed to place order"

- **Fix:** Check server console for detailed error
- **Fix:** Verify all cart items have valid products

**Issue:** "Invalid card number"

- **Fix:** Use test card: 4242 4242 4242 4242
- **Fix:** Remove all spaces (handled automatically)

**Issue:** "Invalid GCash/PayMaya number"

- **Fix:** Must be exactly 11 digits
- **Fix:** Must start with 09

## 📊 Features by Payment Method

| Feature            | Credit Card | PayPal   | GCash     | PayMaya         |
| ------------------ | ----------- | -------- | --------- | --------------- |
| Validation         | ✅ Luhn     | ✅ Email | ✅ Mobile | ✅ Mobile+Email |
| Processing Time    | ~1.5s       | ~2s      | ~1.8s     | ~1.8s           |
| Transaction ID     | CC\_\*      | PP\_\*   | GC\_\*    | PM\_\*          |
| Email Notification | ✅          | ✅       | ✅        | ✅              |
| Order Confirmation | ✅          | ✅       | ✅        | ✅              |
| Stock Update       | ✅          | ✅       | ✅        | ✅              |

## 🎨 UI Features

### Payment Method Selection

- Visual icons for each method
- Active state highlighting
- Smooth transitions
- Responsive grid layout

### Payment Forms

- Auto-formatting (card numbers, expiry)
- Real-time validation
- Error messages
- Placeholder hints
- Security badges

### Loading States

- Animated package icon
- Pulsing dots
- "Processing Payment..." message
- Blur backdrop
- Professional appearance

### Success Notifications

- Dual toast messages:
  1. Payment success
  2. Email confirmation
- Emoji icons
- Long duration (4-5 seconds)
- Dismissible

## 📋 Next Steps

### For Production:

1. **Get Real API Keys:**

   - Stripe: https://stripe.com/
   - PayPal: https://developer.paypal.com/
   - GCash: Contact GCash Business
   - PayMaya: https://developers.paymaya.com/

2. **Update Environment Variables:**

   ```env
   STRIPE_SECRET_KEY=sk_live_...
   PAYPAL_CLIENT_ID=...
   GCASH_API_KEY=...
   PAYMAYA_SECRET_KEY=...
   ```

3. **Replace Simulated Code:**

   - See `PAYMENT_SYSTEM_DOCUMENTATION.md`
   - Follow production integration guide
   - Test thoroughly

4. **Set Up Webhooks:**

   - Configure payment gateway webhooks
   - Handle async payment updates
   - Implement retry logic

5. **Enable HTTPS:**
   - Get SSL certificate
   - Configure HTTPS redirect
   - Update FRONTEND_URL

## 🎉 You're Done!

Your payment system is now:

- ✅ Fully functional
- ✅ Supporting 4 payment methods
- ✅ Sending email confirmations
- ✅ Processing payments in real-time
- ✅ Providing great user experience
- ✅ Ready for production integration

## 📚 Additional Resources

- **Full Documentation:** `PAYMENT_SYSTEM_DOCUMENTATION.md`
- **Order Route Fix:** `ORDER_ROUTE_FIX.md`
- **Order Display:** `ORDER_DISPLAY_ENHANCEMENT.md`
- **Checkout Enhancement:** `ORDER_CONFIRMATION_ENHANCEMENT.md`

## 💬 Support

For issues or questions:

- Check console logs (browser & server)
- Review documentation files
- Test with provided test data
- Verify environment configuration

Happy selling! 🛍️✨
