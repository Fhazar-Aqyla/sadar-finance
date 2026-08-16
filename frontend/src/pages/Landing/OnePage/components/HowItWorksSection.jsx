import React, { useRef } from "react";
import { Camera, Cpu, Gauge, Sparkles } from "lucide-react";
import { SpotlightCard } from "@/Components/ui/spotlight-card";
import { motion, useScroll, useTransform } from "framer-motion";

export const HowItWorksSection = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax shifts on cards
  const yCard1 = useTransform(scrollYProgress, [0, 1], [35, -30]);
  const yCard2 = useTransform(scrollYProgress, [0, 1], [15, -15]);
  const yCard3 = useTransform(scrollYProgress, [0, 1], [-25, 25]);

  const steps = [
    {
      number: "01",
      icon: Camera,
      title: "Foto Struk atau Catat Transaksi",
      desc: "Unggah foto struk belanjaan kasir dari minimarket/restoran atau masukkan transaksi harianmu dalam 3 detik.",
      accent: "bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300",
      numberClass: "text-blue-200 dark:text-blue-900 group-hover:text-[#1E3A8A]/30",
      pill: "Deteksi Otomatis",
      y: yCard1,
    },
    {
      number: "02",
      icon: Cpu,
      title: "AI Memproses & Mengelompokkan",
      desc: "Algoritma cerdas mengenali merchant, memvalidasi total nominal, dan memetakan pos 50/30/20 secara presisi.",
      accent: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
      numberClass: "text-sky-200 dark:text-sky-900 group-hover:text-sky-600/30",
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
      numberClass: "text-emerald-200 dark:text-emerald-900 group-hover:text-emerald-600/30",
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
        {/* Desktop Conduit Line — always lit, with traveling light pulse */}
        <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] -translate-y-14 h-[3px] pointer-events-none">
          {/* Base glow track */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#1E3A8A]/40 via-sky-400/40 to-emerald-500/40 shadow-[0_0_18px_rgba(56,189,248,0.35)]" />
          {/* Bright moving pulse */}
          <motion.div
            animate={{ x: ["0%", "100%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 -translate-y-1/2 w-16 h-[3px] rounded-full bg-gradient-to-r from-transparent via-sky-300 to-transparent origin-left"
            style={{ left: 0 }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
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
                      <span className={`text-4xl sm:text-5xl font-black tracking-tight transition-colors ${step.numberClass}`}>
                        {step.number}
                      </span>
                    </div>

                    <div className={`inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold dark:bg-slate-800 dark:text-slate-300 mb-3 border border-slate-200/60 dark:border-slate-700`}>
                      {step.pill}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-[#1E3A8A] dark:group-hover:text-sky-400 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
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
