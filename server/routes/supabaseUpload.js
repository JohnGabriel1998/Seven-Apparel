const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect, adminOnly } = require("../middleware/supabaseAuth");
const { supabaseAdmin } = require("../config/supabase");

// Configure multer for memory storage (we'll upload to Supabase)
const storage = multer.memoryStorage();

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

// Helper function to upload to Supabase Storage
async function uploadToSupabase(file, bucket, folder) {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  const filename = `${folder}/${uniqueSuffix}${ext}`;

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(bucket)
    .getPublicUrl(filename);

  return {
    filename,
    url: urlData.publicUrl,
  };
}

// @desc    Upload single product image
// @route   POST /api/upload/product
// @access  Private/Admin
router.post(
  "/product",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await uploadToSupabase(req.file, "images", "products");

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        filePath: result.url,
        imageUrl: result.url,
        filename: result.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Error uploading file" 
      });
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
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await uploadToSupabase(req.file, "images", "products");

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        imageUrl: result.url,
        filePath: result.url,
        filename: result.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Error uploading file" 
      });
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
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadPromises = req.files.map((file) =>
        uploadToSupabase(file, "images", "products")
      );
      const results = await Promise.all(uploadPromises);

      const filePaths = results.map((r) => r.url);

      res.status(200).json({
        success: true,
        message: "Images uploaded successfully",
        filePaths: filePaths,
        imageUrls: filePaths,
        count: req.files.length,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Error uploading files" 
      });
    }
  }
);

// @desc    Upload profile image
// @route   POST /api/upload/profile
// @access  Private
router.post(
  "/profile",
  protect,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await uploadToSupabase(req.file, "images", "profiles");

      res.status(200).json({
        success: true,
        message: "Profile image uploaded successfully",
        filePath: result.url,
        imageUrl: result.url,
        filename: result.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Error uploading file" 
      });
    }
  }
);

// @desc    Delete a product image
// @route   DELETE /api/upload/product/:filename
// @access  Private/Admin
router.delete("/product/:filename", protect, adminOnly, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Extract path from URL if full URL provided
    let filePath = filename;
    if (filename.includes("supabase.co")) {
      const parts = filename.split("/images/");
      if (parts[1]) {
        filePath = parts[1];
      }
    }

    const { error } = await supabaseAdmin.storage
      .from("images")
      .remove([filePath]);

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({
        success: false,
        message: "Error deleting image",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ 
      success: false,
      message: "Error deleting file" 
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 5MB.",
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
