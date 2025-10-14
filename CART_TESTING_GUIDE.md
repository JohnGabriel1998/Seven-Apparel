# 🧪 Cart Transaction System - Testing Guide

## 🎯 Test Scenarios

This guide provides step-by-step testing procedures for the cart transaction management system.

---

## 📋 Prerequisites

**Before Testing:**

- ✅ MongoDB running
- ✅ Backend server running (port 5000)
- ✅ Frontend running (port 5173)
- ✅ At least 2 test user accounts created

**Test User Accounts:**

```
User A:
Email: usera@test.com
Password: Test123!

User B:
Email: userb@test.com
Password: Test123!
```

---

## 🧪 Test Suite 1: User-Specific Transactions

### **Test 1.1: Independent Carts**

**Objective:** Verify each user has their own cart

**Steps:**

```
1. Login as User A
2. Add Item X to cart
3. Add Item Y to cart
4. Note cart contents: [X, Y]
5. Logout

6. Login as User B
7. Verify cart is empty
8. Add Item Z to cart
9. Note cart contents: [Z]
10. Logout

11. Login as User A again
12. Verify cart still contains [X, Y]
13. Verify Item Z is NOT in cart
```

**Expected Result:**

```
✅ User A cart: [Item X, Item Y]
✅ User B cart: [Item Z]
✅ No cross-contamination
```

**Database Verification:**

```javascript
// In MongoDB Shell
use seven-apparel

// Check User A's cart
db.carts.findOne({ user: ObjectId("USER_A_ID") })
// Should show: items [X, Y]

// Check User B's cart
db.carts.findOne({ user: ObjectId("USER_B_ID") })
// Should show: items [Z]
```

---

### **Test 1.2: Cart Isolation During Concurrent Operations**

**Objective:** Verify multiple users can add items simultaneously without conflicts

**Steps:**

```
1. Open Browser 1 (Chrome)
   - Login as User A

2. Open Browser 2 (Firefox)
   - Login as User B

3. Simultaneously (within 1 second):
   - Browser 1: Add Item A to cart
   - Browser 2: Add Item B to cart

4. Wait for responses

5. Browser 1: Refresh and check cart
   - Should see: [Item A]
   - Should NOT see: [Item B]

6. Browser 2: Refresh and check cart
   - Should see: [Item B]
   - Should NOT see: [Item A]
```

**Expected Result:**

```
✅ User A sees only Item A
✅ User B sees only Item B
✅ No data conflicts
✅ Both operations successful
```

---

## 🧪 Test Suite 2: Unique Transaction IDs

### **Test 2.1: Order Number Generation**

**Objective:** Verify each order gets unique order number

**Steps:**

```
1. Login as User A
2. Add items to cart
3. Proceed to checkout
4. Complete order
5. Note order number (e.g., ORD-1697123456789-A7K9X2M5P)

6. Add more items to cart
7. Checkout again
8. Note second order number

9. Verify order numbers are different
```

**Expected Result:**

```
✅ Order 1: ORD-1697123456789-A7K9X2M5P
✅ Order 2: ORD-1697234567890-B8L1Y3N6Q
✅ Order numbers are unique
✅ Format correct: ORD-TIMESTAMP-RANDOM
```

**Database Verification:**

```javascript
// Check all order numbers are unique
db.orders.aggregate([
  { $group: { _id: "$orderNumber", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } },
]);
// Should return: empty array (no duplicates)
```

---

### **Test 2.2: Concurrent Order Creation**

**Objective:** Verify unique IDs even with simultaneous orders

**Setup Script:**

```javascript
// create-concurrent-orders.js
const axios = require("axios");

async function createOrder(token, items) {
  return axios.post(
    "http://localhost:5000/api/orders",
    {
      items,
      shippingAddress: {
        /* ... */
      },
      paymentMethod: "credit_card",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

async function test() {
  const tokens = [TOKEN_A, TOKEN_B, TOKEN_C]; // 3 users

  // Create 10 orders simultaneously
  const promises = [];
  for (let i = 0; i < 10; i++) {
    const token = tokens[i % 3];
    promises.push(createOrder(token, items));
  }

  const results = await Promise.all(promises);
  const orderNumbers = results.map((r) => r.data.data.orderNumber);

  // Check for duplicates
  const unique = new Set(orderNumbers);
  console.log("Total orders:", orderNumbers.length);
  console.log("Unique orders:", unique.size);
  console.log("Duplicates:", orderNumbers.length - unique.size);
}

test();
```

**Expected Result:**

```
✅ Total orders: 10
✅ Unique orders: 10
✅ Duplicates: 0
```

---

## 🧪 Test Suite 3: Persistent Cart Contents

### **Test 3.1: Login/Logout Persistence**

**Objective:** Verify cart persists across logout/login

**Steps:**

```
1. Login as User A
2. Add Item X (Qty: 2) to cart
3. Add Item Y (Qty: 1) to cart
4. Verify cart shows: [X (2), Y (1)]
5. Logout

6. Close browser completely
7. Wait 1 minute

8. Open browser again
9. Login as User A
10. Navigate to cart page
11. Verify cart still shows: [X (2), Y (1)]
```

**Expected Result:**

```
✅ Cart persists after logout
✅ Items still present after browser close
✅ Quantities preserved
✅ No data loss
```

---

### **Test 3.2: Device Switch Persistence**

**Objective:** Verify cart accessible from different devices

**Steps:**

```
1. Device 1 (Mobile):
   - Login as User A
   - Add Item X to cart
   - Logout

2. Device 2 (Desktop):
   - Login as User A
   - Navigate to cart
   - Verify Item X is present

3. Device 2:
   - Add Item Y to cart
   - Logout

4. Device 1 (Mobile):
   - Login as User A
   - Navigate to cart
   - Verify both Item X and Y are present
```

**Expected Result:**

```
✅ Cart synchronized across devices
✅ Items from Device 1 visible on Device 2
✅ Items from Device 2 visible on Device 1
✅ Real-time sync working
```

---

### **Test 3.3: Long-Term Persistence**

**Objective:** Verify cart persists over extended period

**Steps:**

```
1. Login as User A
2. Add items to cart
3. Note timestamp
4. Logout

5. Wait 24 hours

6. Login as User A
7. Check cart
8. Verify all items still present
```

**Expected Result:**

```
✅ Cart persists for 24+ hours
✅ No automatic cart clearing
✅ Items preserved long-term
```

---

## 🧪 Test Suite 4: Multi-User Support

### **Test 4.1: Simultaneous Cart Operations**

**Objective:** Verify multiple users can operate carts at same time

**Setup:**

```
3 browsers (Chrome, Firefox, Edge)
3 user accounts logged in
```

**Steps:**

```
Time: 10:00:00
All users simultaneously:
- User A: Add Item A to cart
- User B: Add Item B to cart
- User C: Add Item C to cart

Time: 10:00:05
All users simultaneously:
- User A: Update Item A quantity to 3
- User B: Remove Item B
- User C: Add Item D to cart

Time: 10:00:10
All users check their carts
```

**Expected Result:**

```
✅ User A cart: [Item A (Qty: 3)]
✅ User B cart: [] (empty)
✅ User C cart: [Item C, Item D]
✅ No errors
✅ No data conflicts
```

---

### **Test 4.2: Same User, Multiple Devices**

**Objective:** Verify same user on multiple devices stays synchronized

**Steps:**

```
1. Device 1 (Desktop):
   - Login as User A
   - Add Item X to cart

2. Device 2 (Mobile):
   - Login as User A
   - Verify Item X appears in cart
   - Add Item Y to cart

3. Device 1 (Desktop):
   - Refresh cart page
   - Verify Item Y now appears
   - Update Item X quantity to 5

4. Device 2 (Mobile):
   - Refresh cart page
   - Verify Item X quantity is 5
```

**Expected Result:**

```
✅ Both devices show same cart
✅ Changes on one device reflected on other
✅ No data loss
✅ Proper synchronization
```

---

### **Test 4.3: Load Test (Multiple Users)**

**Load Testing Script:**

```javascript
// load-test.js
const axios = require("axios");
const { performance } = require("perf_hooks");

async function addToCart(token, productId) {
  const start = performance.now();

  try {
    await axios.post(
      "http://localhost:5000/api/cart",
      {
        productId,
        name: `Product ${productId}`,
        image: "image.jpg",
        color: "Red",
        size: "M",
        quantity: 1,
        price: 29.99,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const end = performance.now();
    return { success: true, time: end - start };
  } catch (error) {
    const end = performance.now();
    return { success: false, time: end - start, error: error.message };
  }
}

async function loadTest() {
  const tokens = [
    /* 50 user tokens */
  ];
  const requests = [];

  // 50 users, each makes 10 requests
  for (let i = 0; i < 50; i++) {
    for (let j = 0; j < 10; j++) {
      requests.push(addToCart(tokens[i], `product-${j}`));
    }
  }

  console.log("Starting load test: 500 concurrent requests...");
  const start = performance.now();

  const results = await Promise.all(requests);

  const end = performance.now();

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const avgTime = results.reduce((sum, r) => sum + r.time, 0) / results.length;

  console.log("Results:");
  console.log("- Total requests:", results.length);
  console.log("- Successful:", successful);
  console.log("- Failed:", failed);
  console.log("- Average time:", avgTime.toFixed(2), "ms");
  console.log("- Total time:", (end - start).toFixed(2), "ms");
}

loadTest();
```

**Expected Result:**

```
✅ Total requests: 500
✅ Successful: 500
✅ Failed: 0
✅ Average time: < 100ms
✅ No database errors
```

---

## 🧪 Test Suite 5: Transaction History

### **Test 5.1: Order Creation History**

**Objective:** Verify order creation is recorded in history

**Steps:**

```
1. Login as User A
2. Add items to cart
3. Proceed to checkout
4. Complete order
5. Navigate to order details
6. Check transaction history
```

**Expected History Entry:**

```json
{
  "action": "created",
  "status": "pending",
  "timestamp": "2025-10-11T10:00:00.000Z",
  "note": "Order created from cart"
}
```

---

### **Test 5.2: Status Update History**

**Objective:** Verify status changes are recorded

**Steps:**

```
1. Admin updates order status to "processing"
2. Check order transaction history
3. Verify new entry added

4. Admin updates order status to "shipped"
5. Check order transaction history
6. Verify new entry added

7. Admin updates order status to "delivered"
8. Check order transaction history
9. Verify new entry added
```

**Expected History:**

```json
[
  {
    "action": "created",
    "status": "pending",
    "timestamp": "2025-10-11T10:00:00.000Z"
  },
  {
    "action": "status_updated",
    "status": "processing",
    "timestamp": "2025-10-11T10:05:00.000Z",
    "note": "Payment confirmed"
  },
  {
    "action": "status_updated",
    "status": "shipped",
    "timestamp": "2025-10-12T08:30:00.000Z",
    "note": "Shipped via FedEx"
  },
  {
    "action": "status_updated",
    "status": "delivered",
    "timestamp": "2025-10-14T14:20:00.000Z",
    "note": "Delivered to customer"
  }
]
```

---

### **Test 5.3: Complete Transaction Timeline**

**Objective:** Verify complete transaction tracking from cart to delivery

**Steps:**

```
1. User adds Item A to cart
   - Record timestamp T1

2. User adds Item B to cart
   - Record timestamp T2

3. User checks out
   - Record timestamp T3
   - Order created

4. Admin processes payment
   - Record timestamp T4

5. Admin ships order
   - Record timestamp T5

6. Order delivered
   - Record timestamp T6

7. Review complete order record
```

**Expected Timeline:**

```
T1: Item A added to cart
T2: Item B added to cart
T3: Order created (ORD-XXX)
    - Transaction history: "created"
T4: Payment processed
    - Transaction history: "payment_received"
T5: Order shipped
    - Transaction history: "status_updated" → "shipped"
T6: Order delivered
    - Transaction history: "status_updated" → "delivered"

✅ All timestamps recorded
✅ Complete audit trail
✅ Chronological order maintained
```

---

## 🧪 Edge Case Tests

### **Edge Test 1: Empty Cart Checkout**

**Steps:**

```
1. Login
2. Navigate to checkout without adding items
3. Attempt to place order
```

**Expected Result:**

```
✅ Error: "Cart is empty"
✅ Order not created
✅ User redirected to products
```

---

### **Edge Test 2: Duplicate Item Addition**

**Steps:**

```
1. Add Item X (Color: Red, Size: M, Qty: 2)
2. Add Item X (Color: Red, Size: M, Qty: 3) again
```

**Expected Result:**

```
✅ Single cart entry
✅ Quantity: 5 (combined)
✅ Not duplicate entries
```

---

### **Edge Test 3: Concurrent Same Item Addition**

**Steps:**

```
1. Open 2 browser tabs with same user
2. Both tabs: Add Item X simultaneously
```

**Expected Result:**

```
✅ Single cart entry (not duplicated)
✅ Quantity reflects both additions
✅ Database consistency maintained
```

---

### **Edge Test 4: Cart During Order Placement**

**Steps:**

```
1. Add items to cart
2. Start checkout process
3. In another tab, modify cart
4. Complete checkout in first tab
```

**Expected Result:**

```
✅ Order uses cart state at checkout time
✅ Later modifications don't affect order
✅ Cart cleared after successful order
```

---

## 📊 Performance Benchmarks

### **Response Time Targets:**

| Operation        | Target Time | Acceptable Range |
| ---------------- | ----------- | ---------------- |
| Get Cart         | < 50ms      | 50-100ms         |
| Add to Cart      | < 100ms     | 100-200ms        |
| Update Cart      | < 100ms     | 100-200ms        |
| Remove from Cart | < 100ms     | 100-200ms        |
| Create Order     | < 200ms     | 200-500ms        |
| Get Orders       | < 150ms     | 150-300ms        |

### **Concurrent User Targets:**

| Concurrent Users | Success Rate | Avg Response Time |
| ---------------- | ------------ | ----------------- |
| 10 users         | 100%         | < 100ms           |
| 50 users         | > 99%        | < 200ms           |
| 100 users        | > 98%        | < 300ms           |
| 500 users        | > 95%        | < 500ms           |

---

## ✅ Test Checklist

### **Basic Functionality:**

- [ ] User can add items to cart
- [ ] User can remove items from cart
- [ ] User can update quantities
- [ ] User can view cart
- [ ] User can checkout
- [ ] Order created with unique ID
- [ ] Cart cleared after checkout

### **User Isolation:**

- [ ] Each user has separate cart
- [ ] Users cannot see others' carts
- [ ] Users cannot see others' orders
- [ ] Concurrent operations don't interfere

### **Persistence:**

- [ ] Cart persists after logout
- [ ] Cart persists after browser close
- [ ] Cart accessible from multiple devices
- [ ] Cart data survives days/weeks

### **Transaction History:**

- [ ] Order creation recorded
- [ ] Status changes recorded
- [ ] Timestamps accurate
- [ ] Complete audit trail

### **Security:**

- [ ] JWT authentication required
- [ ] Cannot access other users' data
- [ ] API validates user ownership
- [ ] Database enforces constraints

### **Performance:**

- [ ] Response times within targets
- [ ] Handles concurrent users
- [ ] No database deadlocks
- [ ] Scales appropriately

---

## 🎉 Test Summary

**When all tests pass:**

```
✅ User-specific transactions working
✅ Unique transaction IDs generated
✅ Cart persistence functioning
✅ Multi-user support operational
✅ Transaction history tracking
✅ System production-ready
```

**Your cart transaction system is fully tested!** 🧪✨
