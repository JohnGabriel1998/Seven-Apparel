import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  image: string;
  rating: number;
  text: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Fashion Enthusiast",
    image: "https://i.pravatar.cc/150?img=1",
    rating: 5,
    text: "Seven Apparel has the best collection of trendy clothes! The quality is amazing and the customer service is top-notch. I'm a regular customer now!",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Business Professional",
    image: "https://i.pravatar.cc/150?img=12",
    rating: 5,
    text: "Perfect blend of style and comfort. Their business casual collection is exactly what I needed for my wardrobe. Fast shipping too!",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    role: "Yoga Instructor",
    image: "https://i.pravatar.cc/150?img=5",
    rating: 5,
    text: "Love the sustainable fashion options! The materials feel premium and I feel good knowing I'm supporting eco-friendly practices.",
  },
  {
    id: 4,
    name: "David Thompson",
    role: "Creative Director",
    image: "https://i.pravatar.cc/150?img=13",
    rating: 4,
    text: "Great variety and unique designs. The style quiz helped me find pieces that perfectly match my aesthetic. Highly recommend!",
  },
  {
    id: 5,
    name: "Lisa Park",
    role: "Mom of Two",
    image: "https://i.pravatar.cc/150?img=9",
    rating: 5,
    text: "The kids' collection is adorable and durable! My children love their new outfits and I love the affordable prices.",
  },
  {
    id: 6,
    name: "James Wilson",
    role: "Fitness Trainer",
    image: "https://i.pravatar.cc/150?img=14",
    rating: 5,
    text: "Excellent activewear selection! The fabrics are breathable and the fit is perfect. Will definitely order again.",
  },
];

export const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visible;
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Real reviews from real customers
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-xl flex items-center justify-center text-gray-800 dark:text-white hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Previous testimonials"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 w-12 h-12 bg-white dark:bg-gray-700 rounded-full shadow-xl flex items-center justify-center text-gray-800 dark:text-white hover:bg-primary-600 hover:text-white transition-all duration-300 hover:scale-110"
            aria-label="Next testimonials"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {getVisibleTestimonials().map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`bg-gray-50 dark:bg-gray-700 rounded-2xl p-8 shadow-lg transition-all duration-500 ${
                  index === 1 ? "md:scale-105 md:shadow-2xl" : ""
                }`}
              >
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300 dark:text-gray-600"
                      }`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-gray-600 shadow-md"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Quote Icon */}
                <div className="absolute top-6 right-6 text-primary-600 opacity-20">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-primary-600 w-8"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-primary-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Join thousands of satisfied customers
          </p>
          <a
            href="/products"
            className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start Shopping
          </a>
        </div>
      </div>
    </section>
  );
};
