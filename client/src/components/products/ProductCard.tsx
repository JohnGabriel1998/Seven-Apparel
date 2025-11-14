import { Link } from "react-router-dom";
import {
  HeartIcon as HeartOutline,
  ShoppingCartIcon,
  SparklesIcon,
  StarIcon,
  EyeIcon,
  PlusIcon,
  XCircleIcon,
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
  const { isAuthenticated, user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const isInWishlist = wishlistItems.includes(product._id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdmin) {
      toast.error("Admins cannot use wishlist");
      return;
    }
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

    if (isAdmin) {
      toast.error("Admins cannot add to cart");
      return;
    }
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
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(1deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0);
            transform: scale(1.05);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glass-effect {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .premium-shadow {
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }
        .dark .premium-shadow {
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        .shimmer-effect:hover::before {
          animation: shimmer 0.6s ease-in-out;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.05) rotate(5deg); }
          70% { transform: scale(0.9) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
      
      <div
        className={`group relative glass-effect premium-shadow rounded-3xl overflow-hidden hover:scale-[1.03] transition-all duration-500 ${className}`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-2xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/5 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }}></div>
        </div>

        {/* Image Container */}
        <div className="relative overflow-hidden aspect-square">
          <Link
            to={`/products/${product._id}`}
            className="block w-full h-full"
          >
            <img
              src={getImage()}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
              loading="lazy"
            />
          </Link>

          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>

          {/* Action Buttons Overlay (hide cart for admin) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
            <div className="flex gap-3 transform translate-y-8 group-hover:translate-y-0 transition-all duration-500">
              {!isAdmin && (
                <button
                  onClick={handleQuickAdd}
                  disabled={!inStock}
                  className="group/btn relative p-4 glass-effect rounded-2xl hover:scale-110 transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                  title={inStock ? "Quick Add to Cart" : "Out of Stock"}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <ShoppingCartIcon className="w-6 h-6 text-white relative z-10 group-hover/btn:animate-bounce-in" />
                </button>
              )}
              <Link
                to={`/products/${product._id}`}
                className="group/view relative p-4 glass-effect rounded-2xl hover:scale-110 transition-all duration-300 shadow-2xl"
                title="View Details"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl opacity-0 group-hover/view:opacity-100 transition-opacity duration-300"></div>
                <EyeIcon className="w-6 h-6 text-white relative z-10 group-hover/view:animate-bounce-in" />
              </Link>
            </div>
          </div>

          {/* Stock Badge */}
          {!inStock && (
            <div className="absolute top-4 left-4 px-4 py-2 glass-effect rounded-2xl">
              <div className="flex items-center gap-2">
                <XCircleIcon className="w-4 h-4 text-red-500" />
                <span className="text-sm font-bold text-red-500">Out of Stock</span>
              </div>
            </div>
          )}

          {/* Premium Wishlist Button (hidden for admin) */}
          {!isAdmin && (
            <button
              onClick={toggleWishlist}
              className="absolute top-4 right-4 p-3 glass-effect rounded-2xl hover:scale-110 transition-all duration-300 z-10 group/heart"
              title={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl opacity-0 group-hover/heart:opacity-100 transition-opacity duration-300"></div>
              {isInWishlist ? (
                <HeartSolid className="w-6 h-6 text-red-500 relative z-10 group-hover/heart:text-white animate-pulse-glow" />
              ) : (
                <HeartOutline className="w-6 h-6 text-white relative z-10 group-hover/heart:text-white" />
              )}
            </button>
          )}

          {/* Sparkle Effects */}
          <SparklesIcon className="absolute top-4 left-1/2 w-5 h-5 text-yellow-400 animate-sparkle opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <StarIcon className="absolute bottom-4 right-1/4 w-4 h-4 text-yellow-400 animate-sparkle opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ animationDelay: "1s" }} />
        </div>

        {/* Premium Product Info */}
        <div className="p-6 relative z-10">
          <Link to={`/products/${product._id}`} className="block group/info">
            {/* Brand */}
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-4 h-4 text-primary-600 animate-sparkle" />
              <p className="text-xs text-primary-600 font-bold uppercase tracking-wider">
                {product.brand}
              </p>
            </div>

            {/* Product Name */}
            <h3 className="font-black text-lg mb-4 text-gray-900 dark:text-white group-hover/info:text-primary-600 dark:group-hover/info:text-primary-400 transition-colors duration-300 line-clamp-2 min-h-[3.5rem] leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Rating and Price Section */}
          <div className="mb-4">
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <svg
                  className="w-5 h-5 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                  {product.rating?.average?.toFixed(1) || "0.0"}
                </span>
              </div>
              <StarIcon className="w-4 h-4 text-yellow-400 animate-sparkle" style={{ animationDelay: "0.5s" }} />
            </div>

            {/* Price */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent gradient-animate">
                ₱{product.price.toFixed(2)}
              </span>
              {inStock && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-glow"></div>
                  <span className="text-sm font-bold">In Stock</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Badge */}
          <div className="flex justify-between items-center">
            <span className="inline-block px-4 py-2 glass-effect rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:scale-105 transition-transform duration-300">
              {product.category}
            </span>
            
            {/* Quick Add Button (hidden for admin) */}
            {inStock && !isAdmin && (
              <button
                onClick={handleQuickAdd}
                className="group/add relative inline-flex items-center justify-center p-3 glass-effect rounded-xl hover:scale-110 transition-all duration-300 shimmer-effect"
                title="Quick Add to Cart"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl opacity-0 group-hover/add:opacity-100 transition-opacity duration-300"></div>
                <PlusIcon className="w-5 h-5 text-primary-600 group-hover/add:text-white relative z-10" />
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
