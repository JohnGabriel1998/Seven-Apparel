import { Link } from "react-router-dom";
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  HeartIcon,
  SparklesIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export const Footer = () => {
  return (
    <>
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.6); }
        }
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
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
        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dark .glass-effect {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
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
      `}</style>

      <footer className="relative bg-gradient-to-b from-gray-100 via-gray-50 to-white text-gray-700 pt-20 pb-8 overflow-hidden">
        {/* Enhanced Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-400/5 rounded-full blur-2xl animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Premium Trust Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <div className="glass-effect premium-shadow rounded-3xl p-8 hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-primary-500/20 to-primary-600/30 rounded-2xl group-hover:from-primary-500/30 group-hover:to-primary-600/40 transition-all duration-300">
                  <TruckIcon className="w-8 h-8 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h4 className="text-gray-800 font-bold text-lg mb-1">
                    Free Shipping
                  </h4>
                  <p className="text-sm text-gray-600">On orders over ₱5,000</p>
                </div>
              </div>
            </div>
            <div className="glass-effect premium-shadow rounded-3xl p-8 hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/30 rounded-2xl group-hover:from-emerald-500/30 group-hover:to-emerald-600/40 transition-all duration-300">
                  <ShieldCheckIcon className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h4 className="text-gray-800 font-bold text-lg mb-1">
                    Secure Payment
                  </h4>
                  <p className="text-sm text-gray-600">
                    100% secure transactions
                  </p>
                </div>
              </div>
            </div>
            <div className="glass-effect premium-shadow rounded-3xl p-8 hover:scale-105 transition-all duration-300 group">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/30 rounded-2xl group-hover:from-purple-500/30 group-hover:to-purple-600/40 transition-all duration-300">
                  <CreditCardIcon className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div>
                  <h4 className="text-gray-800 font-bold text-lg mb-1">
                    Easy Returns
                  </h4>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content - Simplified */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-8">
                {/* Enhanced Logo */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary-500 via-purple-500 to-primary-700 rounded-2xl blur-lg opacity-30 animate-pulse-glow"></div>
                    <div className="relative bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-sm rounded-2xl p-3 border border-white/30">
                      <span className="text-6xl font-black bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 bg-clip-text text-transparent gradient-animate">
                        7
                      </span>
                      <SparklesIcon className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 animate-sparkle" />
                      <StarIcon
                        className="absolute -bottom-1 -left-1 w-3 h-3 text-primary-400 animate-sparkle"
                        style={{ animationDelay: "1s" }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xl font-black bg-gradient-to-r from-gray-800 via-primary-600 to-gray-800 bg-clip-text text-transparent">
                      SEVEN
                    </span>
                    <span className="text-sm font-bold tracking-[0.3em] text-primary-600 uppercase -mt-1">
                      APPAREL
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                  Redefining fashion with modern designs, premium quality, and
                  sustainable practices. Dress confidently, live authentically.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-4 mb-8">
                <a
                  href="tel:+1234567890"
                  className="flex items-center space-x-4 text-gray-700 hover:text-primary-600 transition-all duration-300 group"
                >
                  <div className="p-2 glass-effect rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <PhoneIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-lg">+1 (234) 567-890</span>
                </a>
                <a
                  href="mailto:info@sevenapparel.com"
                  className="flex items-center space-x-4 text-gray-700 hover:text-primary-600 transition-all duration-300 group"
                >
                  <div className="p-2 glass-effect rounded-xl group-hover:scale-110 transition-transform duration-300">
                    <EnvelopeIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-lg">info@sevenapparel.com</span>
                </a>
                <div className="flex items-start space-x-4 text-gray-700">
                  <div className="p-2 glass-effect rounded-xl">
                    <MapPinIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="text-lg">123 Fashion Street, NY 10001</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="flex space-x-4">
                {[
                  {
                    name: "Twitter",
                    href: "#",
                    color: "hover:bg-blue-500",
                    icon: "M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z",
                  },
                  {
                    name: "Instagram",
                    href: "#",
                    color:
                      "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
                    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z",
                  },
                  {
                    name: "Facebook",
                    href: "#",
                    color: "hover:bg-blue-600",
                    icon: "M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z",
                  },
                  {
                    name: "YouTube",
                    href: "#",
                    color: "hover:bg-red-600",
                    icon: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z",
                  },
                ].map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className={`p-4 glass-effect rounded-2xl transition-all duration-300 hover:scale-110 hover:-translate-y-1 group ${social.color}`}
                    aria-label={social.name}
                  >
                    <svg
                      className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="text-gray-800 font-bold text-xl mb-8 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-3 text-primary-600 animate-sparkle" />
                Shop
              </h4>
              <ul className="space-y-4">
                {[
                  {
                    to: "/products?gender=women",
                    label: "Women's Clothing",
                    color: "from-pink-500 to-rose-500",
                  },
                  {
                    to: "/products?gender=men",
                    label: "Men's Clothing",
                    color: "from-blue-500 to-indigo-500",
                  },
                  {
                    to: "/products?tags=new-arrival",
                    label: "New Arrivals",
                    color: "from-emerald-500 to-teal-500",
                  },
                  {
                    to: "/products?tags=sale",
                    label: "Sale 🔥",
                    color: "from-red-500 to-orange-500",
                  },
                  {
                    to: "/products",
                    label: "All Products",
                    color: "from-purple-500 to-violet-500",
                  },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-600 hover:text-gray-800 transition-all duration-300 flex items-center group text-lg font-medium"
                    >
                      <span
                        className={`w-0 h-1 bg-gradient-to-r ${link.color} group-hover:w-6 transition-all duration-500 mr-0 group-hover:mr-3 rounded-full`}
                      ></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-gray-800 font-bold text-xl mb-8 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 mr-3 text-emerald-600" />
                Support
              </h4>
              <ul className="space-y-4">
                {[
                  {
                    to: "/contact",
                    label: "Contact Us",
                    color: "from-emerald-500 to-teal-500",
                  },
                  {
                    to: "#shipping",
                    label: "Shipping Info",
                    color: "from-blue-500 to-indigo-500",
                  },
                  {
                    to: "#returns",
                    label: "Returns & Exchanges",
                    color: "from-purple-500 to-violet-500",
                  },
                  {
                    to: "#faq",
                    label: "FAQ",
                    color: "from-orange-500 to-red-500",
                  },
                  {
                    to: "#size-guide",
                    label: "Size Guide",
                    color: "from-pink-500 to-rose-500",
                  },
                  {
                    to: "#track",
                    label: "Track Order",
                    color: "from-cyan-500 to-blue-500",
                  },
                ].map((link) => (
                  <li key={link.label}>
                    {link.to === "/contact" ? (
                      <Link
                        to={link.to}
                        className="text-gray-600 hover:text-gray-800 transition-all duration-300 flex items-center group text-lg font-medium"
                      >
                        <span
                          className={`w-0 h-1 bg-gradient-to-r ${link.color} group-hover:w-6 transition-all duration-500 mr-0 group-hover:mr-3 rounded-full`}
                        ></span>
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.to}
                        className="text-gray-600 hover:text-gray-800 transition-all duration-300 flex items-center group text-lg font-medium"
                      >
                        <span
                          className={`w-0 h-1 bg-gradient-to-r ${link.color} group-hover:w-6 transition-all duration-500 mr-0 group-hover:mr-3 rounded-full`}
                        ></span>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Section - Premium Design */}
          <div className="border-t border-gray-200 pt-12">
            <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0">
              {/* Copyright */}
              <div className="text-center lg:text-left">
                <p className="flex items-center justify-center lg:justify-start text-gray-700 text-lg mb-2">
                  Made with
                  <HeartIcon className="w-5 h-5 mx-2 text-red-500 fill-current animate-pulse" />
                  by Seven Apparel Team
                </p>
                <p className="text-gray-600 text-base">
                  &copy; {new Date().getFullYear()} Seven Apparel. All rights
                  reserved.
                </p>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col items-center lg:items-end space-y-4">
                <span className="text-gray-600 text-sm font-medium">
                  We Accept:
                </span>
                <div className="flex space-x-3">
                  {["Visa", "Mastercard", "PayPal", "Amex"].map((method) => (
                    <div
                      key={method}
                      className="px-4 py-2 glass-effect rounded-xl text-sm font-semibold text-gray-700 hover:text-gray-900 hover:scale-105 transition-all duration-300"
                    >
                      {method}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-center lg:justify-start items-center mt-12 space-x-8 text-sm">
              {[
                { href: "#privacy", label: "Privacy Policy" },
                { href: "#terms", label: "Terms of Service" },
                { href: "#cookies", label: "Cookie Policy" },
                { href: "#accessibility", label: "Accessibility" },
              ].map((link, index) => (
                <div key={link.label} className="flex items-center">
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-600 transition-colors duration-300 font-medium"
                  >
                    {link.label}
                  </a>
                  {index < 3 && <span className="mx-4 text-gray-400">•</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
