import { Link } from "react-router-dom";

export const PromotionalBanner = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white">
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6">
              🎉 Special Offer
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Summer Sale
              <br />
              <span className="text-yellow-300">Up to 50% Off</span>
            </h2>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Don't miss out on our biggest sale of the season. Limited time
              only!
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products?sort=price-asc"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-600 font-bold rounded-lg hover:bg-yellow-300 hover:text-primary-900 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Shop Sale Now
                <svg
                  className="w-5 h-5 ml-2"
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
              </Link>
              <Link
                to="/style-quiz"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-500/30 backdrop-blur-sm text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-primary-600 transition-all duration-300"
              >
                Take Style Quiz
              </Link>
            </div>
          </div>

          {/* Right Content - Countdown Timer */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Sale Ends In:
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: "Days", value: "12" },
                { label: "Hours", value: "05" },
                { label: "Minutes", value: "43" },
                { label: "Seconds", value: "28" },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="bg-white rounded-lg p-4 mb-2">
                    <span className="text-3xl md:text-4xl font-bold text-primary-600">
                      {item.value}
                    </span>
                  </div>
                  <p className="text-sm text-primary-100 font-medium">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-primary-100 mb-4">
                ⚡ Over 1,000 items on sale
              </p>
              <div className="flex justify-center gap-2">
                {["🔥", "💎", "✨", "🎁", "⭐"].map((emoji, i) => (
                  <span
                    key={i}
                    className="text-2xl animate-bounce"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
