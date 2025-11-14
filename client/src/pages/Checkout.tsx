import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import api from "../utils/api";
import {
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { CascadingAddressSelect } from "../components/common/CascadingAddressSelect";

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  region: string;
  province: string;
  city: string;
  barangay: string;
  zipCode: string;
  country: string;
}

interface GCashInfo {
  phoneNumber: string;
}

interface PayMayaInfo {
  phoneNumber: string;
  email: string;
}

export const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Confirmation
  const [loading, setLoading] = useState(false);

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    region: "",
    province: "",
    city: "",
    barangay: "",
    zipCode: "",
    country: "Philippines",
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("gcash"); // Default to GCash for Philippine market

  const [gcashInfo, setGCashInfo] = useState<GCashInfo>({
    phoneNumber: "",
  });

  const [paymayaInfo, setPayMayaInfo] = useState<PayMayaInfo>({
    phoneNumber: "",
    email: user?.email || "",
  });

  const [orderId, setOrderId] = useState<string>("");
  const [showLoader, setShowLoader] = useState(false);

  // Redirect if cart is empty
  if (items.length === 0 && step !== 3) {
    navigate("/cart");
    return null;
  }

  const subtotal = getTotal();
  const shipping = subtotal > 5000 ? 0 : 150; // Free shipping over ₱5000, otherwise ₱150
  const tax = subtotal * 0.12; // 12% VAT in Philippines
  const total = subtotal + shipping + tax;

  // Address change handler for cascading dropdown
  const handleAddressChange = (address: {
    region: string;
    regionCode: string;
    province: string;
    city: string;
    barangay: string;
    zipCode: string;
  }) => {
    setShippingInfo((prev) => ({
      ...prev,
      region: address.region,
      province: address.province,
      city: address.city,
      barangay: address.barangay,
      zipCode: address.zipCode,
    }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate shipping info
    if (
      !shippingInfo.fullName ||
      !shippingInfo.email ||
      !shippingInfo.phone ||
      !shippingInfo.address ||
      !shippingInfo.region ||
      !shippingInfo.province ||
      !shippingInfo.city ||
      !shippingInfo.barangay ||
      !shippingInfo.zipCode
    ) {
      toast.error("Please fill in all shipping information");
      return;
    }

    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate payment info based on selected method
    let paymentDetails: any = {};

    if (selectedPaymentMethod === "gcash") {
      if (!gcashInfo.phoneNumber) {
        toast.error("Please enter your GCash mobile number");
        return;
      }
      if (gcashInfo.phoneNumber.replace(/\D/g, "").length !== 11) {
        toast.error("Invalid GCash mobile number (should be 11 digits)");
        return;
      }
      paymentDetails = {
        phoneNumber: gcashInfo.phoneNumber,
      };
    } else if (selectedPaymentMethod === "paymaya") {
      if (!paymayaInfo.phoneNumber || !paymayaInfo.email) {
        toast.error("Please fill in all PayMaya information");
        return;
      }
      if (paymayaInfo.phoneNumber.replace(/\D/g, "").length !== 11) {
        toast.error("Invalid PayMaya mobile number (should be 11 digits)");
        return;
      }
      paymentDetails = {
        phoneNumber: paymayaInfo.phoneNumber,
        email: paymayaInfo.email,
      };
    }

    setLoading(true);
    setShowLoader(true);

    try {
      // Create order with payment
      const orderData = {
        items: items.map((item) => ({
          product: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          image:
            typeof item.image === "string"
              ? item.image
              : (item.image as any)?.url || "",
        })),
        shippingAddress: {
          fullName: shippingInfo.fullName,
          email: shippingInfo.email,
          phone: shippingInfo.phone,
          addressLine1: shippingInfo.address,
          region: shippingInfo.region,
          province: shippingInfo.province,
          city: shippingInfo.city,
          barangay: shippingInfo.barangay,
          zipCode: shippingInfo.zipCode,
          country: shippingInfo.country,
        },
        paymentMethod: selectedPaymentMethod,
        paymentDetails: paymentDetails,
        subtotal: subtotal,
        shippingCost: shipping,
        tax: tax,
        total: total,
        shippingMethod: shipping === 0 ? "Standard (Free)" : "Standard",
      };

      const { data } = await api.post("/orders", orderData);

      setOrderId(data.data._id || data._id);

      // Check if payment requires action (e.g., redirect to GCash)
      if (data.payment?.requiresAction && data.payment?.paymentUrl) {
        setShowLoader(false);
        toast.success("Redirecting to GCash to complete payment...", {
          duration: 3000,
        });
        
        // Redirect to GCash payment page
        setTimeout(() => {
          window.location.href = data.payment.paymentUrl;
        }, 1500);
        return;
      }

      // Show success toast after a brief delay
      setTimeout(() => {
        setShowLoader(false);
        toast.success("Payment successful! Order confirmed 🎉", {
          duration: 5000,
        });
        toast.success("Confirmation email sent to " + shippingInfo.email, {
          duration: 4000,
          icon: "📧",
        });
        clearCart();
        setStep(3);
        window.scrollTo(0, 0);
      }, 2000);
    } catch (error: any) {
      console.error("Order error:", error);
      setShowLoader(false);
      const errorMsg =
        error.response?.data?.message || "Payment processing failed";
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Loading Animation Overlay */}
      {showLoader && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl">
            {/* Animated Truck/Package Icon */}
            <div className="mb-6 relative">
              <div className="animate-bounce">
                <svg
                  className="w-24 h-24 mx-auto text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
              </div>
              {/* Animated dots */}
              <div className="flex justify-center gap-2 mt-4">
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
              Processing Your Order
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Please wait while we prepare your package...
            </p>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 1
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > 1 ? <CheckCircleIcon className="w-6 h-6" /> : "1"}
            </div>
            <span className="ml-2 font-semibold">Shipping</span>
          </div>

          <div
            className={`w-24 h-1 mx-4 ${
              step >= 2 ? "bg-primary-600" : "bg-gray-200"
            }`}
          ></div>

          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 2
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step > 2 ? <CheckCircleIcon className="w-6 h-6" /> : "2"}
            </div>
            <span className="ml-2 font-semibold">Payment</span>
          </div>

          <div
            className={`w-24 h-1 mx-4 ${
              step >= 3 ? "bg-primary-600" : "bg-gray-200"
            }`}
          ></div>

          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= 3
                  ? "bg-primary-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {step >= 3 ? <CheckCircleIcon className="w-6 h-6" /> : "3"}
            </div>
            <span className="ml-2 font-semibold">Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <TruckIcon className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-2xl font-bold">Shipping Information</h2>
              </div>

              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingInfo.fullName}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          fullName: e.target.value,
                        })
                      }
                      className="input"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingInfo.email}
                      onChange={(e) =>
                        setShippingInfo({
                          ...shippingInfo,
                          email: e.target.value,
                        })
                      }
                      className="input"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingInfo.phone}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        phone: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="(+63) 9XX XXX XXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingInfo.address}
                    onChange={(e) =>
                      setShippingInfo({
                        ...shippingInfo,
                        address: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="Blk 1 Lot 2, Street Name, Barangay"
                  />
                </div>

                {/* Cascading Address Selection */}
                <CascadingAddressSelect
                  onAddressChange={handleAddressChange}
                  initialValues={{
                    region: shippingInfo.region,
                    province: shippingInfo.province,
                    city: shippingInfo.city,
                    barangay: shippingInfo.barangay,
                  }}
                />

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    value="Philippines"
                    disabled
                    className="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Currently shipping to Philippines only
                  </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" className="btn btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Payment Information */}
          {step === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center mb-6">
                <CreditCardIcon className="w-6 h-6 text-primary-600 mr-2" />
                <h2 className="text-2xl font-bold">Payment Information</h2>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Payment Method Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Select Payment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* GCash */}
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod("gcash")}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        selectedPaymentMethod === "gcash"
                          ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-primary-400"
                      }`}
                    >
                      <div className="text-4xl mb-2">📱</div>
                      <p className="text-lg font-semibold">GCash</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Mobile Wallet
                      </p>
                    </button>

                    {/* PayMaya */}
                    <button
                      type="button"
                      onClick={() => setSelectedPaymentMethod("paymaya")}
                      className={`p-6 border-2 rounded-lg transition-all ${
                        selectedPaymentMethod === "paymaya"
                          ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20"
                          : "border-gray-300 dark:border-gray-600 hover:border-primary-400"
                      }`}
                    >
                      <div className="text-4xl mb-2">�</div>
                      <p className="text-lg font-semibold">PayMaya</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Digital Payment
                      </p>
                    </button>
                  </div>
                </div>

                {/* GCash Form */}
                {selectedPaymentMethod === "gcash" && (
                  <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        GCash Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={gcashInfo.phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setGCashInfo({ ...gcashInfo, phoneNumber: value });
                        }}
                        className="input"
                        placeholder="09XXXXXXXXX"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your 11-digit GCash mobile number
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        📱 You will receive a GCash payment notification on your
                        registered mobile number.
                      </p>
                    </div>
                  </div>
                )}

                {/* PayMaya Form */}
                {selectedPaymentMethod === "paymaya" && (
                  <div className="space-y-4 animate-[fadeIn_0.3s_ease-in]">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        PayMaya Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        value={paymayaInfo.phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setPayMayaInfo({
                            ...paymayaInfo,
                            phoneNumber: value,
                          });
                        }}
                        className="input"
                        placeholder="09XXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        PayMaya Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={paymayaInfo.email}
                        onChange={(e) =>
                          setPayMayaInfo({
                            ...paymayaInfo,
                            email: e.target.value,
                          })
                        }
                        className="input"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        💰 You will be redirected to PayMaya to complete your
                        payment securely.
                      </p>
                    </div>
                  </div>
                )}

                {/* Common Security Note and Buttons */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>✓ Secure Payment Processing</strong>
                    <br />
                    All transactions are encrypted and secure. We never store
                    your complete payment details.
                  </p>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn btn-outline"
                  >
                    Back to Shipping
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary px-8"
                  >
                    {loading
                      ? "Processing Payment..."
                      : `Pay ₱${total.toFixed(2)}`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Order Confirmation */}
          {step === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <div className="text-center py-8">
                {/* Success Icon with Animation */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-[scale-in_0.5s_ease-out]">
                    <CheckCircleIcon className="w-12 h-12 text-white" />
                  </div>
                  {/* Confetti effect */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl animate-[bounce_1s_ease-in-out_infinite]">
                      🎉
                    </div>
                  </div>
                </div>

                <h2 className="text-4xl font-bold mb-3 text-gray-900 dark:text-white">
                  Order Confirmed!
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  Thank you for your purchase.
                </p>

                {/* Order ID Badge */}
                <div className="inline-block bg-primary-50 dark:bg-primary-900/20 px-6 py-3 rounded-full mb-8">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Order ID:{" "}
                    <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                      {orderId}
                    </span>
                  </p>
                </div>

                {/* Details Section */}
                <div className="max-w-lg mx-auto space-y-4 text-left">
                  {/* Shipping Address */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-600">
                    <h3 className="font-bold text-lg mb-3 flex items-center text-gray-900 dark:text-white">
                      <TruckIcon className="w-5 h-5 mr-2 text-primary-600" />
                      Shipping Address
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {shippingInfo.fullName}
                      <br />
                      {shippingInfo.address}
                      <br />
                      Brgy. {shippingInfo.barangay}, {shippingInfo.city}
                      <br />
                      {shippingInfo.province}, {shippingInfo.region}
                      <br />
                      {shippingInfo.zipCode}, {shippingInfo.country}
                    </p>
                  </div>

                  {/* Estimated Delivery */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl border border-green-200 dark:border-green-700">
                    <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">
                      Estimated Delivery
                    </h3>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      3-5 business days
                    </p>
                  </div>

                  {/* Email Confirmation */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                    <p className="text-blue-900 dark:text-blue-200 flex items-start">
                      <span className="text-2xl mr-3">📧</span>
                      <span>
                        A confirmation email has been sent to{" "}
                        <strong className="font-bold">
                          {shippingInfo.email}
                        </strong>
                      </span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
                  <button
                    onClick={() => navigate("/orders")}
                    className="btn btn-primary px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow"
                  >
                    View Orders
                  </button>
                  <button
                    onClick={() => navigate("/products")}
                    className="btn btn-outline px-8 py-3 text-lg font-semibold"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        {step < 3 && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.color}-${item.size}`}
                    className="flex gap-3"
                  >
                    <img
                      src={
                        typeof item.image === "string"
                          ? item.image
                          : (item.image as any)?.url ||
                            "https://via.placeholder.com/80"
                      }
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.color} | {item.size} | Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-primary-600">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t dark:border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>
                    {shipping === 0 ? "FREE" : `₱${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (12% VAT)</span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
                <div className="border-t dark:border-gray-700 pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-600">₱{total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 5000 && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Add ₱{(5000 - subtotal).toFixed(2)} more to get FREE
                    shipping!
                  </p>
                </div>
              )}

              {subtotal >= 5000 && (
                <div className="mt-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    You qualify for FREE shipping!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
