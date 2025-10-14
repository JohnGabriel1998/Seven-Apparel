import { Link } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  description: string;
  image: string;
  link: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Women's Collection",
    description: "Elegant & Trendy",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop",
    link: "/products?gender=women",
    color: "from-pink-500 to-rose-500",
  },
  {
    id: 2,
    name: "Men's Collection",
    description: "Bold & Sophisticated",
    image:
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&h=800&fit=crop",
    link: "/products?gender=men",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: 3,
    name: "Kids Collection",
    description: "Playful & Comfortable",
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&h=800&fit=crop",
    link: "/products?category=kids",
    color: "from-yellow-500 to-orange-500",
  },
  {
    id: 4,
    name: "Accessories",
    description: "Complete Your Look",
    image:
      "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&h=800&fit=crop",
    link: "/products?category=accessories",
    color: "from-purple-500 to-pink-500",
  },
];

export const CategoryShowcase = () => {
  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            Shop by Category
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Explore our curated collections for every style
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative h-[400px] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-60 group-hover:opacity-70 transition-opacity duration-500`}
              ></div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <div className="transform transition-transform duration-500 group-hover:translate-y-0 translate-y-2">
                  <p className="text-sm font-medium mb-2 opacity-90">
                    {category.description}
                  </p>
                  <h3 className="text-2xl font-bold mb-3">{category.name}</h3>
                  <div className="inline-flex items-center text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Shop Now
                    <svg
                      className="w-5 h-5 ml-2 transform group-hover:translate-x-2 transition-transform"
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
                  </div>
                </div>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-4 border-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
