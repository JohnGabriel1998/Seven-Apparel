const express = require('express');
const router = express.Router();

// @desc    Submit contact form
// @route   POST /api/support/contact
// @access  Public
router.post('/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // TODO: Send email to support team
    // TODO: Save to database if needed

    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Get FAQ
// @route   GET /api/support/faq
// @access  Public
router.get('/faq', async (req, res) => {
  try {
    const faqs = [
      {
        category: 'Orders',
        questions: [
          {
            question: 'How can I track my order?',
            answer: 'You can track your order by logging into your account and visiting the Order History page.'
          },
          {
            question: 'Can I cancel my order?',
            answer: 'Orders can be cancelled within 24 hours of placement. Please contact support.'
          }
        ]
      },
      {
        category: 'Shipping',
        questions: [
          {
            question: 'What are the shipping options?',
            answer: 'We offer Standard (5-7 days) and Express (2-3 days) shipping.'
          },
          {
            question: 'Do you ship internationally?',
            answer: 'Yes, we ship to most countries worldwide.'
          }
        ]
      },
      {
        category: 'Returns',
        questions: [
          {
            question: 'What is your return policy?',
            answer: 'We accept returns within 30 days of delivery for unworn items with tags attached.'
          },
          {
            question: 'How do I initiate a return?',
            answer: 'Visit your Order History and click on "Return Item" for the order you wish to return.'
          }
        ]
      }
    ];

    res.status(200).json({
      success: true,
      data: faqs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
