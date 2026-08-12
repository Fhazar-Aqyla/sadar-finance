import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import dashboardPreview from "@/assets/images/landing/dashboard-preview.png";
import dashboardMobilePreview from "@/assets/images/landing/dashboard-mobile-preview.webp";

export const ScrollShowcase = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // 3D Perspective Tilt Parallax
  const rotateX = useTransform(smoothProgress, [0, 0.45], [22, 0]);
  const scale = useTransform(smoothProgress, [0, 0.45, 0.9], [0.86, 1, 0.94]);
  const yMockup = useTransform(smoothProgress, [0, 1], [70, -70]);
  const opacity = useTransform(smoothProgress, [0, 0.25, 0.9, 1], [0.75, 1, 1, 0.8]);

  // Ambient Halo Parallax
  const yHalo = useTransform(smoothProgress, [0, 1], [-80, 140]);
  const scaleHalo = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);

  // Floating Badges Parallax with High Contrast & Independent Offsets
  const yBadge1 = useTransform(smoothProgress, [0, 1], [110, -140]);
  const yBadge2 = useTransform(smoothProgress, [0, 1], [-90, 150]);
  const yBadge3 = useTransform(smoothProgress, [0, 1], [130, -120]);

  return (
    <section
      ref={containerRef}
      className="relative py-16 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Decorative Halo Background with dynamic parallax */}
      <motion.div
        style={{ y: yHalo, scale: scaleHalo }}
        className="absolute inset-0 max-w-5xl mx-auto h-[520px] bg-gradient-to-r from-cyan-400/25 via-sky-400/35 to-teal-400/25 blur-3xl -z-10 rounded-3xl"
      />

      {/* 3D Mockup Container with Perspective Parallax */}
      <motion.div
        style={{
          rotateX,
          scale,
          y: yMockup,
          opacity,
          transformPerspective: 1400,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-900/95 p-2.5 sm:p-4 shadow-2xl shadow-sky-500/20 backdrop-blur-xl transition-shadow"
      >
        {/* Mockup Window Header Dots */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-3.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#25a0e2] animate-pulse"></span>
            sadar.app/dashboard
          </div>
          <div className="w-12" />
        </div>

        {/* Dashboard Image Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/10] sm:aspect-[16/9]">
          <img
            src={dashboardPreview}
            alt="SADAR Finance Dashboard Desktop"
            className="hidden sm:block w-full h-full object-cover object-top"
          />
          <img
            src={dashboardMobilePreview}
            alt="SADAR Finance Dashboard Mobile"
            className="block sm:hidden w-full h-full object-fill object-top"
          />
        </div>

        {/* Floating Interactive Micro-Cards (Parallax Float) */}
        <motion.div
          style={{ y: yBadge1 }}
          className="hidden lg:flex items-center gap-3 absolute -top-8 -left-6 bg-white/95 dark:bg-slate-900/95 border border-sky-100 dark:border-slate-800 p-4 rounded-2xl shadow-2xl shadow-sky-500/15 backdrop-blur-md transition-transform hover:scale-105"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-sm">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Gaji Masuk
            </p>
            <p className="text-sm font-black text-slate-900 dark:text-white">
              +Rp 8.000.000
            </p>
          </div>
        </motion.div>

        <motion.div
          style={{ y: yBadge2 }}
          className="hidden lg:flex items-center gap-3 absolute -top-8 -right-6 bg-white/95 dark:bg-slate-900/95 border border-sky-100 dark:border-slate-800 p-4 rounded-2xl shadow-2xl shadow-sky-500/15 backdrop-blur-md transition-transform hover:scale-105"
        >
          <div className="p-2.5 rounded-xl bg-sky-50 text-[#25a0e2] dark:bg-sky-950/60 dark:text-[#32ccff] shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Financial Score
            </p>
            <p className="text-sm font-black text-[#25a0e2] dark:text-[#32ccff]">
              84 • Kondisi Sehat
            </p>
          </div>
        </motion.div>

        <motion.div
          style={{ y: yBadge3 }}
          className="hidden lg:flex items-center gap-3 absolute -bottom-8 -right-6 bg-white/95 dark:bg-slate-900/95 border border-amber-100 dark:border-slate-800 p-4 rounded-2xl shadow-2xl shadow-amber-500/15 backdrop-blur-md transition-transform hover:scale-105"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shadow-sm">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
              Smart Alert
            </p>
            <p className="text-sm font-black text-amber-600 dark:text-amber-400">
              Budget Wants 82%
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
