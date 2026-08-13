import React, { useRef } from "react";
import { InteractiveBudgetSlider } from "@/Components/ui/interactive-budget-slider";
import { Calculator } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const BudgetSimulatorSection = () => {
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

  const yWidget = useTransform(smoothProgress, [0, 1], [30, -30]);

  return (
    <section
      id="simulator"
      ref={containerRef}
      className="py-16 lg:py-24 relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-slate-50/60 to-indigo-50/40 dark:from-slate-950/80 dark:via-slate-900/60 dark:to-blue-950/40 border-y border-blue-100/60 dark:border-slate-800/80"
    >
      {/* Top wave divider */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0,0 C480,48 960,0 1440,0 L1440,48 L0,48 Z" fill="white" className="dark:fill-slate-950" fillOpacity="0.9"/>
        </svg>
      </div>
      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
          <path d="M0,48 C480,0 960,48 1440,48 L1440,0 L0,0 Z" fill="white" className="dark:fill-slate-950" fillOpacity="0.9"/>
        </svg>
      </div>
      {/* Ambient blobs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-blue-300/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-indigo-300/10 dark:bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-blue-100 dark:border-blue-900/40">
            <Calculator className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
            Simulasi Anggaran 50 / 30 / 20
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="text-slate-900 dark:text-white">Hitung Pembagian Gaji Idealmu{" "}</span>
            <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">
              Secara Akurat.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Terapkan rumus alokasi 50/30/20 yang teruji secara global untuk menjaga keseimbangan antara kebutuhan esensial, gaya hidup, dan masa depan.
          </p>
        </div>

        {/* Embedded Interactive Widget with Parallax Elevation */}
        <motion.div style={{ y: yWidget }} className="max-w-5xl mx-auto">
          <InteractiveBudgetSlider />
        </motion.div>
      </div>
    </section>
  );
};


