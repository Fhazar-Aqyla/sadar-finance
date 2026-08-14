import React, { useRef } from "react";
import { Camera, Cpu, Gauge, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
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
  const yCard1 = useTransform(smoothProgress, [0, 1], [35, -30]);
  const yCard2 = useTransform(smoothProgress, [0, 1], [15, -15]);
  const yCard3 = useTransform(smoothProgress, [0, 1], [-25, 25]);

  // Animated line connector with smooth progress
  const lineScale = useTransform(smoothProgress, [0.2, 0.7], [0, 1]);

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
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-blue-500/5 dark:bg-sky-400/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs border border-blue-100 dark:border-blue-900/40">
          <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Alur Kerja Simpel
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="text-slate-900 dark:text-white">Tiga Langkah Mudah Menuju{" "}</span>
          <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">
            Sadar Finansial.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
          Tanpa rumus spreadsheet yang membingungkan. Mulai kelola keuangan secara sadar dan teratur dalam hitungan menit.
        </p>
      </div>

      {/* Steps Container with Connecting Neon Conduit Line */}
      <div className="relative z-10">
        {/* Desktop Dynamic Connector Line */}
        <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-[3px] bg-slate-200 dark:bg-slate-800 -translate-y-12 -z-0 rounded-full overflow-hidden shadow-inner">
          <motion.div
            style={{ scaleX: lineScale }}
            className="h-full w-full bg-gradient-to-r from-[#1E3A8A] via-sky-500 to-emerald-500 origin-left rounded-full shadow-[0_0_10px_#38bdf8]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div key={idx} style={{ y: step.y }} className="h-full">
                <SpotlightCard className="relative p-6 sm:p-8 flex flex-col justify-between h-full border-slate-200/90 dark:border-slate-800 transition-all duration-300 hover:-translate-y-2 shadow-xs hover:shadow-xl group">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className={`w-14 h-14 p-3.5 rounded-2xl ${step.accent} flex items-center justify-center shadow-xs transition-transform`}
                      >
                        <Icon className="w-7 h-7" />
                      </motion.div>
                      <span className="text-4xl sm:text-5xl font-black text-slate-200 dark:text-slate-800 tracking-tight group-hover:text-[#1E3A8A]/20 dark:group-hover:text-sky-400/20 transition-colors">
                        {step.number}
                      </span>
                    </div>

                    <div className="inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold dark:bg-slate-800 dark:text-slate-300 mb-3 border border-slate-200/60 dark:border-slate-700">
                      {step.pill}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-[#1E3A8A] dark:group-hover:text-sky-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-[#1E3A8A] dark:text-sky-400 gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
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
