import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";

interface BlogAuthor {
  name?: string;
  avatar?: string;
}

interface RelatedProduct {
  _id: string;
  name?: string;
  slug?: string;
  images?: string[];
  price?: number;
}

interface BlogPostResponse {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags?: string[];
  featuredImage?: {
    url?: string;
    alt?: string;
  };
  images?: string[];
  author?: BlogAuthor;
  publishedAt?: string;
  relatedProducts?: RelatedProduct[];
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

const formatPrice = (value?: number) => {
  if (value == null) return "";
  return `₱${value.toFixed(2)}`;
};

export const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      setError("We couldn't find that story.");
      setLoading(false);
      return;
    }

    let active = true;

    const fetchPost = async () => {
      try {
        const response = await api.get(`/blog/${slug}`);
        if (!active) return;
        setPost(response.data?.data ?? null);
        if (!response.data?.data) {
          setError("This story is no longer available.");
        }
      } catch (_error) {
        if (!active) return;
        setError("We couldn't load this story. Please try again.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      active = false;
    };
  }, [slug]);

  const renderedContent = useMemo(() => {
    if (!post?.content) return null;

    const trimmed = post.content.trim();
    if (!trimmed) return null;

    const looksLikeHtml = /<[a-z][\s\S]*>/i.test(trimmed);

    if (looksLikeHtml) {
      return (
        <div
          className="space-y-6 leading-relaxed text-gray-700 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_strong]:text-gray-900 [&_a]:text-primary-600 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
      );
    }

    return (
      <div className="space-y-6 leading-relaxed text-gray-700">
        {trimmed
          .split(/\n{2,}/)
          .map((paragraph, index) => (
            <p key={index} className="text-lg">
              {paragraph.trim()}
            </p>
          ))}
      </div>
    );
  }, [post?.content]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">{error}</h1>
        <p className="text-gray-600 mb-8">
          Explore the latest drops and styling tips on our main blog page.
        </p>
        <button
          onClick={() => navigate("/blog")}
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-white font-medium hover:bg-primary-700 transition-colors"
        >
          Back to all stories
        </button>
      </div>
    );
  }

  return (
    <article className="bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-16">
          <div className="text-sm text-primary-600 font-semibold uppercase tracking-wider mb-4">
            <Link to="/blog" className="hover:underline">
              Journal
            </Link>{" "}
            / {post.category.replace(/-/g, " ")}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mt-8">
            <div className="flex items-center gap-3">
              {post.author?.avatar && (
                <img
                  src={post.author.avatar}
                  alt={post.author.name || "Author"}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
              )}
              <div className="flex flex-col">
                <span className="text-gray-900 font-medium">
                  {post.author?.name || "Seven Apparel Team"}
                </span>
                {post.publishedAt && (
                  <span>{formatDate(post.publishedAt)}</span>
                )}
              </div>
            </div>
            {post.tags?.length ? (
              <div className="flex flex-wrap items-center gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {post.featuredImage?.url && (
        <div className="relative bg-gray-900">
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt || post.title}
            className="w-full h-[28rem] md:h-[34rem] object-cover"
          />
        </div>
      )}

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm px-8 py-12">
          {renderedContent}
        </div>

        {post.relatedProducts && post.relatedProducts.length > 0 && (
          <section className="max-w-5xl mx-auto mt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Shop the look
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {post.relatedProducts.map((product) => {
                const productImage = product.images?.[0];
                return (
                  <Link
                    key={product._id}
                    to={product.slug ? `/products/${product.slug}` : "/products"}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col"
                  >
                    <div className="h-48 bg-gray-100 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name || "Product"}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-gray-500 text-sm uppercase tracking-wide">
                          Seven Apparel
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name || "Featured piece"}
                    </h3>
                    {product.price != null && (
                      <span className="text-primary-600 font-medium mt-2">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
};
