import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: {
    url?: string;
    alt?: string;
  };
  category: string;
  tags: string[];
  publishedAt: string;
  author?: {
    name?: string;
    avatar?: string;
  };
}

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchPosts = async () => {
      try {
        const response = await api.get("/blog");
        if (!active) return;
        setPosts(response.data?.data ?? []);
      } catch (_error) {
        if (!active) return;
        setError("We couldn't load the latest stories. Please try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="uppercase tracking-wide text-primary-600 text-sm font-semibold">
            Seven Apparel Journal
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-5">
            Style stories & insider tips
          </h1>
          <p className="text-gray-600">
            Explore the latest drops, styling guides, and behind-the-scenes
            stories from the world of Seven Apparel.
          </p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-8 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center bg-white shadow-sm rounded-xl px-6 py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Fresh content is coming soon
            </h2>
            <p className="text-gray-600">
              Check back later for new editorials, interviews, and style edits
              from our creative team.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const imageUrl = post.featuredImage?.url;

              return (
                <article
                  key={post._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
                >
                  <Link to={`/blog/${post.slug}`} className="flex flex-col flex-1">
                    {imageUrl ? (
                      <div className="relative h-48 overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={post.featuredImage?.alt || post.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-500 text-sm uppercase tracking-wider">
                        Style Notes
                      </div>
                    )}
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-primary-600 font-semibold">
                        <span>
                          {(post.category || "style").replace(/-/g, " ")}
                        </span>
                        {post.publishedAt && (
                          <span className="text-gray-400">
                            {formatDate(post.publishedAt)}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 mt-3 mb-2">
                        {post.title}
                      </h2>
                      <p className="text-gray-600 text-sm flex-1">
                        {post.excerpt}
                      </p>
                      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          {post.author?.avatar && (
                            <img
                              src={post.author.avatar}
                              alt={post.author.name || "Author"}
                              className="h-8 w-8 rounded-full object-cover"
                              loading="lazy"
                            />
                          )}
                          <span>{post.author?.name || "Seven Apparel Team"}</span>
                        </div>
                        <span className="font-medium text-primary-600">
                          Read more
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
