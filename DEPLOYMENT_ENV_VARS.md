# 🚀 Environment Variables Setup Guide

## Architecture Overview
- **Frontend**: React + Vite → Deployed on **Vercel**
- **Backend**: Node.js + Express → Deployed on **Render**
- **Database**: MongoDB Atlas

---

## 🔵 BACKEND (Render) - Environment Variables

Add these in your **Render Dashboard** → Your Service → Environment → Environment Variables

### ✅ Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# CORS - Frontend URL (VERY IMPORTANT!)
CLIENT_URL=https://your-frontend-name.vercel.app

# JWT Authentication
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
```

### 📧 Email Service (Optional but Recommended)

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_app_specific_password
SUPPORT_EMAIL=support@sevenapparel.com
FRONTEND_URL=https://your-frontend-name.vercel.app
```

### 🖼️ Cloudinary (Image Upload)

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 🔐 Google OAuth (If using Google Login)

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 💳 Payment Processing

**Stripe:**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**PayMongo (Philippines):**
```bash
PAYMONGO_SECRET_KEY=sk_live_xxxxx
PAYMONGO_PUBLIC_KEY=pk_live_xxxxx
```

---

## 🟢 FRONTEND (Vercel) - Environment Variables

Add these in your **Vercel Dashboard** → Your Project → Settings → Environment Variables

### ✅ Required Variables

```bash
# Backend API URL (MUST start with VITE_)
# Use your Render backend URL WITHOUT /api at the end
VITE_API_URL=https://your-backend-name.onrender.com
```

**⚠️ IMPORTANT:** 
- Variable name MUST start with `VITE_` for Vite to expose it to the browser
- Use your actual Render backend URL WITHOUT `/api` (e.g., `https://seven-apparel-backend.onrender.com`)
- The code automatically appends `/api` to all requests
- Do NOT include `/api` in the URL

### ❌ What NOT to put in Vercel

**NEVER** put these in Vercel (they're backend secrets):
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_API_SECRET`
- `STRIPE_SECRET_KEY`
- `EMAIL_PASSWORD`
- Any other secret keys

Vercel environment variables are exposed to frontend code and visible in the browser!

---

## 📝 Step-by-Step Setup Instructions

### 1️⃣ Backend Setup (Render)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add each variable from the Backend section above
6. Click **Save Changes**
7. Render will automatically redeploy

### 2️⃣ Frontend Setup (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add `VITE_API_URL` with your Render backend URL
6. Select **Production**, **Preview**, and **Development** environments
7. Click **Save**
8. Redeploy your frontend

### 3️⃣ Verify Connection

**Test Backend:**
```bash
curl https://your-backend.onrender.com/api/health
```

**Test Frontend:**
- Open browser console
- Run: `console.log(import.meta.env.VITE_API_URL)`
- Should show your Render backend URL

---

## 🔍 Troubleshooting

### CORS Errors
- ✅ Check `CLIENT_URL` in Render matches your Vercel frontend URL exactly
- ✅ Ensure URL has `https://` and no trailing slash
- ✅ Redeploy backend after changing `CLIENT_URL`

### API Not Found (404)
- ✅ Check `VITE_API_URL` in Vercel matches your Render backend URL
- ✅ Ensure backend URL doesn't have `/api` at the end
- ✅ Frontend code uses: `VITE_API_URL` + `/api/endpoint`

### Environment Variables Not Working
- ✅ Vercel: Variable must start with `VITE_` for Vite
- ✅ Render: Restart service after adding variables
- ✅ Both: Redeploy after adding/changing variables

---

## 📋 Quick Checklist

### Backend (Render)
- [ ] `NODE_ENV=production`
- [ ] `MONGODB_URI` (MongoDB Atlas connection string)
- [ ] `CLIENT_URL` (your Vercel frontend URL)
- [ ] `JWT_SECRET` (strong random string)
- [ ] `JWT_EXPIRE=7d`
- [ ] `CLOUDINARY_*` (if using image uploads)
- [ ] `EMAIL_*` (if using email notifications)
- [ ] `STRIPE_SECRET_KEY` or `PAYMONGO_SECRET_KEY` (if using payments)

### Frontend (Vercel)
- [ ] `VITE_API_URL` (your Render backend URL)

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use different secrets** for production vs development
3. **Rotate secrets** periodically
4. **Use strong JWT_SECRET** (minimum 32 characters)
5. **Keep backend secrets** only in Render, never in Vercel
6. **Use environment-specific variables** (production vs preview)

---

## 📞 Need Help?

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Your Project → Deployments → View Function Logs
3. Verify all URLs match exactly (including https://)
4. Ensure services are deployed and running

