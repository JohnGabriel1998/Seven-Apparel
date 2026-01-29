const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, adminOnly } = require("../middleware/supabaseAuth");

// Ensure uploads directories exist
const uploadsDir = path.join(__dirname, "../uploads/products");
const profileUploadsDir = path.join(__dirname, "../uploads/profiles");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}

// Configure multer for product file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Configure multer for profile image storage
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "profile-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

// Configure multer for products
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Configure multer for profile images
const profileUpload = multer({
  storage: profileStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max file size for profile images
  },
  fileFilter: fileFilter,
});

// @desc    Upload single product image
// @route   POST /api/upload/product
// @access  Private/Admin
router.post(
  "/product",
  protect,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the file path that can be accessed via the server
      const filePath = `/uploads/products/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        filePath: filePath,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error uploading file" });
    }
  }
);

// @desc    Upload single image (alias for product upload, used by blog)
// @route   POST /api/upload/single
// @access  Private/Admin
router.post(
  "/single",
  protect,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the base URL from the request or env
      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
      const imageUrl = `${baseUrl}/uploads/products/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: imageUrl,
        filePath: `/uploads/products/${req.file.filename}`,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error uploading file" });
    }
  }
);

// @desc    Upload multiple product images
// @route   POST /api/upload/products
// @access  Private/Admin
router.post(
  "/products",
  protect,
  adminOnly,
  upload.array("images", 10),
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const filePaths = req.files.map(
        (file) => `/uploads/products/${file.filename}`
      );

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        filePaths: filePaths,
        count: req.files.length,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error uploading files" });
    }
  }
);

// @desc    Upload profile image
// @route   POST /api/upload/profile
// @access  Private
router.post(
  "/profile",
  protect,
  profileUpload.single("avatar"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = `/uploads/profiles/${req.file.filename}`;

      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        filePath: filePath,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Error uploading file" });
    }
  }
);

// @desc    Delete a product image
// @route   DELETE /api/upload/product/:filename
// @access  Private/Admin
router.delete("/product/:filename", protect, adminOnly, (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB for products, 2MB for profiles.",
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }

  next();
});

module.exports = router;
