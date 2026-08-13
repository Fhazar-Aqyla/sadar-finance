import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Coffee,
  PiggyBank,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { Link } from "react-router-dom";

export const InteractiveBudgetSlider = () => {
  const [income, setIncome] = useState(6000000);

  const presets = [
    { label: "Rp 3 Jt", value: 3000000 },
    { label: "Rp 6 Jt", value: 6000000 },
    { label: "Rp 12 Jt", value: 12000000 },
    { label: "Rp 25 Jt", value: 25000000 },
  ];

  const needs = income * 0.5;
  const wants = income * 0.3;
  const savings = income * 0.2;

  const formatRupiah = (val) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-lg dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold dark:bg-blue-950/60 dark:text-sky-300 mb-2 border border-blue-100 dark:border-blue-900/30">
          <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Simulasi Rumus 50 / 30 / 20
        </div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hitung Alokasi Gaji Idealmu
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
              Geser slider atau pilih preset untuk melihat pembagian anggaran
              sehat secara otomatis.
            </p>
          </div>

          {/* Quick Preset Pills — sejajar kanan bawah header */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-end shrink-0">
            {presets.map((preset) => {
              const isSelected = income === preset.value;
              return (
                <button
                  key={preset.value}
                  onClick={() => setIncome(preset.value)}
                  className="relative px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-colors z-10"
                >
                  {isSelected && (
                    <motion.div
                      layoutId="activePresetPill"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 bg-[#1E3A8A] rounded-xl shadow-sm -z-10"
                    />
                  )}
                  <span
                    className={
                      isSelected
                        ? "text-white font-bold"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }
                  >
                    {preset.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Slider Section ── */}
      <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#1E3A8A] dark:text-sky-400 shrink-0" />
            Total Pendapatan Bersih (Net Income):
          </span>
          <motion.span
            key={income}
            initial={{ scale: 1.08, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-2xl sm:text-3xl font-black text-[#1E3A8A] dark:text-sky-400 tracking-tight"
          >
            {formatRupiah(income)}
          </motion.span>
        </div>

        <input
          type="range"
          min="1500000"
          max="35000000"
          step="500000"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          aria-label="Pengatur Pendapatan Bulanan"
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1E3A8A] dark:bg-slate-800 transition-all"
        />

        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
          <span>Rp 1,5 Jt</span>
          <span>Rp 15 Jt</span>
          <span>Rp 35 Jt</span>
        </div>
      </div>

      {/* ── Allocation Result Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Needs Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#1E3A8A] text-white shadow-sm">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Kebutuhan Pokok
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#1E3A8A]/10 text-[#1E3A8A] dark:bg-blue-900/40 dark:text-sky-300 text-xs font-black border border-[#1E3A8A]/20 dark:border-blue-700/40">
              50%
            </span>
          </div>

          <motion.div
            key={needs}
            initial={{ opacity: 0.6, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-black text-[#1E3A8A] dark:text-sky-300 mb-2 tracking-tight"
          >
            {formatRupiah(needs)}
          </motion.div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Makan sehari-hari, sewa/kos, tagihan listrik & air, cicilan pokok,
            dan bensin rutin.
          </p>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-[#1E3A8A]/10 dark:bg-blue-900/30 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-[#1E3A8A] dark:bg-sky-500 rounded-full" />
          </div>
        </motion.div>

        {/* Wants Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-amber-100 dark:border-amber-900/30 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Gaya Hidup
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-black border border-amber-200/60 dark:border-amber-700/40">
              30%
            </span>
          </div>

          <motion.div
            key={wants}
            initial={{ opacity: 0.6, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-black text-amber-600 dark:text-amber-400 mb-2 tracking-tight"
          >
            {formatRupiah(wants)}
          </motion.div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Jajan kopi, kuliner kafe, nonton bioskop, langganan streaming,
            belanja hobi, & liburan.
          </p>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
            <div className="h-full w-[30%] bg-amber-500 rounded-full" />
          </div>
        </motion.div>

        {/* Savings Card */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.18 }}
          className="rounded-2xl border border-emerald-100 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                <PiggyBank className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                Tabungan & Investasi
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200/60 dark:border-emerald-700/40">
              20%
            </span>
          </div>

          <motion.div
            key={savings}
            initial={{ opacity: 0.6, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mb-2 tracking-tight"
          >
            {formatRupiah(savings)}
          </motion.div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            Akumulasi dana darurat 3-6 bulan, tabungan target beli rumah/nikah,
            reksadana, & emas.
          </p>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-emerald-100 dark:bg-emerald-900/30 rounded-full overflow-hidden">
            <div className="h-full w-[20%] bg-emerald-600 rounded-full" />
          </div>
        </motion.div>
      </div>

      {/* ── Total Bar Visualization ── */}
      <div className="mt-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
          Visualisasi Distribusi Anggaran
        </p>
        <div className="flex h-3 w-full rounded-full overflow-hidden gap-0.5">
          <motion.div
            key={`needs-bar-${income}`}
            initial={{ width: 0 }}
            animate={{ width: "50%" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-full bg-[#1E3A8A] dark:bg-sky-500 rounded-l-full"
          />
          <motion.div
            key={`wants-bar-${income}`}
            initial={{ width: 0 }}
            animate={{ width: "30%" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
            className="h-full bg-amber-500"
          />
          <motion.div
            key={`savings-bar-${income}`}
            initial={{ width: 0 }}
            animate={{ width: "20%" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="h-full bg-emerald-600 rounded-r-full"
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#1E3A8A] dark:bg-sky-500 inline-block" />
            Kebutuhan 50%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            Gaya Hidup 30%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            Tabungan 20%
          </span>
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            SADAR Finance otomatis memantau batas 50/30/20 di setiap transaksi
            yang tercatat.
          </span>
        </div>
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 font-bold text-[#1E3A8A] hover:text-[#1A3175] dark:text-sky-400 hover:underline shrink-0 group whitespace-nowrap"
        >
          Terapkan Alokasi Ini di Akunmu
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
