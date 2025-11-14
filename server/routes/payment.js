const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');

// @desc    Create payment intent
// @route   POST /api/payment/create-intent
// @access  Private
router.post('/create-intent', protect, async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: req.user.id
      }
    });

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Webhook for PayMongo events (GCash payments)
// @route   POST /api/payment/webhook/paymongo
// @access  Public
router.post('/webhook/paymongo', express.json(), async (req, res) => {
  try {
    const event = req.body;
    const Order = require('../models/Order');

    // Verify webhook signature (optional but recommended)
    // const signature = req.headers['paymongo-signature'];
    // Verify signature using PayMongo webhook secret

    console.log('📥 PayMongo webhook received:', event.type);

    if (event.type === 'payment.paid' || event.type === 'link.payment.paid') {
      const paymentData = event.data?.attributes || event.data;
      // PayMongo webhook can have payment_intent_id or link_id depending on payment method
      const transactionId = paymentData.payment_intent_id || 
                           paymentData.link_id || 
                           paymentData.data?.attributes?.payment_intent_id ||
                           paymentData.data?.attributes?.link_id;

      if (transactionId) {
        // Find order by transaction ID (could be payment intent ID or link ID)
        const order = await Order.findOne({ transactionId: transactionId });
        
        if (order && order.paymentStatus === 'pending') {
          // Update order to paid
          order.paymentStatus = 'paid';
          order.isPaid = true;
          order.paidAt = new Date();
          order.status = 'processing';
          order.statusHistory.push({
            status: 'processing',
            timestamp: new Date(),
            note: 'Payment confirmed via GCash',
          });

          // Update product stock
          const Product = require('../models/Product');
          for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
              const variant = product.variants.find((v) => {
                const variantColor = typeof v.color === "object" ? v.color.name : v.color;
                const itemColor = typeof item.color === "object" ? item.color.name : item.color;
                return variantColor === itemColor && v.size === item.size;
              });

              if (variant) {
                variant.stock -= item.quantity;
                product.totalStock -= item.quantity;
                product.soldCount = (product.soldCount || 0) + item.quantity;
                await product.save();
              }
            }
          }

          await order.save();
          console.log(`✅ Order ${order.orderNumber} marked as paid`);
        }
      }
    } else if (event.type === 'payment.failed' || event.type === 'link.payment.failed') {
      const paymentData = event.data?.attributes || event.data;
      const transactionId = paymentData.payment_intent_id || 
                           paymentData.link_id || 
                           paymentData.data?.attributes?.payment_intent_id ||
                           paymentData.data?.attributes?.link_id;

      if (transactionId) {
        const order = await Order.findOne({ transactionId: transactionId });
        if (order) {
          order.paymentStatus = 'failed';
          await order.save();
          console.log(`❌ Order ${order.orderNumber} payment failed`);
        }
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// @desc    Webhook for Stripe events
// @route   POST /api/payment/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // TODO: Update order status
      console.log('PaymentIntent was successful!');
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      // TODO: Handle failed payment
      console.log('PaymentIntent failed!');
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
