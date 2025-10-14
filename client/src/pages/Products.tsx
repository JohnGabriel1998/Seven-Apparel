import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import toast from "react-hot-toast";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "../components/products/ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  rating: { average: number };
}

export const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    gender: searchParams.get("gender") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    brand: searchParams.get("brand") || "",
    sort: searchParams.get("sort") || "newest",
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const { data } = await api.get(`/products?${params.toString()}`);
      setProducts(data.data || data.products || []);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setFilters({
      category: "",
      gender: "",
      minPrice: "",
      maxPrice: "",
      brand: "",
      sort: "newest",
    });
    setSearchParams({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shop All Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Filters</h2>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Category</h3>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="input w-full"
              >
                <option value="">All Categories</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Gender</h3>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className="input w-full"
              >
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  className="input w-full"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  className="input w-full"
                />
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Sort By</h3>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="input w-full"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <button
              onClick={clearAllFilters}
              className="w-full btn-secondary hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No products found
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Showing{" "}
                  <span className="font-semibold">{products.length}</span>{" "}
                  products
                </p>
                <button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
                >
                  <FunnelIcon className="w-5 h-5" />
                  Filters
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product as any} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
