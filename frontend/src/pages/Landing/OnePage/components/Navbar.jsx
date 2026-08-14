import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import sadarLogo from "@/assets/images/landing/sadar-logo.png";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const sections = ["home", "features", "how-it-works", "simulator", "team", "faq"];

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
      setIsScrolled(window.scrollY > 20);

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
    { id: "home", label: "Beranda", href: "#home" },
    { id: "features", label: "Fitur", href: "#features" },
    { id: "how-it-works", label: "Cara Kerja", href: "#how-it-works" },
    { id: "simulator", label: "Simulasi Anggaran", href: "#simulator" },
    { id: "team", label: "Tim", href: "#team" },
    { id: "faq", label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm py-3"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 py-4"
      }`}
    >
      {/* Top Scroll Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#1E3A8A] dark:bg-sky-400 origin-left z-50" />

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
                <a
                  key={link.label}
                  href={link.href}
                  className={`text-sm font-medium transition-colors relative py-1 group ${
                    isActive
                      ? "text-[#1E3A8A] dark:text-sky-400 font-bold"
                      : "text-[#1E3A8A]/60 hover:text-[#1E3A8A] dark:text-slate-300 dark:hover:text-sky-400"
                  }`}
                >
                  {link.label}
                  {isActive ? (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A] dark:bg-sky-400 rounded-full"
                    />
                  ) : (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#1E3A8A] dark:bg-sky-400 transition-all duration-200 group-hover:w-full rounded-full" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* CTA Buttons (Desktop) */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-[#1E3A8A] dark:text-slate-200 dark:hover:text-sky-400 px-4 py-2 rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Masuk
            </Link>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white text-sm font-semibold shadow-xs hover:shadow-md transition-all"
              >
                Mulai Gratis <ArrowRight className="w-4 h-4" />
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
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    activeSection === link.id
                      ? "bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-400 font-bold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-[#1E3A8A] dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white font-semibold text-sm shadow-xs"
                >
                  Daftar
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
