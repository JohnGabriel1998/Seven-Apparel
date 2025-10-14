# Analytics Dashboard - Quick Reference Guide

## 📊 Page Layout Overview

```
┌─────────────────────────────────────────────────────────────┐
│  Analytics Dashboard                    [Period Selector ▼] │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  🛒 Total Orders │ │  💵 Total Revenue│ │  📈 Avg Order    │
│      XXX         │ │    $XX,XXX.XX    │ │    $XXX.XX       │
│  All time orders │ │  From paid orders│ │  Per order avg   │
└──────────────────┘ └──────────────────┘ └──────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Order Status Breakdown                                     │
├──────────┬──────────┬──────────┬──────────┬──────────┐
│ 🕐 XXX   │ ❗ XXX   │ 🚚 XXX   │ ✅ XXX   │ ❌ XXX   │
│ Pending  │Processing│ Shipped  │Delivered │Cancelled │
└──────────┴──────────┴──────────┴──────────┴──────────┘

┌─────────────────────────────────────────────────────────────┐
│  Revenue by Period                                          │
├──────────────┬──────────────┬──────────────┬──────────────┐
│  💵 Daily    │  📊 Weekly   │  🛒 Monthly  │  👥 Yearly   │
│  $XXX.XX     │  $XXX.XX     │  $XXX.XX     │  $XXX.XX     │
│  Today       │  Last 7 days │  This month  │  This year   │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Recent Orders               🔍 [Search orders...        ]  │
├──────────┬──────────┬────┬─────┬────────┬────────┬────────┬───┐
│ Order ID │ Customer │Items│Total│ Status │Payment │  Date  │Act│
├──────────┼──────────┼────┼─────┼────────┼────────┼────────┼───┤
│🕐 SA123  │John Doe  │ 3  │$150 │Pending │  Paid  │10/11/25│👁 │
│          │john@...  │    │     │        │        │        │   │
├──────────┼──────────┼────┼─────┼────────┼────────┼────────┼───┤
│✅ SA124  │Jane...   │ 2  │$99  │Delivered│ Paid  │10/10/25│👁 │
│          │jane@...  │    │     │        │        │        │   │
└──────────┴──────────┴────┴─────┴────────┴────────┴────────┴───┘
           Showing 10 of XX orders [View all orders →]

┌─────────────────────────────────────────────────────────────┐
│  Sales Overview - Monthly                                   │
├─────────────────────────────────────────────────────────────┤
│  📅 10/11/2025        5 orders              $500.00         │
│  📅 10/10/2025        8 orders              $750.00         │
│  📅 10/09/2025        3 orders              $250.00         │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features at a Glance

### Top Row: Critical Metrics

| Metric              | Icon | Description            | Calculation        |
| ------------------- | ---- | ---------------------- | ------------------ |
| **Total Orders**    | 🛒   | All orders ever placed | `orders.length`    |
| **Total Revenue**   | 💵   | Money from paid orders | `sum(paid orders)` |
| **Avg Order Value** | 📈   | Average spending       | `revenue / orders` |

### Status Breakdown

| Status         | Icon | Color  | Meaning             |
| -------------- | ---- | ------ | ------------------- |
| **Pending**    | 🕐   | Yellow | Awaiting processing |
| **Processing** | ❗   | Blue   | Being prepared      |
| **Shipped**    | 🚚   | Purple | On the way          |
| **Delivered**  | ✅   | Green  | Completed           |
| **Cancelled**  | ❌   | Red    | Cancelled           |

### Search Functionality

```
🔍 Search bar supports:
   ✓ Order numbers (SA25103456)
   ✓ Customer names (John Doe)
   ✓ Email addresses (customer@email.com)
   ✓ Partial matches (case-insensitive)
```

## 🔍 How to Use

### Finding an Order

1. **By Order Number:**

   ```
   Type: SA251034
   Results: Shows all orders containing "SA251034"
   ```

2. **By Customer Name:**

   ```
   Type: John
   Results: Shows all orders from customers named John
   ```

3. **By Email:**
   ```
   Type: @gmail.com
   Results: Shows all Gmail customers
   ```

### Viewing Order Details

1. Locate order in table
2. Click **"👁 View"** button
3. Navigates to full order details page

### Understanding Status Colors

**Order Status Badges:**

```
🟡 Pending     - Yellow badge
🔵 Processing  - Blue badge
🟣 Shipped     - Purple badge
🟢 Delivered   - Green badge
🔴 Cancelled   - Red badge
```

**Payment Status Badges:**

```
🟢 Paid    - Green badge
🟡 Pending - Yellow badge
🔴 Failed  - Red badge
```

## 📱 Responsive Behavior

### Desktop View (> 1024px)

- 3 columns for metrics
- 5 columns for status breakdown
- Full table visible
- Search bar: max-width

### Tablet View (768px - 1024px)

- 2 columns for metrics
- 3-4 columns for status
- Scrollable table
- Full-width search

### Mobile View (< 768px)

- 1 column stack
- 2 columns for status
- Horizontal scroll table
- Full-width search

## 🎨 Color Scheme

### Light Mode

```css
Background: White (#FFFFFF)
Text: Gray-900 (#111827)
Borders: Gray-200 (#E5E7EB)
Primary: Red-600 (#DC2626)
```

### Dark Mode

```css
Background: Gray-800 (#1F2937)
Text: White (#FFFFFF)
Borders: Gray-700 (#374151)
Primary: Red-500 (#EF4444)
```

## 🔢 Data Calculations

### Total Revenue

```javascript
totalRevenue = orders
  .filter((order) => order.paymentStatus === "paid")
  .reduce((sum, order) => sum + order.total, 0);
```

### Status Breakdown

```javascript
statusBreakdown = {
  pending: orders.filter((o) => o.status === "pending").length,
  processing: orders.filter((o) => o.status === "processing").length,
  shipped: orders.filter((o) => o.status === "shipped").length,
  delivered: orders.filter((o) => o.status === "delivered").length,
  cancelled: orders.filter((o) => o.status === "cancelled").length,
};
```

### Average Order Value

```javascript
averageOrderValue = totalRevenue / totalOrders;
```

## 📊 Table Columns Explained

| Column       | Content        | Example                    | Purpose              |
| ------------ | -------------- | -------------------------- | -------------------- |
| **Order ID** | Number + Icon  | 🕐 SA25103456              | Quick identification |
| **Customer** | Name + Email   | John Doe<br>john@email.com | Contact info         |
| **Items**    | Item count     | 3 items                    | Order size           |
| **Total**    | Order value    | $150.00                    | Revenue tracking     |
| **Status**   | Order status   | 🟡 Pending                 | Fulfillment stage    |
| **Payment**  | Payment status | 🟢 Paid                    | Payment confirmation |
| **Date**     | Order date     | 10/11/2025                 | Timeline tracking    |
| **Actions**  | View button    | 👁 View                     | Navigate to details  |

## ⚡ Quick Actions

### Common Tasks

1. **Check today's revenue:**

   - Look at "Daily Revenue" card
   - Shows: $XXX.XX Today

2. **Find specific order:**

   - Use search bar
   - Type order number or customer name
   - Click "View" on result

3. **Monitor order fulfillment:**

   - Check "Order Status Breakdown"
   - Identify bottlenecks
   - Take action on pending/processing orders

4. **Track payment issues:**

   - Scan "Payment" column
   - Look for 🔴 Failed badges
   - Investigate and resolve

5. **View all orders:**
   - Scroll to bottom of orders table
   - Click "View all orders →"
   - Opens full orders management page

## 🎯 Best Practices

### For Daily Use

✅ Check status breakdown first thing
✅ Monitor payment failures
✅ Review recent orders
✅ Track daily revenue trends

### For Weekly Reviews

✅ Compare weekly vs monthly revenue
✅ Analyze delivered vs cancelled ratio
✅ Check average order value trends
✅ Review sales overview chart

### For Monthly Analysis

✅ Review yearly revenue progress
✅ Compare month-over-month growth
✅ Analyze customer patterns
✅ Identify peak sales periods

## 🔔 What to Watch For

### Red Flags 🚩

- High number of **Cancelled** orders
- Many **Failed** payments
- Low **Delivered** percentage
- Decreasing average order value
- Many orders stuck in **Processing**

### Good Signs ✅

- High **Delivered** count
- Growing **Total Revenue**
- Increasing average order value
- Most payments **Paid**
- Low cancellation rate

## 🎓 Tips & Tricks

1. **Quick Search:**

   - Don't need full order number
   - Partial matches work
   - Try last 4 digits

2. **Status Monitoring:**

   - Click status badges to filter (future feature)
   - Export data for external analysis
   - Set alerts for failures

3. **Revenue Tracking:**

   - Compare periods side-by-side
   - Calculate growth percentages
   - Set revenue goals

4. **Customer Service:**
   - Search by email for support
   - Quick access to order details
   - Fast issue resolution

## 📈 Performance Metrics

### Load Time

- Initial page load: < 2 seconds
- Search results: Instant (client-side)
- Order fetch: < 1 second

### Data Refresh

- Auto-refresh: On page load
- Manual refresh: Change time period
- Real-time: Not yet (planned)

## 🛠️ Troubleshooting

### "No orders available yet"

- New store (no orders placed)
- Check if orders exist in database
- Verify API connection

### "No orders found matching your search"

- Check spelling
- Try partial search
- Clear search and browse

### Orders not updating

- Refresh page (F5)
- Check internet connection
- Verify API is running

## 📞 Support

For technical issues:

1. Check browser console (F12)
2. Verify API endpoint: `/orders/all`
3. Check authentication token
4. Review network requests

---

## 🎉 Quick Start Checklist

- [✓] Page loads with all metrics
- [✓] Status breakdown displays counts
- [✓] Revenue cards show correct amounts
- [✓] Orders table shows recent orders
- [✓] Search bar filters orders
- [✓] "View" buttons navigate correctly
- [✓] Dark mode works
- [✓] Mobile responsive

**Ready to use!** 🚀

---

**Last Updated:** October 11, 2025
**Version:** 2.0
**Status:** Production Ready ✅
