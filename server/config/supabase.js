const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("⚠️  Supabase environment variables not configured");
}

// Service role client for admin operations (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Anon client for regular operations (respects RLS)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});

// Helper function to get authenticated client for a user
const getAuthenticatedClient = (accessToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
};

// Verify Supabase JWT token
const verifySupabaseToken = async (token) => {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Token verification error:", error.message);
    return null;
  }
};

// Get user profile with role
const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Get user profile error:", error.message);
    return null;
  }
};

module.exports = {
  supabase,
  supabaseAdmin,
  getAuthenticatedClient,
  verifySupabaseToken,
  getUserProfile,
};
