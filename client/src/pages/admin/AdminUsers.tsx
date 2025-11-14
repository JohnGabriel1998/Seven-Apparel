import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-hot-toast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isActive: boolean;
  createdAt: string;
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  orderCount?: number;
  totalSpent?: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  newUsersThisMonth: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users/admin/all");
      setUsers(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await api.get("/users/admin/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/users/admin/${userId}/status`, {
        isActive: !currentStatus,
      });
      toast.success(`User ${!currentStatus ? "activated" : "deactivated"}`);
      fetchUsers();
      fetchUserStats();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, isActive: !currentStatus });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const updateUserRole = async (userId: string, role: "user" | "admin") => {
    try {
      await api.put(`/users/admin/${userId}/role`, { role });
      toast.success("User role updated");
      fetchUsers();
      fetchUserStats();
      if (selectedUser?._id === userId) {
        setSelectedUser({ ...selectedUser, role });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (userId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await api.delete(`/users/admin/${userId}`);
      toast.success("User deleted");
      fetchUsers();
      fetchUserStats();
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const getAvatarUrl = (avatar?: string) => {
    if (avatar && avatar !== "https://via.placeholder.com/150") {
      // If it's a full URL, use it directly
      if (avatar.startsWith("http")) {
        return avatar;
      }
      // If it's a relative path, prepend the server base URL (without /api)
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const baseUrl = apiUrl.replace("/api", "");
      return `${baseUrl}${avatar}`;
    }
    return null;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredUsers = users.filter((user) => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

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
        <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
      </div>

      {/* User Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow">
            <p className="text-sm text-green-600">Active Users</p>
            <p className="text-3xl font-bold text-green-900">
              {stats.activeUsers}
            </p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-lg shadow">
            <p className="text-sm text-indigo-600">Admins</p>
            <p className="text-3xl font-bold text-indigo-900">
              {stats.adminUsers}
            </p>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <p className="text-sm text-blue-600">New This Month</p>
            <p className="text-3xl font-bold text-blue-900">
              {stats.newUsersThisMonth}
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
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {getAvatarUrl(user.avatar) ? (
                            <img
                              src={getAvatarUrl(user.avatar) || undefined}
                              alt={user.name}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                  const fallback = document.createElement("div");
                                  fallback.className = "h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold";
                                  fallback.textContent = getInitials(user.name);
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                              {getInitials(user.name)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.orderCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₱{(user.totalSpent || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">User Details</h2>
                <button
                  onClick={() => setSelectedUser(null)}
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

              {/* User Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-semibold overflow-hidden flex-shrink-0">
                    {getAvatarUrl(selectedUser.avatar) ? (
                      <img
                        src={getAvatarUrl(selectedUser.avatar) || undefined}
                        alt={selectedUser.name}
                        className="h-full w-full object-cover rounded-full"
                        onError={(e) => {
                          // Fallback to initials if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement("div");
                            fallback.className = "h-full w-full rounded-full bg-indigo-500 flex items-center justify-center text-white text-3xl font-semibold";
                            fallback.textContent = getInitials(selectedUser.name);
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    ) : (
                      <span>{getInitials(selectedUser.name)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedUser.name}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    {selectedUser.phone && (
                      <p className="text-gray-600">{selectedUser.phone}</p>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Account Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">User ID</p>
                      <p className="font-medium">{selectedUser._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Joined Date</p>
                      <p className="font-medium">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="font-medium">
                        {selectedUser.orderCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="font-medium">
                        ₱{(selectedUser.totalSpent || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                {selectedUser.address && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">Address</h4>
                    <p className="text-sm text-gray-600">
                      {selectedUser.address.street && (
                        <>
                          {selectedUser.address.street}
                          <br />
                        </>
                      )}
                      {selectedUser.address.city &&
                        selectedUser.address.state && (
                          <>
                            {selectedUser.address.city},{" "}
                            {selectedUser.address.state}{" "}
                            {selectedUser.address.zipCode}
                            <br />
                          </>
                        )}
                      {selectedUser.address.country}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role
                    </label>
                    <select
                      value={selectedUser.role}
                      onChange={(e) =>
                        updateUserRole(
                          selectedUser._id,
                          e.target.value as "user" | "admin"
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() =>
                        toggleUserStatus(
                          selectedUser._id,
                          selectedUser.isActive
                        )
                      }
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                        selectedUser.isActive
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {selectedUser.isActive
                        ? "Deactivate User"
                        : "Activate User"}
                    </button>
                    <Link
                      to={`/admin/orders?user=${selectedUser._id}`}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-center"
                    >
                      View Orders
                    </Link>
                  </div>

                  <button
                    onClick={() => deleteUser(selectedUser._id)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                  >
                    Delete User
                  </button>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
