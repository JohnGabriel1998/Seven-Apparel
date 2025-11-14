import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect, useMemo, useState } from "react";
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  TagIcon,
  NewspaperIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
    return "A";
  };
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [unseenOrders, setUnseenOrders] = useState(0);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [unseenReviews, setUnseenReviews] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [unseenLowStock, setUnseenLowStock] = useState(0);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("admin:dismissedOrderIds");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });
  const [dismissedReviewIds, setDismissedReviewIds] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem("admin:dismissedReviewIds");
      return new Set(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  const persistDismissed = () => {
    localStorage.setItem(
      "admin:dismissedOrderIds",
      JSON.stringify(Array.from(dismissedOrderIds))
    );
    localStorage.setItem(
      "admin:dismissedReviewIds",
      JSON.stringify(Array.from(dismissedReviewIds))
    );
  };

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Poll for order stats (total) and fetch recent orders
  useEffect(() => {
    let isCancelled = false;

    const getLastSeenOrders = () => {
      const raw = localStorage.getItem("admin:lastSeenOrderTotal");
      const n = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(n) ? n : 0;
    };
    const getLastSeenReviews = () => {
      const raw = localStorage.getItem("admin:lastSeenReviewTotal");
      const n = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(n) ? n : 0;
    };
    const getLastSeenLowStock = () => {
      const raw = localStorage.getItem("admin:lastSeenLowStockTotal");
      const n = raw ? parseInt(raw, 10) : 0;
      return Number.isFinite(n) ? n : 0;
    };

    const fetchStats = async () => {
      try {
        const statsRes = await api.get("/orders/admin/stats");
        if (isCancelled) return;
        const total = Number(statsRes?.data?.total || 0);
        setTotalOrders(total);
        const lastSeen = getLastSeenOrders();
        const unseen = Math.max(0, total - lastSeen);
        setUnseenOrders(unseen);
      } catch (_) {
        // ignore
      }
    };

    const fetchRecent = async () => {
      try {
        const res = await api.get("/orders/admin/all");
        if (isCancelled) return;
        const list = Array.isArray(res.data) ? res.data : [];
        list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const recent = list.slice(0, 6);
        setRecentOrders(recent);
        
        // Ensure unseen count is updated based on actual total
        const currentTotal = list.length;
        const lastSeen = getLastSeenOrders();
        if (currentTotal > lastSeen) {
          // New orders detected - update unseen count
          const newOrdersCount = currentTotal - lastSeen;
          setUnseenOrders(newOrdersCount);
          // Also update totalOrders to keep them in sync
          setTotalOrders(currentTotal);
        }
      } catch (_) {
        // ignore
      }
    };

    const fetchReviewStats = async () => {
      try {
        const res = await api.get("/reviews/admin/stats");
        if (isCancelled) return;
        const total = Number(res?.data?.total || 0);
        setTotalReviews(total);
        const unseen = Math.max(0, total - getLastSeenReviews());
        setUnseenReviews(unseen);
      } catch (_) {}
    };

    const fetchRecentReviews = async () => {
      try {
        const res = await api.get("/reviews/admin/recent?limit=6");
        if (isCancelled) return;
        const list = res?.data?.data || [];
        setRecentReviews(list);
      } catch (_) {}
    };

    const fetchLowStock = async () => {
      try {
        const res = await api.get("/products/admin/low-stock?threshold=0&limit=6");
        if (isCancelled) return;
        const list = res?.data?.data || [];
        setLowStockProducts(list);
        const total = Number(res?.data?.total || list.length);
        const unseen = Math.max(0, total - getLastSeenLowStock());
        setUnseenLowStock(unseen);
      } catch (_) {}
    };

    // Initial fetch - fetch stats first to get total, then fetch recent orders
    fetchStats();
    fetchRecent();
    fetchReviewStats();
    fetchRecentReviews();
    fetchLowStock();
    
    // Poll every 10 seconds for faster updates
    const id = setInterval(() => {
      fetchStats();
      fetchRecent();
      fetchReviewStats();
      fetchRecentReviews();
      fetchLowStock();
    }, 10000);
    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, []);

  const markAllAsSeen = () => {
    localStorage.setItem("admin:lastSeenOrderTotal", String(totalOrders));
    localStorage.setItem("admin:lastSeenReviewTotal", String(totalReviews));
    localStorage.setItem("admin:lastSeenLowStockTotal", String(lowStockProducts.length));
    setUnseenOrders(0);
    setUnseenReviews(0);
    setUnseenLowStock(0);
  };

  const dismissOrder = (id: string) => {
    setDismissedOrderIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      setTimeout(persistDismissed, 0);
      return next;
    });
  };

  const dismissReview = (id: string) => {
    setDismissedReviewIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      setTimeout(persistDismissed, 0);
      return next;
    });
  };

  const markAllRead = () => {
    // mark seen + dismiss all currently visible items
    markAllAsSeen();
    setDismissedOrderIds((prev) => {
      const next = new Set(prev);
      recentOrders.forEach((o) => next.add(o._id));
      setTimeout(persistDismissed, 0);
      return next;
    });
    setDismissedReviewIds((prev) => {
      const next = new Set(prev);
      recentReviews.forEach((r) => next.add(r._id));
      setTimeout(persistDismissed, 0);
      return next;
    });
  };

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: HomeIcon },
    { name: "Products", path: "/admin/products", icon: ShoppingBagIcon },
    { name: "Orders", path: "/admin/orders", icon: TagIcon },
    { name: "Users", path: "/admin/users", icon: UsersIcon },
    { name: "Analytics", path: "/admin/analytics", icon: ChartBarIcon },
    { name: "Blog", path: "/admin/blog", icon: NewspaperIcon },
    { name: "Settings", path: "/admin/settings", icon: CogIcon },
  ];

  if (!user || user.role !== "admin") {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleViewShop = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h1 className="text-xl font-bold text-primary-600">
                Seven Apparel
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin Panel
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Admin Info Card */}
          <div className="p-4 m-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-700 dark:to-gray-600 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden flex-shrink-0">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl() || undefined}
                    alt={user?.name || "Admin"}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        const fallback = document.createElement("div");
                        fallback.className = "w-full h-full flex items-center justify-center text-white font-bold text-lg";
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
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {user?.email}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-600 text-white rounded">
                  Administrator
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin" &&
                  location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-primary-600 text-white shadow-md"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.name}</span>
                  {isActive && (
                    <span className="ml-auto w-2 h-2 bg-white rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Actions */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={handleViewShop}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <EyeIcon className="w-5 h-5 mr-3" />
              <span>View Shop</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {navItems.find((item) => {
                    if (item.path === "/admin") {
                      return location.pathname === "/admin";
                    }
                    return location.pathname.startsWith(item.path);
                  })?.name || "Dashboard"}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manage your store efficiently
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    const next = !notificationsOpen;
                    setNotificationsOpen(next);
                    if (next) markAllAsSeen();
                  }}
                  className="relative p-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none transition-all"
                  aria-label="Notifications"
                >
                  <BellIcon className={`w-5 h-5 ${unseenOrders + unseenReviews + unseenLowStock > 0 ? 'animate-pulse' : ''}`} />
                  {unseenOrders + unseenReviews + unseenLowStock > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center px-1.5 h-5 min-w-[20px] text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-bounce">
                      {unseenOrders + unseenReviews + unseenLowStock}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity</p>
                      {unseenOrders + unseenReviews + unseenLowStock > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                          {unseenOrders + unseenReviews + unseenLowStock} new
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {/* Low Stock Section */}
                      <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Low / Out of Stock</div>
                      {lowStockProducts.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">All good</div>
                      ) : (
                        lowStockProducts.map((p: any) => (
                          <button
                            key={p._id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              navigate(`/admin/products`);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-start gap-3"
                          >
                            <div className="mt-1 w-2 h-2 rounded-full bg-red-500"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {p.name}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Stock: {typeof p.totalStock === 'number' ? p.totalStock : 0}</p>
                            </div>
                          </button>
                        ))
                      )}

                      {/* Reviews Section */}
                      <div className="px-4 py-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">New Reviews</div>
                      {recentReviews.filter((r:any)=>!dismissedReviewIds.has(r._id)).length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">No reviews yet</div>
                      ) : (
                        recentReviews.filter((r:any)=>!dismissedReviewIds.has(r._id)).map((r: any) => (
                          <button
                            key={r._id}
                            onClick={() => {
                              setNotificationsOpen(false);
                              if (r.product?._id) navigate(`/products/${r.product._id}`);
                              dismissReview(r._id);
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-start gap-3"
                          >
                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {r.user?.name || 'Customer'} reviewed {r.product?.name || 'a product'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-300">Rating: {r.rating}★ • {new Date(r.createdAt).toLocaleString()}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-1">{r.title}</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); dismissReview(r._id); }}
                              className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                              title="Dismiss"
                            >
                              ×
                            </button>
                          </button>
                        ))
                      )}

                      {/* Orders Section */}
                      <div className="px-4 pt-2 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 flex items-center justify-between">
                        <span>New Orders</span>
                        {unseenOrders > 0 && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                            {unseenOrders} new
                          </span>
                        )}
                      </div>
                      {recentOrders.filter((o:any)=>!dismissedOrderIds.has(o._id)).length === 0 ? (
                        <div className="px-4 py-6 text-sm text-gray-600 dark:text-gray-300">No orders yet</div>
                      ) : (
                        recentOrders.filter((o:any)=>!dismissedOrderIds.has(o._id)).map((o: any) => {
                          // Check if this is a new order (created in the last hour)
                          const orderDate = o.createdAt ? new Date(o.createdAt) : null;
                          const isNewOrder = orderDate && (Date.now() - orderDate.getTime()) < 3600000; // 1 hour
                          const lastSeenTotal = (() => {
                            const raw = localStorage.getItem("admin:lastSeenOrderTotal");
                            const n = raw ? parseInt(raw, 10) : 0;
                            return Number.isFinite(n) ? n : 0;
                          })();
                          const isUnseen = totalOrders > lastSeenTotal && unseenOrders > 0;
                          
                          return (
                            <button
                              key={o._id}
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate(`/admin/orders?id=${o._id}`);
                                dismissOrder(o._id);
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/60 flex items-start gap-3 ${
                                isNewOrder && isUnseen ? 'bg-green-50 dark:bg-green-900/10 border-l-2 border-green-500' : ''
                              }`}
                            >
                              <div className={`mt-1 w-2 h-2 rounded-full ${isNewOrder && isUnseen ? 'bg-green-500 animate-pulse' : 'bg-green-500'}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Order {o.orderNumber || String(o._id).slice(-8)}
                                  </p>
                                  {isNewOrder && isUnseen && (
                                    <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-semibold">
                                      NEW
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                  {o?.user?.name || "Customer"} • ₱{Number(o?.totalAmount || 0).toFixed(2)}
                                </p>
                                <p className="text-[11px] text-gray-400">{o?.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</p>
                              </div>
                              <button
                                onClick={(e) => { e.stopPropagation(); dismissOrder(o._id); }}
                                className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                                title="Dismiss"
                              >
                                ×
                              </button>
                            </button>
                          );
                        })
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                      <button
                        onClick={markAllRead}
                        className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        Mark all as read
                      </button>
                      <button
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate("/admin/orders");
                        }}
                        className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                      >
                        View all orders
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <Link
                to="/"
                className="hidden sm:flex items-center px-3 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 border border-primary-600 dark:border-primary-400 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <EyeIcon className="w-4 h-4 mr-2" />
                View Shop
              </Link>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
