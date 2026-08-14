import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Receipt,
  Activity,
  Zap,
  Lock,
  EyeOff,
  Cpu,
} from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export const HeroSection = () => {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);

  // Dynamic counter states
  const [ocrAmount, setOcrAmount] = useState(0);
  const [healthScore, setHealthScore] = useState(0);

  // Mouse coordinate motion values for Framer Motion / GSAP interactive parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const cardLeftX = useTransform(smoothMouseX, [-0.5, 0.5], [-24, 24]);
  const cardLeftY = useTransform(smoothMouseY, [-0.5, 0.5], [-20, 20]);
  const cardLeftRotate = useTransform(smoothMouseX, [-0.5, 0.5], [-4, 4]);

  const cardRightX = useTransform(smoothMouseX, [-0.5, 0.5], [24, -24]);
  const cardRightY = useTransform(smoothMouseY, [-0.5, 0.5], [20, -20]);
  const cardRightRotate = useTransform(smoothMouseX, [-0.5, 0.5], [4, -4]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  useGSAP(
    () => {
      // 1. Kinetic Master Entrance Timeline
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: () => {
          // Trigger animated count-up numbers smoothly
          let countObj = { amount: 0, score: 0 };
          gsap.to(countObj, {
            amount: 68500,
            score: 84,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              setOcrAmount(Math.floor(countObj.amount));
              setHealthScore(Math.floor(countObj.score));
            },
          });
        },
      });

      tl.from(".hero-badge", {
        opacity: 0,
        y: -20,
        scale: 0.9,
        duration: 0.8,
        ease: "back.out(1.4)",
      })
        .from(
          ".hero-title-word",
          {
            opacity: 0,
            y: 35,
            rotateX: 40,
            duration: 0.9,
            stagger: 0.04,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-subtitle",
          {
            opacity: 0,
            y: 20,
            duration: 0.7,
          },
          "-=0.5"
        )
        .from(
          ".hero-actions > *",
          {
            opacity: 0,
            y: 20,
            scale: 0.95,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.2)",
          },
          "-=0.4"
        )
        .from(
          ".hero-card-left-wrap",
          {
            opacity: 0,
            x: -40,
            scale: 0.88,
            duration: 0.9,
            ease: "back.out(1.2)",
          },
          "-=0.5"
        )
        .from(
          ".hero-card-right-wrap",
          {
            opacity: 0,
            x: 40,
            scale: 0.88,
            duration: 0.9,
            ease: "back.out(1.2)",
          },
          "-=0.7"
        )
        .from(
          ".hero-trust-item",
          {
            opacity: 0,
            y: 15,
            duration: 0.6,
            stagger: 0.08,
          },
          "-=0.4"
        );

      // 2. (removed infinite float loops for performance; scroll & mouse parallax remain)

      // 3. ScrollTrigger Parallax scrub
      gsap.to(".hero-content-wrap", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
        y: 60,
        opacity: 0.3,
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
    },
    { scope: containerRef }
  );

  const headlineWords = [
    { text: "Uangmu", highlight: false },
    { text: "Kemana,", highlight: false },
    { text: "Kamu", highlight: true },
    { text: "Tahu.", highlight: true },
  ];

  const trustHighlights = [
    { icon: Zap, label: "Deteksi OCR Cepat", sub: "< 2 Detik Struk" },
    { icon: Cpu, label: "Formula 50/30/20", sub: "Alokasi Otomatis" },
    { icon: ShieldCheck, label: "Keamanan Terenkripsi", sub: "Standar Perbankan" },
    { icon: EyeOff, label: "100% Bebas Iklan", sub: "Fokus Finansial" },
  ];

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-36 pb-32 lg:pt-44 lg:pb-40 overflow-hidden bg-gradient-to-b from-blue-200/90 via-indigo-100/70 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
    >
      {/* Primary ambient mesh */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[360px] bg-gradient-to-tr from-blue-500/15 via-sky-400/10 to-indigo-500/15 blur-[70px] rounded-full -z-10" />
      {/* Deep radial glow behind headline */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[320px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_65%)] blur-2xl rounded-full -z-10" />
      {/* Secondary accent orbs */}
      <div className="pointer-events-none absolute top-8 left-0 w-64 h-64 bg-indigo-500/10 blur-[70px] rounded-full -z-10" />
      <div className="pointer-events-none absolute top-16 right-0 w-64 h-64 bg-emerald-500/10 blur-[70px] rounded-full -z-10" />
      <div className="pointer-events-none absolute bottom-20 left-1/4 w-56 h-56 bg-sky-400/8 blur-[60px] rounded-full -z-10" />
      <div className="pointer-events-none absolute bottom-10 right-1/4 w-64 h-64 bg-violet-500/8 blur-[70px] rounded-full -z-10" />

      {/* Fine dot-grid texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.3] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] dark:opacity-[0.25] -z-10" />

      {/* Decorative static particles */}
      <div className="pointer-events-none absolute top-32 left-[8%] w-2.5 h-2.5 rounded-full bg-blue-400/40 dark:bg-sky-400/30" />
      <div className="pointer-events-none absolute top-48 right-[12%] w-2 h-2 rounded-full bg-emerald-400/50 dark:bg-emerald-400/30" />
      <div className="pointer-events-none absolute top-72 left-[18%] w-1.5 h-1.5 rounded-full bg-indigo-400/40 dark:bg-indigo-400/25" />
      <div className="pointer-events-none absolute top-40 right-[22%] w-3 h-3 rotate-45 bg-sky-300/30 dark:bg-sky-300/20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        {/* Floating Card Left: Live OCR Transaction Scan (3D Mouse Parallax) */}
        <motion.div
          style={{ x: cardLeftX, y: cardLeftY, rotate: cardLeftRotate }}
          className="hero-card-left-wrap hidden lg:flex absolute top-10 left-0 z-20 pointer-events-none"
        >
          <div className="hero-float-inner-1 pointer-events-auto flex items-center gap-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 flex items-center justify-center text-[#1E3A8A] dark:text-sky-400 shrink-0 shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <span>Struk Terdeteksi AI</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
                +Rp {ocrAmount.toLocaleString("id-ID")}{" "}
                <span className="text-[10px] font-bold text-[#1E3A8A] dark:text-sky-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/40">
                  Kebutuhan Pokok
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Floating Card Right: Live Financial Score (3D Mouse Parallax) */}
        <motion.div
          style={{ x: cardRightX, y: cardRightY, rotate: cardRightRotate }}
          className="hero-card-right-wrap hidden lg:flex absolute top-16 right-0 z-20 pointer-events-none"
        >
          <div className="hero-float-inner-2 pointer-events-auto flex items-center gap-3 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all hover:scale-105">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shrink-0 shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <span>Skor Kesehatan Finansial</span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E3A8A] dark:bg-sky-400"></span>
                </span>
              </div>
              <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <span>{healthScore} / 100</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
                  Kondisi Prima
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hero Main Content */}
        <div className="hero-content-wrap max-w-4xl mx-auto text-center relative z-10">

          {/* Hero Main Headline with Kinetic Word Stagger */}
          <h1
            ref={headlineRef}
            className="hero-title text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-3xl mx-auto leading-[1.15] sm:leading-[1.1] [perspective:1000px]"
          >
            {headlineWords.map((word, idx) => (
              <motion.span
                key={idx}
                className={`hero-title-word inline-block mr-[0.25em] ${
                  word.highlight
                    ? "hero-text-shimmer bg-gradient-to-r from-[#1E3A8A] via-sky-500 to-[#1E3A8A] bg-clip-text text-transparent [background-size:200%_auto] dark:from-sky-300 dark:via-blue-300 dark:to-sky-300"
                    : ""
                }`}
              >
                {word.text}
              </motion.span>
            ))}
          </h1>

          {/* Hero Subtitle */}
          <p className="hero-subtitle mt-8 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Foto struknya, sisanya urusan AI. SADAR mencatat pengeluaran,
            membagi anggaran 50/30/20, dan menjaga skor kesehatan
            finansialmu tetap terkontrol.
          </p>

          {/* Call to Actions with Shimmer Effect */}
          <div className="hero-actions mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto relative group overflow-hidden rounded-xl"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Shimmer Sweep Animation */}
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Gratis Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto"
            >
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm shadow-xs hover:bg-slate-50 hover:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                Pelajari Fitur
              </a>
            </motion.div>
          </div>

          {/* Hero Trust Badges Bar */}
          <div className="mt-16 sm:mt-20 pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {trustHighlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="hero-trust-item flex items-center justify-center sm:justify-start gap-2.5 p-2.5 rounded-xl text-left bg-white/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800/60 shadow-2xs hover:scale-105 transition-transform"
                >
                  <div className="p-2 rounded-lg bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {item.sub}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
