import React from "react";
import { Link } from "react-router-dom";
import sadarLogo from "@/assets/images/landing/sadar-logo.png";
import { Heart } from "lucide-react";

export const FooterSection = () => {
  return (
    <footer className="border-t border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800/80">
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link to="/" className="flex items-center group" aria-label="SADAR Finance">
              <img
                src={sadarLogo}
                alt="SADAR Finance"
                className="h-7 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <span className="hidden sm:inline-block text-slate-300 dark:text-slate-700">|</span>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Smart AI-Driven Automated Receipt & Personal Finance Management
            </p>
          </div>

          {/* Quick Nav Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
            <a
              href="#home"
              className="hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors"
            >
              Beranda
            </a>
            <a
              href="#features"
              className="hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors"
            >
              Fitur
            </a>
            <a
              href="#simulator"
              className="hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors"
            >
              Simulasi
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors"
            >
              Cara Kerja
            </a>
            <a
              href="#team"
              className="hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors"
            >
              Tim
            </a>
            <a
              href="#faq"
              className="hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors"
            >
              FAQ
            </a>
          </div>
        </div>

        {/* Bottom Legal & Credits */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} SADAR Finance. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline-block" />
            <span>oleh Tim SADAR Finance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

