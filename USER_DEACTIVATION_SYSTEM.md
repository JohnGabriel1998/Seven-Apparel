# 🔒 User Account Deactivation System

## Overview

This system prevents deactivated or deleted users from accessing the Seven Apparel shopping site or making any transactions. When an admin deactivates a user account, the system automatically blocks all user activities across the platform.

---

## 🎯 What Gets Blocked

When a user account is deactivated (`isActive: false`), the following actions are **completely blocked**:

### 1. **Login Access** ❌

- User cannot log into their account
- Login page shows: _"Your account has been deactivated. Please contact support for assistance."_
- Error persists for 5 seconds to ensure user reads the message

### 2. **Shopping & Browsing** ❌

- Cannot view products (protected routes require authentication)
- Cannot add items to cart
- Cannot view cart or checkout
- Cannot search or filter products

### 3. **Transactions & Orders** ❌

- Cannot place new orders
- Cannot make purchases
- Cannot process payments
- Cannot view order history

### 4. **Account Management** ❌

- Cannot update profile information
- Cannot manage addresses
- Cannot view wishlist
- Cannot leave reviews

### 5. **Any Protected API Calls** ❌

- All API requests requiring authentication are blocked
- User is automatically logged out if account is deactivated while logged in

---

## 🏗️ System Architecture

### Backend Protection (Server-Side)

#### **1. Login Controller Check**

**File:** `server/controllers/authController.js`

```javascript
// Check if user account is active
if (user.isActive === false) {
  return res.status(403).json({
    success: false,
    message:
      "Your account has been deactivated. Please contact support for assistance.",
  });
}
```

**When:** During login attempt (after password verification)
**Status Code:** 403 Forbidden
**Result:** User cannot obtain authentication token

#### **2. Protect Middleware Check**

**File:** `server/middleware/auth.js`

```javascript
// Check if user account is active
if (req.user.isActive === false) {
  return res.status(403).json({
    success: false,
    message:
      "Your account has been deactivated. Please contact support for assistance.",
  });
}
```

**When:** Every protected API request
**Status Code:** 403 Forbidden
**Result:** Request is rejected, user is logged out on frontend

### Frontend Protection (Client-Side)

#### **3. Auth Store Error Handling**

**File:** `client/src/store/useAuthStore.ts`

```typescript
// Login error handling with longer duration for deactivated accounts
if (error.response?.status === 403) {
  toast.error(errorMessage, { duration: 5000 });
}

// CheckAuth - automatic logout on deactivated account
if (error.response?.status === 403) {
  toast.error(error.response?.data?.message, { duration: 6000 });
  localStorage.removeItem("token");
  localStorage.removeItem("cart-storage");
}
```

**When:** Login attempt or automatic auth check
**Result:** Clear error message shown, user logged out, cart cleared

#### **4. User Type Definition**

**File:** `client/src/types/index.ts`

```typescript
export interface User {
  id: string;
  isActive?: boolean; // Track account status
  // ... other fields
}
```

---

## 🔐 Security Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ATTEMPTS ACTION                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Is User Logged In?  │
         └───────┬───────────────┘
                 │
        ┌────────┴────────┐
        │ NO              │ YES
        │                 │
        ▼                 ▼
┌──────────────┐   ┌────────────────────┐
│ Redirect to  │   │ API Request with   │
│ Login Page   │   │ Auth Token         │
└──────────────┘   └─────────┬──────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │ Server: Verify JWT Token   │
                └────────────┬───────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │ Load User from Database    │
                └────────────┬───────────────┘
                             │
                             ▼
                ┌────────────────────────────┐
                │ Check: user.isActive?      │
                └─────┬──────────────────────┘
                      │
              ┌───────┴────────┐
              │ TRUE           │ FALSE
              │                │
              ▼                ▼
    ┌─────────────────┐   ┌──────────────────────┐
    │ ✅ ALLOW         │   │ ❌ REJECT (403)      │
    │ Process Request │   │ Return Error         │
    └─────────────────┘   └──────────┬───────────┘
                                     │
                                     ▼
                        ┌────────────────────────┐
                        │ Frontend: Show Error   │
                        │ "Account Deactivated"  │
                        │ Logout User            │
                        │ Clear Cart & Token     │
                        └────────────────────────┘
```

---

## 👨‍💼 Admin Usage Guide

### How to Deactivate a User

1. **Navigate to Admin Panel**

   - Go to `/admin/users`

2. **Find the User**

   - Search or browse user list
   - Click "View Details" on the target user

3. **Deactivate Account**

   - In user details sidebar, find "User Role" section
   - Click **"Deactivate User"** button (red button)
   - User status changes to "Inactive"

4. **Immediate Effect**
   - User is instantly blocked from all activities
   - If currently logged in, next API request will log them out
   - Cannot log back in until reactivated

### How to Reactivate a User

1. **Navigate to Deactivated User**

   - Go to `/admin/users`
   - Find user with "Inactive" status badge (red badge)

2. **Activate Account**

   - Click "View Details"
   - Click **"Activate User"** button (green button)
   - User status changes to "Active"

3. **User Can Access Again**
   - User can now log in
   - All features restored immediately

### Visual Indicators

```
┌────────────────────────────────────────────────────┐
│ USER LIST                                          │
├────────────────────────────────────────────────────┤
│ Name      Email              Status    Actions    │
│ John Doe  john@email.com     🟢 Active  View      │
│ Jane Doe  jane@email.com     🔴 Inactive View     │
└────────────────────────────────────────────────────┘

USER DETAILS SIDEBAR:
┌──────────────────────────┐
│ User Details             │
├──────────────────────────┤
│ Name: John Doe           │
│ Email: john@email.com    │
│ Status: 🔴 Inactive      │
│                          │
│ User Role                │
│ [User ▼]                 │
│                          │
│ [🟢 Activate User]       │  ← Click to activate
│ [View Orders]            │
│ [Delete User]            │
└──────────────────────────┘
```

---

## 🧪 Testing Guide

### Test 1: Login Restriction

**Setup:**

1. Create test user account
2. Admin deactivates the account

**Test:**

1. Go to login page
2. Enter correct credentials
3. Click "Sign In"

**Expected Result:**

- ❌ Login fails
- Error message: "Your account has been deactivated. Please contact support for assistance."
- User stays on login page
- No authentication token issued

**Verify:**

```bash
# Check browser console - no token
localStorage.getItem('token') // Should be null
```

---

### Test 2: Active Session Termination

**Setup:**

1. User is logged in and browsing
2. Admin deactivates user's account while logged in

**Test:**

1. User tries to add item to cart
2. Or user navigates to any protected page
3. Or user tries to view profile

**Expected Result:**

- ❌ Request blocked
- Error toast: "Your account has been deactivated..."
- User automatically logged out
- Redirected to login page
- Cart cleared from storage

**Verify:**

```bash
# Check browser storage
localStorage.getItem('token') // null
localStorage.getItem('cart-storage') // null
```

---

### Test 3: Protected Routes Access

**Setup:**

1. Deactivated user account exists

**Test Blocked Routes:**

```
❌ /products (if requires auth)
❌ /cart
❌ /checkout
❌ /profile
❌ /orders
❌ /wishlist
```

**Expected Result:**

- All API calls return 403 Forbidden
- User logged out automatically
- Redirected to login

---

### Test 4: Reactivation

**Setup:**

1. Deactivated user account

**Test:**

1. Admin activates account
2. User attempts login with correct credentials

**Expected Result:**

- ✅ Login successful
- User can access all features
- Can browse products
- Can add to cart
- Can make purchases

---

### Test 5: API Request Flow

**Setup:**

1. Use Postman or curl to test API directly

**Test Deactivated User:**

```bash
# Login attempt
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"deactivated@test.com","password":"password"}'

# Expected Response:
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support for assistance."
}
# Status: 403 Forbidden
```

**Test Protected Route with Deactivated Token:**

```bash
# Get profile (assuming user was deactivated after login)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token_of_deactivated_user>"

# Expected Response:
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support for assistance."
}
# Status: 403 Forbidden
```

---

## 📊 Database Schema

### User Model

**File:** `server/models/User.js`

```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$hashed...",
  role: "user",
  isActive: true,  // ← KEY FIELD for deactivation
  createdAt: ISODate("2025-01-15"),
  updatedAt: ISODate("2025-01-15")
}
```

### Check User Status in MongoDB

```javascript
// Find deactivated users
db.users.find({ isActive: false });

// Deactivate user manually
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isActive: false } }
);

// Reactivate user manually
db.users.updateOne({ email: "user@example.com" }, { $set: { isActive: true } });

// Count active vs inactive
db.users.aggregate([{ $group: { _id: "$isActive", count: { $sum: 1 } } }]);
```

---

## 🔍 API Endpoints Reference

### Admin Routes (Require Admin Role)

#### Update User Status

```
PUT /api/users/admin/:id/status
Authorization: Bearer <admin_token>
Body: { "isActive": false }

Response 200:
{
  "_id": "user_id",
  "isActive": false,
  "name": "John Doe",
  "email": "john@example.com"
  // ... other fields (no password)
}
```

### Authentication Routes

#### Login (Public)

```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }

Success Response 200:
{
  "success": true,
  "token": "jwt_token...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}

Deactivated Response 403:
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support for assistance."
}
```

#### Get Current User (Protected)

```
GET /api/auth/me
Authorization: Bearer <token>

Success Response 200:
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true
  }
}

Deactivated Response 403:
{
  "success": false,
  "message": "Your account has been deactivated. Please contact support for assistance."
}
```

---

## 🎨 User Experience

### Error Messages

#### Login Page

```
┌─────────────────────────────────────────┐
│           Sign In                       │
├─────────────────────────────────────────┤
│                                         │
│  Email: [john@example.com          ]   │
│  Password: [••••••••••••]              │
│                                         │
│  [  Sign In  ]                         │
│                                         │
│  ⚠️ Your account has been deactivated. │
│     Please contact support for         │
│     assistance.                         │
│                                         │
└─────────────────────────────────────────┘
```

#### Active Session (Toast Notification)

```
┌──────────────────────────────────────────┐
│  ⚠️ Your account has been deactivated.  │
│     Please contact support for          │
│     assistance.                          │
└──────────────────────────────────────────┘
(Appears for 6 seconds, then user logged out)
```

---

## 📝 Code Changes Summary

### Backend Changes

1. **`server/controllers/authController.js`**

   - Added `isActive` check in login function
   - Returns 403 status with clear message

2. **`server/middleware/auth.js`**
   - Added `isActive` check in protect middleware
   - Validates on every protected request

### Frontend Changes

1. **`client/src/types/index.ts`**

   - Added `isActive?: boolean` to User interface

2. **`client/src/store/useAuthStore.ts`**
   - Enhanced login error handling (5s duration for 403)
   - Enhanced checkAuth error handling (6s duration for 403)
   - Auto-logout and cart clearing on 403 errors

---

## 🚨 Important Notes

### For Developers

1. **Always use the protect middleware** on any route that should be restricted
2. **Don't skip the isActive check** - it's in two places for redundancy
3. **Test deactivation** before deploying to production
4. **Log deactivation events** (consider adding to audit log)

### For Admins

1. **Be careful** - deactivation is immediate and blocks everything
2. **Communicate with users** before deactivating (if appropriate)
3. **Document reason** for deactivation (add note in admin panel)
4. **Easy to undo** - just click "Activate User" button

### Security Considerations

1. **Deactivated ≠ Deleted** - User data remains in database
2. **Tokens invalidated** - Old tokens won't work after deactivation
3. **Cart cleared** - Security measure to prevent data leaks
4. **Orders preserved** - Past orders remain viewable by admin

---

## 🔧 Troubleshooting

### Issue: User Still Can Access After Deactivation

**Possible Causes:**

1. Frontend cached old auth state
2. Browser has old token

**Solution:**

```javascript
// Force logout on frontend
localStorage.removeItem("token");
localStorage.removeItem("cart-storage");
localStorage.removeItem("auth-storage");
location.reload();
```

### Issue: User Can't Login After Reactivation

**Possible Causes:**

1. Database not updated
2. Cache issue

**Solution:**

```javascript
// Check database
db.users.findOne({ email: "user@example.com" });
// Verify isActive: true

// If false, update:
db.users.updateOne({ email: "user@example.com" }, { $set: { isActive: true } });
```

### Issue: Error Not Showing on Frontend

**Possible Causes:**

1. Toast notification dismissed too quickly
2. Error message not propagating

**Solution:**

- Check browser console for API response
- Verify error.response.status === 403
- Check if toast library is working

---

## ✅ Implementation Checklist

- [✅] Backend: Login controller checks isActive
- [✅] Backend: Protect middleware checks isActive
- [✅] Backend: Returns 403 status code
- [✅] Backend: Clear error messages
- [✅] Frontend: User type includes isActive
- [✅] Frontend: Login handles 403 errors
- [✅] Frontend: checkAuth handles 403 errors
- [✅] Frontend: Automatic logout on deactivation
- [✅] Frontend: Cart clearing on deactivation
- [✅] Admin: Activate/Deactivate button works
- [✅] Admin: Visual indicators (Active/Inactive badges)
- [✅] Documentation: Complete guide created

---

## 📞 Support Contact

If you need to restore a deactivated account or have questions:

**For Users:**

- Email: support@sevenapparel.com
- Phone: (555) 123-4567
- Live Chat: Available on website

**For Admins:**

- Internal documentation: `/admin/help`
- Developer contact: dev@sevenapparel.com

---

## 📚 Related Documentation

- [Admin Panel Guide](./ADMIN_PANEL_GUIDE.md)
- [User Management](./ORDERS_USERS_COMPLETE.md)
- [Authentication System](./server/controllers/authController.js)
- [Cart Security](./CART_FIX_SUMMARY.md)

---

**Last Updated:** October 11, 2025
**Version:** 1.0.0
**Status:** ✅ Fully Implemented & Tested
