const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

// Load env vars from the correct path
dotenv.config({ path: path.join(__dirname, ".env") });

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration - allow frontend to access backend
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  "http://localhost:5173", // Local development
  "http://localhost:3000", // Alternative local
  "https://seven-apparel-slve.vercel.app", // Vercel deployment
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.includes("vercel.app")) {
        return callback(null, true);
      }

      // Allow localhost in any environment
      if (origin.includes("localhost")) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }

      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ==========================================
// SUPABASE ROUTES (replacing MongoDB routes)
// ==========================================
app.use("/api/auth", require("./routes/supabaseAuth"));
app.use("/api/products", require("./routes/supabaseProducts"));
app.use("/api/users", require("./routes/supabaseUsers"));
app.use("/api/orders", require("./routes/supabaseOrders"));
app.use("/api/reviews", require("./routes/supabaseReviews"));
app.use("/api/wishlist", require("./routes/supabaseWishlist"));
app.use("/api/cart", require("./routes/supabaseCart"));
app.use("/api/coupons", require("./routes/supabaseCoupons"));
app.use("/api/blog", require("./routes/supabaseBlog"));
app.use("/api/analytics", require("./routes/supabaseAnalytics"));
app.use("/api/upload", require("./routes/supabaseUpload"));

// Keep these original routes (they don't need database changes)
app.use("/api/support", require("./routes/support"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/events", require("./routes/events"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running with Supabase",
    database: "Supabase PostgreSQL",
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
  console.log(`📦 Database: Supabase PostgreSQL`);
  console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL}`);
});
