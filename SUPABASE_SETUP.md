# Seven Apparel - Supabase Setup Guide

## Overview

This guide will help you set up Supabase for the Seven Apparel e-commerce application.

## Prerequisites

- A Supabase account (free at [supabase.com](https://supabase.com))
- Node.js 18+ installed
- Git installed

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Organization**: Select or create one
   - **Project name**: `seven-apparel` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest to your users
4. Click "Create new project" and wait for setup (2-3 minutes)

## Step 2: Get Your API Keys

1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: Your public API key
   - **service_role key**: Your secret server key (keep this safe!)

## Step 3: Configure Environment Variables

### Server (.env)

```bash
cd server
cp .env.example .env
```

Edit `.env` and add:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Client (.env)

```bash
cd client
cp .env.example .env
```

Edit `.env` and add:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 4: Run Database Migrations

### Option A: Using Supabase Dashboard (Recommended for first time)

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the sidebar
3. Run each migration file in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_storage.sql
supabase/migrations/003_functions.sql
supabase/migrations/004_seed_data.sql
```

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

## Step 5: Configure Authentication

### Enable Email/Password Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure settings:
   - Enable email confirmations (recommended for production)
   - Set site URL: `http://localhost:5173` (dev) or your production URL

### Enable Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth Client ID**
5. Configure:
   - Application type: Web application
   - Authorized JavaScript origins: `https://your-project-id.supabase.co`
   - Authorized redirect URIs: `https://your-project-id.supabase.co/auth/v1/callback`
6. Copy Client ID and Client Secret
7. In Supabase, go to **Authentication** → **Providers** → **Google**
8. Enable and paste your credentials

## Step 6: Configure Storage

The storage buckets are created automatically by the migrations, but verify:

1. Go to **Storage** in Supabase dashboard
2. You should see these buckets:
   - `products` - Product images
   - `avatars` - User profile pictures
   - `blog` - Blog post images
   - `reviews` - Review images

## Step 7: Create Admin User

### Option A: Using SQL Editor

```sql
-- First, sign up through the app or use Supabase Auth
-- Then run this to make a user an admin:

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
```

### Option B: Using the Application

1. Start the application
2. Register a new account
3. Use SQL Editor to upgrade the user to admin (as shown above)

## Step 8: Install Dependencies

```bash
# Install server dependencies
cd server
npm install @supabase/supabase-js

# Install client dependencies
cd ../client
npm install @supabase/supabase-js
```

## Step 9: Start the Application

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

## Project Structure

```
SevenApparel/
├── client/
│   ├── src/
│   │   ├── lib/
│   │   │   └── supabase.ts      # Supabase client & helpers
│   │   └── ...
│   └── .env                      # Client environment variables
├── server/
│   ├── config/
│   │   └── supabase.js          # Supabase server config
│   ├── middleware/
│   │   └── supabaseAuth.js      # Auth middleware
│   ├── controllers/
│   │   ├── supabaseProductController.js
│   │   └── supabaseOrderController.js
│   └── .env                      # Server environment variables
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        ├── 002_storage.sql
        ├── 003_functions.sql
        └── 004_seed_data.sql
```

## Database Schema

### Main Tables

| Table              | Description                        |
| ------------------ | ---------------------------------- |
| `profiles`         | User profiles (extends auth.users) |
| `user_addresses`   | Saved shipping addresses           |
| `products`         | Product catalog                    |
| `product_variants` | Size/color variants with stock     |
| `orders`           | Customer orders                    |
| `order_items`      | Items in each order                |
| `carts`            | Shopping carts                     |
| `cart_items`       | Items in carts                     |
| `reviews`          | Product reviews                    |
| `wishlists`        | User wishlists                     |
| `coupons`          | Discount coupons                   |
| `blog_posts`       | Blog content                       |

## Row Level Security (RLS)

All tables have RLS policies enabled:

- **Users** can only access their own data (orders, cart, profile)
- **Admins** can access all data
- **Products** and **Blog posts** are publicly readable
- **Reviews** require authentication to create

## Useful Supabase Features

### Real-time Subscriptions

```typescript
// Subscribe to order updates
supabase
  .channel("orders")
  .on(
    "postgres_changes",
    { event: "UPDATE", schema: "public", table: "orders" },
    (payload) => {
      console.log("Order updated:", payload);
    },
  )
  .subscribe();
```

### Storage

```typescript
// Upload product image
const { data, error } = await supabase.storage
  .from("products")
  .upload("path/to/image.jpg", file);

// Get public URL
const {
  data: { publicUrl },
} = supabase.storage.from("products").getPublicUrl("path/to/image.jpg");
```

## Troubleshooting

### "Permission denied" errors

- Check RLS policies in Supabase dashboard
- Ensure user is authenticated
- Verify JWT token is being sent

### "Invalid API key" errors

- Double-check environment variables
- Ensure no extra spaces or quotes in .env files
- Restart the server after changing .env

### Database connection issues

- Check Supabase project status (not paused)
- Verify project URL is correct
- Check network connectivity

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/JohnGabriel1998/Seven-Apparel/issues)
