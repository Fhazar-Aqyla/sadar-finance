import React from "react";
import { motion } from "framer-motion";
import { X, Check, ArrowLeftRight } from "lucide-react";

const checklistRows = [
  "Pencatatan transaksi otomatis",
  "Kategorisasi transaksi otomatis",
  "Peringatan sebelum anggaran berlebihan",
  "Financial Health Score 0–100",
  "Analisis pola pengeluaran otomatis",
];

export const ComparisonSection = () => {
  return (
    <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
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
          <span className="text-rose-600 dark:text-rose-400">Melelahkan</span>
          <span className="text-slate-900 dark:text-white">,{" "}</span>
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

      {/* Comparison Checklist Table */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-10 overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg shadow-slate-900/5"
      >
        {/* Header */}
        <div className="hidden sm:grid grid-cols-[1.6fr_0.7fr_0.7fr] items-stretch border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center px-6 lg:px-10 py-6">
            <span className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Fitur / Aspek
            </span>
          </div>
          <div className="flex items-center justify-center px-4 py-6 border-l border-slate-200/70 dark:border-slate-800">
            <span className="text-sm font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Cara Konvensional
            </span>
          </div>
          <div className="flex items-center justify-center px-4 py-6 bg-[#1E3A8A] dark:bg-[#1E3A8A]">
            <span className="text-sm font-extrabold uppercase tracking-wider text-white">
              SADAR Finance
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {checklistRows.map((feature, idx) => (
            <div
              key={idx}
              className={`grid grid-cols-1 sm:grid-cols-[1.6fr_0.7fr_0.7fr] items-stretch ${
                idx % 2 === 1
                  ? "bg-slate-50/60 dark:bg-slate-800/30"
                  : "bg-white dark:bg-slate-900"
              }`}
            >
              {/* Feature */}
              <div className="flex items-center px-6 lg:px-10 py-5 sm:py-7">
                <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {feature}
                </span>
              </div>

              {/* Cara Konvensional */}
              <div className="flex items-center justify-between sm:justify-center gap-3 px-6 sm:px-4 py-3.5 sm:py-7 border-t sm:border-t-0 border-slate-100/80 dark:border-slate-800/60 sm:border-l sm:border-slate-200/70 dark:sm:border-slate-800">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cara Konvensional
                </span>
                <span className="w-10 h-10 shrink-0 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-100/80 dark:border-rose-900/50 flex items-center justify-center">
                  <X className="w-5 h-5 text-rose-500 dark:text-rose-400" strokeWidth={2.5} />
                </span>
              </div>

              {/* SADAR Finance */}
              <div className="flex items-center justify-between sm:justify-center gap-3 px-6 sm:px-4 py-3.5 sm:py-7 bg-blue-50/70 dark:bg-blue-950/30 border-t sm:border-t-0 sm:border-l border-slate-100/80 dark:border-slate-800/60 sm:border-blue-100 dark:sm:border-blue-900/40">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-wider text-[#1E3A8A] dark:text-sky-300">
                  SADAR Finance
                </span>
                <span className="w-10 h-10 shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/80 dark:border-emerald-900/50 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};