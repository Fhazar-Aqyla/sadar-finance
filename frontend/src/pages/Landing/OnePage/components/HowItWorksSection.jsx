import React, { useRef } from "react";
import { Camera, Cpu, Gauge, CheckCircle2 } from "lucide-react";
import { SpotlightCard } from "@/Components/ui/spotlight-card";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const HowItWorksSection = () => {
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

  // Parallax shifts on cards
  const yCard1 = useTransform(smoothProgress, [0, 1], [30, -30]);
  const yCard2 = useTransform(smoothProgress, [0, 1], [10, -10]);
  const yCard3 = useTransform(smoothProgress, [0, 1], [-20, 20]);

  // Animated line connector
  const lineScale = useTransform(smoothProgress, [0.2, 0.65], [0, 1]);

  const steps = [
    {
      number: "01",
      icon: Camera,
      title: "Foto Struk atau Catat Transaksi",
      desc: "Unggah foto struk belanjaan kasir dari minimarket/restoran atau masukkan transaksi harianmu dalam 3 detik.",
      accent: "bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300",
      pill: "Deteksi Otomatis",
      y: yCard1,
    },
    {
      number: "02",
      icon: Cpu,
      title: "AI Memproses & Mengelompokkan",
      desc: "Algoritma cerdas mengenali merchant, memvalidasi total nominal, dan memetakan pos 50/30/20 secara presisi.",
      accent: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
      pill: "NLP Categorization",
      y: yCard2,
    },
    {
      number: "03",
      icon: Gauge,
      title: "Pantau Skor & Kendalikan Pengeluaran",
      desc: "Dapatkan skor kesehatan finansial objektif dan terima peringatan otomatis sebelum kuota anggaranmu overbudget.",
      accent:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      pill: "Skor Finansial",
      y: yCard3,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-blue-100 dark:border-blue-900/40">
          Alur Kerja Simpel
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Tiga Langkah Mudah Menuju{" "}
          <span className="text-[#1E3A8A] dark:text-sky-400">
            Sadar Finansial.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Tanpa rumus spreadsheet yang membingungkan. Mulai kelola keuangan secara sadar dan teratur dalam hitungan menit.
        </p>
      </div>

      {/* Steps Container with Connecting Line */}
      <div className="relative z-10">
        {/* Desktop Dynamic Connector Line */}
        <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-[2px] bg-slate-200 dark:bg-slate-800 -translate-y-12 -z-0 rounded-full overflow-hidden">
          <motion.div
            style={{ scaleX: lineScale }}
            className="h-full w-full bg-[#1E3A8A] origin-left rounded-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div key={idx} style={{ y: step.y }} className="h-full">
                <SpotlightCard className="relative p-6 sm:p-8 flex flex-col justify-between h-full border-slate-200/90 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-md">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-13 h-13 p-3 rounded-xl ${step.accent} flex items-center justify-center shadow-sm`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-4xl font-black text-slate-200 dark:text-slate-800 tracking-tight">
                        {step.number}
                      </span>
                    </div>

                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold dark:bg-slate-800 dark:text-slate-300 mb-2.5">
                      {step.pill}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-[#1E3A8A] dark:text-sky-400 gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Otomatis & Realtime</span>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};


