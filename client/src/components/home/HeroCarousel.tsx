import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  SparklesIcon, 
  StarIcon,
  PlayIcon,
  PauseIcon
} from "@heroicons/react/24/outline";

interface CarouselSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  cta: {
    text: string;
    link: string;
  };
  ctaSecondary?: {
    text: string;
    link: string;
  };
}

const slides: CarouselSlide[] = [
  {
    id: 1,
    title: "New Collection 2025",
    subtitle: "Discover Your Style",
    description:
      "Modern clothing for the modern you. Explore our latest collection.",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&h=900&fit=crop",
    cta: {
      text: "Shop Women",
      link: "/products?gender=women",
    },
    ctaSecondary: {
      text: "Shop Men",
      link: "/products?gender=men",
    },
  },
  {
    id: 2,
    title: "Summer Sale",
    subtitle: "Up to 50% Off",
    description:
      "Get ready for summer with our amazing deals on trending styles.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=900&fit=crop",
    cta: {
      text: "Shop Sale",
      link: "/products?sort=price-asc",
    },
  },
  {
    id: 3,
    title: "Premium Quality",
    subtitle: "Sustainable Fashion",
    description:
      "Eco-friendly materials that look good and do good for the planet.",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=900&fit=crop",
    cta: {
      text: "Learn More",
      link: "/products",
    },
  },
  {
    id: 4,
    title: "Kids Collection",
    subtitle: "Comfort Meets Style",
    description: "Adorable and durable clothing for your little ones.",
    image:
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=1600&h=900&fit=crop",
    cta: {
      text: "Shop Kids",
      link: "/products?category=kids",
    },
  },
];

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000); // Resume auto-play after 12 seconds
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

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
        @keyframes slideInFromLeft {
          0% { transform: translateX(-100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInFromRight {
          0% { transform: translateX(100%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .slide-in-left {
          animation: slideInFromLeft 0.8s ease-out;
        }
        .slide-in-right {
          animation: slideInFromRight 0.8s ease-out;
        }
      `}</style>

      <div className="relative h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] overflow-hidden group">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/3 rounded-full blur-2xl animate-float" style={{ animationDelay: "2s" }}></div>
        </div>

        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
              />
              {/* Enhanced Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/20"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 h-full flex items-center relative z-10">
              <div className="max-w-4xl text-white">
                {/* Animated Content */}
                <div
                  className={`transition-all duration-700 delay-300 ${
                    index === currentSlide
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  {/* Subtitle with Sparkle */}
                  <div className="flex items-center space-x-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-yellow-400 animate-sparkle" />
                    <p className="text-lg md:text-xl font-bold text-yellow-400 uppercase tracking-wider">
                      {slide.subtitle}
                    </p>
                    <StarIcon className="w-5 h-5 text-yellow-400 animate-sparkle" style={{ animationDelay: "1s" }} />
                  </div>

                  {/* Main Title */}
                  <h1 className="text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-black mb-6 md:mb-8 leading-tight bg-gradient-to-r from-white via-primary-200 to-white bg-clip-text text-transparent gradient-animate">
                    {slide.title}
                  </h1>

                  {/* Description */}
                  <p className="text-xl md:text-2xl lg:text-3xl mb-8 md:mb-12 text-gray-200 leading-relaxed max-w-3xl">
                    {slide.description}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Link
                      to={slide.cta.link}
                      className="group relative inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 text-white font-bold text-lg rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 shimmer-effect"
                    >
                      <span className="relative z-10 flex items-center">
                        <span className="mr-3">✨</span>
                        {slide.cta.text}
                        <svg
                          className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl"></div>
                    </Link>
                    {slide.ctaSecondary && (
                      <Link
                        to={slide.ctaSecondary.link}
                        className="group relative inline-flex items-center justify-center px-10 py-4 glass-effect text-white font-bold text-lg rounded-2xl border-2 border-white/30 transition-all duration-300 hover:scale-105 hover:border-white/50"
                      >
                        <span className="relative z-10 flex items-center">
                          <span className="mr-3">👕</span>
                          {slide.ctaSecondary.text}
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl"></div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Premium Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 glass-effect rounded-2xl flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20 hover:shadow-2xl"
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="w-8 h-8" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 glass-effect rounded-2xl flex items-center justify-center text-white transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 z-20 hover:shadow-2xl"
          aria-label="Next slide"
        >
          <ChevronRightIcon className="w-8 h-8" />
        </button>

        {/* Auto-play Toggle */}
        <button
          onClick={toggleAutoPlay}
          className="absolute top-6 right-6 w-12 h-12 glass-effect rounded-xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 z-20"
          aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
        >
          {isAutoPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>

        {/* Premium Dots Navigation */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-500 rounded-full group ${
                index === currentSlide
                  ? "w-16 h-4 bg-gradient-to-r from-primary-500 to-primary-700 shadow-lg"
                  : "w-4 h-4 bg-white/30 hover:bg-white/60 hover:scale-125"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentSlide && (
                <div className="w-full h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse-glow"></div>
              )}
            </button>
          ))}
        </div>

        {/* Enhanced Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/10 z-20">
          <div
            className="h-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 transition-all duration-500 shadow-lg"
            style={{
              width: `${((currentSlide + 1) / slides.length) * 100}%`,
            }}
          />
        </div>

        {/* Slide Counter */}
        <div className="absolute bottom-6 right-6 glass-effect rounded-xl px-4 py-2 text-white text-sm font-semibold z-20">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    </>
  );
};
