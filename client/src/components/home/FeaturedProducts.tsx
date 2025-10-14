import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "../products/ProductCard";
import api from "../../utils/api";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[] | any[];
  category: string;
  brand: string;
  rating?: { average: number };
  totalStock?: number;
  variants?: any[];
}

interface FeaturedProductsProps {
  title?: string;
  subtitle?: string;
  endpoint?: string;
  limit?: number;
}

export const FeaturedProducts = ({
  title = "Featured Products",
  subtitle = "Discover our handpicked selection",
  endpoint = "/products/featured",
  limit = 8,
}: FeaturedProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [endpoint]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`${endpoint}?limit=${limit}`);
      setProducts(data.data || data.products || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.offsetWidth * 0.8;
    const newPosition =
      direction === "left"
        ? scrollPosition - scrollAmount
        : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: "smooth",
    });

    setScrollPosition(newPosition);
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md animate-pulse"
              >
                <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-t-xl"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{subtitle}</p>
        </div>

        {/* Carousel Container */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={scrollPosition <= 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-800 dark:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 hover:bg-primary-600 hover:text-white"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          {/* Products Carousel */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="flex-none w-[280px] sm:w-[320px]"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-xl flex items-center justify-center text-gray-800 dark:text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-primary-600 hover:text-white"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>

        {/* View All Link */}
        <div className="text-center mt-12">
          <Link
            to="/products"
            className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            View All Products
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};
