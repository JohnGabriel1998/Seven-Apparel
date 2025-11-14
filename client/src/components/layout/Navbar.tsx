import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  ShoppingCartIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
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

  const getAvatarUrl = () => {
    if (user?.avatar && user.avatar !== "https://via.placeholder.com/150") {
      // If it's a full URL, use it directly
      if (user.avatar.startsWith("http")) {
        return user.avatar;
      }
      // If it's a relative path, prepend the server base URL (without /api)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const baseUrl = apiUrl.replace("/api", "");
      return `${baseUrl}${user.avatar}`;
    }
    return null;
  };

  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

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

      <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo - Elegant & Professional */}
            <Link to="/" className="relative group flex items-center space-x-3">
              {/* Minimalist Number "7" */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary-600/20 to-primary-800/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-2 border border-gray-200 dark:border-gray-700 shadow-sm group-hover:shadow-md transition-all duration-300">
                  <span className="text-4xl font-bold text-primary-600 dark:text-primary-400">
                    7
                  </span>
                </div>
              </div>

              {/* Brand Name - Refined Typography */}
              <div className="flex flex-col">
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  SEVEN
                </span>
                <span className="text-xs font-semibold tracking-[0.25em] text-gray-600 dark:text-gray-400 uppercase -mt-0.5">
                  APPAREL
                </span>
              </div>
            </Link>

            {/* Navigation Links - Clean & Professional */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/products?gender=women"
                className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 relative group"
              >
                Women
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/products?gender=men"
                className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 relative group"
              >
                Men
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/products?tags=new-arrival"
                className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 relative group"
              >
                New Arrivals
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/products?tags=sale"
                className="px-5 py-2.5 font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 relative group"
              >
                Sale
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 dark:bg-red-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link
                to="/blog"
                className="px-5 py-2.5 font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300 relative group"
              >
                Blog
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </div>

            {/* Right Icons - Sophisticated Design */}
            <div className="flex items-center space-x-2">
              {/* Search Button */}
              <button className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300" />
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group relative"
              >
                <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300" />
              </Link>

              {/* Cart - Clean Design */}
              <div className="relative group">
                <Link
                  to="/cart"
                  className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 relative block"
                >
                  <ShoppingCartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300" />
                  {isAuthenticated && itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>

                {/* Refined Tooltip */}
                {!isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 pointer-events-none">
                    <div className="bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg py-2 px-4 whitespace-nowrap shadow-lg">
                      Sign in to save items
                      <div className="absolute -top-1 right-4 w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu - Professional Design */}
              {isAuthenticated ? (
                <div
                  className="relative"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 hover:ring-2 hover:ring-primary-200 dark:hover:ring-primary-800 overflow-hidden"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl() || undefined}
                        alt={user?.name || "Profile"}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement("div");
                            fallback.className = `w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                              user?.role === "admin"
                                ? "bg-gray-900 dark:bg-gray-700"
                                : "bg-primary-600 dark:bg-primary-700"
                            }`;
                            fallback.textContent = getInitials();
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <div
                        className={`w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                          user?.role === "admin"
                            ? "bg-gray-900 dark:bg-gray-700"
                            : "bg-primary-600 dark:bg-primary-700"
                        }`}
                      >
                        {getInitials()}
                      </div>
                    )}
                  </button>
                  {isDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 border border-gray-200 dark:border-gray-700 z-50"
                      onMouseEnter={handleDropdownMouseEnter}
                      onMouseLeave={handleDropdownMouseLeave}
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm overflow-hidden flex-shrink-0">
                            {getAvatarUrl() ? (
                              <img
                                src={getAvatarUrl() || undefined}
                                alt={user?.name || "User"}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  // Fallback to initials if image fails to load
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = document.createElement("div");
                                    fallback.className = `w-full h-full rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                                      user?.role === "admin"
                                        ? "bg-gray-900 dark:bg-gray-700"
                                        : "bg-primary-600 dark:bg-primary-700"
                                    }`;
                                    fallback.textContent = getInitials();
                                    parent.appendChild(fallback);
                                  }
                                }}
                              />
                            ) : (
                              <span>{getInitials()}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                        {user?.role === "admin" && (
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded bg-gray-900 dark:bg-gray-700 text-white text-xs font-medium">
                            Admin
                          </div>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300 text-sm"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      {user?.role !== "admin" && (
                        <Link
                          to="/orders"
                          className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300 text-sm"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Orders
                        </Link>
                      )}
                      {user?.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-gray-700 dark:text-gray-300 text-sm"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-2 border-gray-200 dark:border-gray-700" />
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
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors duration-200 text-sm"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 bg-primary-600 dark:bg-primary-700 text-white font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-300 hidden sm:block"
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button - Clean */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300"
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

        {/* Mobile Menu - Professional Design */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-6 py-4 space-y-1">
              <Link
                to="/products?gender=women"
                className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Women
              </Link>
              <Link
                to="/products?gender=men"
                className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Men
              </Link>
              <Link
                to="/products?tags=new-arrival"
                className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                New Arrivals
              </Link>
              <Link
                to="/products?tags=sale"
                className="block px-4 py-2.5 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sale
              </Link>
              <Link
                to="/blog"
                className="block px-4 py-2.5 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="block px-4 py-2.5 mt-4 rounded-lg font-medium bg-primary-600 dark:bg-primary-700 text-white hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors duration-200 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};
