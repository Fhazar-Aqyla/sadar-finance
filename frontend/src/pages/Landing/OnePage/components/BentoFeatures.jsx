import React, { useState, useRef } from "react";
import { SpotlightCard } from "@/Components/ui/spotlight-card";
import { ReceiptScannerDemo } from "@/Components/ui/receipt-scanner-demo";
import {
  Scan,
  Activity,
  AlertTriangle,
  Wallet,
  Sparkles,
  CheckCircle2,
  Landmark,
  Smartphone,
  Zap,
} from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const BentoFeatures = () => {
  const containerRef = useRef(null);
  const [activeScore, setActiveScore] = useState(84);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Parallax offsets for cards & background - synchronized symmetrically to prevent misaligned staggering
  const yBg = useTransform(smoothProgress, [0, 1], [-100, 100]);
  const yCard1 = useTransform(smoothProgress, [0, 1], [25, -25]);
  const yBottomGrid = useTransform(smoothProgress, [0, 1], [35, -35]);

  const getScoreData = (val) => {
    if (val <= 45) {
      return {
        label: "Perlu Perhatian",
        tag: "Kritis",
        color: "text-rose-500",
        stroke: "#f43f5e",
        glow: "shadow-rose-500/20 border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900",
        recommendation:
          "Pangkas kuota Wants & lunasi utang bunga tinggi segera.",
        factors: [
          { name: "Rasio Tabungan", val: "10%", status: "Rendah", ok: false },
          { name: "Disiplin Budget", val: "45%", status: "Bocor", ok: false },
          { name: "Kontrol Belanja", val: "50%", status: "Waspada", ok: false },
          { name: "Dana Darurat", val: "0.5 Bln", status: "Kurang", ok: false },
        ],
      };
    }
    if (val <= 72) {
      return {
        label: "Cukup Sehat",
        tag: "Waspada",
        color: "text-amber-500",
        stroke: "#f59e0b",
        glow: "shadow-amber-500/20 border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900",
        recommendation: "Tingkatkan alokasi tabungan rutin ke 20% penghasilan.",
        factors: [
          { name: "Rasio Tabungan", val: "20%", status: "Cukup", ok: true },
          {
            name: "Disiplin Budget",
            val: "70%",
            status: "Terkendali",
            ok: true,
          },
          { name: "Kontrol Belanja", val: "68%", status: "Cukup", ok: true },
          { name: "Dana Darurat", val: "2.5 Bln", status: "Sedang", ok: true },
        ],
      };
    }
    return {
      label: "Kondisi Sehat",
      tag: "Prima",
      color: "text-emerald-500",
      stroke: "#10b981",
      glow: "shadow-emerald-500/20 border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900",
      recommendation: "Alokasi 50/30/20 optimal & cadangan darurat terpenuhi.",
      factors: [
        { name: "Rasio Tabungan", val: "35%", status: "Optimal", ok: true },
        { name: "Disiplin Budget", val: "92%", status: "Disiplin", ok: true },
        { name: "Kontrol Belanja", val: "88%", status: "Terkendali", ok: true },
        { name: "Dana Darurat", val: "6 Bln", status: "Aman", ok: true },
      ],
    };
  };

  const scoreData = getScoreData(activeScore);

  // SVG Gauge calculations (Semi-circle Arc gauge: 220 degree arc)
  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  // Use a 220 degree arc (220/360 fraction of circle)
  const arcLength = circumference * (220 / 360);
  const strokeDashoffset = arcLength - arcLength * ((activeScore - 20) / 80);

  const scorePresets = [
    { label: "Kritis", score: 35 },
    { label: "Sedang", score: 62 },
    { label: "Sehat", score: 84 },
    { label: "Prima", score: 96 },
  ];

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-16 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background Parallax Light Mesh */}
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute top-1/3 -left-48 w-96 h-96 bg-gradient-to-tr from-cyan-400/20 to-sky-300/10 blur-3xl rounded-full -z-10"
      />
      <motion.div
        style={{ y: yBg }}
        className="pointer-events-none absolute bottom-10 -right-48 w-96 h-96 bg-gradient-to-tr from-teal-400/20 to-sky-300/10 blur-3xl rounded-full -z-10"
      />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 text-[#1a85be] dark:bg-sky-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-sky-100 dark:border-sky-900/40">
          <Sparkles className="w-3.5 h-3.5 text-[#25a0e2]" />
          Fitur Unggulan
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Teknologi Cerdas yang Bekerja{" "}
          <span className="bg-gradient-to-r from-[#0bb9a8] via-[#25a0e2] to-[#2c9be0] bg-clip-text text-transparent">
            Tanpa Beban Pikiran.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Dirancang khusus untuk gaya hidup modern. Bekerja otomatis di latar
          belakang tanpa perlu chatbot rumit.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="space-y-6 lg:space-y-8">
        {/* Card 1: Interactive OCR Scanner (Full-Width Large Card) */}
        <motion.div style={{ y: yCard1 }}>
          <SpotlightCard className="p-6 sm:p-8 lg:p-10 border-slate-200/80 dark:border-slate-800 shadow-md shadow-sky-500/5">
            <div className="max-w-2xl mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50 text-[#1a85be] text-xs font-bold dark:bg-sky-950/60 dark:text-sky-300 mb-2.5 border border-sky-100 dark:border-sky-900/30">
                <Scan className="w-3.5 h-3.5 text-[#25a0e2]" />
                OCR & NLP Scanner
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Foto Struk Kasir, Biarkan AI Menginput
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                Tidak perlu lagi mengetik satu per satu barang belanjaan. Ambil
                foto struk dari Indomaret, kafe, atau SPBU, dan nominal serta
                pos kebutuhan 50/30/20 otomatis terdeteksi.
              </p>
            </div>
            <ReceiptScannerDemo />
          </SpotlightCard>
        </motion.div>

        {/* Row 2: Equal Height 2-Column Bento Grid (Card 2: Health Score & Card 3: Overspending + Wallets) */}
        <motion.div
          style={{ y: yBottomGrid }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch"
        >
          {/* Card 2: Interactive Financial Health Score */}
          <SpotlightCard className="h-full flex flex-col justify-between p-6 sm:p-8 border-slate-200/80 dark:border-slate-800 shadow-md shadow-sky-500/5">
            <div>
              {/* Header Badge & Title */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50 text-[#1a85be] text-xs font-bold dark:bg-sky-950/60 dark:text-sky-300 border border-sky-100 dark:border-sky-900/30">
                  <Activity className="w-3.5 h-3.5 text-[#25a0e2]" />
                  Financial Health Score
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live AI Evaluator
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Skor Kesehatan Finansial 0–100
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
                Kalkulasi objektif dari rasio tabungan, disiplin budget, kontrol
                pengeluaran, dan cadangan darurat.
              </p>

              {/* Modern Radial Gauge & Score Visualization Card */}
              <div className="my-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-50/90 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200/90 dark:border-slate-800 shadow-sm relative overflow-hidden">
                {/* Background soft radial glow based on score */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none transition-colors duration-500"
                  style={{
                    background: `radial-gradient(circle at center 40%, ${scoreData.stroke} 0%, transparent 70%)`,
                  }}
                />

                {/* SVG Radial Arc Visualizer */}
                <div className="relative flex flex-col items-center justify-center pt-2">
                  <div className="relative w-44 h-36 flex items-center justify-center">
                    <svg
                      className="w-44 h-44 -rotate-110 transform"
                      viewBox="0 0 160 160"
                    >
                      {/* Background Track */}
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${arcLength} ${circumference}`}
                        strokeLinecap="round"
                        className="text-slate-200 dark:text-slate-800"
                      />
                      {/* Animated Progress Arc */}
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={scoreData.stroke}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${arcLength} ${circumference}`}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                      />
                    </svg>

                    {/* Center Score Number */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
                      <div className="flex items-baseline">
                        <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                          {activeScore}
                        </span>
                        <span className="text-base sm:text-lg font-medium text-slate-400 ml-0.5">
                          /100
                        </span>
                      </div>
                      <div className="mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border transition-all duration-300 ${scoreData.glow}`}
                        >
                          <Zap className="w-3 h-3" />
                          {scoreData.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendation Summary Line */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-2 px-2 italic">
                    "{scoreData.recommendation}"
                  </p>
                </div>

                {/* Interactive Slider Controller with Presets */}
                <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">
                    <span>Geser untuk simulasi skor:</span>
                    <span className="font-bold text-[#25a0e2] bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-100 dark:border-sky-900/30">
                      {activeScore} Poin
                    </span>
                  </div>

                  {/* Custom Styled Slider */}
                  <input
                    type="range"
                    min="20"
                    max="98"
                    value={activeScore}
                    onChange={(e) => setActiveScore(Number(e.target.value))}
                    aria-label="Simulasi Skor Finansial"
                    className="w-full h-2.5 rounded-lg appearance-none cursor-pointer accent-[#25a0e2] dark:accent-[#32ccff] transition-all"
                    style={{
                      background: `linear-gradient(to right, ${scoreData.stroke} 0%, ${scoreData.stroke} ${
                        ((activeScore - 20) / (98 - 20)) * 100
                      }%, #e2e8f0 ${((activeScore - 20) / (98 - 20)) * 100}%, #e2e8f0 100%)`,
                    }}
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex items-center justify-between gap-1.5 mt-3 pt-1">
                    {scorePresets.map((preset) => (
                      <button
                        key={preset.score}
                        type="button"
                        onClick={() => setActiveScore(preset.score)}
                        className={`flex-1 py-1 px-1.5 text-[11px] font-semibold rounded-lg border transition-all text-center ${
                          activeScore === preset.score
                            ? "bg-[#25a0e2] text-white border-[#25a0e2] shadow-sm shadow-sky-500/30"
                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-300"
                        }`}
                      >
                        {preset.label} ({preset.score})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Assessment Factors Matrix (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              {scoreData.factors.map((f, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ${
                        f.ok ? "text-emerald-500" : "text-rose-500"
                      }`}
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                      {f.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white shrink-0 ml-1.5">
                    {f.val}
                  </span>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 3: Stacked AI Alerts & Multi-Wallet Manager (Balanced & Equal Height) */}
          <div className="flex flex-col gap-6 lg:gap-8 h-full">
            {/* Subcard A: Predictive Overspending Alert */}
            <SpotlightCard className="flex-1 flex flex-col justify-between p-6 sm:p-7 border-slate-200/80 dark:border-slate-800 shadow-md shadow-sky-500/5">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-bold dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    AI Predictive Engine
                  </div>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/40">
                    Sistem Peringatan Dini
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Deteksi Dini Overspending
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                  SADAR memproyeksikan laju belanja harian hingga akhir bulan
                  dan memberi peringatan proaktif sebelum kuota anggaran
                  terlampaui.
                </p>

                {/* Interactive Simulated Overspending Progress Card */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Kopi & Kuliner (Wants)
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      82% Terpakai
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-amber-100 dark:bg-amber-950/60 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full transition-all duration-500"
                      style={{ width: "82%" }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Rp 410.000 / Rp 500.000</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      Sisa Rp 90.000 (4 Hari)
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Proactive Advice Banner */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <Sparkles className="w-4 h-4 text-[#25a0e2] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">
                    Saran Cerdas:
                  </strong>{" "}
                  Tahan jajan di luar hingga pekan depan untuk menjaga alokasi
                  30% tetap sehat.
                </p>
              </div>
            </SpotlightCard>

            {/* Subcard B: Multi-Account Management */}
            <SpotlightCard className="flex-1 flex flex-col justify-between p-6 sm:p-7 border-slate-200/80 dark:border-slate-800 shadow-md shadow-sky-500/5">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-50 text-[#1a85be] text-xs font-bold dark:bg-sky-950/60 dark:text-sky-300 border border-sky-100 dark:border-sky-900/30">
                    <Wallet className="w-3.5 h-3.5 text-[#25a0e2]" />
                    Sinkronisasi Multi-Akun
                  </div>
                  <span className="text-[11px] font-bold text-[#25a0e2] bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900/30">
                    Semua Terhubung
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Kelola Dompet, Bank & E-Wallet
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                  Pantau saldo Cash, Rekening BCA/Mandiri, hingga GoPay/OVO
                  dalam satu ringkasan saldo gabungan yang selalu sinkron.
                </p>

                {/* Account Balances Visual Row Cards */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 hover:border-sky-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                          Bank BCA & Mandiri
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Rekening Tabungan Utama
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Rp 14.850.000
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                        Terhubung
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 hover:border-sky-200 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-[#25a0e2] flex items-center justify-center shrink-0">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                          GoPay, OVO & DANA
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          E-Wallet Operasional
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        Rp 620.000
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                        Terhubung
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Consolidated Balance Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Total Saldo Bersih:
                </span>
                <span className="font-extrabold text-sm text-[#1a85be] dark:text-[#32ccff]">
                  Rp 15.470.000
                </span>
              </div>
            </SpotlightCard>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
