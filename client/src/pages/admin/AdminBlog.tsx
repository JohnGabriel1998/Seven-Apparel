import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api";
import BlogPostForm from "../../components/admin/BlogPostForm";

type PublishStatus = "draft" | "published";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author?: {
    name?: string;
    avatar?: string;
  };
  category?: string;
  tags: string[];
  status: PublishStatus;
  publishedAt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  featuredImage?: {
    url?: string;
    alt?: string;
  };
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | PublishStatus>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; postId: string | null }>({
    show: false,
    postId: null,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/blog", {
        params: {
          limit: 100,
          includeAll: true, // Get both published and draft posts for admin
        },
      });

      const normalized: BlogPost[] = (response.data?.data ?? []).map(
        (post: any) => ({
          _id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          author: post.author,
          category: post.category,
          tags: Array.isArray(post.tags) ? post.tags : [],
          status: (post.status ?? "published") as PublishStatus,
          publishedAt: post.publishedAt,
          viewCount: post.viewCount ?? 0,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          featuredImage: post.featuredImage,
        })
      );

      setPosts(normalized);
    } catch (error) {
      console.error(error);
      setError("Failed to load blog posts");
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    setDeleteConfirm({ show: true, postId: _id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.postId) return;

    try {
      await api.delete(`/blog/${deleteConfirm.postId}`);
      toast.success("Post deleted successfully");
      fetchPosts();
      setDeleteConfirm({ show: false, postId: null });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete post");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, postId: null });
  };

  const handleCreatePost = () => {
    setEditingPostId(undefined);
    setIsFormOpen(true);
  };

  const handleEditPost = (_id: string) => {
    setEditingPostId(_id);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingPostId(undefined);
  };

  const handleFormSuccess = () => {
    fetchPosts();
  };

  const togglePublish = async (_id: string, currentStatus: PublishStatus) => {
    const nextStatus: PublishStatus =
      currentStatus === "published" ? "draft" : "published";

    try {
      const payload: Record<string, unknown> = {
        status: nextStatus,
      };

      if (nextStatus === "published") {
        payload.publishedAt = new Date().toISOString();
      }

      await api.put(`/blog/${_id}`, payload);
      toast.success(
        nextStatus === "published"
          ? "Post published successfully"
          : "Post moved to drafts"
      );
      fetchPosts();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update post status");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || post.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Blog Management
        </h1>
        <button
          onClick={handleCreatePost}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Post
        </button>
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
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as "" | PublishStatus)
              }
              className="input"
            >
              <option value="">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Blog Posts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Post
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPosts.map((post) => (
              <tr key={post._id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {post.excerpt.substring(0, 60)}...
                    </div>
                    <div className="flex gap-1 mt-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {post.category || "Uncategorized"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <EyeIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {post.viewCount}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublish(post._id, post.status)}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.status === "published"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {post.status === "published" ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => window.open(`/blog/${post.slug}`, "_blank")}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                    title="View post"
                  >
                    <EyeIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => handleEditPost(post._id)}
                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 mr-3"
                    title="Edit post"
                  >
                    <PencilIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No posts found</p>
          </div>
        )}
      </div>

      {/* Blog Post Form Modal */}
      <BlogPostForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        postId={editingPostId}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                Delete Post
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
