import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Activity,
  TrendingUp,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const HeroSection = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 24,
    restDelta: 0.001,
  });

  // Parallax Transform Layers
  const yBg = useTransform(smoothProgress, [0, 1], [0, 220]);
  const scaleBg = useTransform(smoothProgress, [0, 1], [1, 1.25]);
  const opacityBg = useTransform(smoothProgress, [0, 0.85], [1, 0.1]);

  const yContent = useTransform(smoothProgress, [0, 1], [0, 90]);
  const opacityContent = useTransform(smoothProgress, [0, 0.7], [1, 0.2]);

  // Floating elements move with high differential speeds
  const yFloatLeft = useTransform(smoothProgress, [0, 1], [0, -200]);
  const xFloatLeft = useTransform(smoothProgress, [0, 1], [0, -40]);
  const rotateFloatLeft = useTransform(smoothProgress, [0, 1], [-2, -10]);

  const yFloatRight = useTransform(smoothProgress, [0, 1], [0, 210]);
  const xFloatRight = useTransform(smoothProgress, [0, 1], [0, 45]);
  const rotateFloatRight = useTransform(smoothProgress, [0, 1], [2, 10]);

  const yFloatBottom = useTransform(smoothProgress, [0, 1], [0, -120]);

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden"
    >
      {/* LAYER 0: Ambient Background Light Meshes & Dot Grid (Parallax Depth Layer) */}
      <motion.div
        style={{ y: yBg, scale: scaleBg, opacity: opacityBg }}
        className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[1000px] h-[650px] bg-gradient-to-tr from-cyan-400/25 via-sky-400/25 to-teal-300/20 blur-3xl rounded-full -z-10"
      />
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#25a0e2_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-[0.08] -z-10"
      />

      {/* LAYER 1: Floating Metric Cards (Real Parallax Movement) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pointer-events-none">
        {/* Floating Card Left: OCR Transaction */}
        <motion.div
          style={{ y: yFloatLeft, x: xFloatLeft, rotate: rotateFloatLeft }}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="hidden lg:flex items-center gap-3.5 absolute top-12 left-2 xl:-left-6 pointer-events-auto p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-200/90 dark:border-slate-800 shadow-2xl shadow-sky-500/15 backdrop-blur-md transition-shadow hover:shadow-sky-500/25"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-[#25a0e2] shrink-0 shadow-inner">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
              <span>Scan OCR Terbaca</span>
              <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              +Rp 68.500{" "}
              <span className="text-xs font-bold text-[#25a0e2] bg-sky-50 px-2 py-0.5 rounded-md dark:bg-sky-950/50">
                Needs
              </span>
            </p>
          </div>
        </motion.div>

        {/* Floating Card Right: Financial Health Gauge */}
        <motion.div
          style={{ y: yFloatRight, x: xFloatRight, rotate: rotateFloatRight }}
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55, ease: "easeOut" }}
          className="hidden lg:flex items-center gap-3.5 absolute top-24 right-2 xl:-right-6 pointer-events-auto p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-200/90 dark:border-slate-800 shadow-2xl shadow-sky-500/15 backdrop-blur-md transition-shadow hover:shadow-sky-500/25"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0bb9a8] to-[#2c9be0] text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Financial Score
            </div>
            <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>84 / 100</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                Sehat
              </span>
            </div>
          </div>
        </motion.div>

        {/* Floating Mini Pill Bottom: Savings Ratio */}
        <motion.div
          style={{ y: yFloatBottom }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          className="hidden xl:flex items-center gap-2 absolute top-[360px] right-20 pointer-events-auto px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-sky-100 dark:border-slate-800 shadow-lg shadow-sky-500/10 backdrop-blur-md text-xs font-bold text-slate-700 dark:text-slate-300"
        >
          <PiggyBank className="w-4 h-4 text-[#0bb9a8]" />
          <span>Tabungan Terjaga 20%</span>
        </motion.div>
      </div>

      {/* LAYER 2: Hero Main Content */}
      <motion.div
        style={{ y: yContent, opacity: opacityContent }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
      >
        {/* Release Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.04 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-400/30 bg-sky-50/90 dark:bg-sky-950/40 text-[#1a85be] dark:text-sky-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm shadow-sm cursor-default"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#25a0e2] animate-ping" />
          <span className="font-bold">SADAR v1.0</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="flex items-center gap-1">
            Personal Finance Cerdas & Sadar Finansial{" "}
            <ChevronRight className="w-3.5 h-3.5 text-[#25a0e2]" />
          </span>
        </motion.div>

        {/* Hero Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15] sm:leading-[1.12]"
        >
          Ketahui Ke Mana Uangmu Pergi Tanpa Ribet{" "}
          <span className="bg-gradient-to-r from-[#0bb9a8] via-[#25a0e2] to-[#2c9be0] bg-clip-text text-transparent">
            Mencatat Manual.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
          className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal"
        >
          SADAR Finance mengekstrak struk belanja dengan OCR, membaca pola
          kebiasaan pengeluaranmu, dan menghitung skor kesehatan finansial
          secara objektif.
        </motion.p>

        {/* Call to Actions with Auth-consistent styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
          className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="w-full sm:w-auto"
          >
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0bb9a8] to-[#2c9be0] text-white font-bold text-base shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-slate-200 bg-white/90 text-slate-700 font-semibold text-base shadow-sm hover:border-[#25a0e2] hover:text-[#25a0e2] dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-sky-500 transition-all"
            >
              Jelajahi Fitur{" "}
              <Sparkles className="w-4 h-4 text-[#25a0e2]" />
            </a>
          </motion.div>
        </motion.div>

        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25a0e2]" />
            <span>Scan Struk Kasir Instan</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#25a0e2]" />
            <span>Skor Kesehatan Finansial 0–100</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#25a0e2]" />
            <span>Privasi Data 100% Terisolasi</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
