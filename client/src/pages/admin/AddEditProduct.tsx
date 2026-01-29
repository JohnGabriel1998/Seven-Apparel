import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";
import toast from "react-hot-toast";
import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface ProductVariant {
  color: string;
  size: string;
  stock: number;
  sku: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  brand: string;
  gender: string;
  images: string[];
  variants: ProductVariant[];
  tags: string[];
  featured: boolean;
}

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageInput, setImageInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<ProductForm>({
    name: "",
    description: "",
    price: 0,
    category: "men",
    subcategory: "",
    brand: "",
    gender: "men",
    images: [],
    variants: [],
    tags: [],
    featured: false,
  });

  const [currentVariant, setCurrentVariant] = useState<ProductVariant>({
    color: "",
    size: "",
    stock: 0,
    sku: "",
  });

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      const productData = data.data || data;

      // Normalize variants: ensure color is a string
      const normalizedVariants = (productData.variants || []).map((v: any) => ({
        ...v,
        color: typeof v.color === "object" ? v.color.name : v.color,
      }));

      // Normalize images: extract URLs
      const normalizedImages = (productData.images || []).map((img: any) =>
        typeof img === "string" ? img : img.url || img,
      );

      setFormData({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        subcategory: productData.subcategory || "",
        brand: productData.brand,
        gender: productData.gender,
        images: normalizedImages,
        variants: normalizedVariants,
        tags: productData.tags || [],
        featured: productData.featured || false,
      });
    } catch (error) {
      toast.error("Failed to load product");
      navigate("/admin/products");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.variants.length === 0) {
      toast.error("Please add at least one variant");
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await api.put(`/products/${id}`, formData);
        toast.success("Product updated successfully");
      } else {
        await api.post("/products", formData);
        toast.success("Product added successfully");
      }
      navigate("/admin/products");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadedImages: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("image", files[i]);

        const { data } = await api.post("/upload/product", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Use the full URL returned from Supabase Storage, or construct from filePath
        const imageUrl = data.imageUrl || data.filePath;
        uploadedImages.push(imageUrl);
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedImages],
      }));

      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload images");
    } finally {
      setUploadingImage(false);
      // Reset the file input
      e.target.value = "";
    }
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageInput.trim()],
      });
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    const imageUrl = formData.images[index];

    // If it's an uploaded image (from our server), delete it
    if (imageUrl.includes("localhost:5000/uploads")) {
      const filename = imageUrl.split("/").pop();
      if (filename) {
        api.delete(`/upload/product/${filename}`).catch((err) => {
          console.error("Failed to delete image from server:", err);
        });
      }
    }

    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addVariant = () => {
    if (!currentVariant.color || !currentVariant.size || !currentVariant.sku) {
      toast.error("Please fill all variant fields");
      return;
    }
    setFormData({
      ...formData,
      variants: [...formData.variants, currentVariant],
    });
    setCurrentVariant({ color: "", size: "", stock: 0, sku: "" });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index),
    });
  };

  const addTag = (tagValue?: string) => {
    const tagToAdd = tagValue || tagInput.trim();
    if (!tagToAdd) return;

    // Normalize tag: convert to lowercase and replace spaces with hyphens
    const normalizeTag = (tag: string) => {
      return tag
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ""); // Remove special characters except hyphens
    };

    // Split by comma and normalize each tag
    const newTags = tagToAdd
      .split(",")
      .map(normalizeTag)
      .filter((tag) => tag && !formData.tags.includes(tag));

    if (newTags.length > 0) {
      setFormData({ ...formData, tags: [...formData.tags, ...newTags] });
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {id ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="input"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Brand *
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="input"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price (₱) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="input"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
                className="input"
                placeholder="e.g., Shirts, Jeans, Shoes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender *
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="input"
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="unisex">Unisex</option>
                <option value="kids">Kids</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="input"
              placeholder="Enter product description"
            />
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) =>
                  setFormData({ ...formData, featured: e.target.checked })
                }
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Featured Product
              </span>
            </label>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Product Images
          </h2>

          {/* File Upload Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Images from Computer
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF, WEBP (MAX. 5MB per image)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {uploadingImage && (
              <p className="mt-2 text-sm text-primary-600 dark:text-primary-400">
                Uploading images...
              </p>
            )}
          </div>

          {/* OR Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink mx-4 text-gray-600 dark:text-gray-400 text-sm">
              OR
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* URL Input Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Image from URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                className="input flex-1"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add URL
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Uploaded Images ({formData.images.length})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/150";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-60 text-white text-xs rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
            {formData.images.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No images uploaded yet
              </p>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Product Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <input
              type="text"
              value={currentVariant.color}
              onChange={(e) =>
                setCurrentVariant({ ...currentVariant, color: e.target.value })
              }
              className="input"
              placeholder="Color"
            />
            <input
              type="text"
              value={currentVariant.size}
              onChange={(e) =>
                setCurrentVariant({ ...currentVariant, size: e.target.value })
              }
              className="input"
              placeholder="Size (S, M, L, XL)"
            />
            <input
              type="number"
              min="0"
              value={currentVariant.stock || ""}
              onChange={(e) =>
                setCurrentVariant({
                  ...currentVariant,
                  stock: parseInt(e.target.value) || 0,
                })
              }
              className="input"
              placeholder="Stock"
            />
            <input
              type="text"
              value={currentVariant.sku}
              onChange={(e) =>
                setCurrentVariant({ ...currentVariant, sku: e.target.value })
              }
              className="input"
              placeholder="SKU"
            />
            <button
              type="button"
              onClick={addVariant}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex gap-4 text-sm">
                  <span>
                    <strong>Color:</strong> {variant.color}
                  </span>
                  <span>
                    <strong>Size:</strong> {variant.size}
                  </span>
                  <span>
                    <strong>Stock:</strong> {variant.stock}
                  </span>
                  <span>
                    <strong>SKU:</strong> {variant.sku}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Tags
          </h2>

          {/* Quick Tag Buttons */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Quick add:
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "new-arrival",
                "sale",
                "limited-edition",
                "bestseller",
                "trending",
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={formData.tags.includes(tag)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    formData.tags.includes(tag)
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-700 dark:hover:text-primary-300"
                  }`}
                >
                  {tag.replace("-", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTag())
              }
              className="input flex-1"
              placeholder="Enter tag and press Enter (spaces will become hyphens)"
            />
            <button
              type="button"
              onClick={() => addTag()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full text-sm flex items-center gap-2"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : id ? "Update Product" : "Add Product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;
