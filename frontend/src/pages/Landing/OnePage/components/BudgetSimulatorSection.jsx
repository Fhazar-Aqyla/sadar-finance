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

  const yBg = useTransform(smoothProgress, [0, 1], [-80, 110]);
  const yWidget = useTransform(smoothProgress, [0, 1], [40, -40]);

  return (
    <section
      id="simulator"
      ref={containerRef}
      className="py-16 lg:py-28 bg-slate-50/70 dark:bg-slate-950/40 border-y border-slate-200/70 dark:border-slate-800/80 relative overflow-hidden"
    >
      {/* Ambient background glow with Parallax */}
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-gradient-to-r from-sky-400/15 via-teal-400/15 to-transparent blur-3xl rounded-full -z-10"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 text-[#1a85be] dark:bg-sky-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Calculator className="w-3.5 h-3.5 text-[#25a0e2]" />
            Kalkulator Alokasi Finansial
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Coba Simulasi Anggaran{" "}
            <span className="bg-gradient-to-r from-[#0bb9a8] via-[#25a0e2] to-[#2c9be0] bg-clip-text text-transparent">
              Sebelum Mendaftar.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Metode alokasi 50/30/20 terbukti secara global membantu jutaan orang terbebas dari stres finansial tanggal tua.
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
