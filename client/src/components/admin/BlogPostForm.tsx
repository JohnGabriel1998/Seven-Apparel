import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import api from "../../utils/api";

type PublishStatus = "draft" | "published";
type Category = "style-tips" | "trends" | "how-to" | "lookbook" | "news";

interface BlogPostFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  postId?: string;
}

interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  category: Category | "";
  tags: string;
  status: PublishStatus;
  featuredImage?: {
    url: string;
    alt: string;
  };
}

const BlogPostForm = ({
  isOpen,
  onClose,
  onSuccess,
  postId,
}: BlogPostFormProps) => {
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    tags: "",
    status: "draft",
  });
  const [loading, setLoading] = useState(false);
  const [fetchingPost, setFetchingPost] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (postId) {
      fetchPost();
    } else {
      resetForm();
    }
  }, [postId, isOpen]);

  const fetchPost = async () => {
    if (!postId) return;

    setFetchingPost(true);
    try {
      // Fetch by ID using a different endpoint or query all posts
      const response = await api.get("/blog", {
        params: { limit: 1000 },
      });

      const post = response.data?.data?.find((p: any) => p._id === postId);

      if (!post) {
        toast.error("Post not found");
        onClose();
        return;
      }

      setFormData({
        title: post.title || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        category: post.category || "",
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
        status: post.status || "draft",
        featuredImage: post.featuredImage,
      });

      if (post.featuredImage?.url) {
        setImagePreview(post.featuredImage.url);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load blog post");
      onClose();
    } finally {
      setFetchingPost(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files are allowed (JPEG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setUploading(true);
    const uploadFormData = new FormData();
    uploadFormData.append("image", file);

    try {
      const response = await api.post("/upload/single", uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const imageUrl = response.data.imageUrl;
      setFormData({
        ...formData,
        featuredImage: {
          url: imageUrl,
          alt: formData.title || file.name,
        },
      });
      setImagePreview(imageUrl);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      featuredImage: undefined,
    });
    setImagePreview("");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      category: "",
      tags: "",
      status: "draft",
    });
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error("Please enter an excerpt");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Please enter content");
      return;
    }

    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
        status: formData.status,
      };

      // Add publishedAt if publishing
      if (formData.status === "published") {
        payload.publishedAt = new Date().toISOString();
      }

      // Add featured image if exists
      if (formData.featuredImage?.url) {
        payload.featuredImage = {
          url: formData.featuredImage.url,
          alt: formData.featuredImage.alt || formData.title.trim(),
        };
        console.log("Sending featuredImage:", payload.featuredImage);
      }

      console.log("Blog post payload:", payload);

      if (postId) {
        await api.put(`/blog/${postId}`, payload);
        toast.success("Blog post updated successfully");
      } else {
        await api.post("/blog", payload);
        toast.success("Blog post created successfully");
      }

      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${postId ? "update" : "create"} blog post`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {postId ? "Edit Blog Post" : "Create New Blog Post"}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {fetchingPost ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="input"
                    placeholder="Enter blog post title"
                    required
                  />
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) =>
                      setFormData({ ...formData, excerpt: e.target.value })
                    }
                    rows={3}
                    className="input"
                    placeholder="Brief description of the blog post"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={12}
                    className="input font-mono text-sm"
                    placeholder="Write your blog post content here (supports markdown)"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    You can use markdown formatting
                  </p>
                </div>

                {/* Category and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as Category | "",
                        })
                      }
                      className="input"
                      required
                    >
                      <option value="">Select category</option>
                      <option value="style-tips">Style Tips</option>
                      <option value="trends">Trends</option>
                      <option value="how-to">How To</option>
                      <option value="lookbook">Lookbook</option>
                      <option value="news">News</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.value as PublishStatus,
                        })
                      }
                      className="input"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    className="input"
                    placeholder="fashion, style, trends (comma separated)"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Separate tags with commas
                  </p>
                </div>

                {/* Featured Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image{" "}
                    {formData.featuredImage?.url && (
                      <span className="text-green-600">✓ Uploaded</span>
                    )}
                  </label>

                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-green-500"
                      />
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Ready to publish
                      </div>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="text-gray-600 dark:text-gray-400">
                          {uploading ? (
                            <div className="flex flex-col items-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                              <p>Uploading...</p>
                            </div>
                          ) : (
                            <>
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <p className="mt-2 text-sm">
                                Click to upload or drag and drop
                              </p>
                              <p className="text-xs mt-1">
                                PNG, JPG, GIF, WebP up to 5MB
                              </p>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {loading
                      ? "Saving..."
                      : postId
                      ? "Update Post"
                      : "Create Post"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostForm;
