const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const mongoose = require("mongoose");
const { ensureReviewIndexes } = require("./utils/ensureIndexes");
const errorHandler = require("./middleware/errorHandler");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/users", require("./routes/users"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/wishlist", require("./routes/wishlist"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/coupons", require("./routes/coupons"));
app.use("/api/blog", require("./routes/blog"));
app.use("/api/support", require("./routes/support"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/events", require("./routes/events"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Run non-blocking index fix after DB is connected
mongoose.connection.once('open', async () => {
  await ensureReviewIndexes(mongoose);
});

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
  );
});
