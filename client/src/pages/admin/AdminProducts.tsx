import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ProductImage {
  url: string;
  alt?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  totalStock: number;
  images: ProductImage[];
  featured: boolean;
  isFeatured?: boolean;
}

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [savingStock, setSavingStock] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      console.log("API Response:", data);
      console.log("Products:", data.data);
      console.log("Products count:", data.data?.length || 0);
      setProducts(data.data || []);
    } catch (error: any) {
      console.error("Failed to load products:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const setStockValue = (id: string, value: number) => {
    setEditingStock((prev) => ({ ...prev, [id]: Math.max(0, Math.floor(value || 0)) }));
  };

  const saveStock = async (id: string) => {
    const newValue = editingStock[id];
    if (newValue === undefined) return;
    setSavingStock((s) => ({ ...s, [id]: true }));
    try {
      // Fetch full product to update variant-level stock too
      const { data: productRes } = await api.get(`/products/${id}`);
      const full = productRes.data || productRes;
      let payload: any = {};
      if (Array.isArray(full?.variants) && full.variants.length > 0) {
        const updatedVariants = full.variants.map((v: any) => ({ ...v, stock: Math.max(0, Math.floor(newValue)) }));
        const total = updatedVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
        payload = { variants: updatedVariants, totalStock: total };
      } else {
        payload = { totalStock: Math.max(0, Math.floor(newValue)) };
      }

      await api.put(`/products/${id}`, payload);
      toast.success("Stock updated");
      // update local list optimistically (use computed total)
      setProducts((list) => list.map((p) => (p._id === id ? { ...p, totalStock: payload.totalStock ?? newValue } as any : p)));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update stock");
    } finally {
      setSavingStock((s) => ({ ...s, [id]: false }));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredProducts =
    products?.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        !filterCategory || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <Link
          to="/admin/products/add"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              <option value="tops">Tops</option>
              <option value="bottoms">Bottoms</option>
              <option value="dresses">Dresses</option>
              <option value="outerwear">Outerwear</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessories</option>
              <option value="activewear">Activewear</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProducts.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.images[0] && (
                      <img
                        src={
                          typeof product.images[0] === "string"
                            ? product.images[0]
                            : product.images[0].url
                        }
                        alt={
                          typeof product.images[0] === "string"
                            ? product.name
                            : product.images[0].alt || product.name
                        }
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {product.brand}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  ₱{product.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStockValue(product._id, (editingStock[product._id] ?? product.totalStock) - 1)}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      title="Decrease"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={editingStock[product._id] ?? product.totalStock}
                      onChange={(e) => setStockValue(product._id, parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-1 border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => setStockValue(product._id, (editingStock[product._id] ?? product.totalStock) + 1)}
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                      title="Increase"
                    >
                      +
                    </button>
                    <button
                      onClick={() => saveStock(product._id)}
                      disabled={savingStock[product._id]}
                      className={`ml-2 px-3 py-1 rounded ${savingStock[product._id] ? 'bg-gray-200 text-gray-500' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                    >
                      {savingStock[product._id] ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.totalStock > 0
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {product.totalStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    to={`/admin/products/edit/${product._id}`}
                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 mr-4"
                  >
                    <PencilIcon className="w-5 h-5 inline" />
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No products found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
