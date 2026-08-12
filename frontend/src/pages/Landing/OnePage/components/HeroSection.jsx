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
} from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      // 1. Master Entrance Timeline
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.from(".hero-bg-glow", {
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: "power2.out",
      })
        .from(
          ".hero-badge",
          {
            opacity: 0,
            y: -16,
            duration: 0.7,
          },
          "-=0.9"
        )
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 26,
            duration: 0.8,
          },
          "-=0.5"
        )
        .from(
          ".hero-subtitle",
          {
            opacity: 0,
            y: 18,
            duration: 0.7,
          },
          "-=0.5"
        )
        .from(
          ".hero-actions > *",
          {
            opacity: 0,
            y: 16,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.15)",
          },
          "-=0.4"
        )
        .from(
          ".hero-card-left-wrap",
          {
            opacity: 0,
            x: -30,
            duration: 0.85,
          },
          "-=0.5"
        )
        .from(
          ".hero-card-right-wrap",
          {
            opacity: 0,
            x: 30,
            duration: 0.85,
          },
          "-=0.75"
        )
        .from(
          ".hero-trust-item",
          {
            opacity: 0,
            y: 10,
            duration: 0.5,
            stagger: 0.08,
          },
          "-=0.4"
        );

      // 2. Calm, out-of-phase ambient floating loop on the inner card elements
      gsap.to(".hero-card-left-inner", {
        y: -7,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.0,
      });

      gsap.to(".hero-card-right-inner", {
        y: 7,
        duration: 4.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.2,
      });

      // 3. Subtle GSAP ScrollTrigger Parallax on outer wrappers
      gsap.to(".hero-content-wrap", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 60,
        opacity: 0.35,
        ease: "none",
      });

      gsap.to(".hero-card-left-wrap", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
        y: -40,
        ease: "none",
      });

      gsap.to(".hero-card-right-wrap", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
        y: 40,
        ease: "none",
      });

      gsap.to(".hero-bg-glow", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 70,
        scale: 1.1,
        ease: "none",
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden"
    >
      {/* Background Ambient Glow & Soft Dot Grid */}
      <div className="hero-bg-glow pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] lg:w-[1000px] h-[550px] bg-gradient-to-tr from-cyan-400/20 via-sky-400/20 to-teal-300/15 blur-3xl rounded-full -z-10" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#25a0e2_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Floating Card Left: Live OCR Transaction Scan */}
        <div className="hero-card-left-wrap hidden lg:flex absolute top-4 left-0 xl:-left-4 2xl:-left-10 z-20 pointer-events-none">
          <div className="hero-card-left-inner pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-100/90 dark:border-slate-800 shadow-xl shadow-sky-500/10 backdrop-blur-md transition-all hover:shadow-sky-500/20 hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-[#25a0e2] shrink-0 shadow-inner">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Scan OCR Terbaca</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                +Rp 68.500{" "}
                <span className="text-[11px] font-bold text-[#25a0e2] bg-sky-50 px-1.5 py-0.5 rounded-md dark:bg-sky-950/50">
                  Needs
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Card Right: Live Financial Score */}
        <div className="hero-card-right-wrap hidden lg:flex absolute top-12 right-0 xl:-right-4 2xl:-right-10 z-20 pointer-events-none">
          <div className="hero-card-right-inner pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-sky-100/90 dark:border-slate-800 shadow-xl shadow-sky-500/10 backdrop-blur-md transition-all hover:shadow-sky-500/20 hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0bb9a8] to-[#2c9be0] text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25">
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
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="hero-content-wrap max-w-3xl xl:max-w-3xl 2xl:max-w-4xl mx-auto text-center relative z-10">
          {/* Release Pill Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-300/40 bg-sky-50/80 dark:bg-sky-950/40 dark:border-sky-800/50 text-[#1a85be] dark:text-sky-300 text-xs sm:text-sm font-semibold mb-6 backdrop-blur-sm shadow-sm cursor-default hover:border-sky-400 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-[#25a0e2] animate-pulse" />
            <span className="font-bold">SADAR v1.0</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1">
              Personal Finance Cerdas & Sadar Finansial
              <ChevronRight className="w-3.5 h-3.5 text-[#25a0e2]" />
            </span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-2xl xl:max-w-3xl mx-auto leading-[1.18] sm:leading-[1.14]">
            Ketahui Ke Mana Uangmu Pergi Tanpa Ribet{" "}
            <span className="bg-gradient-to-r from-[#0bb9a8] via-[#25a0e2] to-[#2c9be0] bg-clip-text text-transparent">
              Mencatat Manual.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="hero-subtitle mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            SADAR Finance mengekstrak struk belanja dengan OCR, membaca pola
            kebiasaan pengeluaranmu, dan menghitung skor kesehatan finansial
            secara objektif.
          </p>

          {/* Call to Actions */}
          <div className="hero-actions mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0bb9a8] to-[#2c9be0] text-white font-bold text-base shadow-lg shadow-sky-500/25 hover:shadow-xl hover:shadow-sky-500/35 transition-all"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-slate-200/90 bg-white/90 text-slate-700 font-semibold text-base shadow-sm hover:border-[#25a0e2] hover:text-[#25a0e2] dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-sky-500 transition-all"
              >
                Jelajahi Fitur <Sparkles className="w-4 h-4 text-[#25a0e2]" />
              </a>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <div className="hero-trust mt-12 pt-8 border-t border-slate-200/60 dark:border-slate-800 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="hero-trust-item flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25a0e2]" />
              <span>Scan Struk Kasir Instan</span>
            </div>
            <div className="hero-trust-item flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#25a0e2]" />
              <span>Skor Kesehatan Finansial 0–100</span>
            </div>
            <div className="hero-trust-item flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#25a0e2]" />
              <span>Privasi Data 100% Terisolasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


