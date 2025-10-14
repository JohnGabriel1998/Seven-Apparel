import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { useEffect, useState } from "react";
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
} from "@heroicons/react/24/outline";

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

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
              <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
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
