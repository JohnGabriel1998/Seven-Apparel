# 🚀 Seven Apparel - Complete Setup Guide

## 📋 Prerequisites

Before starting, make sure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Installation Steps

### 1. Install Root Dependencies

```powershell
npm install
```

### 2. Setup Backend (Server)

#### Install Server Dependencies
```powershell
cd server
npm install
```

#### Configure Environment Variables
```powershell
# Copy the example environment file
copy .env.example .env
```

Edit the `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/seven-apparel
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Google OAuth (Optional - Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe (Get from Stripe Dashboard)
STRIPE_SECRET_KEY=your_stripe_secret_key

# Cloudinary (Optional - For image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Configuration (Optional - For order confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Frontend URL
CLIENT_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### 3. Setup Frontend (Client)

#### Install Client Dependencies
```powershell
cd ..\client
npm install
```

#### Configure Environment Variables
```powershell
# Copy the example environment file
copy .env.example .env
```

Edit the `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```powershell
# If MongoDB is installed as a service (Windows)
net start MongoDB

# Or start manually
mongod --dbpath="C:\data\db"
```

## 🏃‍♂️ Running the Application

### Option 1: Run Both (Recommended for Development)

From the root directory:
```powershell
npm run dev
```

This will start both the backend server (port 5000) and frontend client (port 5173) concurrently.

### Option 2: Run Separately

**Terminal 1 - Backend:**
```powershell
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd client
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 🔑 Getting API Keys

### Stripe (Payment Processing)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create an account or sign in
3. Navigate to Developers → API Keys
4. Copy your Publishable Key (for frontend) and Secret Key (for backend)

### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Set authorized redirect URIs to `http://localhost:5000/api/auth/google/callback`

### Cloudinary (Image Storage - Optional)
1. Go to [Cloudinary](https://cloudinary.com/)
2. Create a free account
3. Find your Cloud Name, API Key, and API Secret in the dashboard

## 📦 Seeding the Database (Optional)

You can create a seed script to populate your database with sample data:

```powershell
cd server
node seed.js  # You'll need to create this file
```

## 🧪 Testing

### Run Backend Tests
```powershell
cd server
npm test
```

### Run Frontend Tests
```powershell
cd client
npm test
```

## 🏗️ Building for Production

### Build Frontend
```powershell
cd client
npm run build
```

The built files will be in `client/dist/`

### Run Production Server
```powershell
cd server
npm start
```

## 📱 Features Checklist

### Core Features
- ✅ User Authentication (JWT + OAuth)
- ✅ Product Catalog with Filters
- ✅ Shopping Cart
- ✅ Checkout Process
- ✅ Order Management
- ✅ Product Reviews
- ✅ Wishlist
- ✅ User Profile & Addresses
- ✅ Coupon System
- ✅ Blog/Lookbook
- ✅ Admin Dashboard (Analytics, Products, Orders, Users)

### Advanced Features
- ⏳ Style Quiz (Implement quiz logic)
- ⏳ Virtual Try-On (Integrate AR/3D library)
- ⏳ Live Chat Support (Integrate chat service)
- ⏳ Email Notifications (Configure nodemailer)
- ⏳ Dark/Light Mode Toggle
- ⏳ Multilanguage Support

## 🔧 Common Issues & Solutions

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Make sure MongoDB service is running

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change the PORT in `.env` file or kill the process using that port

### TypeScript Errors in VS Code
**Solution**: Install dependencies first with `npm install`, then restart VS Code

### CORS Errors
**Solution**: Check that `CLIENT_URL` in server `.env` matches your frontend URL

## 📚 Useful Commands

```powershell
# Install all dependencies (root, server, client)
npm run install-all

# Run development mode (both server and client)
npm run dev

# Run only backend
npm run server

# Run only frontend
npm run client

# Build frontend for production
cd client && npm run build

# Lint code
cd client && npm run lint
```

## 📖 API Documentation

Once the server is running, you can test the API endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status (Admin)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### And many more endpoints...

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check existing issues on GitHub
- Create a new issue with detailed information
- Include error messages and system info

## 🎉 You're All Set!

Your Seven Apparel e-commerce platform is now ready for development. Happy coding! 🚀
