import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface SalesData {
  _id: string;
  totalOrders: number;
  totalRevenue: number;
  date: string;
}

interface RevenueStats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

interface ProductPerformance {
  _id: string;
  name: string;
  totalSold: number;
  revenue: number;
}

interface OrderStatusBreakdown {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  items: any[];
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const AdminAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });
  const [topProducts] = useState<ProductPerformance[]>([]);
  const [timeRange, setTimeRange] = useState("monthly");

  // New state for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [statusBreakdown, setStatusBreakdown] = useState<OrderStatusBreakdown>({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchAnalytics();
    fetchOrders();
  }, [timeRange]);

  useEffect(() => {
    // Filter orders based on search query
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = orders.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(query) ||
          order.user.name.toLowerCase().includes(query) ||
          order.user.email.toLowerCase().includes(query)
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [salesRes, revenueRes] = await Promise.all([
        api.get("/analytics/sales", { params: { period: timeRange } }),
        api.get("/analytics/revenue"),
      ]);

      // Map the sales data to match our interface
      const mappedSalesData = (salesRes.data.salesByDay || []).map(
        (day: any) => ({
          _id: day._id,
          totalOrders: day.orderCount,
          totalRevenue: day.totalSales,
          date: day._id,
        })
      );

      setSalesData(mappedSalesData);

      // Map revenue stats - calculate weekly from the sales data
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const weeklyRevenue = mappedSalesData
        .filter((day: any) => new Date(day.date) >= weekAgo)
        .reduce((sum: number, day: any) => sum + day.totalRevenue, 0);

      setRevenueStats({
        daily: revenueRes.data.today || 0,
        weekly: weeklyRevenue,
        monthly: revenueRes.data.thisMonth || 0,
        yearly: revenueRes.data.thisYear || 0,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/orders/admin/all");
      const ordersData = data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);

      // Calculate total orders and revenue
      setTotalOrders(ordersData.length);
      const revenue = ordersData.reduce(
        (sum: number, order: Order) =>
          order.paymentStatus === "paid" ? sum + order.total : sum,
        0
      );
      setTotalRevenue(revenue);

      // Calculate status breakdown
      const breakdown: OrderStatusBreakdown = {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      ordersData.forEach((order: Order) => {
        const status = order.status.toLowerCase();
        if (status in breakdown) {
          breakdown[status as keyof OrderStatusBreakdown]++;
        }
      });

      setStatusBreakdown(breakdown);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <ExclamationCircleIcon className="w-5 h-5 text-blue-500" />;
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
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "shipped":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleViewOrder = (orderId: string) => {
    navigate(`/admin/orders?id=${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Analytics Dashboard
        </h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input max-w-xs"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Key Metrics - Row 1: Orders & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Orders
            </h3>
            <ShoppingCartIcon className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {totalOrders}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            All time orders
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Revenue
            </h3>
            <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            ₱{totalRevenue.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            From paid orders
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Average Order Value
            </h3>
            <ArrowTrendingUpIcon className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            $
            {totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0.00"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Per order average
          </p>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Order Status Breakdown
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Pending */}
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <ClockIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statusBreakdown.pending}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Pending
            </p>
          </div>

          {/* Processing */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <ExclamationCircleIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statusBreakdown.processing}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Processing
            </p>
          </div>

          {/* Shipped */}
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <TruckIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statusBreakdown.shipped}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Shipped
            </p>
          </div>

          {/* Delivered */}
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statusBreakdown.delivered}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Delivered
            </p>
          </div>

          {/* Cancelled */}
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <XCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {statusBreakdown.cancelled}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Cancelled
            </p>
          </div>
        </div>
      </div>

      {/* Revenue Stats by Period */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Revenue by Period
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <CurrencyDollarIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₱{revenueStats.daily.toFixed(2)}
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-green-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              <span>Today</span>
            </div>
          </div>

          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₱{revenueStats.weekly.toFixed(2)}
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-blue-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              <span>Last 7 days</span>
            </div>
          </div>

          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <ShoppingCartIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₱{revenueStats.monthly.toFixed(2)}
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-purple-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              <span>This month</span>
            </div>
          </div>

          <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <UsersIcon className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ₱{revenueStats.yearly.toFixed(2)}
            </p>
            <div className="flex items-center justify-center mt-2 text-sm text-orange-600">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              <span>This year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
            Recent Orders
          </h2>

          {/* Search Bar */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by order number, name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.slice(0, 10).map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(order.status)}
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                          {order.orderNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {order.user.name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">
                          {order.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {order.items.length} item
                      {order.items.length !== 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                      ₱{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus.charAt(0).toUpperCase() +
                          order.paymentStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewOrder(order._id)}
                        className="inline-flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                      >
                        <EyeIcon className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p>
                      {searchQuery
                        ? "No orders found matching your search"
                        : "No orders available yet"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Show more indicator */}
        {filteredOrders.length > 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing 10 of {filteredOrders.length} orders
            </p>
            <button
              onClick={() => navigate("/admin/orders")}
              className="mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
            >
              View all orders →
            </button>
          </div>
        )}
      </div>

      {/* Sales Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Sales Overview -{" "}
          {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)}
        </h2>
        <div className="space-y-4">
          {salesData.length > 0 ? (
            salesData.map((data) => (
              <div
                key={data._id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(data.date).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {data.totalOrders} orders
                  </p>
                </div>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  ₱{data.totalRevenue.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No sales data available for this period
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Top Performing Products
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Units Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {product.totalSold}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₱{product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                  >
                    <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p>No product sales data available yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
