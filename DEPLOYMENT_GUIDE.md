# 🚀 Complete Deployment Guide - Seven Apparel

## Overview
This guide will help you deploy your MERN stack application:
- **Frontend** (React + Vite) → **Vercel**
- **Backend** (Node.js + Express) → **Render**
- **Database** → **MongoDB Atlas**

---

## 📋 Prerequisites

1. ✅ GitHub repository with your code
2. ✅ MongoDB Atlas account and cluster
3. ✅ Render account (free tier available)
4. ✅ Vercel account (free tier available)
5. ✅ Cloudinary account (for image uploads - optional)
6. ✅ Email service credentials (Gmail, SendGrid, etc. - optional)

---

## 🔵 Part 1: Backend Deployment (Render)

### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier: M0)
3. Click **Connect** → **Connect your application**
4. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `seven-apparel` (or your preferred database name)

### Step 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Select the repository: `SevenApparel`
5. Configure the service:
   - **Name**: `seven-apparel-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your production branch)
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node` (version 18+)

6. Click **Advanced** and add Environment Variables:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seven-apparel
CLIENT_URL=https://your-frontend-name.vercel.app
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
```

**Optional but Recommended:**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASSWORD=your_app_specific_password
SUPPORT_EMAIL=support@sevenapparel.com
FRONTEND_URL=https://your-frontend-name.vercel.app

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

7. Click **Create Web Service**
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL (e.g., `https://seven-apparel-backend.onrender.com`)

### Step 3: Test Backend

1. Open your backend URL in browser: `https://your-backend.onrender.com/api/health`
2. You should see: `{"status":"OK","message":"Server is running"}`

---

## 🟢 Part 2: Frontend Deployment (Vercel)

### Step 1: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository: `SevenApparel`
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click **Environment Variables** and add:

```bash
VITE_API_URL=https://your-backend-name.onrender.com
```

**⚠️ IMPORTANT:** 
- Replace `your-backend-name.onrender.com` with your actual Render backend URL
- Do NOT include `/api` at the end
- The URL should be: `https://seven-apparel-backend.onrender.com`

6. Click **Deploy**
7. Wait for deployment (2-5 minutes)
8. Copy your frontend URL (e.g., `https://seven-apparel.vercel.app`)

### Step 2: Update Backend CORS

1. Go back to **Render Dashboard**
2. Select your backend service
3. Go to **Environment** tab
4. Update `CLIENT_URL` to match your Vercel frontend URL:

```bash
CLIENT_URL=https://your-frontend-name.vercel.app
```

5. Click **Save Changes**
6. Render will automatically redeploy

### Step 3: Test Frontend

1. Open your Vercel frontend URL
2. Open browser console (F12)
3. Run: `console.log(import.meta.env.VITE_API_URL)`
4. Should show your Render backend URL
5. Try logging in or browsing products to test API connection

---

## ✅ Part 3: Verification Checklist

### Backend (Render)
- [ ] Backend URL accessible: `https://your-backend.onrender.com/api/health`
- [ ] MongoDB connected (check Render logs)
- [ ] CORS configured correctly
- [ ] Environment variables set

### Frontend (Vercel)
- [ ] Frontend URL accessible
- [ ] `VITE_API_URL` environment variable set
- [ ] Can make API calls (check browser Network tab)
- [ ] No CORS errors in console

### Integration
- [ ] Frontend can call backend API
- [ ] Authentication works
- [ ] Images load correctly (if using Cloudinary)
- [ ] Email notifications work (if configured)

---

## 🔧 Troubleshooting

### Backend Issues

**Problem: Backend won't start**
- ✅ Check Render logs: Dashboard → Your Service → Logs
- ✅ Verify `MONGODB_URI` is correct
- ✅ Ensure `PORT` is set (Render uses 10000)
- ✅ Check `NODE_ENV=production`

**Problem: CORS errors**
- ✅ Verify `CLIENT_URL` matches your Vercel URL exactly
- ✅ Ensure URL has `https://` (not `http://`)
- ✅ No trailing slash in URL
- ✅ Redeploy backend after changing `CLIENT_URL`

**Problem: Database connection fails**
- ✅ Check MongoDB Atlas IP whitelist (add `0.0.0.0/0` for Render)
- ✅ Verify password in `MONGODB_URI` is correct
- ✅ Check MongoDB cluster is running

### Frontend Issues

**Problem: API calls fail**
- ✅ Check `VITE_API_URL` in Vercel matches backend URL
- ✅ Verify backend URL doesn't have `/api` at the end
- ✅ Check browser console for errors
- ✅ Verify backend is running (test `/api/health`)

**Problem: Environment variables not working**
- ✅ Variable name MUST start with `VITE_`
- ✅ Redeploy frontend after adding variables
- ✅ Check Vercel deployment logs

**Problem: Build fails**
- ✅ Check Vercel build logs
- ✅ Verify `package.json` scripts are correct
- ✅ Ensure all dependencies are in `package.json`

---

## 🔄 Updating Your Deployment

### Backend Updates
1. Push changes to GitHub
2. Render automatically redeploys
3. Check Render logs for errors

### Frontend Updates
1. Push changes to GitHub
2. Vercel automatically redeploys
3. Check Vercel deployment status

### Environment Variable Updates
1. **Render**: Dashboard → Environment → Edit → Save (auto-redeploys)
2. **Vercel**: Settings → Environment Variables → Edit → Redeploy

---

## 📊 Monitoring

### Render Monitoring
- View logs: Dashboard → Your Service → Logs
- Check metrics: Dashboard → Your Service → Metrics
- Set up alerts: Dashboard → Your Service → Alerts

### Vercel Monitoring
- View logs: Dashboard → Your Project → Deployments → View Function Logs
- Check analytics: Dashboard → Your Project → Analytics
- Monitor performance: Dashboard → Your Project → Speed Insights

---

## 🔐 Security Checklist

- [ ] Strong `JWT_SECRET` (32+ characters, random)
- [ ] MongoDB password is strong
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in frontend code
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] Environment variables only in platform dashboards

---

## 📝 Quick Reference

### Backend URL Format
```
https://your-service-name.onrender.com
```

### Frontend URL Format
```
https://your-project-name.vercel.app
```

### API Endpoint Format
```
Frontend calls: VITE_API_URL + /api/endpoint
Example: https://backend.onrender.com/api/products
```

### Environment Variables Summary

**Render (Backend):**
- `MONGODB_URI`
- `CLIENT_URL`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `CLOUDINARY_*` (optional)
- `EMAIL_*` (optional)
- `STRIPE_SECRET_KEY` (optional)

**Vercel (Frontend):**
- `VITE_API_URL`

---

## 🎉 You're Done!

Your application should now be live:
- **Frontend**: `https://your-project.vercel.app`
- **Backend**: `https://your-service.onrender.com`

Share your frontend URL with users and start selling! 🚀

---

## 📞 Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- Check logs in both platforms for detailed error messages

