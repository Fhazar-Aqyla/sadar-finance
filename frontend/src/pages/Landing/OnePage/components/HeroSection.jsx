import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export const HeroSection = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        y: -20,
        opacity: 0,
        duration: 0.6,
      })
        .from(
          ".hero-title",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.3"
        )
        .from(
          ".hero-desc",
          {
            y: 20,
            opacity: 0,
            duration: 0.7,
          },
          "-=0.5"
        )
        .from(
          ".hero-cta",
          {
            y: 20,
            opacity: 0,
            stagger: 0.15,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-trust",
          {
            opacity: 0,
            duration: 0.8,
          },
          "-=0.2"
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden"
    >
      {/* Background Decorative Gradients */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-teal-400/20 via-blue-500/15 to-transparent blur-3xl rounded-full" />
      <div className="pointer-events-none absolute top-1/2 -right-40 w-96 h-96 bg-teal-300/10 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Release Pill Badge */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/30 bg-teal-50/80 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm shadow-sm cursor-default"
        >
          <span className="flex h-2 w-2 rounded-full bg-teal-500 animate-ping" />
          <span className="font-bold">SADAR v1.0</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="flex items-center gap-1">
            Personal Finance Cerdas & Sadar Finansial <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </motion.div>

        {/* Hero Main Headline */}
        <h1 className="hero-title text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15] sm:leading-[1.12]">
          Ketahui Ke Mana Uangmu Pergi Tanpa Ribet{" "}
          <span className="bg-gradient-to-r from-blue-900 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Mencatat Manual.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="hero-desc mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          SADAR Finance mengekstrak struk belanja dengan OCR, membaca pola kebiasaan pengeluaranmu, dan menghitung skor kesehatan finansial secara objektif.
        </p>

        {/* Call to Actions with Framer Motion spring physics */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Link
              to="/auth/register"
              className="hero-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-900 via-teal-700 to-teal-600 text-white font-bold text-base shadow-xl shadow-teal-700/25 transition-all"
            >
              Mulai Gratis Sekarang <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto"
          >
            <a
              href="#features"
              className="hero-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-slate-200 bg-white/80 text-slate-700 font-semibold text-base shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
            >
              Jelajahi Fitur <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </a>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <div className="hero-trust mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Scan Struk Kasir Instan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Skor Kesehatan Finansial 0–100</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Privasi Data 100% Terisolasi</span>
          </div>
        </div>
      </div>
    </section>
  );
};
