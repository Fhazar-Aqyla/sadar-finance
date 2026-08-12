import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  XCircle,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Receipt,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SpotlightCard } from "@/Components/ui/spotlight-card";

export const ComparisonSection = () => {
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

  const yManual = useTransform(smoothProgress, [0, 1], [25, -25]);
  const ySadar = useTransform(smoothProgress, [0, 1], [-20, 20]);

  const manualDrawbacks = [
    {
      title: "Pencatatan Manual Melelahkan",
      desc: "Mengetik satu per satu nominal transaksi di Excel/Notes yang sering tertunda dan akhirnya terlupakan.",
    },
    {
      title: "Struk Fisik Kasir Mudah Hilang",
      desc: "Kertas kasir bertumpuk, tinta cepat memudar, dan total pengeluaran kecil bocor tanpa jejak.",
    },
    {
      title: "Batas Anggaran Bablas",
      desc: "Hanya menyadari uang habis saat saldo sudah menipis di pertengahan bulan tanpa peringatan dini.",
    },
    {
      title: "Buta Kondisi Kesehatan Finansial",
      desc: "Tidak mengetahui rasio tabungan, ketahanan dana darurat, maupun skor kesehatan finansial riil.",
    },
  ];

  const sadarAdvantages = [
    {
      title: "AI OCR Otomatisasi Struk < 2 Detik",
      desc: "Cukup jepret foto struk kasir, nama merchant, total belanja, dan item langsung terpetakan.",
    },
    {
      title: "Formula Alokasi 50/30/20 Terintegrasi",
      desc: "Setiap transaksi otomatis dikelompokkan ke pos Kebutuhan, Keinginan, atau Tabungan.",
    },
    {
      title: "Radar Peringatan Dini Overbudget",
      desc: "Notifikasi realtime sebelum kuota gaya hidupmu melebihi batas toleransi yang ditetapkan.",
    },
    {
      title: "Live Financial Health Score (0-100)",
      desc: "Evaluasi kesehatan finansial objektif dengan rekomendasi langkah perbaikan yang dipersonalisasi.",
    },
  ];

  return (
    <section
      ref={containerRef}
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-80 bg-blue-500/5 dark:bg-sky-400/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-blue-100 dark:border-blue-900/40">
          <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Transformasi Finansial
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Tinggalkan Cara Lama yang{" "}
          <span className="text-rose-600 dark:text-rose-400">Melelahkan</span>,
          Beralih ke{" "}
          <span className="text-[#1E3A8A] dark:text-sky-400">SADAR Finance.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Bandingkan bagaimana otomatisasi AI dan metode 50/30/20 mengubah cara kamu mengelola uang setiap harinya.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch relative z-10">
        {/* Card 1: Cara Tradisional / Manual */}
        <motion.div style={{ y: yManual }} className="h-full">
          <div className="h-full rounded-3xl border border-rose-200/80 bg-gradient-to-b from-rose-50/40 via-white to-rose-50/20 dark:from-rose-950/20 dark:via-slate-900 dark:to-rose-950/10 p-6 sm:p-8 flex flex-col justify-between shadow-xs dark:border-rose-900/40">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-rose-900/30 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                      Cara Manual & Konvensional
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Metode lama tanpa otomatisasi
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 text-xs font-bold">
                  Sering Gagal
                </span>
              </div>

              <div className="space-y-4">
                {manualDrawbacks.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-rose-100/80 dark:border-rose-900/30 transition-all"
                  >
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-rose-100 dark:border-rose-900/30 text-center">
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                ⚠️ Rentan bocor halus & memakan waktu 30-45 menit/minggu
              </span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Bersama SADAR Finance */}
        <motion.div style={{ y: ySadar }} className="h-full">
          <SpotlightCard className="h-full rounded-3xl border-2 border-[#1E3A8A]/30 dark:border-sky-500/30 bg-gradient-to-b from-blue-50/60 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 flex flex-col justify-between shadow-xl shadow-blue-500/5">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-blue-100 dark:border-blue-900/40 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-sm">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                      Bersama SADAR Finance
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-[#1E3A8A] dark:text-sky-400 font-semibold">
                      AI Powered & Realtime Ecosystem
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                  Direkomendasikan
                </span>
              </div>

              <div className="space-y-4">
                {sadarAdvantages.map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ x: 4 }}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-blue-900/50 shadow-xs hover:border-[#1E3A8A]/40 dark:hover:border-sky-400/40 transition-all"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Hemat waktu hingga 95% & Bebas Stres
              </span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1E3A8A] hover:text-[#1A3175] dark:text-sky-400 hover:underline group"
              >
                Coba Sekarang{" "}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};
