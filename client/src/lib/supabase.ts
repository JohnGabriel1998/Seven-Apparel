import { createClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// =============================================
// AUTH HELPERS
// =============================================

// Sign up with email and password
export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });
  return { data, error };
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// Sign in with Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

// Reset password
export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
};

// Update password
export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
};

// =============================================
// PROFILE HELPERS
// =============================================

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  phone?: string;
  is_active: boolean;
  is_verified: boolean;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  address_country?: string;
  style_quiz_completed: boolean;
  style_preference?: string;
  preferred_colors?: string[];
  preferred_sizes?: string[];
  preferred_brands?: string[];
  price_range_min?: number;
  price_range_max?: number;
  created_at: string;
  updated_at: string;
}

// Get user profile
export const getProfile = async (userId: string): Promise<{ data: Profile | null; error: any }> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

// Update user profile
export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

// =============================================
// PRODUCTS HELPERS
// =============================================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: any[];
  category: string;
  subcategory?: string;
  gender: string;
  brand: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  total_stock: number;
  material?: string;
  care_instructions?: string[];
  size_guide?: any;
  tags?: string[];
  rating_average: number;
  rating_count: number;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_on_sale: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  size: string;
  sku?: string;
  stock: number;
  images?: string[];
}

// Get all products with filters
export const getProducts = async (filters?: {
  category?: string;
  gender?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('is_active', true);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.gender) {
    query = query.eq('gender', filters.gender);
  }
  if (filters?.brand) {
    query = query.eq('brand', filters.brand);
  }
  if (filters?.minPrice) {
    query = query.gte('price', filters.minPrice);
  }
  if (filters?.maxPrice) {
    query = query.lte('price', filters.maxPrice);
  }
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }
  if (filters?.sortBy) {
    query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' });
  } else {
    query = query.order('created_at', { ascending: false });
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  return { data, error, count };
};

// Get single product by ID
export const getProduct = async (id: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', id)
    .single();
  return { data, error };
};

// Get featured products
export const getFeaturedProducts = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(limit);
  return { data, error };
};

// Get new arrivals
export const getNewArrivals = async (limit = 8) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

// =============================================
// CART HELPERS
// =============================================

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

// Get user's cart
export const getCart = async (userId: string) => {
  // First get or create cart
  let { data: cart, error } = await supabase
    .from('carts')
    .select('*, cart_items(*)')
    .eq('user_id', userId)
    .single();

  if (error && error.code === 'PGRST116') {
    // Cart doesn't exist, create one
    const { data: newCart, error: createError } = await supabase
      .from('carts')
      .insert({ user_id: userId })
      .select('*, cart_items(*)')
      .single();
    
    return { data: newCart, error: createError };
  }

  return { data: cart, error };
};

// Add item to cart
export const addToCart = async (
  userId: string,
  item: {
    product_id: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }
) => {
  // Get or create cart
  const { data: cart } = await getCart(userId);
  if (!cart) return { data: null, error: new Error('Could not get cart') };

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cart.id)
    .eq('product_id', item.product_id)
    .eq('color', item.color)
    .eq('size', item.size)
    .single();

  if (existingItem) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + item.quantity })
      .eq('id', existingItem.id)
      .select()
      .single();
    return { data, error };
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({ ...item, cart_id: cart.id })
      .select()
      .single();
    return { data, error };
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId: string, quantity: number) => {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single();
  return { data, error };
};

// Remove item from cart
export const removeFromCart = async (itemId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);
  return { error };
};

// Clear cart
export const clearCart = async (cartId: string) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);
  return { error };
};

// =============================================
// WISHLIST HELPERS
// =============================================

// Get user's wishlist
export const getWishlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', userId);
  return { data, error };
};

// Add to wishlist
export const addToWishlist = async (userId: string, productId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .insert({ user_id: userId, product_id: productId })
    .select()
    .single();
  return { data, error };
};

// Remove from wishlist
export const removeFromWishlist = async (userId: string, productId: string) => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);
  return { error };
};

// Check if product is in wishlist
export const isInWishlist = async (userId: string, productId: string) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();
  return { isInWishlist: !!data, error };
};

// =============================================
// ORDER HELPERS
// =============================================

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address_line_1: string;
  shipping_address_line_2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_country: string;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  discount_coupon_code?: string;
  shipping_cost: number;
  tax: number;
  total: number;
  status: string;
  payment_status: string;
  is_paid: boolean;
  paid_at?: string;
  is_delivered: boolean;
  delivered_at?: string;
  tracking_number?: string;
  carrier?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

// Get user's orders
export const getOrders = async (userId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

// Get single order
export const getOrder = async (orderId: string) => {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();
  return { data, error };
};

// Create order
export const createOrder = async (
  userId: string,
  orderData: Partial<Order>,
  items: Omit<OrderItem, 'id' | 'order_id'>[]
) => {
  // Insert order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ ...orderData, user_id: userId })
    .select()
    .single();

  if (orderError) return { data: null, error: orderError };

  // Insert order items
  const orderItems = items.map(item => ({ ...item, order_id: order.id }));
  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    .select();

  if (itemsError) return { data: null, error: itemsError };

  return { data: { ...order, order_items: insertedItems }, error: null };
};

// =============================================
// REVIEW HELPERS
// =============================================

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  size?: string;
  color?: string;
  fit?: string;
  quality?: number;
  comfort?: number;
  verified: boolean;
  helpful: number;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

// Get product reviews
export const getProductReviews = async (productId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(name, avatar)')
    .eq('product_id', productId)
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  return { data, error };
};

// Create review
export const createReview = async (
  userId: string,
  reviewData: {
    product_id: string;
    rating: number;
    title: string;
    comment: string;
    images?: string[];
    size?: string;
    color?: string;
    fit?: string;
    quality?: number;
    comfort?: number;
  }
) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ ...reviewData, user_id: userId })
    .select()
    .single();
  return { data, error };
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId: string, userId: string) => {
  // Add vote
  const { error: voteError } = await supabase
    .from('review_helpful_votes')
    .insert({ review_id: reviewId, user_id: userId });

  if (voteError) return { error: voteError };

  // Increment helpful count
  const { data, error } = await supabase.rpc('increment_review_helpful', {
    review_id: reviewId,
  });

  return { data, error };
};

// =============================================
// COUPON HELPERS
// =============================================

// Validate coupon
export const validateCoupon = async (code: string, cartTotal: number) => {
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('is_active', true)
    .single();

  if (error || !coupon) {
    return { valid: false, error: 'Invalid coupon code' };
  }

  const now = new Date();
  if (new Date(coupon.valid_from) > now || new Date(coupon.valid_until) < now) {
    return { valid: false, error: 'Coupon has expired' };
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }

  if (cartTotal < coupon.min_purchase) {
    return { valid: false, error: `Minimum purchase of $${coupon.min_purchase} required` };
  }

  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (cartTotal * coupon.discount_value) / 100;
    if (coupon.max_discount) {
      discount = Math.min(discount, coupon.max_discount);
    }
  } else {
    discount = coupon.discount_value;
  }

  return { valid: true, coupon, discount };
};

// =============================================
// BLOG HELPERS
// =============================================

// Get blog posts
export const getBlogPosts = async (filters?: {
  category?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('blog_posts')
    .select('*, profiles(name, avatar)')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.limit) {
    query = query.limit(filters.limit);
  }
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
  }

  const { data, error } = await query;
  return { data, error };
};

// Get blog post by slug
export const getBlogPost = async (slug: string) => {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*, profiles(name, avatar), blog_related_products(products(*))')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  return { data, error };
};

// Increment blog view count
export const incrementBlogViews = async (blogId: string) => {
  const { error } = await supabase.rpc('increment_blog_views', {
    blog_id: blogId,
  });
  return { error };
};

// =============================================
// STORAGE HELPERS
// =============================================

// Upload file to storage
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
  return { data, error };
};

// Get public URL for file
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Delete file from storage
export const deleteFile = async (bucket: string, path: string) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  return { error };
};

// =============================================
// REALTIME SUBSCRIPTIONS
// =============================================

// Subscribe to order status changes
export const subscribeToOrderStatus = (
  orderId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      callback
    )
    .subscribe();
};

// Subscribe to cart changes
export const subscribeToCart = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel(`cart-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cart_items',
      },
      callback
    )
    .subscribe();
};

export type { User, Session };
