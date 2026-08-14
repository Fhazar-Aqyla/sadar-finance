import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  XCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  FileSpreadsheet,
  Zap,
  ArrowLeftRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export const ComparisonSection = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yManual = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const ySadar = useTransform(scrollYProgress, [0, 1], [-25, 25]);

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
      {/* Ambient background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/8 dark:bg-rose-500/6 blur-[120px] rounded-full" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/8 dark:bg-sky-400/6 blur-[120px] rounded-full" />
      </div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm border border-blue-100 dark:border-blue-900/40">
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Transformasi Finansial
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="text-slate-900 dark:text-white">Tinggalkan Cara Lama yang{" "}</span>
          <span className="text-rose-600 dark:text-rose-400">Melelahkan</span><span className="text-slate-900 dark:text-white">,{" "}</span>
          <br className="hidden sm:block" />
          <span className="text-slate-900 dark:text-white">Beralih ke{" "}</span>
          <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">
            SADAR Finance.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
          Bandingkan bagaimana otomatisasi AI dan metode 50/30/20 mengubah cara
          kamu mengelola uang setiap harinya.
        </p>
      </motion.div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-0 items-stretch relative z-10">
        {/* ── Left: Manual Card ── */}
        <motion.div style={{ y: yManual }}>
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-full rounded-3xl border border-rose-200 dark:border-rose-900/50 bg-white dark:bg-slate-900 overflow-hidden shadow-lg shadow-rose-500/5"
          >
            {/* Card header */}
            <div className="px-7 py-6 bg-gradient-to-br from-rose-50 to-rose-100/40 dark:from-rose-950/40 dark:to-slate-900 border-b border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-500 flex items-center justify-center shadow-sm">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">
                      Cara Manual & Konvensional
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Metode lama tanpa otomatisasi
                    </p>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-wide border border-rose-200 dark:border-rose-800">
                  Sering Gagal
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="px-7 py-6 space-y-3">
              {manualDrawbacks.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08, duration: 0.4 }}
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 transition-all cursor-default"
                >
                  <div className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mx-7 mb-6 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Rentan bocor halus & memakan waktu 30–45 menit/minggu
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ── Center Divider ── */}
        <div className="hidden lg:flex flex-col items-center justify-center px-6 gap-3">
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-400/30 to-blue-500/30 blur-md animate-pulse" />
            <div className="relative w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg">
              <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 tracking-widest">VS</span>
            </div>
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        {/* ── Right: SADAR Card ── */}
        <motion.div style={{ y: ySadar }}>
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-full rounded-3xl border-2 border-[#1E3A8A]/25 dark:border-sky-500/30 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-blue-500/10 relative"
          >
            {/* Subtle inner glow top */}
            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-50/80 to-transparent dark:from-blue-950/30 dark:to-transparent pointer-events-none" />

            {/* Card header */}
            <div className="relative px-7 py-6 bg-gradient-to-br from-blue-50 to-blue-100/30 dark:from-blue-950/40 dark:to-slate-900 border-b border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#1E3A8A] to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-tight flex items-center gap-2">
                      Bersama SADAR Finance
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-xs text-[#1E3A8A] dark:text-sky-400 font-semibold mt-0.5">
                      AI Powered & Realtime Ecosystem
                    </p>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wide border border-emerald-200 dark:border-emerald-800">
                  ✦ Direkomendasikan
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="px-7 py-6 space-y-3 relative z-10">
              {sadarAdvantages.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 + 0.1, duration: 0.4 }}
                  whileHover={{ x: -5 }}
                  className="flex items-start gap-3.5 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 hover:border-[#1E3A8A]/30 dark:hover:border-sky-500/40 transition-all cursor-default"
                >
                  <div className="mt-0.5 w-5 h-5 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="mx-7 mb-6 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 to-emerald-50/60 dark:from-blue-950/30 dark:to-emerald-950/20 border border-blue-100 dark:border-blue-900/40 flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" />
                Hemat waktu hingga 95% & Bebas Stres
              </span>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs font-black text-[#1E3A8A] dark:text-sky-400 hover:underline group whitespace-nowrap"
              >
                Coba Sekarang
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
