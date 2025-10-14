import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  author: {
    name: string;
    email: string;
  };
  category: string;
  tags: string[];
  published: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

const AdminBlog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // Mock data for now - you'll need to create a blog API endpoint
      const mockPosts: BlogPost[] = [
        {
          _id: "1",
          title: "Spring Fashion Trends 2024",
          slug: "spring-fashion-trends-2024",
          excerpt:
            "Discover the hottest spring trends that will dominate the season.",
          author: {
            name: "Admin User",
            email: "admin@sevenapparel.com",
          },
          category: "Trends",
          tags: ["spring", "fashion", "trends"],
          published: true,
          publishedAt: "2024-01-15",
          views: 1250,
          createdAt: "2024-01-10",
          updatedAt: "2024-01-15",
        },
        {
          _id: "2",
          title: "How to Style Your Summer Wardrobe",
          slug: "how-to-style-summer-wardrobe",
          excerpt:
            "Essential tips for creating versatile summer outfits that keep you cool.",
          author: {
            name: "Admin User",
            email: "admin@sevenapparel.com",
          },
          category: "Style Guide",
          tags: ["summer", "styling", "tips"],
          published: false,
          views: 0,
          createdAt: "2024-02-01",
          updatedAt: "2024-02-01",
        },
      ];

      setPosts(mockPosts);
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load blog posts");
      setLoading(false);
    }
  };

  const handleDelete = async (_id: string) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      // await api.delete(`/blog/${_id}`);
      toast.success("Post deleted successfully");
      fetchPosts();
    } catch (error) {
      toast.error("Failed to delete post");
    }
  };

  const togglePublish = async (_id: string, currentStatus: boolean) => {
    try {
      // await api.patch(`/blog/${_id}/publish`, { published: !currentStatus });
      toast.success(
        `Post ${!currentStatus ? "published" : "unpublished"} successfully`
      );
      fetchPosts();
    } catch (error) {
      toast.error("Failed to update post status");
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      !filterStatus ||
      (filterStatus === "published" && post.published) ||
      (filterStatus === "draft" && !post.published);
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
          onClick={() => toast.success("Coming soon: Add new blog post")}
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
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="">All Posts</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>
      </div>

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
                    {post.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900 dark:text-white">
                    <EyeIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {post.views}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublish(post._id, post.published)}
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      post.published
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => toast.success("Coming soon: View post")}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                  >
                    <EyeIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => toast.success("Coming soon: Edit post")}
                    className="text-primary-600 hover:text-primary-900 dark:text-primary-400 mr-3"
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
    </div>
  );
};

export default AdminBlog;
