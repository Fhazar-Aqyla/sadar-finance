import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import sadarLogo from "@/assets/images/landing/sadar-logo.png";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Real scroll progress for the top progress line
  const { scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const sections = ["home", "features", "how-it-works", "simulator", "testimonials", "team", "faq"];

    const computeActive = () => {
      const scrollPosition = window.scrollY + 100;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            return sectionId;
          }
        }
      }
      return null;
    };

    let ticking = false;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);

      // Throttle the DOM-read active-section detection to one pass per frame
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          const next = computeActive();
          if (next) setActiveSection(next);
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { id: "home", label: "Beranda" },
    { id: "features", label: "Fitur" },
    { id: "how-it-works", label: "Cara Kerja" },
    { id: "simulator", label: "Simulasi Anggaran" },
    { id: "testimonials", label: "Testimoni" },
    { id: "team", label: "Tim" },
    { id: "faq", label: "FAQ" },
  ];

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const hasAuthToken = () => {
    try {
      return Boolean(JSON.parse(localStorage.getItem("authUser") || "null")?.token);
    } catch {
      return false;
    }
  };
  const isAuthenticated = hasAuthToken();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/75 dark:bg-slate-900/75 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 shadow-sm shadow-slate-900/5 py-3"
          : "bg-transparent border-b border-transparent py-4 lg:py-5"
      }`}
    >
      {/* Top Scroll Progress Line */}
      <motion.div
        style={{ scaleX: scrollProgress }}
        className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#1E3A8A] via-sky-400 to-emerald-400 origin-left z-50"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group py-1" aria-label="SADAR Finance">
            <motion.img
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              src={sadarLogo}
              alt="SADAR Finance"
              className="h-7 sm:h-8 w-auto object-contain transition-transform"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`text-sm font-medium transition-colors relative py-1 group cursor-pointer ${
                    isActive
                      ? "text-slate-900 dark:text-white font-bold"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive ? (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-slate-200 rounded-full"
                    />
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* CTA Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white px-4 py-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isAuthenticated ? "Dashboard" : "Masuk"}
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all"
              >
                {isAuthenticated ? "Buka Aplikasi" : "Mulai Gratis"} <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3"
            >
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-base font-medium cursor-pointer ${
                    activeSection === link.id
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  to={isAuthenticated ? "/dashboard" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {isAuthenticated ? "Dashboard" : "Masuk"}
                </Link>
                <Link
                  to={isAuthenticated ? "/dashboard" : "/register"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white font-semibold text-sm shadow-xs"
                >
                  {isAuthenticated ? "Buka Aplikasi" : "Daftar"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
