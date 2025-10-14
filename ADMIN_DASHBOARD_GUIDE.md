# Seven Apparel - Admin Dashboard Guide

## 🎯 Overview

The admin dashboard is now fully functional with **REAL DATA** from MongoDB, not dummy/placeholder values.

## ✅ What's Implemented

### 1. **Real-Time Analytics Backend** (`server/controllers/analyticsController.js`)

- **Total Revenue**: Aggregated from all `delivered` orders
- **Total Orders**: Complete order count from database
- **Total Products**: Active product count
- **Total Users**: Customer count (excluding admins)
- **Recent Orders**: Last 10 orders with customer details
- **Low Stock Alerts**: Products with stock < 10 units

### 2. **Sales Analytics**

- Sales by day (7, 30, 90, or 365 days)
- Sales by category aggregation
- Top 10 selling products

### 3. **Revenue Statistics**

- Today's revenue
- This month's revenue
- This year's revenue

## 🚀 Getting Started

### Step 1: Start MongoDB

```powershell
net start MongoDB
```

### Step 2: Fix Port Conflicts (if needed)

```powershell
# Check what's using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID_NUMBER> /F
```

### Step 3: Seed Sample Data

```powershell
cd server
node seedData.js
```

This will add:

- 6 sample products (men's shirts, jeans, women's dresses, kids' tees, accessories)
- Various stock levels (some below 10 for low stock alerts)
- Multiple variants (colors/sizes)

### Step 4: Start Backend Server

```powershell
cd server
npm run dev
```

Should see:

```
🚀 Server running on port 5000
✅ MongoDB Connected
```

### Step 5: Start Frontend (if not running)

```powershell
cd client
npm run dev
```

## 🔐 Admin Login

**URL**: http://localhost:5173/admin

**Credentials**:

- Email: `admin@sevenapparel.com`
- Password: `Admin123!`

## 📊 Dashboard Features

### Statistics Cards

- **Total Revenue**: Sum of all delivered orders
- **Total Orders**: All orders in database
- **Total Products**: Active products count
- **Total Users**: Customer accounts (non-admin)

### Recent Orders Table

Shows last 10 orders with:

- Order ID
- Customer name and email
- Total amount
- Payment status
- Order status
- Date

### Low Stock Alerts

Products with less than 10 units in stock:

- Product name
- Current stock level
- Quick action buttons

## 🛠️ API Endpoints

All endpoints require admin authentication (JWT token with role: 'admin')

### Dashboard

```
GET /api/analytics/dashboard
```

Returns:

```json
{
  "totalRevenue": 5432.50,
  "totalOrders": 45,
  "totalProducts": 6,
  "totalUsers": 12,
  "recentOrders": [...],
  "lowStockProducts": [...]
}
```

### Sales Analytics

```
GET /api/analytics/sales?days=30
```

Returns sales by day, category, and top products

### Revenue Stats

```
GET /api/analytics/revenue
```

Returns today, month, and year revenue

## 🧪 Testing Real Data Flow

### 1. Add More Products

- Login to admin panel
- Go to Products → Add Product
- Fill in details and submit

### 2. Create Test Orders (Manual)

Since checkout isn't implemented yet, you can create orders via MongoDB:

```javascript
// In MongoDB Compass or mongosh
use seven-apparel

db.orders.insertOne({
  user: ObjectId("USER_ID_HERE"),
  items: [
    {
      product: ObjectId("PRODUCT_ID_HERE"),
      quantity: 2,
      price: 29.99,
      color: "Black",
      size: "M"
    }
  ],
  totalAmount: 59.98,
  status: "delivered",
  paymentStatus: "paid",
  shippingAddress: {
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 3. Verify Dashboard Updates

- Refresh admin dashboard
- Numbers should reflect real data
- Recent orders should show
- Low stock alerts should appear

## 🔍 Troubleshooting

### Dashboard Shows Zeros

1. **Check backend is running**: http://localhost:5000/api/health
2. **Check MongoDB is running**: `net start MongoDB`
3. **Check database has data**: Run `node seedData.js`
4. **Check browser console**: Look for API errors
5. **Check Network tab**: Verify `/api/analytics/dashboard` returns data

### Authentication Issues

1. **Login again** with admin credentials
2. **Check localStorage**: Should have `token` with JWT
3. **Check backend logs**: Look for auth errors

### Missing Data

1. **Run seed script**: `node seedData.js`
2. **Check MongoDB connection string**: In `.env` file
3. **Verify database name**: Should be `seven-apparel`

## 📁 Key Files

### Backend

- `server/controllers/analyticsController.js` - Analytics logic
- `server/routes/analytics.js` - API endpoints
- `server/middleware/auth.js` - JWT authentication
- `server/seedData.js` - Sample data generator

### Frontend

- `client/src/pages/admin/AdminDashboard.tsx` - Dashboard UI
- `client/src/pages/admin/AdminProducts.tsx` - Products management
- `client/src/api/api.ts` - API client with auth
- `client/src/stores/authStore.ts` - Auth state management

## 🎨 Customization

### Change Stock Alert Threshold

In `analyticsController.js`:

```javascript
// Find products with low stock (change < 10 to your threshold)
const lowStockProducts = await Product.find({ totalStock: { $lt: 10 } });
```

### Add New Dashboard Stats

1. Add aggregation in `analyticsController.js`
2. Return in `getDashboard` response
3. Update `AdminDashboard.tsx` to display

### Modify Recent Orders Count

In `analyticsController.js`:

```javascript
// Change .limit(10) to show more/fewer orders
.limit(10)
```

## 🚦 Next Steps

1. ✅ **Complete**: Real analytics backend
2. ✅ **Complete**: Admin dashboard with real data
3. ⏳ **Pending**: Checkout page for creating orders
4. ⏳ **Pending**: Order management page for admins
5. ⏳ **Pending**: User management panel
6. ⏳ **Pending**: Email notifications
7. ⏳ **Pending**: Product reviews system

## 💡 Tips

- **Low Stock**: Add products with stock < 10 to test alerts
- **Revenue**: Create orders with status "delivered" to see revenue
- **Testing**: Use MongoDB Compass to manually add/edit data
- **Development**: Backend has nodemon for auto-restart on changes

## 📞 Support

Check these if issues occur:

1. Backend terminal for errors
2. Frontend terminal for build errors
3. Browser DevTools Console
4. Browser DevTools Network tab
5. MongoDB logs

---

**Last Updated**: Dashboard now shows real data from MongoDB aggregations ✅
