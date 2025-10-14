// Seed database with sample data
// Run this with: node seedData.js

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");

// Connect to MongoDB
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27017/seven-apparel"
);

const sampleProducts = [
  {
    name: "Classic Cotton T-Shirt",
    description:
      "Premium quality cotton t-shirt perfect for everyday wear. Soft, breathable, and durable.",
    price: 29.99,
    category: "tops",
    subcategory: "T-Shirts",
    brand: "Seven Apparel",
    gender: "men",
    images: [
      {
        url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
        alt: "Black t-shirt",
      },
      {
        url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400",
        alt: "White t-shirt",
      },
    ],
    colors: [
      { name: "Black", hex: "#000000" },
      { name: "White", hex: "#FFFFFF" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      {
        color: { name: "Black", hex: "#000000" },
        size: "S",
        stock: 25,
        sku: "TSH-BLK-S-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "M",
        stock: 50,
        sku: "TSH-BLK-M-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "L",
        stock: 40,
        sku: "TSH-BLK-L-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "XL",
        stock: 30,
        sku: "TSH-BLK-XL-001",
      },
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "S",
        stock: 20,
        sku: "TSH-WHT-S-001",
      },
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "M",
        stock: 45,
        sku: "TSH-WHT-M-001",
      },
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "L",
        stock: 35,
        sku: "TSH-WHT-L-001",
      },
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "XL",
        stock: 25,
        sku: "TSH-WHT-XL-001",
      },
    ],
    totalStock: 270,
    tags: ["new-arrival", "bestseller"],
    isFeatured: true,
  },
  {
    name: "Slim Fit Jeans",
    description:
      "Modern slim fit jeans with stretch denim for ultimate comfort and style.",
    price: 79.99,
    category: "bottoms",
    subcategory: "Jeans",
    brand: "Seven Apparel",
    gender: "men",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        alt: "Dark blue jeans",
      },
      {
        url: "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=400",
        alt: "Black jeans",
      },
    ],
    colors: [
      { name: "Dark Blue", hex: "#1E3A8A" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      {
        color: { name: "Dark Blue", hex: "#1E3A8A" },
        size: "S",
        stock: 15,
        sku: "JNS-DBL-S-001",
      },
      {
        color: { name: "Dark Blue", hex: "#1E3A8A" },
        size: "M",
        stock: 25,
        sku: "JNS-DBL-M-001",
      },
      {
        color: { name: "Dark Blue", hex: "#1E3A8A" },
        size: "L",
        stock: 20,
        sku: "JNS-DBL-L-001",
      },
      {
        color: { name: "Dark Blue", hex: "#1E3A8A" },
        size: "XL",
        stock: 15,
        sku: "JNS-DBL-XL-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "S",
        stock: 12,
        sku: "JNS-BLK-S-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "M",
        stock: 22,
        sku: "JNS-BLK-M-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "L",
        stock: 18,
        sku: "JNS-BLK-L-001",
      },
    ],
    totalStock: 127,
    tags: ["new-arrival", "trending"],
    isFeatured: true,
  },
  {
    name: "Floral Summer Dress",
    description:
      "Beautiful floral print dress perfect for summer occasions. Light and flowy fabric.",
    price: 59.99,
    category: "dresses",
    subcategory: "Summer Dresses",
    brand: "Seven Apparel",
    gender: "women",
    images: [
      {
        url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400",
        alt: "Pink floral dress",
      },
      {
        url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400",
        alt: "Blue floral dress",
      },
    ],
    colors: [
      { name: "Pink", hex: "#FFC0CB" },
      { name: "Blue", hex: "#3B82F6" },
    ],
    sizes: ["XS", "S", "M", "L"],
    variants: [
      {
        color: { name: "Pink", hex: "#FFC0CB" },
        size: "XS",
        stock: 10,
        sku: "DRS-PNK-XS-001",
      },
      {
        color: { name: "Pink", hex: "#FFC0CB" },
        size: "S",
        stock: 20,
        sku: "DRS-PNK-S-001",
      },
      {
        color: { name: "Pink", hex: "#FFC0CB" },
        size: "M",
        stock: 25,
        sku: "DRS-PNK-M-001",
      },
      {
        color: { name: "Pink", hex: "#FFC0CB" },
        size: "L",
        stock: 15,
        sku: "DRS-PNK-L-001",
      },
      {
        color: { name: "Blue", hex: "#3B82F6" },
        size: "S",
        stock: 8,
        sku: "DRS-BLU-S-001",
      },
      {
        color: { name: "Blue", hex: "#3B82F6" },
        size: "M",
        stock: 7,
        sku: "DRS-BLU-M-001",
      },
      {
        color: { name: "Blue", hex: "#3B82F6" },
        size: "L",
        stock: 5,
        sku: "DRS-BLU-L-001",
      },
    ],
    totalStock: 90,
    tags: ["sale", "trending"],
    isFeatured: true,
  },
  {
    name: "Kids Graphic Tee",
    description:
      "Fun graphic t-shirt for kids. Soft cotton blend that's perfect for active children.",
    price: 19.99,
    category: "tops",
    subcategory: "T-Shirts",
    brand: "Seven Apparel",
    gender: "kids",
    images: [
      {
        url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400",
        alt: "Kids graphic tee",
      },
    ],
    colors: [
      { name: "Red", hex: "#EF4444" },
      { name: "Blue", hex: "#3B82F6" },
    ],
    sizes: ["S", "M", "L"],
    variants: [
      {
        color: { name: "Red", hex: "#EF4444" },
        size: "S",
        stock: 30,
        sku: "KTS-RED-S-001",
      },
      {
        color: { name: "Red", hex: "#EF4444" },
        size: "M",
        stock: 35,
        sku: "KTS-RED-M-001",
      },
      {
        color: { name: "Red", hex: "#EF4444" },
        size: "L",
        stock: 30,
        sku: "KTS-RED-L-001",
      },
      {
        color: { name: "Blue", hex: "#3B82F6" },
        size: "S",
        stock: 28,
        sku: "KTS-BLU-S-001",
      },
      {
        color: { name: "Blue", hex: "#3B82F6" },
        size: "M",
        stock: 32,
        sku: "KTS-BLU-M-001",
      },
      {
        color: { name: "Blue", hex: "#3B82F6" },
        size: "L",
        stock: 28,
        sku: "KTS-BLU-L-001",
      },
    ],
    totalStock: 183,
    tags: ["new-arrival"],
    isFeatured: false,
  },
  {
    name: "Leather Crossbody Bag",
    description:
      "Elegant leather crossbody bag with adjustable strap. Perfect for everyday use.",
    price: 89.99,
    category: "accessories",
    subcategory: "Bags",
    brand: "Seven Apparel",
    gender: "women",
    images: [
      {
        url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
        alt: "Leather bag",
      },
    ],
    colors: [
      { name: "Brown", hex: "#92400E" },
      { name: "Black", hex: "#000000" },
      { name: "Tan", hex: "#D2691E" },
    ],
    sizes: ["M"],
    variants: [
      {
        color: { name: "Brown", hex: "#92400E" },
        size: "M",
        stock: 5,
        sku: "BAG-BRN-M-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "M",
        stock: 8,
        sku: "BAG-BLK-M-001",
      },
      {
        color: { name: "Tan", hex: "#D2691E" },
        size: "M",
        stock: 3,
        sku: "BAG-TAN-M-001",
      },
    ],
    totalStock: 16,
    tags: ["limited-edition"],
    isFeatured: false,
  },
  {
    name: "Classic Sneakers",
    description:
      "Classic low-top sneakers with cushioned sole. Versatile and comfortable.",
    price: 69.99,
    category: "shoes",
    subcategory: "Sneakers",
    brand: "Seven Apparel",
    gender: "unisex",
    images: [
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400",
        alt: "White sneakers",
      },
    ],
    colors: [
      { name: "White", hex: "#FFFFFF" },
      { name: "Black", hex: "#000000" },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: [
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "S",
        stock: 8,
        sku: "SNK-WHT-S-001",
      },
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "M",
        stock: 7,
        sku: "SNK-WHT-M-001",
      },
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "L",
        stock: 6,
        sku: "SNK-WHT-L-001",
      },
      {
        color: { name: "White", hex: "#FFFFFF" },
        size: "XL",
        stock: 4,
        sku: "SNK-WHT-XL-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "S",
        stock: 6,
        sku: "SNK-BLK-S-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "M",
        stock: 5,
        sku: "SNK-BLK-M-001",
      },
      {
        color: { name: "Black", hex: "#000000" },
        size: "L",
        stock: 4,
        sku: "SNK-BLK-L-001",
      },
    ],
    totalStock: 40,
    tags: ["bestseller"],
    isFeatured: false,
  },
];

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...\n");

    // Clear existing data
    console.log("🗑️  Clearing existing products...");
    await Product.deleteMany({});
    console.log("✅ Products cleared\n");

    // Insert sample products
    console.log("📦 Inserting sample products...");
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ ${products.length} products inserted\n`);

    // Calculate totals
    const totalStock = products.reduce((sum, p) => sum + p.totalStock, 0);
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.totalStock,
      0
    );

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✨ Database Seeded Successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📦 Total Products: ${products.length}`);
    console.log(`📊 Total Stock Units: ${totalStock}`);
    console.log(`💰 Total Inventory Value: $${totalValue.toFixed(2)}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📋 Products added:");
    products.forEach((p, i) => {
      console.log(
        `   ${i + 1}. ${p.name} - $${p.price} (Stock: ${p.totalStock})`
      );
    });

    console.log("\n🚀 You can now:");
    console.log("   1. View products at: http://localhost:5173/products");
    console.log(
      "   2. Manage in admin at: http://localhost:5173/admin/products"
    );
    console.log("   3. View dashboard at: http://localhost:5173/admin\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedDatabase();
