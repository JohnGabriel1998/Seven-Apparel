# GCash Payment Integration Setup Guide

This guide will help you set up real GCash payments using PayMongo (a payment gateway that supports GCash in the Philippines).

## Prerequisites

1. A PayMongo account (sign up at https://paymongo.com)
2. Your PayMongo API keys (Public Key and Secret Key)

## Setup Steps

### 1. Create a PayMongo Account

1. Go to https://paymongo.com
2. Sign up for an account
3. Complete the verification process
4. Navigate to your dashboard

### 2. Get Your API Keys

1. In your PayMongo dashboard, go to **Settings** → **API Keys**
2. Copy your **Public Key** (starts with `pk_test_` or `pk_live_`)
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)

**Important:**
- Use `test` keys for development/testing
- Use `live` keys for production (requires account verification)

### 3. Configure Environment Variables

Add these variables to your `.env` file in the `server` directory:

```env
# PayMongo API Keys for GCash Integration
PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here

# Frontend URL (for payment redirects)
FRONTEND_URL=http://localhost:5173
# For production: FRONTEND_URL=https://yourdomain.com
```

### 4. Set Up Webhook (Optional but Recommended)

To automatically update order status when payments are completed:

1. In PayMongo dashboard, go to **Settings** → **Webhooks**
2. Add a new webhook with URL: `https://yourdomain.com/api/payment/webhook/paymongo`
3. Select events: `payment.paid` and `payment.failed`
4. Copy the webhook secret (if provided)

Add to `.env`:
```env
PAYMONGO_WEBHOOK_SECRET=your_webhook_secret_here
```

### 5. Test the Integration

1. Start your server: `npm run dev` (in server directory)
2. Go to checkout and select GCash as payment method
3. Enter a test GCash number (for testing, PayMongo provides test numbers)
4. Complete the payment flow

## How It Works

1. **User selects GCash** → Enters their GCash mobile number
2. **Payment Intent Created** → PayMongo creates a payment intent
3. **Payment Method Attached** → GCash payment method is attached
4. **User Redirected** → User is redirected to GCash to complete payment
5. **Webhook Notification** → PayMongo sends webhook when payment succeeds/fails
6. **Order Updated** → Order status is automatically updated

## Payment Flow

- **Without API Keys**: System falls back to simulation mode (for testing)
- **With API Keys**: Real GCash payments are processed through PayMongo
- **Payment Status**: Orders remain "pending" until payment is confirmed via webhook

## Troubleshooting

### Payment not redirecting to GCash
- Check that `PAYMONGO_PUBLIC_KEY` and `PAYMONGO_SECRET_KEY` are set correctly
- Verify the keys are active in your PayMongo dashboard
- Check server logs for error messages

### Orders not updating after payment
- Ensure webhook URL is accessible from the internet
- Check webhook configuration in PayMongo dashboard
- Verify webhook endpoint is receiving events (check server logs)

### Invalid phone number errors
- Ensure phone number is in format: `09XXXXXXXXX` (11 digits starting with 09)
- Phone number is automatically normalized in the code

## Security Notes

- **Never commit API keys to version control**
- Use environment variables for all sensitive data
- Use test keys during development
- Verify webhook signatures in production (code includes placeholder)

## Support

- PayMongo Documentation: https://developers.paymongo.com
- PayMongo Support: support@paymongo.com

## Alternative Payment Gateways

If PayMongo doesn't work for your needs, you can also integrate with:
- **Xendit** (supports GCash)
- **DragonPay** (supports GCash)
- **Paynamics** (supports GCash)

The code structure supports easy switching between payment providers.

