import { Link } from "react-router-dom";
import {
  HeartIcon as HeartOutline,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[] | any[];
    category: string;
    brand: string;
    rating?: { average: number };
    totalStock?: number;
    variants?: any[];
  };
  className?: string;
}

export const ProductCard = ({ product, className = "" }: ProductCardProps) => {
  const {
    items: wishlistItems,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const isInWishlist = wishlistItems.includes(product._id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInWishlist) {
      removeFromWishlist(product._id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product._id);
      toast.success("Added to wishlist");
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    // Get first available variant
    const firstVariant = product.variants?.[0];
    if (!firstVariant) {
      toast.error("Product variant not available");
      return;
    }

    try {
      await addToCart(product as any, firstVariant.color, firstVariant.size, 1);
      toast.success("Added to cart!");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const getImage = () => {
    if (!product.images || product.images.length === 0) {
      return "https://via.placeholder.com/400";
    }

    const firstImage = product.images[0];
    return typeof firstImage === "string"
      ? firstImage
      : (firstImage as any)?.url || "https://via.placeholder.com/400";
  };

  const inStock = (product.totalStock || 0) > 0;

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Image Container */}
      <Link
        to={`/products/${product._id}`}
        className="block relative overflow-hidden aspect-square"
      >
        <img
          src={getImage()}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleQuickAdd}
              disabled={!inStock}
              className="p-3 bg-white text-gray-900 rounded-full hover:bg-primary-600 hover:text-white transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              title={inStock ? "Quick Add to Cart" : "Out of Stock"}
            >
              <ShoppingCartIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stock Badge */}
        {!inStock && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full shadow-lg">
            Out of Stock
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 z-10"
        >
          {isInWishlist ? (
            <HeartSolid className="w-5 h-5 text-red-500" />
          ) : (
            <HeartOutline className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          {/* Brand */}
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
            {product.brand}
          </p>

          {/* Product Name */}
          <h3 className="font-semibold text-base md:text-lg mb-2 hover:text-primary-600 dark:hover:text-primary-400 transition-colors line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
        </Link>

        {/* Rating and Price Row */}
        <div className="flex items-center justify-between mt-3">
          {/* Rating */}
          <div className="flex items-center gap-1">
            <svg
              className="w-4 h-4 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {product.rating?.average?.toFixed(1) || "0.0"}
            </span>
          </div>

          {/* Price */}
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
            ₱{product.price.toFixed(2)}
          </span>
        </div>

        {/* Category Badge */}
        <div className="mt-3">
          <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
            {product.category}
          </span>
        </div>
      </div>
    </div>
  );
};
