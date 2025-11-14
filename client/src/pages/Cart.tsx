import { Link, Navigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  SparklesIcon, 
  StarIcon, 
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const Cart = () => {
  const { isAuthenticated } = useAuthStore();
  const { items, removeItem, updateQuantity, getTotal, getItemCount } =
    useCartStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast.error("Please login to view your cart");
    return <Navigate to="/login" replace />;
  }

  const handleUpdateQuantity = (
    productId: string,
    color: string,
    size: string,
    newQuantity: number
  ) => {
    if (newQuantity === 0) {
      removeItem(productId, color, size);
      toast.success("Item removed from cart");
    } else {
      updateQuantity(productId, color, size, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, color: string, size: string) => {
    removeItem(productId, color, size);
    toast.success("Item removed from cart");
  };

  if (items.length === 0) {
    return (
      <>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(1deg); }
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
              box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
              transform: scale(1.02);
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
        `}</style>

        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/3 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }}></div>
          </div>

          <div className="container mx-auto px-6 py-20 relative z-10">
            <div className="glass-effect premium-shadow rounded-3xl p-16 text-center max-w-2xl mx-auto">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-gradient-to-r from-gray-500 to-gray-700 rounded-2xl blur-lg opacity-20"></div>
                <div className="relative w-24 h-24 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl flex items-center justify-center mx-auto">
                  <ShoppingBagIcon className="w-12 h-12 text-white" />
                </div>
                <SparklesIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-sparkle" />
              </div>
              
              <div className="inline-flex items-center space-x-3 mb-6">
                <SparklesIcon className="w-8 h-8 text-primary-600 animate-sparkle" />
                <span className="text-primary-600 font-bold text-xl tracking-wider uppercase">Shopping Cart</span>
                <StarIcon className="w-7 h-7 text-yellow-500 animate-sparkle" style={{ animationDelay: "1s" }} />
              </div>
              
              <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent gradient-animate">
                Your Cart is Empty
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. Start shopping to discover our amazing collection!
              </p>
              
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 shimmer-effect"
              >
                <span className="relative z-10 flex items-center">
                  <span className="mr-3">✨</span>
                  Start Shopping
                  <ArrowLeftIcon className="w-5 h-5 ml-3 group-hover:-translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

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

      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/3 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>

        <div className="container mx-auto px-6 py-12 relative z-10">
          {/* Premium Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-primary-600 animate-sparkle" />
              <span className="text-primary-600 font-bold text-xl tracking-wider uppercase">Shopping Cart</span>
              <StarIcon className="w-7 h-7 text-yellow-500 animate-sparkle" style={{ animationDelay: "1s" }} />
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent gradient-animate">
              Your Cart
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Review your items and proceed to checkout
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="glass-effect premium-shadow rounded-3xl overflow-hidden">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    className={`flex gap-6 p-8 ${index !== items.length - 1 ? 'border-b border-gray-200/50 dark:border-gray-700/50' : ''} hover:bg-white/5 dark:hover:bg-black/5 transition-all duration-300 group`}
                  >
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.productId}`}
                      className="flex-shrink-0 group/image"
                    >
                      <div className="relative">
                        <img
                          src={
                            typeof item.image === "string"
                              ? item.image
                              : (item.image as any)?.url ||
                                "https://via.placeholder.com/150"
                          }
                          alt={item.name}
                          className="w-32 h-32 object-cover rounded-2xl shadow-lg group-hover/image:scale-105 transition-all duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1">
                      <Link
                        to={`/products/${item.productId}`}
                        className="group/info block"
                      >
                        <h3 className="font-black text-2xl mb-3 text-gray-900 dark:text-white group-hover/info:text-primary-600 dark:group-hover/info:text-primary-400 transition-colors duration-300">
                          {item.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="glass-effect rounded-xl px-4 py-2">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Color</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.color}</p>
                        </div>
                        <div className="glass-effect rounded-xl px-4 py-2">
                          <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Size</span>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{item.size}</p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Quantity</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                item.color,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="group/minus relative p-3 glass-effect rounded-xl hover:scale-110 transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 rounded-xl opacity-0 group-hover/minus:opacity-100 transition-opacity duration-300"></div>
                            <MinusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover/minus:text-white relative z-10" />
                          </button>
                          
                          <div className="glass-effect rounded-xl px-6 py-3 min-w-[4rem] text-center">
                            <span className="text-xl font-black text-gray-900 dark:text-white">{item.quantity}</span>
                          </div>
                          
                          <button
                            onClick={() =>
                              handleUpdateQuantity(
                                item.productId,
                                item.color,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="group/plus relative p-3 glass-effect rounded-xl hover:scale-110 transition-all duration-300"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 rounded-xl opacity-0 group-hover/plus:opacity-100 transition-opacity duration-300"></div>
                            <PlusIcon className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover/plus:text-white relative z-10" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price and Remove */}
                    <div className="text-right flex flex-col justify-between items-end">
                      <button
                        onClick={() =>
                          handleRemoveItem(item.productId, item.color, item.size)
                        }
                        className="group/remove relative p-3 glass-effect rounded-xl hover:scale-110 transition-all duration-300 mb-4"
                        title="Remove Item"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 rounded-xl opacity-0 group-hover/remove:opacity-100 transition-opacity duration-300"></div>
                        <TrashIcon className="w-6 h-6 text-red-500 group-hover/remove:text-white relative z-10" />
                      </button>
                      
                      <div className="text-right">
                        <p className="text-3xl font-black text-primary-600 dark:text-primary-400 mb-2">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ₱{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="group relative inline-flex items-center justify-center mt-8 px-8 py-4 glass-effect rounded-2xl hover:scale-105 transition-all duration-300 shimmer-effect"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center text-primary-600 group-hover:text-white font-bold">
                  <ArrowLeftIcon className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
                  Continue Shopping
                </span>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-effect premium-shadow rounded-3xl p-8 sticky top-4">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center space-x-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-primary-600 animate-sparkle" />
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order Summary</h2>
                    <StarIcon className="w-5 h-5 text-yellow-500 animate-sparkle" style={{ animationDelay: "1s" }} />
                  </div>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-bold">
                        Subtotal ({getItemCount()} items)
                      </span>
                      <span className="text-xl font-black text-gray-900 dark:text-white">₱{getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-bold flex items-center gap-2">
                        <TruckIcon className="w-5 h-5" />
                        Shipping
                      </span>
                      <span className="text-xl font-black">
                        {getTotal() >= 5000 ? (
                          <span className="text-green-600 animate-pulse-glow">FREE</span>
                        ) : (
                          <span className="text-gray-900 dark:text-white">₱150.00</span>
                        )}
                      </span>
                    </div>
                  </div>
                  
                  <div className="glass-effect rounded-2xl p-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400 font-bold">Tax (12% VAT)</span>
                      <span className="text-xl font-black text-gray-900 dark:text-white">₱{(getTotal() * 0.12).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="glass-effect rounded-2xl p-6 border-2 border-primary-500/20">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-black text-gray-900 dark:text-white">Total</span>
                      <span className="text-3xl font-black bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent gradient-animate">
                        ₱{(
                          getTotal() +
                          (getTotal() >= 5000 ? 0 : 150) +
                          getTotal() * 0.12
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {getTotal() < 5000 && (
                  <div className="glass-effect rounded-2xl p-6 mb-6 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">!</span>
                      </div>
                      <p className="text-blue-600 dark:text-blue-400 font-bold">
                        Add ₱{(5000 - getTotal()).toFixed(2)} more to get <span className="text-green-600">FREE shipping!</span>
                      </p>
                    </div>
                  </div>
                )}

                <Link
                  to="/checkout"
                  className="group relative block w-full text-center py-4 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 shimmer-effect mb-8"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <span className="mr-3">🚀</span>
                    Proceed to Checkout
                    <ArrowLeftIcon className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
                </Link>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 glass-effect rounded-xl">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <TruckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-bold">Free shipping on orders over ₱5,000</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 glass-effect rounded-xl">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-bold">30-day return policy</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 glass-effect rounded-xl">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <ShieldCheckIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 font-bold">Secure checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
