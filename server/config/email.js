const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  // Check if email configuration exists
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    console.warn(
      "⚠️  Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env"
    );
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (orderData) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(
      "📧 Email service not configured - skipping email notification"
    );
    return { success: false, message: "Email service not configured" };
  }

  const {
    email,
    fullName,
    orderNumber,
    items,
    total,
    shippingAddress,
    paymentMethod,
  } = orderData;

  // Format items list
  const itemsList = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.name}</strong><br/>
        <small>Color: ${item.color} | Size: ${item.size} | Qty: ${
        item.quantity
      }</small>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
    </tr>
  `
    )
    .join("");

  const mailOptions = {
    from: `"Seven Apparel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Order Confirmation - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Order Confirmed!</h1>
          <p style="color: #fee2e2; margin: 10px 0 0 0;">Thank you for your purchase</p>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
          <p>Your order has been successfully placed and is being processed!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #dc2626;">
            <h2 style="color: #dc2626; margin-top: 0;">Order Details</h2>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${formatPaymentMethod(
              paymentMethod
            )}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</p>
          </div>

          <h3 style="color: #dc2626;">Items Ordered</h3>
          <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden;">
            ${itemsList}
            <tr>
              <td style="padding: 15px; font-weight: bold; font-size: 18px; background: #fee2e2;">Total</td>
              <td style="padding: 15px; font-weight: bold; font-size: 18px; text-align: right; color: #dc2626; background: #fee2e2;">
                $${total.toFixed(2)}
              </td>
            </tr>
          </table>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #dc2626; margin-top: 0;">Shipping Address</h3>
            <p style="margin: 5px 0;">${shippingAddress.fullName}</p>
            <p style="margin: 5px 0;">${shippingAddress.addressLine1}</p>
            <p style="margin: 5px 0;">${shippingAddress.city}, ${
      shippingAddress.state
    } ${shippingAddress.zipCode}</p>
            <p style="margin: 5px 0;">${shippingAddress.country}</p>
            ${
              shippingAddress.phone
                ? `<p style="margin: 5px 0;">Phone: ${shippingAddress.phone}</p>`
                : ""
            }
          </div>

          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af;">
              <strong>📦 Estimated Delivery:</strong> 3-5 business days
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/orders" 
               style="display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Track Your Order
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

          <p style="font-size: 14px; color: #6b7280; text-align: center;">
            If you have any questions, please contact our support team at 
            <a href="mailto:${
              process.env.SUPPORT_EMAIL || process.env.EMAIL_USER
            }" style="color: #dc2626;">
              ${process.env.SUPPORT_EMAIL || process.env.EMAIL_USER}
            </a>
          </p>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} Seven Apparel. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${email}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, message: error.message };
  }
};

// Helper function to format payment method
const formatPaymentMethod = (method) => {
  const methods = {
    credit_card: "Credit Card",
    paypal: "PayPal",
    gcash: "GCash",
    paymaya: "PayMaya",
  };
  return methods[method] || method;
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (paymentData) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(
      "📧 Email service not configured - skipping email notification"
    );
    return { success: false, message: "Email service not configured" };
  }

  const { email, fullName, orderNumber, amount, paymentMethod, transactionId } =
    paymentData;

  const mailOptions = {
    from: `"Seven Apparel" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payment Confirmed - ${orderNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Confirmed!</h1>
        </div>
        
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px;">Hi <strong>${fullName}</strong>,</p>
          <p>Your payment has been successfully processed!</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #10b981;">
            <h2 style="color: #10b981; margin-top: 0;">Payment Details</h2>
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Amount Paid:</strong> $${amount.toFixed(
              2
            )}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${formatPaymentMethod(
              paymentMethod
            )}</p>
            ${
              transactionId
                ? `<p style="margin: 5px 0;"><strong>Transaction ID:</strong> ${transactionId}</p>`
                : ""
            }
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}</p>
          </div>

          <div style="background: #d1fae5; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <p style="margin: 0; color: #065f46;">
              <strong>✓</strong> Your order is now being processed for shipment.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.FRONTEND_URL || "http://localhost:5173"
            }/orders" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Order Status
            </a>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px;">
            © ${new Date().getFullYear()} Seven Apparel. All rights reserved.
          </p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Payment confirmation email sent to ${email}`);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    return { success: false, message: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
};
