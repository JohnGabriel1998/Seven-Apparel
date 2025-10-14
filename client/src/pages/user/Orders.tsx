import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  ShoppingBagIcon,
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
  paymentStatus: string;
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  user?: {
    name: string;
    email: string;
  };
}

export const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/orders/my");
      setOrders(data.data || data.orders || []);
    } catch (error: any) {
      console.error("Orders fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
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

  const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
      case "paid":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "pending":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "failed":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      case "refunded":
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const normalizeImage = (image: any): string => {
    if (typeof image === "string") return image;
    if (image?.url) return image.url;
    return "https://via.placeholder.com/150";
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
          <ShoppingBagIcon className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
            No Orders Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            Start shopping to see your orders here!
          </p>
          <Link
            to="/products"
            className="btn btn-primary px-8 py-3 text-lg font-semibold inline-block"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              {/* Order Header */}
              <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="font-bold text-2xl mb-2 text-gray-900 dark:text-white">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Order Date:{" "}
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        second: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Order Status */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Order Status
                    </p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Payment Status
                    </p>
                    <span
                      className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold capitalize ${getPaymentStatusColor(
                        order.paymentStatus
                      )}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Order Progress Tracker */}
                <div className="mt-6 p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/30 dark:to-gray-800/30 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Order Progress
                  </h4>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600"></div>
                    <div
                      className="absolute top-5 left-0 h-1 bg-primary-600 transition-all duration-500"
                      style={{
                        width:
                          order.status === "pending"
                            ? "0%"
                            : order.status === "processing"
                            ? "33%"
                            : order.status === "shipped"
                            ? "66%"
                            : order.status === "delivered"
                            ? "100%"
                            : "0%",
                      }}
                    ></div>

                    {/* Progress Steps */}
                    <div className="relative flex justify-between">
                      {/* Pending/Processing */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            order.status === "pending" ||
                            order.status === "processing" ||
                            order.status === "shipped" ||
                            order.status === "delivered"
                              ? "bg-primary-600 text-white"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-600"
                          }`}
                        >
                          <ClockIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs mt-2 font-semibold text-gray-700 dark:text-gray-300">
                          Processing
                        </p>
                      </div>

                      {/* Shipped */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            order.status === "shipped" ||
                            order.status === "delivered"
                              ? "bg-primary-600 text-white"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-600"
                          }`}
                        >
                          <TruckIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs mt-2 font-semibold text-gray-700 dark:text-gray-300">
                          Shipped
                        </p>
                      </div>

                      {/* Delivered */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            order.status === "delivered"
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 dark:bg-gray-600 text-gray-600"
                          }`}
                        >
                          <CheckCircleIcon className="w-5 h-5" />
                        </div>
                        <p className="text-xs mt-2 font-semibold text-gray-700 dark:text-gray-300">
                          Delivered
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estimated Delivery for non-delivered orders */}
                  {order.status !== "delivered" &&
                    order.status !== "cancelled" && (
                      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          📦 Estimated delivery:{" "}
                          <span className="font-semibold">
                            3-5 business days
                          </span>
                        </p>
                      </div>
                    )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h4 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                  Order Items
                </h4>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <img
                        src={normalizeImage(item.image)}
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                          {item.name}
                        </h4>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Color:</span>{" "}
                            {item.color}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Size:</span>{" "}
                            {item.size}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-semibold">Quantity:</span>{" "}
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-primary-600 dark:text-primary-400">
                          ₱{item.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ₱{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
                    <TruckIcon className="w-5 h-5 text-primary-600" />
                    Shipping Address
                  </h4>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p className="font-semibold">
                      {order.shippingAddress.fullName}
                    </p>
                    <p className="mt-2">{order.shippingAddress.addressLine1}</p>
                    <p>
                      {order.shippingAddress.city},{" "}
                      {order.shippingAddress.state}{" "}
                      {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                    {order.shippingAddress.phone && (
                      <p className="mt-2">
                        <span className="font-semibold">Phone:</span>{" "}
                        {order.shippingAddress.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Total */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-6 rounded-xl border border-primary-200 dark:border-primary-700">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xl text-gray-900 dark:text-white">
                      Total Amount
                    </span>
                    <span className="font-bold text-3xl text-primary-600 dark:text-primary-400">
                      ₱{order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
