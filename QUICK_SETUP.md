# ⚡ Quick Setup Reference

## 🎯 Copy-Paste Environment Variables

### Render (Backend) - Add These Variables

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seven-apparel
CLIENT_URL=https://your-frontend-name.vercel.app
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
```

### Vercel (Frontend) - Add This Variable

```bash
VITE_API_URL=https://your-backend-name.onrender.com
```

**⚠️ Remember:** 
- Replace `your-backend-name` with your actual Render service name
- Replace `your-frontend-name` with your actual Vercel project name
- Do NOT include `/api` in `VITE_API_URL`

---

## 🔄 Deployment Flow

1. **Deploy Backend First** (Render)
   - Get backend URL: `https://your-backend.onrender.com`
   - Test: `https://your-backend.onrender.com/api/health`

2. **Deploy Frontend** (Vercel)
   - Set `VITE_API_URL` to your backend URL
   - Get frontend URL: `https://your-frontend.vercel.app`

3. **Update Backend CORS**
   - Set `CLIENT_URL` in Render to your Vercel frontend URL
   - Backend will auto-redeploy

4. **Test Everything**
   - Open frontend URL
   - Check browser console for errors
   - Try logging in or browsing products

---

## ✅ Quick Test Commands

**Test Backend:**
```bash
curl https://your-backend.onrender.com/api/health
```

**Test Frontend API Connection:**
1. Open frontend in browser
2. Open console (F12)
3. Run: `console.log(import.meta.env.VITE_API_URL)`
4. Should show your backend URL

---

## 📍 Where to Add Variables

### Render
1. Dashboard → Your Service → Environment
2. Click "Add Environment Variable"
3. Add each variable
4. Click "Save Changes"

### Vercel
1. Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Add `VITE_API_URL`
4. Select all environments (Production, Preview, Development)
5. Click "Save"
6. Redeploy

---

## 🐛 Common Issues

**CORS Error?**
- ✅ `CLIENT_URL` in Render = Your Vercel frontend URL
- ✅ No trailing slash
- ✅ Use `https://` not `http://`

**API Not Found?**
- ✅ `VITE_API_URL` = Backend URL without `/api`
- ✅ Backend is running (check Render logs)
- ✅ Test `/api/health` endpoint

**Environment Variables Not Working?**
- ✅ Vercel: Must start with `VITE_`
- ✅ Both: Redeploy after adding variables
- ✅ Check spelling and values

---

## 📚 Full Documentation

- **Complete Guide**: See `DEPLOYMENT_GUIDE.md`
- **Environment Variables**: See `DEPLOYMENT_ENV_VARS.md`

