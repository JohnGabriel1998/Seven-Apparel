# Seven Apparel - Premium E-commerce Platform

A modern, responsive e-commerce platform built with React, TypeScript, and Node.js featuring premium glassmorphism design and advanced animations.

## 🌟 Features

- **Premium Design**: Modern glassmorphism UI with advanced animations
- **Full E-commerce**: Complete shopping cart, checkout, and order management
- **Admin Dashboard**: Comprehensive admin panel for product and order management
- **User Authentication**: Secure login/register system with role-based access
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Payment Integration**: Secure payment processing
- **Image Upload**: Cloudinary integration for product images
- **Analytics**: Built-in analytics and reporting
- **Multi-region Support**: Philippine regions and zip codes

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Router** for navigation
- **Heroicons** for icons

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Cloudinary** for image storage
- **Passport.js** for authentication strategies

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Cloudinary account (for image uploads)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JohnGabriel1998/Seven-Apparel.git
   cd Seven-Apparel
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create `.env` files in both `server` and `client` directories:
   
   **server/.env**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/seven-apparel
   JWT_SECRET=your-jwt-secret
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret
   ```
   
   **client/.env**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the application**
   ```bash
   # Start the server (from server directory)
   npm run dev
   
   # Start the client (from client directory)
   npm run dev
   ```

## 🎨 Design Features

- **Glassmorphism Effects**: Modern translucent design elements
- **Advanced Animations**: Smooth transitions and micro-interactions
- **Premium Typography**: Gradient text effects and modern fonts
- **Responsive Layout**: Mobile-first design approach
- **Dark Mode Support**: Built-in dark/light theme switching

## 📱 Pages & Features

### Customer Pages
- **Home**: Hero carousel with featured products
- **Products**: Product listing with filters and search
- **Product Detail**: Detailed product view with image gallery
- **Cart**: Shopping cart with quantity management
- **Checkout**: Secure checkout process
- **Profile**: User account management
- **Orders**: Order history and tracking
- **Wishlist**: Save favorite products

### Admin Pages
- **Dashboard**: Analytics and overview
- **Products**: Add, edit, and manage products
- **Orders**: Order management and fulfillment
- **Users**: User account management
- **Analytics**: Sales and performance metrics
- **Settings**: System configuration

## 🔧 Available Scripts

### Server
```bash
npm run dev          # Start development server
npm start           # Start production server
npm run seed        # Seed database with sample data
```

### Client
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## 🌐 Deployment

The project is configured for GitHub Pages deployment with GitHub Actions. The workflow automatically builds and deploys the React frontend when changes are pushed to the main branch.

### Manual Deployment
1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder to your hosting service

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📞 Support

For support or questions, please open an issue in the GitHub repository.

---

**Seven Apparel** - Redefining fashion with modern designs, premium quality, and sustainable practices. Dress confidently, live authentically. ✨