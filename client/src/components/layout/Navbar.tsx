import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  ShoppingCartIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";

export const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 300);
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsDropdownOpen(false);
    }, 200);
  };

  return (
    <>
      <style>{`
        @keyframes bounce-cart {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.1); }
        }
        .animate-bounce-cart:hover {
          animation: bounce-cart 0.6s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
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
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
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
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
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
      `}</style>

      <nav className="glass-effect premium-shadow sticky top-0 z-50 border-b border-white/20 dark:border-gray-700/30">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-24">
            {/* Logo - Premium Design */}
            <Link to="/" className="relative group flex items-center space-x-4">
              {/* Animated Number "7" with Enhanced Effects */}
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-700 rounded-2xl blur-lg opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse-glow"></div>
                <div className="relative bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/30">
                  <span className="text-6xl font-black bg-gradient-to-br from-primary-600 via-purple-600 to-primary-800 bg-clip-text text-transparent gradient-animate">
                    7
                  </span>
                  {/* Sparkle Effects */}
                  <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-sparkle" />
                  <StarIcon className="absolute -bottom-1 -left-1 w-3 h-3 text-primary-400 animate-sparkle" style={{ animationDelay: "1s" }} />
                </div>
              </div>

              {/* Brand Name with Premium Styling */}
              <div className="flex flex-col">
                <span className="text-3xl font-black tracking-tight bg-gradient-to-r from-gray-900 via-primary-700 to-gray-900 dark:from-white dark:via-primary-300 dark:to-white bg-clip-text text-transparent shimmer-effect">
                  SEVEN
                </span>
                <span className="text-sm font-bold tracking-[0.3em] text-primary-600 dark:text-primary-400 uppercase -mt-1 bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                  APPAREL
                </span>
              </div>

              {/* Enhanced Decorative Elements */}
              <div className="absolute -top-3 -right-3 w-4 h-4 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full animate-float opacity-70 shadow-lg"></div>
              <div
                className="absolute -bottom-2 -left-2 w-3 h-3 bg-gradient-to-br from-purple-500 to-primary-600 rounded-full animate-float opacity-50 shadow-lg"
                style={{ animationDelay: "1.5s" }}
              ></div>
              <div
                className="absolute top-1/2 -right-6 w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-float opacity-60"
                style={{ animationDelay: "0.8s" }}
              ></div>
            </Link>

            {/* Navigation Links - Premium Desktop */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link
                to="/products?gender=women"
                className="px-6 py-3 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 relative group overflow-hidden glass-effect hover:shadow-lg"
              >
                <span className="relative z-10">Women</span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500 group-hover:w-full transition-all duration-500"></div>
              </Link>
              <Link
                to="/products?gender=men"
                className="px-6 py-3 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 relative group overflow-hidden glass-effect hover:shadow-lg"
              >
                <span className="relative z-10">Men</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-500"></div>
              </Link>
              <Link
                to="/products?tags=new-arrival"
                className="px-6 py-3 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 relative group overflow-hidden glass-effect hover:shadow-lg"
              >
                <span className="relative z-10">New Arrivals</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-500"></div>
              </Link>
              <Link
                to="/products?tags=sale"
                className="px-6 py-3 rounded-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden group animate-pulse-glow"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <span>Sale</span>
                  <span className="text-lg animate-bounce">🔥</span>
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              </Link>
              <Link
                to="/blog"
                className="px-6 py-3 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:text-white dark:hover:text-white transition-all duration-300 relative group overflow-hidden glass-effect hover:shadow-lg"
              >
                <span className="relative z-10">Blog</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500 group-hover:w-full transition-all duration-500"></div>
              </Link>
            </div>

            {/* Right Icons - Premium Design */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button className="p-3 glass-effect rounded-2xl transition-all duration-300 hover:scale-110 group hover:shadow-lg">
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-3 glass-effect rounded-2xl transition-all duration-300 hover:scale-110 group relative hover:shadow-lg"
              >
                <HeartIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-all duration-300" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-ping"></div>
              </Link>

              {/* Cart with Enhanced Animation */}
              <div className="relative group">
                <Link
                  to="/cart"
                  className="p-3 glass-effect rounded-2xl transition-all duration-300 relative block animate-bounce-cart hover:shadow-lg"
                >
                  <ShoppingCartIcon className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300" />
                  {isAuthenticated && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-primary-600 via-purple-600 to-primary-700 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-xl animate-pulse-glow border-2 border-white">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Enhanced Tooltip */}
                {!isAuthenticated && (
                  <div className="absolute right-0 top-full mt-3 hidden group-hover:block z-50 pointer-events-none">
                    <div className="glass-effect text-white text-sm rounded-2xl py-4 px-6 whitespace-nowrap shadow-2xl border border-white/20 backdrop-blur-xl">
                      <p className="font-bold text-lg">👋 Just window shopping?</p>
                      <p className="text-sm text-gray-200 mt-2">
                        Sign in to save your favorites
                      </p>
                      <div className="absolute -top-2 right-6 w-4 h-4 glass-effect transform rotate-45 border-l border-t border-white/20"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu - Premium Design */}
              {isAuthenticated ? (
                <div
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="w-12 h-12 flex items-center justify-center glass-effect rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg ring-2 ring-transparent hover:ring-primary-200 dark:hover:ring-primary-800"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xl ${
                        user?.role === "admin"
                          ? "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 animate-pulse-glow"
                          : "bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800"
                      }`}
                    >
                      {user?.role === "admin"
                        ? "A"
                        : user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                  </button>
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-4 w-64 glass-effect rounded-3xl shadow-2xl py-3 border border-white/20 z-50 backdrop-blur-xl"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="px-6 py-4 border-b border-white/20">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                        {user?.role === "admin" && (
                          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold">
                            👑 Admin
                          </div>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-6 py-3 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-semibold rounded-xl mx-2 my-1"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        👤 Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-6 py-3 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 text-sm font-semibold rounded-xl mx-2 my-1"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        📦 Orders
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-6 py-3 hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-semibold rounded-xl mx-2 my-1"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          ⚙️ Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-3 border-white/20" />
                      <button
                        onClick={async () => {
                          const isAdmin = user?.role === "admin";
                          await logout();
                          setIsDropdownOpen(false);
                          if (isAdmin) {
                            navigate("/admin/products");
                          } else {
                            navigate("/products");
                          }
                        }}
                        className="block w-full text-left px-6 py-3 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all duration-300 text-sm font-semibold rounded-xl mx-2"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-8 py-3 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white font-bold rounded-2xl hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hidden sm:block relative overflow-hidden"
                >
                  <span className="relative z-10 text-white drop-shadow-lg">Sign In</span>
                  <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              )}

              {/* Mobile Menu Button - Premium */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-3 glass-effect rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                ) : (
                  <Bars3Icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Premium Design */}
        {isMobileMenuOpen && (
          <div className="lg:hidden glass-effect border-t border-white/20 dark:border-gray-700/30 shadow-2xl backdrop-blur-xl">
            <div className="container mx-auto px-6 py-6 space-y-3">
              <Link
                to="/products?gender=women"
                className="block px-6 py-4 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-500 hover:text-white transition-all duration-300 glass-effect hover:shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Women
              </Link>
              <Link
                to="/products?gender=men"
                className="block px-6 py-4 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 hover:text-white transition-all duration-300 glass-effect hover:shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                to="/products?tags=new-arrival"
                className="block px-6 py-4 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 hover:text-white transition-all duration-300 glass-effect hover:shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                to="/products?tags=sale"
                className="block px-6 py-4 rounded-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white hover:from-red-600 hover:via-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-xl hover:shadow-2xl animate-pulse-glow"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="flex items-center space-x-2">
                  <span>Sale</span>
                  <span className="text-lg animate-bounce">🔥</span>
                </span>
              </Link>
              <Link
                to="/blog"
                className="block px-6 py-4 rounded-2xl font-semibold text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-violet-500 hover:text-white transition-all duration-300 glass-effect hover:shadow-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block px-6 py-4 rounded-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white hover:from-primary-700 hover:via-primary-800 hover:to-primary-900 transition-all duration-300 shadow-xl hover:shadow-2xl text-center relative overflow-hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="relative z-10 text-white drop-shadow-lg">Sign In</span>
                  <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity duration-300"></div>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
