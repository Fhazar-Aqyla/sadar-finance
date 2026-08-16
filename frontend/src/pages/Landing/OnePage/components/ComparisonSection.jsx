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
        <div className="hidden sm:grid grid-cols-[1.6fr_0.7fr_0.7fr] items-stretch border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center px-8 lg:px-10 py-6 bg-[#F8FAFC] dark:bg-slate-800/60">
            <span className="text-[15px] font-bold uppercase tracking-wider text-[#0F172A] dark:text-slate-100">
              Fitur / Aspek
            </span>
          </div>
          <div className="flex items-center justify-center px-4 py-6 border-l border-[#F1D5D8] dark:border-rose-900/40 bg-[#FFF1F2] dark:bg-rose-950/40">
            <span className="text-[15px] font-bold uppercase tracking-wider text-[#9F1239] dark:text-rose-300">
              Platform Lain
            </span>
          </div>
          <div className="flex items-center justify-center px-4 py-6 border-l border-[#23408F] bg-[#23408F] dark:bg-[#23408F]">
            <span className="text-[15px] font-extrabold uppercase tracking-wider text-white">
              SADAR Finance
            </span>
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {checklistRows.map((feature, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[1.6fr_0.7fr_0.7fr] items-stretch"
            >
              {/* Feature */}
              <div className="flex items-center px-8 lg:px-10 py-5 sm:py-7 bg-white dark:bg-slate-900">
                <span className="text-[17px] sm:text-[18px] font-semibold text-[#0F172A] dark:text-white leading-snug">
                  {feature}
                </span>
              </div>

              {/* Platform Lain */}
              <div className="flex items-center justify-between sm:justify-center gap-3 px-6 sm:px-4 py-3.5 sm:py-7 border-t sm:border-t-0 border-slate-100/80 dark:border-slate-800/60 sm:border-l sm:border-[#F1D5D8] dark:sm:border-rose-900/40 bg-[#FFFAFA] dark:bg-rose-950/20">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-wider text-[#9F1239]">
                  Platform Lain
                </span>
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#FFF1F2] dark:bg-rose-950/50 border border-[#F1D5D8] dark:border-rose-900/50 flex items-center justify-center">
                  <X className="w-6 h-6 text-[#FF4D6D] dark:text-rose-400" strokeWidth={2.5} />
                </span>
              </div>

              {/* SADAR Finance */}
              <div className="flex items-center justify-between sm:justify-center gap-3 px-6 sm:px-4 py-3.5 sm:py-7 border-t sm:border-t-0 sm:border-l border-slate-100/80 dark:border-slate-800/60 sm:border-blue-200 dark:sm:border-blue-900/50 bg-[#F2F7FF] dark:bg-blue-950/40">
                <span className="sm:hidden text-xs font-semibold uppercase tracking-wider text-[#23408F] dark:text-sky-300">
                  SADAR Finance
                </span>
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center">
                  <Check className="w-6 h-6 text-[#00A878] dark:text-emerald-400" strokeWidth={2.5} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};