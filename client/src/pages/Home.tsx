import { HeroCarousel } from "../components/home/HeroCarousel";
import { FeaturedProducts } from "../components/home/FeaturedProducts";
import { CategoryShowcase } from "../components/home/CategoryShowcase";
import { PromotionalBanner } from "../components/home/PromotionalBanner";
import { Testimonials } from "../components/home/Testimonials";
import {
  TruckIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export const Home = () => {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
            transform: scale(1.05);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dark .glass-effect {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .premium-shadow {
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(255, 255, 255, 0.05);
        }
        .dark .premium-shadow {
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transform: translateX(-100%);
          transition: transform 0.6s;
        }
        .shimmer-effect:hover::before {
          animation: shimmer 0.6s ease-in-out;
        }
      `}</style>

      <div className="relative overflow-hidden">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Premium Features Section */}
        <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-float"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/3 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }}></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 mb-6">
                <SparklesIcon className="w-6 h-6 text-primary-600 animate-sparkle" />
                <span className="text-primary-600 font-bold text-lg tracking-wider uppercase">Why Choose Us</span>
                <StarIcon className="w-5 h-5 text-yellow-500 animate-sparkle" style={{ animationDelay: "1s" }} />
              </div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-gray-900 via-primary-600 to-gray-900 dark:from-white dark:via-primary-400 dark:to-white bg-clip-text text-transparent gradient-animate">
                Premium Experience
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Experience the difference with our exceptional service, quality products, and customer-first approach
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Free Shipping */}
              <div className="group relative">
                <div className="glass-effect premium-shadow rounded-3xl p-8 hover:scale-105 transition-all duration-500 h-full">
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="absolute -inset-4 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <TruckIcon className="w-10 h-10 text-white" />
                      </div>
                      <SparklesIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-sparkle" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                      Free Shipping
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                      On orders over ₱5,000 - Fast, reliable delivery to your doorstep
                    </p>
                    <div className="mt-6 inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-300 text-sm font-semibold">
                      🚚 Express Delivery
                    </div>
                  </div>
                </div>
              </div>

              {/* Easy Returns */}
              <div className="group relative">
                <div className="glass-effect premium-shadow rounded-3xl p-8 hover:scale-105 transition-all duration-500 h-full">
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <ArrowPathIcon className="w-10 h-10 text-white" />
                      </div>
                      <StarIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-sparkle" style={{ animationDelay: "0.5s" }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                      Easy Returns
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                      30-day return policy - No questions asked, hassle-free returns
                    </p>
                    <div className="mt-6 inline-flex items-center px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                      🔄 Hassle-Free
                    </div>
                  </div>
                </div>
              </div>

              {/* Secure Payment */}
              <div className="group relative">
                <div className="glass-effect premium-shadow rounded-3xl p-8 hover:scale-105 transition-all duration-500 h-full">
                  <div className="text-center">
                    <div className="relative mb-8">
                      <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl blur-lg opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                      <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheckIcon className="w-10 h-10 text-white" />
                      </div>
                      <SparklesIcon className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-sparkle" style={{ animationDelay: "1.5s" }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                      Secure Payment
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                      100% secure transactions - Your data is protected with bank-level security
                    </p>
                    <div className="mt-6 inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-700 dark:text-purple-300 text-sm font-semibold">
                      🔒 Bank-Level Security
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      {/* Featured Products Carousel */}
      <FeaturedProducts
        title="Featured Products"
        subtitle="Discover our handpicked selection"
        endpoint="/products/featured"
      />

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Promotional Banner */}
      <PromotionalBanner />

      {/* New Arrivals */}
      <FeaturedProducts
        title="New Arrivals"
        subtitle="Fresh styles just landed"
        endpoint="/products"
        limit={8}
      />

      {/* Testimonials */}
      <Testimonials />

        {/* Premium CTA Section */}
        <section className="py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white relative overflow-hidden">
          {/* Enhanced Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2 animate-float"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 translate-y-1/2 animate-float" style={{ animationDelay: "1s" }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }}></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-yellow-400/20 rounded-full animate-float" style={{ animationDelay: "0.5s" }}></div>
            <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-purple-400/20 rounded-full animate-float" style={{ animationDelay: "1.5s" }}></div>
          </div>

          <div className="container mx-auto px-6 text-center relative z-10">
            {/* Premium CTA Content */}
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center space-x-3 mb-8">
                <SparklesIcon className="w-8 h-8 text-yellow-400 animate-sparkle" />
                <span className="text-yellow-400 font-bold text-xl tracking-wider uppercase">Style Quiz</span>
                <StarIcon className="w-7 h-7 text-yellow-400 animate-sparkle" style={{ animationDelay: "1s" }} />
              </div>
              
              <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                Not sure what suits you?
              </h2>
              
              <p className="text-2xl mb-12 text-primary-100 leading-relaxed max-w-3xl mx-auto">
                Take our personalized style quiz and discover your perfect look with AI-powered recommendations!
              </p>

              {/* Premium CTA Button */}
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl blur-lg opacity-30 animate-pulse-glow"></div>
                <a
                  href="/style-quiz"
                  className="relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-yellow-400 to-yellow-500 text-primary-900 font-black text-xl rounded-2xl hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 shimmer-effect"
                >
                  <span className="mr-3">🎯</span>
                  Take the Style Quiz
                  <svg
                    className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </a>
              </div>

              {/* Additional Info */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-primary-200">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-lg font-semibold">Free & Fun</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "0.5s" }}></div>
                  <span className="text-lg font-semibold">AI-Powered</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: "1s" }}></div>
                  <span className="text-lg font-semibold">Personalized Results</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};
