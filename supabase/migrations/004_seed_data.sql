-- =============================================
-- Seed Data for Seven Apparel
-- =============================================

-- Insert sample products
INSERT INTO public.products (
  name, description, price, compare_at_price, category, subcategory, gender, brand,
  colors, sizes, total_stock, material, tags, is_featured, is_new_arrival, is_active
) VALUES
(
  'Classic Cotton T-Shirt',
  'Premium 100% cotton t-shirt with a comfortable relaxed fit. Perfect for everyday wear.',
  29.99, 39.99, 'tops', 't-shirts', 'men', 'Seven Basics',
  '[{"name": "White", "hex": "#FFFFFF"}, {"name": "Black", "hex": "#000000"}, {"name": "Navy", "hex": "#000080"}]'::jsonb,
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  100, '100% Cotton',
  ARRAY['basics', 'casual', 'essential'],
  true, true, true
),
(
  'Slim Fit Denim Jeans',
  'Modern slim fit jeans crafted from premium stretch denim for all-day comfort.',
  79.99, 99.99, 'bottoms', 'jeans', 'men', 'Seven Denim',
  '[{"name": "Dark Blue", "hex": "#00008B"}, {"name": "Light Blue", "hex": "#ADD8E6"}, {"name": "Black", "hex": "#000000"}]'::jsonb,
  ARRAY['28', '30', '32', '34', '36'],
  75, '98% Cotton, 2% Elastane',
  ARRAY['denim', 'casual', 'streetwear'],
  true, false, true
),
(
  'Floral Summer Dress',
  'Elegant floral print dress perfect for summer occasions. Lightweight and flowy.',
  89.99, 119.99, 'dresses', 'midi', 'women', 'Seven Collection',
  '[{"name": "Floral Pink", "hex": "#FFB6C1"}, {"name": "Floral Blue", "hex": "#87CEEB"}]'::jsonb,
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  50, '100% Viscose',
  ARRAY['summer', 'floral', 'elegant'],
  true, true, true
),
(
  'Leather Crossbody Bag',
  'Premium genuine leather crossbody bag with adjustable strap. Perfect for daily use.',
  149.99, 199.99, 'accessories', 'bags', 'women', 'Seven Leather',
  '[{"name": "Tan", "hex": "#D2B48C"}, {"name": "Black", "hex": "#000000"}, {"name": "Brown", "hex": "#8B4513"}]'::jsonb,
  ARRAY[]::text[],
  30, 'Genuine Leather',
  ARRAY['leather', 'accessories', 'bags'],
  true, false, true
),
(
  'Kids Rainbow Hoodie',
  'Fun and colorful hoodie for kids. Soft fleece interior for maximum comfort.',
  39.99, 49.99, 'kids', 'hoodies', 'kids', 'Seven Kids',
  '[{"name": "Rainbow", "hex": "#FF0000"}, {"name": "Purple", "hex": "#800080"}]'::jsonb,
  ARRAY['4', '6', '8', '10', '12'],
  60, '80% Cotton, 20% Polyester',
  ARRAY['kids', 'colorful', 'comfortable'],
  false, true, true
),
(
  'Athletic Performance Shorts',
  'Lightweight moisture-wicking shorts designed for high-performance workouts.',
  44.99, 54.99, 'activewear', 'shorts', 'unisex', 'Seven Active',
  '[{"name": "Black", "hex": "#000000"}, {"name": "Gray", "hex": "#808080"}, {"name": "Blue", "hex": "#0000FF"}]'::jsonb,
  ARRAY['S', 'M', 'L', 'XL'],
  80, '100% Polyester',
  ARRAY['activewear', 'sports', 'workout'],
  false, true, true
),
(
  'Wool Blend Winter Coat',
  'Sophisticated wool blend coat for the cold season. Timeless design with modern fit.',
  249.99, 349.99, 'outerwear', 'coats', 'women', 'Seven Premium',
  '[{"name": "Camel", "hex": "#C19A6B"}, {"name": "Charcoal", "hex": "#36454F"}, {"name": "Burgundy", "hex": "#800020"}]'::jsonb,
  ARRAY['XS', 'S', 'M', 'L', 'XL'],
  25, '70% Wool, 30% Polyester',
  ARRAY['winter', 'premium', 'elegant'],
  true, false, true
),
(
  'Canvas Sneakers',
  'Classic canvas sneakers with comfortable cushioned insole. Versatile everyday footwear.',
  59.99, 79.99, 'shoes', 'sneakers', 'unisex', 'Seven Footwear',
  '[{"name": "White", "hex": "#FFFFFF"}, {"name": "Black", "hex": "#000000"}, {"name": "Red", "hex": "#FF0000"}]'::jsonb,
  ARRAY['6', '7', '8', '9', '10', '11', '12'],
  120, 'Canvas Upper, Rubber Sole',
  ARRAY['sneakers', 'casual', 'classic'],
  false, false, true
);

-- Insert product variants for the first product (Classic Cotton T-Shirt)
INSERT INTO public.product_variants (product_id, color, size, sku, stock)
SELECT 
  p.id,
  c.color,
  s.size,
  'TSH-' || c.color || '-' || s.size,
  10
FROM public.products p
CROSS JOIN (VALUES ('White'), ('Black'), ('Navy')) AS c(color)
CROSS JOIN (VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL')) AS s(size)
WHERE p.name = 'Classic Cotton T-Shirt';

-- Insert a sample coupon
INSERT INTO public.coupons (
  code, description, discount_type, discount_value, min_purchase, max_discount,
  usage_limit, valid_from, valid_until, is_active, is_public
) VALUES
(
  'WELCOME10',
  'Welcome discount - 10% off your first order',
  'percentage', 10, 50, 25,
  1000, NOW(), NOW() + INTERVAL '1 year',
  true, true
),
(
  'SUMMER2026',
  'Summer sale - 20% off all items',
  'percentage', 20, 100, 50,
  500, NOW(), NOW() + INTERVAL '3 months',
  true, true
),
(
  'FREESHIP',
  'Free shipping on orders over $75',
  'fixed', 15, 75, NULL,
  NULL, NOW(), NOW() + INTERVAL '6 months',
  true, true
);

-- Note: Blog posts and reviews would typically be added through the admin interface
-- This seed data provides a starting point for testing the application
