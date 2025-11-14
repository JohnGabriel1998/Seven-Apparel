import { useState, useEffect, useRef } from "react";
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
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
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
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"info" | "orders" | "products">(
    "info"
  );
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      // Upload image
      const uploadResponse = await api.post("/upload/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = uploadResponse.data.imageUrl;

      // Update user profile with new avatar
      const updateResponse = await api.put("/users/profile", {
        avatar: imageUrl,
      });

      // Update user in store
      updateUser(updateResponse.data.data);
      toast.success("Profile image updated successfully!");
    } catch (error: any) {
      console.error("Image upload error:", error);
      toast.error(
        error.response?.data?.message || "Failed to upload profile image"
      );
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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

  const validatePasswordForm = () => {
    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      errors.current = "Current password is required";
    }

    if (!newPassword) {
      errors.new = "New password is required";
    } else if (newPassword.length < 6) {
      errors.new = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      errors.confirm = "Please confirm your new password";
    } else if (newPassword !== confirmPassword) {
      errors.confirm = "Passwords do not match";
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) {
      return;
    }

    setChangingPassword(true);
    try {
      await api.put("/users/profile", {
        currentPassword,
        newPassword,
      });

      toast.success("Password changed successfully!");
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setPasswordErrors({});
    } catch (error: any) {
      console.error("Password change error:", error);
      const errorMessage = error.response?.data?.message || "Failed to change password";
      toast.error(errorMessage);
      
      // Set specific error for current password
      if (error.response?.status === 401) {
        setPasswordErrors({ current: "Current password is incorrect" });
      }
    } finally {
      setChangingPassword(false);
    }
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
          
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl() || undefined}
                    alt={user?.name || "Profile"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-4xl font-bold">${getInitials()}</span>`;
                      }
                    }}
                  />
                ) : (
                  <span>{getInitials()}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Change profile picture"
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <CameraIcon className="w-5 h-5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              Click the camera icon to upload a profile picture
            </p>
          </div>

          {/* Profile Details */}
          <div className="space-y-4 mb-8">
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

          {/* Password Change Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LockClosedIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <h3 className="text-lg font-semibold">Change Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  if (showPasswordForm) {
                    // Reset form when closing
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordErrors({});
                  }
                }}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        if (passwordErrors.current) {
                          setPasswordErrors({ ...passwordErrors, current: undefined });
                        }
                      }}
                      className={`input w-full pr-10 ${
                        passwordErrors.current ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showCurrentPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.current && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordErrors.current}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (passwordErrors.new) {
                          setPasswordErrors({ ...passwordErrors, new: undefined });
                        }
                        // Clear confirm error if passwords now match
                        if (e.target.value === confirmPassword && passwordErrors.confirm) {
                          setPasswordErrors({ ...passwordErrors, confirm: undefined });
                        }
                      }}
                      className={`input w-full pr-10 ${
                        passwordErrors.new ? "border-red-500" : ""
                      }`}
                      placeholder="Enter your new password (min. 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.new && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordErrors.new}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (passwordErrors.confirm) {
                          setPasswordErrors({ ...passwordErrors, confirm: undefined });
                        }
                      }}
                      className={`input w-full pr-10 ${
                        passwordErrors.confirm ? "border-red-500" : ""
                      }`}
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {passwordErrors.confirm && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {passwordErrors.confirm}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {changingPassword ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Changing Password...
                      </span>
                    ) : (
                      "Change Password"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordErrors({});
                    }}
                    className="btn-secondary"
                    disabled={changingPassword}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
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
