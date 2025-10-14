import { Link, Navigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { TrashIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export const Cart = () => {
  const { isAuthenticated } = useAuthStore();
  const { items, removeItem, updateQuantity, getTotal, getItemCount } =
    useCartStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    toast.error("Please login to view your cart");
    return <Navigate to="/login" replace />;
  }

  const handleUpdateQuantity = (
    productId: string,
    color: string,
    size: string,
    newQuantity: number
  ) => {
    if (newQuantity === 0) {
      removeItem(productId, color, size);
      toast.success("Item removed from cart");
    } else {
      updateQuantity(productId, color, size, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, color: string, size: string) => {
    removeItem(productId, color, size);
    toast.success("Item removed from cart");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.color}-${item.size}`}
                className="flex gap-4 p-6 border-b dark:border-gray-700 last:border-b-0"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${item.productId}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={
                      typeof item.image === "string"
                        ? item.image
                        : (item.image as any)?.url ||
                          "https://via.placeholder.com/150"
                    }
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1">
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-semibold text-lg hover:text-primary-600 transition-colors"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Color: {item.color} | Size: {item.size}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-4">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId,
                          item.color,
                          item.size,
                          item.quantity - 1
                        )
                      }
                      className="p-1 border border-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MinusIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-1 border border-gray-300 rounded">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(
                          item.productId,
                          item.color,
                          item.size,
                          item.quantity + 1
                        )
                      }
                      className="p-1 border border-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <PlusIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price and Remove */}
                <div className="text-right flex flex-col justify-between">
                  <button
                    onClick={() =>
                      handleRemoveItem(item.productId, item.color, item.size)
                    }
                    className="text-red-600 hover:text-red-800 mb-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <div>
                    <p className="text-lg font-bold text-primary-600">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ₱{item.price} each
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <Link
            to="/products"
            className="inline-block mt-6 text-primary-600 hover:underline"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Subtotal ({getItemCount()} items)
                </span>
                <span className="font-semibold">₱{getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Shipping
                </span>
                <span className="font-semibold">
                  {getTotal() >= 5000 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    "₱150.00"
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Tax (12% VAT)
                </span>
                <span className="font-semibold">
                  ₱{(getTotal() * 0.12).toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary-600">
                  ₱
                  {(
                    getTotal() +
                    (getTotal() >= 5000 ? 0 : 150) +
                    getTotal() * 0.12
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            {getTotal() < 5000 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
                Add ₱{(5000 - getTotal()).toFixed(2)} more to get FREE shipping!
              </p>
            )}

            <Link
              to="/checkout"
              className="block w-full btn-primary text-center"
            >
              Proceed to Checkout
            </Link>

            <div className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              <p className="flex items-center gap-2 mb-2">
                <span>✓</span> Free shipping on orders over ₱5,000
              </p>
              <p className="flex items-center gap-2 mb-2">
                <span>✓</span> 30-day return policy
              </p>
              <p className="flex items-center gap-2">
                <span>✓</span> Secure checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
