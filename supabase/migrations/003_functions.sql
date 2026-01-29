-- =============================================
-- Database Functions for Seven Apparel
-- =============================================

-- Function to increment review helpful count
CREATE OR REPLACE FUNCTION increment_review_helpful(review_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.reviews
  SET helpful = helpful + 1
  WHERE id = review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment blog view count
CREATE OR REPLACE FUNCTION increment_blog_views(blog_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product stock by variant
CREATE OR REPLACE FUNCTION get_product_stock(
  p_product_id UUID,
  p_color VARCHAR DEFAULT NULL,
  p_size VARCHAR DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  IF p_color IS NULL AND p_size IS NULL THEN
    SELECT total_stock INTO v_stock
    FROM public.products
    WHERE id = p_product_id;
  ELSE
    SELECT COALESCE(SUM(stock), 0) INTO v_stock
    FROM public.product_variants
    WHERE product_id = p_product_id
      AND (p_color IS NULL OR color = p_color)
      AND (p_size IS NULL OR size = p_size);
  END IF;
  
  RETURN COALESCE(v_stock, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrease product stock
CREATE OR REPLACE FUNCTION decrease_product_stock(
  p_product_id UUID,
  p_color VARCHAR,
  p_size VARCHAR,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_stock INTEGER;
BEGIN
  SELECT stock INTO v_current_stock
  FROM public.product_variants
  WHERE product_id = p_product_id
    AND color = p_color
    AND size = p_size
  FOR UPDATE;
  
  IF v_current_stock IS NULL OR v_current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  
  UPDATE public.product_variants
  SET stock = stock - p_quantity
  WHERE product_id = p_product_id
    AND color = p_color
    AND size = p_size;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get order statistics for analytics
CREATE OR REPLACE FUNCTION get_order_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_orders BIGINT,
  total_revenue DECIMAL,
  average_order_value DECIMAL,
  orders_by_status JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_orders,
    COALESCE(SUM(total), 0)::DECIMAL as total_revenue,
    COALESCE(AVG(total), 0)::DECIMAL as average_order_value,
    (
      SELECT jsonb_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM public.orders
        WHERE created_at BETWEEN start_date AND end_date
        GROUP BY status
      ) s
    )::JSONB as orders_by_status
  FROM public.orders
  WHERE created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top selling products
CREATE OR REPLACE FUNCTION get_top_selling_products(
  limit_count INTEGER DEFAULT 10,
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR,
  total_sold BIGINT,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    oi.product_id,
    MAX(oi.name)::VARCHAR as product_name,
    SUM(oi.quantity)::BIGINT as total_sold,
    SUM(oi.price * oi.quantity)::DECIMAL as total_revenue
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  WHERE o.created_at BETWEEN start_date AND end_date
    AND o.status NOT IN ('cancelled', 'refunded')
  GROUP BY oi.product_id
  ORDER BY total_sold DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get revenue by category
CREATE OR REPLACE FUNCTION get_revenue_by_category(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  category VARCHAR,
  total_revenue DECIMAL,
  order_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.category::VARCHAR,
    SUM(oi.price * oi.quantity)::DECIMAL as total_revenue,
    COUNT(DISTINCT o.id)::BIGINT as order_count
  FROM public.order_items oi
  JOIN public.orders o ON o.id = oi.order_id
  JOIN public.products p ON p.id = oi.product_id
  WHERE o.created_at BETWEEN start_date AND end_date
    AND o.status NOT IN ('cancelled', 'refunded')
  GROUP BY p.category
  ORDER BY total_revenue DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check coupon usage for a user
CREATE OR REPLACE FUNCTION check_user_coupon_usage(
  p_coupon_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_usage_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_usage_count
  FROM public.coupon_usage
  WHERE coupon_id = p_coupon_id
    AND user_id = p_user_id;
  
  RETURN COALESCE(v_usage_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply coupon
CREATE OR REPLACE FUNCTION apply_coupon(
  p_code VARCHAR,
  p_user_id UUID,
  p_cart_total DECIMAL
)
RETURNS TABLE (
  success BOOLEAN,
  discount DECIMAL,
  coupon_id UUID,
  error_message TEXT
) AS $$
DECLARE
  v_coupon RECORD;
  v_user_usage INTEGER;
  v_discount DECIMAL;
BEGIN
  -- Get coupon
  SELECT * INTO v_coupon
  FROM public.coupons
  WHERE code = UPPER(p_code)
    AND is_active = true;
  
  IF v_coupon IS NULL THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, NULL::UUID, 'Invalid coupon code'::TEXT;
    RETURN;
  END IF;
  
  -- Check validity dates
  IF NOW() < v_coupon.valid_from OR NOW() > v_coupon.valid_until THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, NULL::UUID, 'Coupon has expired'::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limit
  IF v_coupon.usage_limit IS NOT NULL AND v_coupon.used_count >= v_coupon.usage_limit THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, NULL::UUID, 'Coupon usage limit reached'::TEXT;
    RETURN;
  END IF;
  
  -- Check user usage
  v_user_usage := check_user_coupon_usage(v_coupon.id, p_user_id);
  IF v_user_usage >= v_coupon.usage_per_user THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, NULL::UUID, 'You have already used this coupon'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum purchase
  IF p_cart_total < v_coupon.min_purchase THEN
    RETURN QUERY SELECT FALSE, 0::DECIMAL, NULL::UUID, 
      ('Minimum purchase of $' || v_coupon.min_purchase || ' required')::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount
  IF v_coupon.discount_type = 'percentage' THEN
    v_discount := (p_cart_total * v_coupon.discount_value) / 100;
    IF v_coupon.max_discount IS NOT NULL AND v_discount > v_coupon.max_discount THEN
      v_discount := v_coupon.max_discount;
    END IF;
  ELSE
    v_discount := v_coupon.discount_value;
  END IF;
  
  RETURN QUERY SELECT TRUE, v_discount, v_coupon.id, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record coupon usage
CREATE OR REPLACE FUNCTION record_coupon_usage(
  p_coupon_id UUID,
  p_user_id UUID,
  p_order_id UUID
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.coupon_usage (coupon_id, user_id, order_id)
  VALUES (p_coupon_id, p_user_id, p_order_id);
  
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE id = p_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convert to lowercase, replace spaces with hyphens, remove special chars
  base_slug := LOWER(TRIM(title));
  base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9\s-]', '', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '\s+', '-', 'g');
  base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  
  final_slug := base_slug;
  
  -- Check for uniqueness in blog_posts
  WHILE EXISTS (SELECT 1 FROM public.blog_posts WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to search products with full text
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  p_category VARCHAR DEFAULT NULL,
  p_gender VARCHAR DEFAULT NULL,
  p_min_price DECIMAL DEFAULT NULL,
  p_max_price DECIMAL DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  compare_at_price DECIMAL,
  images JSONB,
  category VARCHAR,
  gender VARCHAR,
  brand VARCHAR,
  rating_average DECIMAL,
  rating_count INTEGER,
  is_featured BOOLEAN,
  is_new_arrival BOOLEAN,
  is_on_sale BOOLEAN,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.compare_at_price,
    p.images,
    p.category,
    p.gender,
    p.brand,
    p.rating_average,
    p.rating_count,
    p.is_featured,
    p.is_new_arrival,
    p.is_on_sale,
    ts_rank(
      to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.brand, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM public.products p
  WHERE p.is_active = true
    AND (
      search_query IS NULL OR search_query = '' OR
      to_tsvector('english', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '') || ' ' || COALESCE(p.brand, ''))
      @@ plainto_tsquery('english', search_query)
      OR p.name ILIKE '%' || search_query || '%'
      OR p.brand ILIKE '%' || search_query || '%'
    )
    AND (p_category IS NULL OR p.category = p_category)
    AND (p_gender IS NULL OR p.gender = p_gender)
    AND (p_min_price IS NULL OR p.price >= p_min_price)
    AND (p_max_price IS NULL OR p.price <= p_max_price)
  ORDER BY rank DESC, p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
