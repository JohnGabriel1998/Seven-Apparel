export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive?: boolean;
  avatar?: string;
  addresses?: Address[];
  wishlist?: string[];
  stylePreferences?: StylePreferences;
}

export interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface StylePreferences {
  quiz_completed: boolean;
  style?: string;
  colors?: string[];
  sizes?: string[];
  brands?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: { url: string; alt: string }[];
  category: string;
  subcategory?: string;
  gender: 'men' | 'women' | 'unisex' | 'kids';
  brand: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  variants: ProductVariant[];
  totalStock: number;
  material?: string;
  careInstructions?: string[];
  tags?: string[];
  rating: {
    average: number;
    count: number;
  };
  reviews?: Review[];
  isFeatured?: boolean;
  createdAt: string;
}

export interface ProductVariant {
  color: { name: string; hex: string };
  size: string;
  sku: string;
  stock: number;
  images?: string[];
}

export interface CartItem {
  productId: string;
  product: Product;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  subtotal: number;
  discount: {
    amount: number;
    couponCode?: string;
  };
  shippingCost: number;
  tax: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  trackingNumber?: string;
  shippingMethod: 'standard' | 'express';
  estimatedDelivery?: string;
  createdAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  size?: string;
  color?: string;
  fit?: 'runs-small' | 'true-to-size' | 'runs-large';
  quality?: number;
  comfort?: number;
  verified: boolean;
  helpful: number;
  status: string;
  createdAt: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
  };
  excerpt: string;
  content: string;
  featuredImage: {
    url: string;
    alt: string;
  };
  category: string;
  tags: string[];
  status: string;
  publishedAt: string;
  viewCount: number;
  relatedProducts?: Product[];
}

export interface Coupon {
  code: string;
  discount: number;
  description: string;
}
