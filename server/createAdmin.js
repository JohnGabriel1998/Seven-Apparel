// Create Admin User Script
// Run this with: node createAdmin.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/seven-apparel"
);

// User Schema (simplified)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Admin credentials
const adminData = {
  name: "Admin User",
  email: "admin@sevenapparel.com",
  password: "Admin123!", // Change this!
  role: "admin",
};

async function createAdmin() {
  try {
    console.log("🔄 Connecting to database...");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("📧 Email:", adminData.email);
      console.log(
        "\n💡 To reset password, delete this user from MongoDB and run again."
      );
      process.exit(0);
    }

    // Hash password
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    console.log("👤 Creating admin user...");
    const admin = new User({
      name: adminData.name,
      email: adminData.email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:", adminData.email);
    console.log("🔑 Password:", adminData.password);
    console.log("👤 Role: admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n🚀 You can now login at: http://localhost:5173/login");
    console.log("⚠️  IMPORTANT: Change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
