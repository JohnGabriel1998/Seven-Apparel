import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  lowStockProducts: any[];
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get("/analytics/dashboard");
      setStats(data);
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Revenue",
      value: `₱${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: CurrencyDollarIcon,
      color: "bg-green-500",
    },
    {
      name: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: "bg-blue-500",
    },
    {
      name: "Total Products",
      value: stats?.totalProducts || 0,
      icon: ChartBarIcon,
      color: "bg-purple-500",
    },
    {
      name: "Total Users",
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 text-white/90">Welcome to Admin Panel</h1>
            <p className="text-primary-100">
              Manage your Seven Apparel store efficiently
            </p>
          </div>
          <div className="hidden md:flex">
            <Link
              to="/admin/products/add"
              className="flex items-center px-5 py-2.5 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Product
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {stat.name}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/products/new"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <PlusIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Add New Product
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a new product listing
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/orders"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Pending Orders
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stats?.recentOrders?.filter((o) => o.status === "pending")
                  .length || 0}{" "}
                orders need attention
              </p>
            </div>
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all group"
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <ChartBarIcon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                View Analytics
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detailed performance reports
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Orders
            </h2>
            <Link
              to="/admin/orders"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.recentOrders?.slice(0, 5).map((order) => (
              <div
                key={order._id}
                className="flex justify-between items-center border-b dark:border-gray-700 pb-3"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    #{order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.user?.name || "Guest"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    ₱{order.totalAmount}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "processing"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No recent orders
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Low Stock Alert
              </h2>
            </div>
            <Link
              to="/admin/products"
              className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
            >
              Manage →
            </Link>
          </div>
          <div className="space-y-4">
            {stats?.lowStockProducts?.slice(0, 5).map((product) => {
              // Handle different image formats (array of objects or array of strings)
              const imageUrl = Array.isArray(product.images)
                ? typeof product.images[0] === "string"
                  ? product.images[0]
                  : product.images[0]?.url
                : null;

              return (
                <div
                  key={product._id}
                  className="flex justify-between items-center border-b dark:border-gray-700 pb-3 last:border-b-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stock: {product.totalStock} units
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400 rounded-full whitespace-nowrap">
                    Low Stock
                  </span>
                </div>
              );
            })}
            {(!stats?.lowStockProducts ||
              stats.lowStockProducts.length === 0) && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                All products in stock
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
