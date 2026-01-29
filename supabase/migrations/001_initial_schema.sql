-- =============================================
-- Seven Apparel - Supabase Database Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar VARCHAR(500) DEFAULT 'https://via.placeholder.com/150',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    google_id VARCHAR(255) UNIQUE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    phone VARCHAR(50),
    
    -- Default address
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_zip_code VARCHAR(20),
    address_country VARCHAR(100),
    
    -- Style preferences
    style_quiz_completed BOOLEAN DEFAULT false,
    style_preference VARCHAR(100),
    preferred_colors TEXT[],
    preferred_sizes TEXT[],
    preferred_brands TEXT[],
    price_range_min DECIMAL(10,2),
    price_range_max DECIMAL(10,2),
    
    -- Password reset
    reset_password_token VARCHAR(255),
    reset_password_expire TIMESTAMPTZ,
    verification_token VARCHAR(255),
    verification_token_expire TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- USER ADDRESSES TABLE
-- =============================================
CREATE TABLE public.user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label VARCHAR(100),
    full_name VARCHAR(255),
    phone VARCHAR(50),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100),
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    compare_at_price DECIMAL(10,2) CHECK (compare_at_price >= 0),
    images JSONB DEFAULT '[]',
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'men', 'women', 'kids', 'accessories', 'tops', 'bottoms', 
        'dresses', 'outerwear', 'shoes', 'activewear'
    )),
    subcategory VARCHAR(100),
    gender VARCHAR(20) NOT NULL CHECK (gender IN ('men', 'women', 'unisex', 'kids', 'male', 'female')),
    brand VARCHAR(100) NOT NULL,
    colors JSONB DEFAULT '[]', -- [{name: string, hex: string}]
    sizes TEXT[] DEFAULT '{}', -- ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']
    total_stock INTEGER DEFAULT 0,
    material VARCHAR(255),
    care_instructions TEXT[],
    size_guide JSONB,
    tags TEXT[],
    
    -- Rating
    rating_average DECIMAL(2,1) DEFAULT 0 CHECK (rating_average >= 0 AND rating_average <= 5),
    rating_count INTEGER DEFAULT 0,
    
    -- Status
    is_featured BOOLEAN DEFAULT false,
    is_new_arrival BOOLEAN DEFAULT false,
    is_best_seller BOOLEAN DEFAULT false,
    is_on_sale BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- SEO
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PRODUCT VARIANTS TABLE
-- =============================================
CREATE TABLE public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    color VARCHAR(100) DEFAULT '',
    size VARCHAR(10),
    sku VARCHAR(100),
    stock INTEGER DEFAULT 0,
    images TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Shipping address
    shipping_full_name VARCHAR(255),
    shipping_phone VARCHAR(50),
    shipping_street VARCHAR(255),
    shipping_address_line_1 VARCHAR(255),
    shipping_address_line_2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_zip_code VARCHAR(20),
    shipping_country VARCHAR(100),
    
    -- Payment
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN (
        'credit_card', 'debit_card', 'gcash', 'paymaya', 'paypal', 'apple_pay', 'cod'
    )),
    payment_result_id VARCHAR(255),
    payment_result_status VARCHAR(50),
    payment_result_email VARCHAR(255),
    
    -- Amounts
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_coupon_code VARCHAR(50),
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
    )),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN (
        'pending', 'paid', 'failed', 'refunded'
    )),
    is_paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMPTZ,
    is_delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    
    -- Tracking
    tracking_number VARCHAR(100),
    carrier VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    name VARCHAR(255),
    image VARCHAR(500),
    color VARCHAR(100),
    size VARCHAR(10),
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CARTS TABLE
-- =============================================
CREATE TABLE public.carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CART ITEMS TABLE
-- =============================================
CREATE TABLE public.cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(500) NOT NULL,
    color VARCHAR(100) NOT NULL,
    size VARCHAR(10) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate items
    UNIQUE(cart_id, product_id, color, size)
);

-- =============================================
-- REVIEWS TABLE
-- =============================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) NOT NULL,
    comment TEXT NOT NULL,
    images TEXT[],
    size VARCHAR(10),
    color VARCHAR(100),
    fit VARCHAR(20) CHECK (fit IN ('runs-small', 'true-to-size', 'runs-large')),
    quality INTEGER CHECK (quality >= 1 AND quality <= 5),
    comfort INTEGER CHECK (comfort >= 1 AND comfort <= 5),
    verified BOOLEAN DEFAULT false,
    helpful INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REVIEW HELPFUL VOTES TABLE
-- =============================================
CREATE TABLE public.review_helpful_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(review_id, user_id)
);

-- =============================================
-- WISHLISTS TABLE
-- =============================================
CREATE TABLE public.wishlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, product_id)
);

-- =============================================
-- COUPONS TABLE
-- =============================================
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
    min_purchase DECIMAL(10,2) DEFAULT 0,
    max_discount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    usage_per_user INTEGER DEFAULT 1,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    applicable_products UUID[],
    applicable_categories TEXT[],
    excluded_products UUID[],
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- COUPON USAGE TABLE
-- =============================================
CREATE TABLE public.coupon_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BLOG POSTS TABLE
-- =============================================
CREATE TABLE public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    featured_image_url VARCHAR(500),
    featured_image_alt VARCHAR(255),
    images TEXT[],
    category VARCHAR(50) NOT NULL CHECK (category IN ('style-tips', 'trends', 'how-to', 'lookbook', 'news')),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    published_at TIMESTAMPTZ,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- BLOG RELATED PRODUCTS TABLE
-- =============================================
CREATE TABLE public.blog_related_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(blog_id, product_id)
);

-- =============================================
-- INDEXES
-- =============================================

-- Products indexes
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_gender ON public.products(gender);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_is_active ON public.products(is_active);
CREATE INDEX idx_products_is_featured ON public.products(is_featured);
CREATE INDEX idx_products_price ON public.products(price);
CREATE INDEX idx_products_rating ON public.products(rating_average);

-- Product variants indexes
CREATE INDEX idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- Cart items indexes
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON public.cart_items(product_id);

-- Reviews indexes
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_status ON public.reviews(status);

-- Wishlists indexes
CREATE INDEX idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX idx_wishlists_product_id ON public.wishlists(product_id);

-- Coupons indexes
CREATE INDEX idx_coupons_code ON public.coupons(code);
CREATE INDEX idx_coupons_is_active ON public.coupons(is_active);

-- Blog posts indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX idx_blog_posts_category ON public.blog_posts(category);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);

-- User addresses indexes
CREATE INDEX idx_user_addresses_user_id ON public.user_addresses(user_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = 'SA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
            LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update product rating
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(2,1);
    review_count INTEGER;
BEGIN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    AND status = 'approved';
    
    UPDATE public.products
    SET rating_average = COALESCE(avg_rating, 0),
        rating_count = COALESCE(review_count, 0),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update product total stock
CREATE OR REPLACE FUNCTION update_product_total_stock()
RETURNS TRIGGER AS $$
DECLARE
    new_total_stock INTEGER;
BEGIN
    SELECT COALESCE(SUM(stock), 0)
    INTO new_total_stock
    FROM public.product_variants
    WHERE product_id = COALESCE(NEW.product_id, OLD.product_id);
    
    UPDATE public.products
    SET total_stock = new_total_stock,
        updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://via.placeholder.com/150')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGERS
-- =============================================

-- Update timestamps triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at
    BEFORE UPDATE ON public.user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at
    BEFORE UPDATE ON public.carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Order number generation trigger
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Product rating update triggers
CREATE TRIGGER update_product_rating_on_insert
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_product_rating_on_update
    AFTER UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_product_rating_on_delete
    AFTER DELETE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Product stock update triggers
CREATE TRIGGER update_product_stock_on_insert
    AFTER INSERT ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_product_total_stock();

CREATE TRIGGER update_product_stock_on_update
    AFTER UPDATE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_product_total_stock();

CREATE TRIGGER update_product_stock_on_delete
    AFTER DELETE ON public.product_variants
    FOR EACH ROW EXECUTE FUNCTION update_product_total_stock();

-- Create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_related_products ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- User addresses policies
CREATE POLICY "Users can manage their own addresses"
    ON public.user_addresses FOR ALL
    USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Anyone can view active products"
    ON public.products FOR SELECT
    USING (is_active = true);

CREATE POLICY "Admins can manage products"
    ON public.products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Product variants policies
CREATE POLICY "Anyone can view product variants"
    ON public.product_variants FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.products
            WHERE id = product_id AND is_active = true
        )
    );

CREATE POLICY "Admins can manage product variants"
    ON public.product_variants FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
    ON public.orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Order items policies
CREATE POLICY "Users can view their own order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create order items for their orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE id = order_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all order items"
    ON public.order_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Cart policies
CREATE POLICY "Users can manage their own cart"
    ON public.carts FOR ALL
    USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can manage their own cart items"
    ON public.cart_items FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.carts
            WHERE id = cart_id AND user_id = auth.uid()
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews"
    ON public.reviews FOR SELECT
    USING (status = 'approved');

CREATE POLICY "Users can view their own reviews"
    ON public.reviews FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
    ON public.reviews FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Review helpful votes policies
CREATE POLICY "Users can manage their own votes"
    ON public.review_helpful_votes FOR ALL
    USING (auth.uid() = user_id);

-- Wishlists policies
CREATE POLICY "Users can manage their own wishlist"
    ON public.wishlists FOR ALL
    USING (auth.uid() = user_id);

-- Coupons policies
CREATE POLICY "Anyone can view public active coupons"
    ON public.coupons FOR SELECT
    USING (is_active = true AND is_public = true);

CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Coupon usage policies
CREATE POLICY "Users can view their own coupon usage"
    ON public.coupon_usage FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create coupon usage"
    ON public.coupon_usage FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all coupon usage"
    ON public.coupon_usage FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Blog posts policies
CREATE POLICY "Anyone can view published blog posts"
    ON public.blog_posts FOR SELECT
    USING (status = 'published');

CREATE POLICY "Admins can manage blog posts"
    ON public.blog_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Blog related products policies
CREATE POLICY "Anyone can view blog related products"
    ON public.blog_related_products FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.blog_posts
            WHERE id = blog_id AND status = 'published'
        )
    );

CREATE POLICY "Admins can manage blog related products"
    ON public.blog_related_products FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
