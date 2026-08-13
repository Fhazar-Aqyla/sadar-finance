import React from "react";
import { Link } from "react-router-dom";
import sadarLogo from "@/assets/images/landing/sadar-logo.png";
import { Heart, Github, Linkedin, Instagram, Shield, Zap, ArrowRight } from "lucide-react";

const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.65-1.64c0-.91-.74-1.65-1.65-1.65-.9 0-1.64.74-1.64 1.65 0 .9.74 1.64 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

export const FooterSection = () => {
  const productLinks = [
    { label: "Beranda", href: "#home" },
    { label: "Fitur Unggulan", href: "#features" },
    { label: "Simulasi Anggaran", href: "#simulator" },
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Tim Kami", href: "#team" },
    { label: "FAQ", href: "#faq" },
  ];

  const accountLinks = [
    { label: "Daftar Gratis", to: "/register" },
    { label: "Masuk ke Akun", to: "/login" },
  ];

  const trustItems = [
    { icon: Shield, label: "Data Terenkripsi AES-256" },
    { icon: Zap, label: "AI OCR < 2 Detik" },
  ];

  return (
    <footer className="relative bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
      {/* Top gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1E3A8A]/40 dark:via-sky-400/30 to-transparent" />

      {/* Subtle dot grid background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.5] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] dark:opacity-[0.4] pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-0 left-1/4 w-80 h-48 bg-blue-400/4 dark:bg-sky-400/4 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Grid */}
        <div className="py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Column 1 — Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center group mb-4" aria-label="SADAR Finance">
              <img
                src={sadarLogo}
                alt="SADAR Finance"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-2 max-w-xs">
              Platform keuangan pribadi berbasis AI yang membantu kamu melacak pengeluaran, mengelola anggaran, dan mencapai kebebasan finansial.
            </p>

            {/* Trust badges */}
            <div className="mt-5 space-y-2">
              {trustItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <Icon className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2.5 mt-6">
              <a
                href="https://github.com/Fhazar-Aqyla"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/fhazaraqyla/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 dark:hover:text-sky-400 dark:hover:bg-blue-950/40 transition-colors"
              >
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/fhazar_aqyla/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:text-pink-400 dark:hover:bg-pink-950/40 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2 — Produk */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-5">
              Produk
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors font-medium flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#1E3A8A] dark:bg-sky-400 transition-all duration-200 rounded-full" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Akun */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-5">
              Akun
            </h4>
            <ul className="space-y-3">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-[#1E3A8A] dark:hover:text-sky-400 transition-colors font-medium flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-[#1E3A8A] dark:bg-sky-400 transition-all duration-200 rounded-full" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — CTA Card */}
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-widest mb-5">
              Mulai Sekarang
            </h4>
            <div className="rounded-2xl bg-gradient-to-br from-[#1E3A8A]/90 to-blue-700 p-5 text-white shadow-lg shadow-blue-500/15">
              <p className="text-sm font-bold leading-snug">
                Gratis selamanya. Tanpa kartu kredit.
              </p>
              <p className="text-xs text-blue-100 mt-1.5 leading-relaxed">
                Mulai lacak keuanganmu hari ini dengan SADAR Finance — 100% bebas iklan.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#1E3A8A] text-xs font-extrabold hover:bg-blue-50 transition-colors shadow-sm group"
              >
                Coba Gratis
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>
            © {new Date().getFullYear()} SADAR Finance. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center gap-1.5">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>oleh <span className="font-semibold text-slate-500 dark:text-slate-400">Tim SADAR Finance</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
