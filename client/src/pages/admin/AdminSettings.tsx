import { useState } from "react";
import toast from "react-hot-toast";
import {
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  TruckIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // General Settings
  const [storeName, setStoreName] = useState("Seven Apparel");
  const [storeEmail, setStoreEmail] = useState("admin@sevenapparel.com");
  const [storePhone, setStorePhone] = useState("+1 (555) 123-4567");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [newUserNotifications, setNewUserNotifications] = useState(false);

  // Shipping Settings
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(50);
  const [standardShippingCost, setStandardShippingCost] = useState(5.99);
  const [expressShippingCost, setExpressShippingCost] = useState(12.99);

  // Payment Settings
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [codEnabled, setCodEnabled] = useState(true);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "general", name: "General", icon: CogIcon },
    { id: "notifications", name: "Notifications", icon: BellIcon },
    { id: "shipping", name: "Shipping", icon: TruckIcon },
    { id: "payment", name: "Payment", icon: CreditCardIcon },
    { id: "email", name: "Email", icon: EnvelopeIcon },
    { id: "security", name: "Security", icon: ShieldCheckIcon },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your store settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  General Settings
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Name
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Email
                  </label>
                  <input
                    type="email"
                    value={storeEmail}
                    onChange={(e) => setStoreEmail(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Store Phone
                  </label>
                  <input
                    type="tel"
                    value={storePhone}
                    onChange={(e) => setStorePhone(e.target.value)}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="input"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD (C$)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="input"
                    >
                      <option value="America/New_York">
                        Eastern Time (ET)
                      </option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">
                        Pacific Time (PT)
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Notification Preferences
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Email Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Order Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified about new orders
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderNotifications}
                      onChange={(e) => setOrderNotifications(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Low Stock Alerts
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alert when products are running low
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={lowStockAlerts}
                      onChange={(e) => setLowStockAlerts(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        New User Notifications
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when new users register
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newUserNotifications}
                      onChange={(e) =>
                        setNewUserNotifications(e.target.checked)
                      }
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Shipping Settings */}
            {activeTab === "shipping" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Shipping Configuration
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Free Shipping Threshold
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) =>
                        setFreeShippingThreshold(Number(e.target.value))
                      }
                      className="input pl-8"
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Orders above this amount get free shipping
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Standard Shipping Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={standardShippingCost}
                      onChange={(e) =>
                        setStandardShippingCost(Number(e.target.value))
                      }
                      className="input pl-8"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Express Shipping Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={expressShippingCost}
                      onChange={(e) =>
                        setExpressShippingCost(Number(e.target.value))
                      }
                      className="input pl-8"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Payment Methods
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Stripe
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Accept credit and debit cards
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={stripeEnabled}
                      onChange={(e) => setStripeEnabled(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        PayPal
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Accept PayPal payments
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={paypalEnabled}
                      onChange={(e) => setPaypalEnabled(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        Cash on Delivery
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow payment upon delivery
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={codEnabled}
                      onChange={(e) => setCodEnabled(e.target.checked)}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Email Configuration
                </h2>
                <div className="text-center py-12">
                  <EnvelopeIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Email settings coming soon...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Configure SMTP settings and email templates
                  </p>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Security Settings
                </h2>
                <div className="text-center py-12">
                  <ShieldCheckIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Security settings coming soon...
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Configure 2FA, password policies, and access controls
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
