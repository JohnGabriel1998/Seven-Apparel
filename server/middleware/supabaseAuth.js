const {
  supabaseAdmin,
  verifySupabaseToken,
  getUserProfile,
} = require("../config/supabase");

// Middleware to protect routes - requires valid Supabase JWT
const protect = async (req, res, next) => {
  let token;

  // Check for Bearer token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify the Supabase JWT token
    const user = await verifySupabaseToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or expired",
      });
    }

    // Get user profile with role
    const profile = await getUserProfile(user.id);

    if (!profile) {
      return res.status(401).json({
        success: false,
        message: "User profile not found",
      });
    }

    if (!profile.is_active) {
      return res.status(401).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // Attach user and profile to request
    req.user = {
      id: user.id,
      email: user.email,
      ...profile,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Middleware to restrict access to admin users only
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Optional auth - attaches user if token present, but doesn't block
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const user = await verifySupabaseToken(token);
      if (user) {
        const profile = await getUserProfile(user.id);
        if (profile && profile.is_active) {
          req.user = {
            id: user.id,
            email: user.email,
            ...profile,
          };
        }
      }
    } catch (error) {
      // Silently fail - user remains unauthenticated
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
};

module.exports = { protect, adminOnly, optionalAuth };
