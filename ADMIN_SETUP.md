# Admin Account Setup Guide

## Quick Method: Run the Admin Creation Script

### Step 1: Navigate to Server Directory

```powershell
cd c:\SevenApparel\server
```

### Step 2: Run the Script

```powershell
node createAdmin.js
```

This will create an admin account with:

- **Email:** `admin@sevenapparel.com`
- **Password:** `Admin123!`
- **Role:** `admin`

### Step 3: Login

1. Go to `http://localhost:5173/login`
2. Enter the credentials above
3. You'll be redirected to the homepage
4. Click on "Admin" in the user menu or go to `/admin`

---

## Default Admin Credentials

```
📧 Email: admin@sevenapparel.com
🔑 Password: Admin123!
👤 Role: admin
```

**⚠️ IMPORTANT:** Change the password after first login!

---

## Alternative Methods

### Method 1: Register and Promote to Admin

1. **Register a new account:**

   - Go to `http://localhost:5173/register`
   - Create an account with your email

2. **Update to admin via MongoDB:**

   ```javascript
   // In MongoDB Shell or Compass
   use seven-apparel

   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

3. **Logout and login again** to refresh your role

### Method 2: Direct MongoDB Insert

```javascript
// In MongoDB Shell or Compass
use seven-apparel

// First, register normally to get a hashed password
// Then update the role:
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

---

## Verify Admin Access

After creating the admin account:

1. **Login** at `http://localhost:5173/login`
2. **Check the navbar** - you should see "Admin" option
3. **Go to Admin Panel** - `http://localhost:5173/admin`
4. **You should see:**
   - Dashboard with statistics
   - Sidebar with Products, Orders, Users, Analytics, etc.

---

## Troubleshooting

### "Admin user already exists"

- The script won't create duplicate admins
- Use Method 1 to reset the password or delete the user in MongoDB

### "Cannot access /admin"

- Make sure you're logged in
- Check your user role in MongoDB:
  ```javascript
  db.users.findOne({ email: "admin@sevenapparel.com" });
  ```
- Role should be `"admin"` not `"user"`

### "Connection error"

- Make sure MongoDB is running: `net start MongoDB`
- Check your `.env` file has correct `MONGODB_URI`

---

## Security Notes

🔒 **For Production:**

1. Never use default passwords
2. Use strong, unique passwords
3. Enable 2FA if possible
4. Limit admin access by IP if possible
5. Regularly audit admin activities

---

## Quick Start Checklist

- [ ] MongoDB is running
- [ ] Backend server is running (`npm run dev` in server folder)
- [ ] Run `node createAdmin.js`
- [ ] Login at `http://localhost:5173/login`
- [ ] Access admin panel at `http://localhost:5173/admin`
- [ ] Change default password

---

**Ready to manage your store!** 🎉
