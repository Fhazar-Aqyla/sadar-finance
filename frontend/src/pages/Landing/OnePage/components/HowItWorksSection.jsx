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
  const yCard1 = useTransform(smoothProgress, [0, 1], [50, -50]);
  const yCard2 = useTransform(smoothProgress, [0, 1], [10, -10]);
  const yCard3 = useTransform(smoothProgress, [0, 1], [-35, 45]);

  // Animated line connector
  const lineScale = useTransform(smoothProgress, [0.2, 0.65], [0, 1]);
  const yBg = useTransform(smoothProgress, [0, 1], [-90, 90]);

  const steps = [
    {
      number: "01",
      icon: Camera,
      title: "Catat atau Unggah Struk Belanja",
      desc: "Foto struk fisik dari minimarket/restoran atau input transaksi harianmu secara manual dalam 3 detik.",
      color: "from-[#0bb9a8] to-[#25a0e2]",
      accent: "bg-sky-50 text-[#1a85be] dark:bg-sky-950/60 dark:text-sky-300",
      pill: "Deteksi Otomatis",
      y: yCard1,
    },
    {
      number: "02",
      icon: Cpu,
      title: "AI Memproses & Mengelompokkan",
      desc: "Sistem membaca nominal, nama merchant, dan mengelompokkan pengeluaranmu ke pos Needs, Wants, atau Tabungan.",
      color: "from-[#25a0e2] to-cyan-500",
      accent: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
      pill: "NLP Categorization",
      y: yCard2,
    },
    {
      number: "03",
      icon: Gauge,
      title: "Ketahui Skor & Cegah Keborosan",
      desc: "Pantau kesehatan keuanganmu via Financial Score 0–100 dan terima peringatan otomatis jika pengeluaran hampir overbudget.",
      color: "from-emerald-600 to-teal-500",
      accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      pill: "Skor Finansial",
      y: yCard3,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="py-16 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background Parallax Light Blob */}
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-sky-400/10 via-teal-400/10 to-transparent blur-3xl rounded-full -z-10"
      />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 text-[#1a85be] dark:bg-sky-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
          Langkah Mudah
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Cara Kerja SADAR Finance dalam{" "}
          <span className="bg-gradient-to-r from-[#0bb9a8] via-[#25a0e2] to-[#2c9be0] bg-clip-text text-transparent">
            3 Langkah Simpel.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Tidak perlu spreadsheet rumit atau pencatatan berjam-jam. Mulai sadar
          finansial dalam hitungan menit.
        </p>
      </div>

      {/* Steps Container with Animated Connecting Line */}
      <div className="relative z-10">
        {/* Desktop Dynamic Connector Line */}
        <div className="hidden md:block absolute top-1/2 left-[12%] right-[12%] h-[3px] bg-slate-200 dark:bg-slate-800 -translate-y-12 -z-0 rounded-full overflow-hidden">
          <motion.div
            style={{ scaleX: lineScale }}
            className="h-full w-full bg-gradient-to-r from-[#0bb9a8] via-[#25a0e2] to-[#2c9be0] origin-left rounded-full shadow-[0_0_12px_rgba(37,160,226,0.8)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                style={{ y: step.y }}
                className="h-full"
              >
                <SpotlightCard className="relative p-6 sm:p-8 flex flex-col justify-between h-full border-slate-200/80 dark:border-slate-800 transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-2xl hover:shadow-sky-500/15">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div
                        className={`w-14 h-14 rounded-2xl ${step.accent} flex items-center justify-center shadow-md shadow-sky-500/10 transition-transform duration-300 hover:scale-110`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                      <span className="text-4xl font-black text-slate-200 dark:text-slate-800 tracking-tight">
                        {step.number}
                      </span>
                    </div>

                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-sky-50 text-[#1a85be] text-[11px] font-bold dark:bg-sky-950/60 dark:text-sky-300 mb-2.5">
                      {step.pill}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-[#25a0e2] dark:text-[#32ccff] gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#25a0e2]" />
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
