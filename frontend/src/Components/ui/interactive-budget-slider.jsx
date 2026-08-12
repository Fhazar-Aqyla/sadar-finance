import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Coffee,
  PiggyBank,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
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
    <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 lg:p-10 shadow-lg dark:border-slate-800 dark:bg-slate-900 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold dark:bg-blue-950/60 dark:text-sky-300 mb-2 border border-blue-100 dark:border-blue-900/30">
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
            Simulasi Rumus 50 / 30 / 20
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Hitung Alokasi Gaji Idealmu
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pilih preset atau geser slider sesuai estimasi pendapatan bulananmu untuk melihat alokasi sehat.
          </p>
        </div>

        {/* Quick Presets with Framer Motion layoutId */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start md:self-auto">
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
                    className="absolute inset-0 bg-[#1E3A8A] rounded-xl shadow-xs -z-10"
                  />
                )}
                <span
                  className={
                    isSelected
                      ? "text-white font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  }
                >
                  {preset.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Slider Input */}
      <div className="my-8 p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <span className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#1E3A8A] dark:text-sky-400" />
            Total Pendapatan Bersih (Net Income):
          </span>
          <motion.span
            key={income}
            initial={{ scale: 1.1, opacity: 0.8 }}
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

      {/* Result Cards Grid with Framer Motion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Needs Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#1E3A8A] text-white shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Kebutuhan Pokok
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-black dark:bg-blue-950/60 dark:text-sky-300 border border-blue-200/60">
              50%
            </span>
          </div>
          <motion.div
            key={needs}
            initial={{ opacity: 0.7, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 mb-2 tracking-tight"
          >
            {formatRupiah(needs)}
          </motion.div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Makan sehari-hari, sewa/kos, tagihan listrik & air, cicilan pokok, dan bensin rutin.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "50%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-[#1E3A8A] h-full rounded-full"
            />
          </div>
        </motion.div>

        {/* Wants Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                <Coffee className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Gaya Hidup
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-black dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60">
              30%
            </span>
          </div>
          <motion.div
            key={wants}
            initial={{ opacity: 0.7, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 mb-2 tracking-tight"
          >
            {formatRupiah(wants)}
          </motion.div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Jajan kopi, kuliner kafe, nonton bioskop, langganan streaming, belanja hobi, & liburan.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "30%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-amber-500 h-full rounded-full"
            />
          </div>
        </motion.div>

        {/* Savings Card */}
        <motion.div
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-800/40 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
                <PiggyBank className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Tabungan & Investasi
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
              20%
            </span>
          </div>
          <motion.div
            key={savings}
            initial={{ opacity: 0.7, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 mb-2 tracking-tight"
          >
            {formatRupiah(savings)}
          </motion.div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
            Akumulasi dana darurat 3-6 bulan, tabungan target beli rumah/nikah, reksadana, & emas.
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-4 overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "20%" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-emerald-600 h-full rounded-full"
            />
          </div>
        </motion.div>
      </div>

      {/* Footer Call to Action */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            SADAR Finance otomatis memantau batas 50/30/20 di setiap transaksi yang tercatat.
          </span>
        </div>
        <Link
          to="/register"
          className="inline-flex items-center gap-1.5 font-bold text-[#1E3A8A] hover:text-[#1A3175] dark:text-sky-400 hover:underline shrink-0 group"
        >
          Terapkan Alokasi Ini di Akunmu{" "}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
