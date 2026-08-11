import React, { useState } from "react";
import { SpotlightCard } from "@/Components/ui/spotlight-card";
import { ReceiptScannerDemo } from "@/Components/ui/receipt-scanner-demo";
import {
  Scan,
  Activity,
  AlertTriangle,
  Wallet,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  PieChart,
} from "lucide-react";

export const BentoFeatures = () => {
  const [activeScore, setActiveScore] = useState(84);

  const getScoreStatus = (val) => {
    if (val <= 40) return { label: "Perlu Perhatian", color: "text-rose-500", bg: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" };
    if (val <= 70) return { label: "Cukup Sehat", color: "text-amber-500", bg: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" };
    return { label: "Kondisi Sehat", color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300" };
  };

  const status = getScoreStatus(activeScore);

  return (
    <section id="features" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Fitur Unggulan
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Teknologi Cerdas yang Bekerja{" "}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            Tanpa Beban Pikiran.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Dirancang khusus untuk gaya hidup modern. Bekerja otomatis di latar belakang tanpa chatbot rumit.
        </p>
      </div>

      {/* Bento Grid 4-Cards Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card 1: Interactive OCR Scanner (Full-Width Large Card - 12 Cols) */}
        <div className="lg:col-span-12">
          <SpotlightCard className="p-6 sm:p-8 border-teal-200/50 dark:border-teal-900/30">
            <div className="max-w-2xl mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold dark:bg-teal-950/60 dark:text-teal-300 mb-2">
                <Scan className="w-3.5 h-3.5 text-teal-600" />
                OCR & NLP Scanner
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Foto Struk Kasir, Biarkan AI Menginput
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                Tidak perlu lagi mengetik satu per satu barang belanjaan. Ambil foto struk dari Indomaret, kafe, atau SPBU, dan nominal serta pos kebutuhan otomatis terdeteksi.
              </p>
            </div>
            <ReceiptScannerDemo />
          </SpotlightCard>
        </div>

        {/* Card 2: Interactive Financial Health Score (6 Cols) */}
        <div className="lg:col-span-6">
          <SpotlightCard className="h-full flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold dark:bg-blue-950/60 dark:text-blue-300 mb-3">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                Financial Health Score
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Skor Kesehatan Finansial 0–100
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Kalkulasi objektif dari rasio tabungan, disiplin budget, dan kontrol pengeluaran.
              </p>

              {/* Interactive Speedometer Simulation */}
              <div className="my-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-center">
                <div className="relative inline-flex items-center justify-center">
                  <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                    {activeScore}
                    <span className="text-xl text-slate-400 font-normal">/100</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${status.bg}`}>
                    {status.label}
                  </span>
                </div>

                {/* Score Tester Slider */}
                <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Uji Nilai Skor:</span>
                    <span className="font-semibold">{activeScore} poin</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="98"
                    value={activeScore}
                    onChange={(e) => setActiveScore(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-400 pt-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Rasio Tabungan (35%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
                <span>Kontrol Belanja (30%)</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Card 3: Smart Overspending Alerts & Multi-Account (6 Cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Subcard A: Predictive Spending Alert */}
          <SpotlightCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Deteksi Dini Overspending
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  SADAR memproyeksikan laju belanja hingga akhir bulan. Jika tren pengeluaran diprediksi melebihi budget, kamu langsung mendapat peringatan.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 dark:bg-amber-950/30 dark:border-amber-800/50 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">⚠️ Alert Simulasi:</span>
                  <span>Pengeluaran Kopi & Jajan pekan ini telah menyerap 82% kuota Wants.</span>
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Subcard B: Multi-Account Management */}
          <SpotlightCard className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 shrink-0">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                  Kelola Dompet, Bank & E-Wallet
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Pantau saldo Cash, Rekening BCA/Mandiri, hingga GoPay/OVO dalam satu ringkasan saldo gabungan yang selalu sinkron.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    💵 Dompet Tunai
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    💳 Bank BCA & Mandiri
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                    📱 GoPay & OVO
                  </span>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
};
