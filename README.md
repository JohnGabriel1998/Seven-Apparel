# 🛍️ Seven Apparel – Clothing E-Commerce Website

A modern and stylish clothing e-commerce platform built with the MERN stack.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + MongoDB
- **Authentication**: JWT + OAuth (Google)
- **Payment**: Stripe Integration
- **Storage**: Cloudinary (for images)

## 📦 Features

### User Features
- 🛍️ Product catalog with advanced filters
- 👕 Detailed product pages with reviews
- 🛒 Shopping cart with coupon support
- 💳 Secure checkout with multiple payment options
- 👤 User accounts with order history
- ❤️ Wishlist functionality
- 🌈 Style quiz for personalized recommendations
- 👗 Virtual try-on feature (Optional)

### Admin Features
- 📊 Analytics dashboard
- 📦 Product management
- 👥 User management
- 🎫 Promo code management
- 📋 Order management

### Additional Features
- 🌙 Dark/Light mode
- 🌐 Multilanguage support
- 📱 Mobile-first responsive design
- 💬 Live chat support
- 📝 Blog/Lookbook section

## 🛠️ Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- npm or yarn

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

## 🔧 Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
CLIENT_URL=http://localhost:5173
```

### Client (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## 📝 API Documentation

API documentation is available at `/api/docs` when the server is running.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Seven Apparel Team

## 🙏 Acknowledgments

- React Team
- Tailwind CSS
- MongoDB
- Express.js
