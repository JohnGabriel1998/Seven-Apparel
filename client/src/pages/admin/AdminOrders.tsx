import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";

interface OrderItem {
  product: {
    _id: string;
    name: string;
    images: { url: string; alt?: string }[];
  };
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; orderId: string | null }>({
    show: false,
    orderId: null,
  });

  useEffect(() => {
    fetchOrders();
    fetchOrderStats();
  }, []);

  // Check URL for order ID and open modal automatically
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("id");

    if (orderId && orders.length > 0) {
      const order = orders.find((o) => o._id === orderId);
      if (order) {
        setSelectedOrder(order);
        // Clean up URL after opening modal
        window.history.replaceState({}, "", "/admin/orders");
      }
    }
  }, [orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders/admin/all");
      setOrders(response.data.data || response.data.orders || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await api.get("/orders/admin/stats");
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error("Failed to fetch order stats:", error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status });
      toast.success("Order status updated");
      fetchOrders();
      fetchOrderStats();
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    }
  };

  const updatePaymentStatus = async (
    orderId: string,
    paymentStatus: string
  ) => {
    try {
      await api.put(`/orders/admin/${orderId}/payment`, { paymentStatus });
      toast.success("Payment status updated");
      fetchOrders();
      setSelectedOrder(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update payment");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setDeleteConfirm({ show: true, orderId });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.orderId) return;

    try {
      await api.delete(`/orders/admin/${deleteConfirm.orderId}`);
      toast.success("Order deleted successfully");
      fetchOrders();
      fetchOrderStats();
      if (selectedOrder?._id === deleteConfirm.orderId) {
        setSelectedOrder(null);
      }
      setDeleteConfirm({ show: false, orderId: null });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, orderId: null });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      paid: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Reset to first page when filters/search/orders change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, searchQuery, orders.length]);

  const totalItems = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
      </div>

      {/* Order Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow">
            <p className="text-sm text-yellow-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-900">
              {stats.pending}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow">
            <p className="text-sm text-blue-600">Processing</p>
            <p className="text-2xl font-bold text-blue-900">
              {stats.processing}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg shadow">
            <p className="text-sm text-purple-600">Shipped</p>
            <p className="text-2xl font-bold text-purple-900">
              {stats.shipped}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow">
            <p className="text-sm text-green-600">Delivered</p>
            <p className="text-2xl font-bold text-green-900">
              {stats.delivered}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow">
            <p className="text-sm text-red-600">Cancelled</p>
            <p className="text-2xl font-bold text-red-900">{stats.cancelled}</p>
          </div>
          <div className="bg-indigo-50 p-4 rounded-lg shadow">
            <p className="text-sm text-indigo-600">Revenue</p>
            <p className="text-2xl font-bold text-indigo-900">
              ₱{stats.totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber || order._id.slice(-8)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items.length} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₱{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Order"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{totalItems === 0 ? 0 : startIndex + 1}</span>-
            <span className="font-medium">{endIndex}</span> of
            <span className="font-medium"> {totalItems}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Prev
            </button>
            <span className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of
              <span className="font-medium"> {totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalItems === 0}
              className={`px-3 py-1 rounded border ${
                currentPage === totalPages || totalItems === 0
                  ? "text-gray-400 border-gray-200 cursor-not-allowed"
                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="ml-2 px-2 py-1 border border-gray-300 rounded"
            >
              <option value={5}>5 / page</option>
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold">
                    {selectedOrder.orderNumber || selectedOrder._id.slice(-8)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  Customer Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">{selectedOrder.user.name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.user.email}
                  </p>
                  <Link
                    to={`/admin/users/${selectedOrder.user._id}`}
                    className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                  >
                    View Customer Profile →
                  </Link>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {selectedOrder.shippingAddress.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingAddress.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingAddress.city},{" "}
                    {selectedOrder.shippingAddress.state}{" "}
                    {selectedOrder.shippingAddress.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.shippingAddress.country}
                  </p>
                  {selectedOrder.shippingAddress.phone && (
                    <p className="text-sm text-gray-600 mt-1">
                      Phone: {selectedOrder.shippingAddress.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg"
                    >
                      <img
                      src={item.product?.images?.[0]?.url || "/placeholder.png"}
                      alt={item.product?.name || "Product"}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.product?.name || "Product unavailable"}</p>
                        {item.color && (
                          <p className="text-sm text-gray-600">
                            Color: {item.color}
                          </p>
                        )}
                        {item.size && (
                          <p className="text-sm text-gray-600">
                            Size: {item.size}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          ₱{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span>₱{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Updates */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Update Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Status
                    </label>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        updateOrderStatus(selectedOrder._id, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) =>
                        updatePaymentStatus(selectedOrder._id, e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    if (selectedOrder) {
                      handleDeleteOrder(selectedOrder._id);
                    }
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <TrashIcon className="w-5 h-5" />
                  Delete Order
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Order
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to delete this order? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
