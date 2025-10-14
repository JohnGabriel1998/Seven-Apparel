const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, authorize } = require("../middleware/auth");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
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

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// @desc    Upload single product image
// @route   POST /api/upload/product
// @access  Private/Admin
router.post(
  "/product",
  protect,
  authorize("admin"),
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

// @desc    Upload multiple product images
// @route   POST /api/upload/products
// @access  Private/Admin
router.post(
  "/products",
  protect,
  authorize("admin"),
  upload.array("images", 10), // Max 10 images
  (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Return array of file paths
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

// @desc    Delete product image
// @route   DELETE /api/upload/product/:filename
// @access  Private/Admin
router.delete("/product/:filename", protect, authorize("admin"), (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(200).json({
        success: true,
        message: "Image deleted successfully",
      });
    } else {
      res.status(404).json({ message: "Image not found" });
    }
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting file" });
  }
});

module.exports = router;
