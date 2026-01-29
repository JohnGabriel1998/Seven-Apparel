# Seven Apparel - Supabase Integration Guide

## Overview

This guide explains how to run Seven Apparel with Supabase instead of MongoDB.

## Prerequisites

- Node.js 18+
- Supabase project (already configured)
- Supabase URL and keys

## Environment Variables

### Server (.env)

```env
NODE_ENV=development
PORT=5000

# Supabase Configuration
SUPABASE_URL=https://oxxcbhfctgqfxwtesupo.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Get from Supabase Dashboard > Settings > API

# Other settings
CLIENT_URL=http://localhost:5173
```

### Client (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://oxxcbhfctgqfxwtesupo.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Getting the Service Role Key

1. Go to your Supabase Dashboard
2. Click on **Settings** (gear icon)
3. Click on **API**
4. Under "Project API keys", copy the **service_role** key (keep this secret!)
5. Add it to your `server/.env` as `SUPABASE_SERVICE_ROLE_KEY`

## Running the Application

### Server with Supabase

```bash
cd server

# Development mode
npm run dev:supabase

# Production mode
npm run start:supabase
```

### Client (same as before)

```bash
cd client
npm run dev
```

## File Structure

### New Supabase Files

```
server/
├── config/
│   └── supabase.js              # Supabase client configuration
├── middleware/
│   └── supabaseAuth.js          # Auth middleware for Supabase
├── routes/
│   ├── supabaseAuth.js          # Authentication routes
│   ├── supabaseProducts.js      # Product routes
│   ├── supabaseOrders.js        # Order routes
│   ├── supabaseCart.js          # Cart routes
│   ├── supabaseWishlist.js      # Wishlist routes
│   ├── supabaseReviews.js       # Review routes
│   ├── supabaseCoupons.js       # Coupon routes
│   ├── supabaseUsers.js         # User management routes
│   ├── supabaseBlog.js          # Blog routes
│   └── supabaseAnalytics.js     # Analytics routes
└── server.supabase.js           # Main server file for Supabase

client/
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client & helpers
│   └── store/
│       └── useSupabaseAuthStore.ts  # Auth store for Supabase
```

## API Endpoints

All endpoints work the same as the MongoDB version:

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/update-password` - Update password
- `PUT /api/auth/profile` - Update profile

### Products

- `GET /api/products` - List products (with filters)
- `GET /api/products/featured` - Featured products
- `GET /api/products/:id` - Single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders

- `GET /api/orders` - User's orders
- `GET /api/orders/admin/all` - All orders (admin)
- `GET /api/orders/:id` - Single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/status` - Update status (admin)
- `PUT /api/orders/:id/cancel` - Cancel order

### Cart

- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update quantity
- `DELETE /api/cart/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Wishlist

- `GET /api/wishlist` - Get wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:productId` - Remove from wishlist

### Reviews

- `GET /api/reviews/product/:productId` - Product reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Coupons

- `POST /api/coupons/validate` - Validate coupon
- `GET /api/coupons` - List coupons (admin)
- `POST /api/coupons` - Create coupon (admin)
- `PUT /api/coupons/:id` - Update coupon (admin)
- `DELETE /api/coupons/:id` - Delete coupon (admin)

### Users (Admin)

- `GET /api/users` - List users
- `GET /api/users/:id` - Single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Analytics (Admin)

- `GET /api/analytics/summary` - Dashboard summary
- `GET /api/analytics/sales-chart` - Sales chart data
- `GET /api/analytics/top-products` - Top selling products
- `GET /api/analytics/low-stock` - Low stock products
- `GET /api/analytics/recent-orders` - Recent orders

### Blog

- `GET /api/blog` - Published posts
- `GET /api/blog/:slug` - Single post
- `POST /api/blog` - Create post (admin)
- `PUT /api/blog/:id` - Update post (admin)
- `DELETE /api/blog/:id` - Delete post (admin)

## Authentication Flow

### With Supabase Auth

1. User registers/logs in via Supabase Auth
2. Supabase returns session with access token
3. Client includes token in requests via `Authorization: Bearer <token>`
4. Server middleware validates token with Supabase
5. Profile data is fetched from `profiles` table

### Creating Admin Users

Use the Supabase SQL Editor to promote a user to admin:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

## Database Schema

### Main Tables

- `profiles` - User profiles (linked to Supabase Auth)
- `products` - Product catalog
- `product_variants` - Size/color variants
- `orders` - Order records
- `order_items` - Order line items
- `cart_items` - Shopping cart
- `wishlists` - User wishlists
- `reviews` - Product reviews
- `coupons` - Discount coupons
- `blog_posts` - Blog content

### Storage Buckets

- `products` - Product images
- `avatars` - User profile pictures
- `blog` - Blog post images
- `reviews` - Review images

## Switching Between MongoDB and Supabase

### To use MongoDB (original):

```bash
cd server
npm run dev  # Uses server.js with MongoDB
```

### To use Supabase:

```bash
cd server
npm run dev:supabase  # Uses server.supabase.js with Supabase
```

## Troubleshooting

### "Invalid JWT" errors

- Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Ensure the token is being sent in the Authorization header

### "Row Level Security" errors

- The service role key bypasses RLS - make sure it's configured
- Check that RLS policies are correctly set up

### Profile not created after registration

- The `handle_new_user()` trigger should create profiles automatically
- Check the trigger in Supabase Dashboard > Database > Triggers

### Cart/Orders not saving

- Verify user is authenticated
- Check browser Network tab for error responses

## Production Deployment

1. Set environment variables on your hosting platform
2. Use `npm run start:supabase` for production
3. Ensure CORS origins are configured for your domain
4. Keep `SUPABASE_SERVICE_ROLE_KEY` secret (never expose to client)

## Support

If you encounter issues, check:

1. Supabase Dashboard > Logs for database errors
2. Server console for API errors
3. Browser DevTools > Network for request/response details
