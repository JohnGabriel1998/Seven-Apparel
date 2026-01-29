const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabase");
const { protect, adminOnly } = require("../middleware/supabaseAuth");

// @desc    Register user (Supabase handles this, but we can proxy)
// @route   POST /api/auth/register
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, and password",
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for now
        user_metadata: { name },
      });

    if (authError) {
      // Handle duplicate email
      if (authError.message.includes("already")) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }
      throw authError;
    }

    // Get session for the new user
    const { data: sessionData, error: sessionError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

    // Sign in to get access token
    const { data: signInData, error: signInError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) throw signInError;

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    res.status(201).json({
      success: true,
      token: signInData.session.access_token,
      user: {
        id: authData.user.id,
        name: profile?.name || name,
        email: authData.user.email,
        role: profile?.role || "user",
        avatar: profile?.avatar,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Registration failed",
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    // Check if user is active
    if (profile && !profile.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact support.",
      });
    }

    res.status(200).json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: profile?.name || email.split("@")[0],
        email: data.user.email,
        role: profile?.role || "user",
        avatar: profile?.avatar,
        phone: profile?.phone,
        isVerified: profile?.is_verified || false,
        address: profile
          ? {
              street: profile.address_street,
              city: profile.address_city,
              state: profile.address_state,
              zipCode: profile.address_zip_code,
              country: profile.address_country,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Login failed",
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        avatar: req.user.avatar,
        phone: req.user.phone,
        isVerified: req.user.is_verified,
        address: {
          street: req.user.address_street,
          city: req.user.address_city,
          state: req.user.address_state,
          zipCode: req.user.address_zip_code,
          country: req.user.address_country,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
router.get("/logout", protect, async (req, res) => {
  try {
    // Supabase handles token invalidation on client-side
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email",
      });
    }

    // Send password reset email via Supabase
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.CLIENT_URL}/auth/reset-password`,
    });

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send reset email",
    });
  }
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
router.put("/update-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide a new password",
      });
    }

    // Update password via Supabase Admin
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      req.user.id,
      { password: newPassword },
    );

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update password",
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, avatar, address } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (avatar) updates.avatar = avatar;
    if (address) {
      if (address.street) updates.address_street = address.street;
      if (address.city) updates.address_city = address.city;
      if (address.state) updates.address_state = address.state;
      if (address.zipCode) updates.address_zip_code = address.zipCode;
      if (address.country) updates.address_country = address.country;
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      user: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        avatar: profile.avatar,
        phone: profile.phone,
        isVerified: profile.is_verified,
        address: {
          street: profile.address_street,
          city: profile.address_city,
          state: profile.address_state,
          zipCode: profile.address_zip_code,
          country: profile.address_country,
        },
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
});

module.exports = router;
