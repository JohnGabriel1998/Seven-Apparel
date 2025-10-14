import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  totalStock: number;
}

export const Profile = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "products">(
    "info"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "products") {
      fetchProducts();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const { data } = await api.get("/orders/my");
      setOrders(data.data || data.orders || []);
    } catch (error: any) {
      console.error("Orders fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const { data } = await api.get("/products");
      setProducts(data.data || data.products || []);
    } catch (error: any) {
      console.error("Products fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load products");
    } finally {
      setLoadingProducts(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <TruckIcon className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "processing":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "shipped":
        return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
      case "delivered":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "cancelled":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const normalizeImage = (image: any): string => {
    if (typeof image === "string") return image;
    if (image?.url) return image.url;
    return "https://via.placeholder.com/150";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "info"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserIcon className="w-5 h-5" />
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "orders"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <ShoppingBagIcon className="w-5 h-5" />
          My Orders
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`px-6 py-3 font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "products"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <HeartIcon className="w-5 h-5" />
          Shop Products
        </button>
      </div>

      {/* Profile Info Tab */}
      {activeTab === "info" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Name
              </label>
              <p className="text-lg font-semibold">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Email
              </label>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Role
              </label>
              <p className="text-lg font-semibold capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div>
          {loadingOrders ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <ShoppingBagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Orders Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start shopping to see your orders here!
              </p>
              <Link to="/products" className="btn-primary inline-block">
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <img
                          src={normalizeImage(item.image)}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{item.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.color} - {item.size} x {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">₱{item.price}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 flex justify-between items-center">
                    <span className="font-semibold text-lg">Total</span>
                    <span className="font-bold text-xl text-primary-600">
                      ₱{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div>
          {loadingProducts ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
              <HeartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back soon for new arrivals!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={normalizeImage(product.images[0])}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {product.totalStock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {product.brand}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-primary-600">
                        ₱{product.price}
                      </span>
                      <span className="text-sm text-gray-500">
                        {product.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
