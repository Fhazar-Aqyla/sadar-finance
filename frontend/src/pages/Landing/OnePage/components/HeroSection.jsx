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

      tl.from(".hero-badge", {
        opacity: 0,
        y: -16,
        duration: 0.7,
      })
        .from(
          ".hero-title",
          {
            opacity: 0,
            y: 24,
            duration: 0.8,
          },
          "-=0.4"
        )
        .from(
          ".hero-subtitle",
          {
            opacity: 0,
            y: 16,
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
            x: -25,
            duration: 0.8,
          },
          "-=0.5"
        )
        .from(
          ".hero-card-right-wrap",
          {
            opacity: 0,
            x: 25,
            duration: 0.8,
          },
          "-=0.7"
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
        y: -6,
        duration: 3.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 0.8,
      });

      gsap.to(".hero-card-right-inner", {
        y: 6,
        duration: 4.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.0,
      });

      // 3. Subtle GSAP ScrollTrigger Parallax on outer wrappers
      gsap.to(".hero-content-wrap", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 50,
        opacity: 0.4,
        ease: "none",
      });

      gsap.to(".hero-card-left-wrap", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
        y: -35,
        ease: "none",
      });

      gsap.to(".hero-card-right-wrap", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
        y: 35,
        ease: "none",
      });
    },
    { scope: containerRef }
  );

  return (
    <section
      id="home"
      ref={containerRef}
      className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Subtle clean background dot grid */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.4] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] dark:opacity-[0.25] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Floating Card Left: Live OCR Transaction Scan */}
        <div className="hero-card-left-wrap hidden lg:flex absolute top-4 left-0 xl:-left-4 2xl:-left-10 z-20 pointer-events-none">
          <div className="hero-card-left-inner pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#1E3A8A] dark:text-sky-400 shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Struk Terdeteksi AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                +Rp 68.500{" "}
                <span className="text-[11px] font-bold text-[#1E3A8A] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded-md">
                  Kebutuhan Pokok
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Card Right: Live Financial Score */}
        <div className="hero-card-right-wrap hidden lg:flex absolute top-12 right-0 xl:-right-4 2xl:-right-10 z-20 pointer-events-none">
          <div className="hero-card-right-inner pointer-events-auto flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-all hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Skor Kesehatan Finansial
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <span>84 / 100</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
                  Kondisi Prima
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Main Content */}
        <div className="hero-content-wrap max-w-3xl xl:max-w-3xl 2xl:max-w-4xl mx-auto text-center relative z-10">
          {/* Release Pill Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white/90 dark:bg-slate-900/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm cursor-default hover:border-slate-300 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-[#1E3A8A] dark:bg-sky-400 animate-pulse" />
            <span className="font-bold text-[#1E3A8A] dark:text-sky-400">SADAR v1.0</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="flex items-center gap-1">
              Platform Finansial Cerdas Berbasis AI & OCR
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </span>
          </div>

          {/* Hero Main Headline */}
          <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-2xl xl:max-w-3xl mx-auto leading-[1.18] sm:leading-[1.14]">
            Ketahui ke Mana Uangmu Pergi Tanpa{" "}
            <span className="text-[#1E3A8A] dark:text-sky-400">
              Repot Mencatat Manual.
            </span>
          </h1>

          {/* Hero Subtitle */}
          <p className="hero-subtitle mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Ekstraksi struk kasir otomatis dengan AI OCR, pantau limit alokasi
            50/30/20 secara realtime, dan ketahui skor kesehatan finansialmu
            secara objektif.
          </p>

          {/* Call to Actions - Navy Button style matching Auth */}
          <div className="hero-actions mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white font-bold text-base shadow-sm hover:shadow transition-all"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-base shadow-sm hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                Jelajahi Fitur <Sparkles className="w-4 h-4 text-[#1E3A8A] dark:text-sky-400" />
              </a>
            </motion.div>
          </div>

          {/* Trust Badges */}
          <div className="hero-trust mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800 max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="hero-trust-item flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ekstraksi Struk Kasir via OCR</span>
            </div>
            <div className="hero-trust-item flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Skor Kesehatan Finansial Objektif</span>
            </div>
            <div className="hero-trust-item flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1E3A8A] dark:text-sky-400" />
              <span>Keamanan & Privasi Terisolasi</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};



