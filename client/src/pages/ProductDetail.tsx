import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuthStore } from "../store/useAuthStore";
import {
  ShoppingCartIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid, StarIcon } from "@heroicons/react/24/solid";

interface ProductVariant {
  color: string;
  size: string;
  stock: number;
  sku: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  variants: ProductVariant[];
  rating: { average: number; count: number };
  totalStock: number;
}

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem: addToCart } = useCartStore();
  const {
    items: wishlistItems,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();

  // Check if current user is admin
  const isAdmin = user?.role === "admin";

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      const productData = data.data || data;

      // Normalize images: convert objects to strings
      if (productData.images && Array.isArray(productData.images)) {
        productData.images = productData.images.map((img: any) =>
          typeof img === "string" ? img : img.url || img
        );
      }

      setProduct(productData);
      if (productData.variants.length > 0) {
        setSelectedColor(productData.variants[0].color);
        setSelectedSize(productData.variants[0].size);
      }
    } catch (error: any) {
      console.error("Product fetch error:", error);
      toast.error(error.response?.data?.message || "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableColors = () => {
    if (!product) return [];
    return [...new Set(product.variants.map((v) => v.color))];
  };

  const getAvailableSizes = () => {
    if (!product) return [];
    return [
      ...new Set(
        product.variants
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
      ),
    ];
  };

  const getSelectedVariant = () => {
    if (!product) return null;
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  };

  const handleAddToCart = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    const variant = getSelectedVariant();
    if (!variant) {
      toast.error("Please select a size and color");
      return;
    }
    if (variant.stock < quantity) {
      toast.error("Not enough stock available");
      return;
    }

    addToCart(product as any, selectedColor, selectedSize, quantity);
    toast.success("Added to cart!");
  };

  const isInWishlist = () => {
    return wishlistItems.includes(product!._id);
  };

  const toggleWishlist = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to manage wishlist");
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    if (isInWishlist()) {
      removeFromWishlist(product!._id);
      toast.success("Removed from wishlist");
    } else {
      addToWishlist(product!._id);
      toast.success("Added to wishlist");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Product not found</p>
      </div>
    );
  }

  const variant = getSelectedVariant();
  const availableColors = getAvailableColors();
  const availableSizes = getAvailableSizes();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <Link to="/" className="text-primary-600 hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="text-primary-600 hover:underline">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-500">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="mb-4 relative">
            <img
              src={
                product.images[selectedImage]
                  ? typeof product.images[selectedImage] === "string"
                    ? product.images[selectedImage]
                    : (product.images[selectedImage] as any).url ||
                      "https://via.placeholder.com/600"
                  : "https://via.placeholder.com/600"
              }
              alt={product.name}
              className="w-full h-96 lg:h-[500px] object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => {
              const imgSrc =
                typeof image === "string"
                  ? image
                  : (image as any).url || "https://via.placeholder.com/100";
              return (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`border-2 rounded-lg overflow-hidden ${
                    selectedImage === index
                      ? "border-primary-600"
                      : "border-gray-200"
                  }`}
                >
                  <img
                    src={imgSrc}
                    alt=""
                    className="w-full h-20 object-cover"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {product.brand}
          </p>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(product.rating.average)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              {product.rating.average.toFixed(1)} ({product.rating.count}{" "}
              reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-primary-600">
              ₱{product.price}
            </span>
          </div>

          {/* Description */}
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {product.description}
          </p>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Color: {selectedColor}</h3>
            <div className="flex gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(getAvailableSizes()[0] || "");
                  }}
                  className={`px-4 py-2 border-2 rounded-lg ${
                    selectedColor === color
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Size: {selectedSize}</h3>
            <div className="flex gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-2 rounded-lg ${
                    selectedSize === size
                      ? "border-primary-600 bg-primary-50 dark:bg-primary-900"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Info */}
          {variant && (
            <p className="mb-4 text-sm">
              {variant.stock > 0 ? (
                <span className="text-green-600">
                  In Stock ({variant.stock} available)
                </span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </p>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Quantity</h3>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                -
              </button>
              <span className="px-6 py-2 border border-gray-300 rounded-lg">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity(Math.min(variant?.stock || 1, quantity + 1))
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                +
              </button>
            </div>
          </div>

          {/* Admin View Banner */}
          {isAdmin && (
            <div className="mb-6 p-4 bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-primary-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-800 dark:text-primary-200">
                    <strong>Admin View:</strong> Cart and wishlist functions are
                    disabled for administrators.
                  </p>
                  <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                    You're viewing this product as an admin. Customers will see
                    the full shopping experience.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {!isAdmin ? (
            <div className="flex gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!variant || variant.stock === 0}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={toggleWishlist}
                className="p-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 transition-colors"
              >
                {isInWishlist() ? (
                  <HeartSolid className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartOutline className="w-6 h-6" />
                )}
              </button>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm font-medium">
                🛒 Shopping features are disabled in admin mode
              </p>
              <p className="text-center text-gray-500 dark:text-gray-500 text-xs mt-1">
                Use the "View Shop" option to see the customer experience
              </p>
            </div>
          )}

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-3">Product Details</h3>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <strong>Category:</strong> {product.category}
              </li>
              <li>
                <strong>Brand:</strong> {product.brand}
              </li>
              <li>
                <strong>SKU:</strong> {variant?.sku || "N/A"}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
