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
      className="py-16 lg:py-24 bg-slate-50 dark:bg-slate-950/60 border-y border-slate-200/80 dark:border-slate-800/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-blue-100 dark:border-blue-900/40">
            <Calculator className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
            Kalkulator Alokasi Finansial
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Coba Simulasi Anggaran{" "}
            <span className="text-[#1E3A8A] dark:text-sky-400">
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

