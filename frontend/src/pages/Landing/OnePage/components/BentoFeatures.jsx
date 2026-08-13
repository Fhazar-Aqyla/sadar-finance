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
  Check,
  AlertCircle,
  TrendingUp,
  Info,
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

  // Parallax offsets for cards
  const yCard1 = useTransform(smoothProgress, [0, 1], [25, -20]);
  const yBottomGrid = useTransform(smoothProgress, [0, 1], [35, -25]);

  // Helper to get score status theme & dynamically calculated factors based on activeScore
  // Exact Score Ranges per SADAR Finance Specification:
  // 80 - 100 : Sehat (Emerald)
  // 60 - 79  : Cukup Sehat (Amber)
  // 0  - 59  : Perlu Perhatian (Rose)
  const getScoreData = (val) => {
    // Dynamic math for 4 factors based directly on val
    const rasioTabungan = Math.min(35, Math.max(5, Math.round(val * 0.35)));
    const disiplinAnggaran = Math.min(95, Math.max(30, Math.round(val * 0.95)));
    const kontrolBelanja = Math.min(92, Math.max(30, Math.round(val * 0.91)));
    const danaDarurat = Math.min(
      6.0,
      Math.max(0.5, Math.round((val / 100) * 60) / 10)
    ).toFixed(1);

    if (val < 60) {
      return {
        label: "Perlu Perhatian",
        tag: "0–59",
        accentColor: "rose",
        textColor: "text-rose-600 dark:text-rose-400",
        stroke: "#f43f5e",
        activePillBg: "bg-rose-500 text-white shadow-sm shadow-rose-500/30",
        badgeGlow:
          "border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900/50",
        recommendation:
          "Pangkas kuota keinginan dan prioritaskan pelunasan utang berbunga tinggi.",
        factors: [
          { name: "Rasio Tabungan", val: `${rasioTabungan}%`, ok: false },
          { name: "Disiplin Anggaran", val: `${disiplinAnggaran}%`, ok: false },
          { name: "Kontrol Belanja", val: `${kontrolBelanja}%`, ok: false },
          { name: "Dana Darurat", val: `${danaDarurat} Bln`, ok: false },
        ],
      };
    }
    if (val <= 79) {
      return {
        label: "Cukup Sehat",
        tag: "60–79",
        accentColor: "amber",
        textColor: "text-amber-600 dark:text-amber-400",
        stroke: "#f59e0b",
        activePillBg: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
        badgeGlow:
          "border-amber-200 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50",
        recommendation:
          "Tingkatkan alokasi tabungan rutin ke 20% dari total pendapatan.",
        factors: [
          { name: "Rasio Tabungan", val: `${rasioTabungan}%`, ok: true },
          { name: "Disiplin Anggaran", val: `${disiplinAnggaran}%`, ok: true },
          { name: "Kontrol Belanja", val: `${kontrolBelanja}%`, ok: true },
          { name: "Dana Darurat", val: `${danaDarurat} Bln`, ok: true },
        ],
      };
    }
    return {
      label: "Sehat",
      tag: "80–100",
      accentColor: "emerald",
      textColor: "text-emerald-600 dark:text-emerald-400",
      stroke: "#10b981",
      activePillBg: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30",
      badgeGlow:
        "border-emerald-200 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/50",
      recommendation:
        "Alokasi 50/30/20 berada di tingkat optimal & cadangan dana darurat aman.",
      factors: [
        { name: "Rasio Tabungan", val: `${rasioTabungan}%`, ok: true },
        { name: "Disiplin Anggaran", val: `${disiplinAnggaran}%`, ok: true },
        { name: "Kontrol Belanja", val: `${kontrolBelanja}%`, ok: true },
        { name: "Dana Darurat", val: `${danaDarurat} Bln`, ok: true },
      ],
    };
  };

  const scoreData = getScoreData(activeScore);

  // Full 360-degree Circle Ring Gauge Calculations
  const radius = 64;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeDashoffset = circumference - (circumference * activeScore) / 100;

  const scorePresets = [
    { label: "Kritis", score: 35 },
    { label: "Cukup", score: 68 },
    { label: "Sehat", score: 84 },
    { label: "Maksimal", score: 100 },
  ];

  return (
    <section
      id="features"
      ref={containerRef}
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-blue-500/5 dark:bg-sky-400/5 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/5 blur-[100px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-xs border border-blue-100 dark:border-blue-900/40">
          <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Teknologi & Fitur Utama
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Solusi Cerdas untuk Mengelola Keuangan{" "}
          <span className="text-[#1E3A8A] dark:text-sky-400">
            Tanpa Rasa Khawatir.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Otomatisasi pencatatan belanja, analisis laju pengeluaran, dan wawasan
          finansial terarah dalam satu dashboard modern.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="space-y-6 lg:space-y-8 relative z-10">
        {/* Card 1: Interactive OCR Scanner (Full-Width Large Card) */}
        <motion.div style={{ y: yCard1 }}>
          <SpotlightCard className="p-6 sm:p-8 lg:p-10 border-slate-200/90 dark:border-slate-800 shadow-md">
            <div className="max-w-2xl mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-[#1E3A8A] text-xs font-bold dark:bg-blue-950/60 dark:text-sky-300 mb-2.5 border border-blue-100 dark:border-blue-900/30">
                <Scan className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
                AI OCR Scanner
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Cukup Foto Struk Belanja, AI yang Menginput Datanya
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed font-normal">
                Tak perlu lagi mencatat struk belanja satu per satu. Sistem cerdas
                SADAR mengekstrak merchant, tanggal, total nominal, dan membaginya
                ke pos 50/30/20 secara otomatis.
              </p>
            </div>
            <ReceiptScannerDemo />
          </SpotlightCard>
        </motion.div>

        {/* Row 2: Equal Height 2-Column Bento Grid */}
        <motion.div
          style={{ y: yBottomGrid }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch"
        >
          {/* Card 2: Perfect Circular Financial Health Score Card */}
          <SpotlightCard className="h-full flex flex-col justify-between p-6 sm:p-8 border-slate-200/90 dark:border-slate-800 shadow-md relative overflow-hidden">
            <div>
              {/* Header Badge & Title */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold dark:bg-blue-950/60 dark:text-sky-300 border border-blue-100 dark:border-blue-900/30">
                  <Activity className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
                  Financial Health Score
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200/80 dark:border-emerald-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Evaluator AI Live
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Evaluasi Kesehatan Finansial Realtime
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-normal leading-relaxed">
                SADAR mengevaluasi rasio tabungan, kepatuhan anggaran, dan ketahanan
                dana daruratmu untuk menghasilkan skor objektif (0–100).
              </p>

              {/* Full Circular 360° Ring Display */}
              <div className="my-6 py-2 flex flex-col items-center justify-center relative">
                {/* Subtle Radial Glow reacting to active score color */}
                <div
                  className="absolute w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700"
                  style={{ backgroundColor: scoreData.stroke }}
                />

                {/* Perfect Full Circle Ring SVG (-rotate-90 starts 0% at 12 o'clock top center) */}
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg
                    className="w-48 h-48 -rotate-90 transform"
                    viewBox="0 0 160 160"
                  >
                    {/* Full Track 360° Circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth={strokeWidth}
                      className="text-slate-100 dark:text-slate-800/80"
                    />
                    {/* Animated Progress Circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={scoreData.stroke}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>

                  {/* Center Score Number & Badge */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex items-baseline">
                      <motion.span
                        key={activeScore}
                        initial={{ scale: 1.1, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight"
                      >
                        {activeScore}
                      </motion.span>
                      <span className="text-sm font-semibold text-slate-400 ml-0.5">
                        /100
                      </span>
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold border transition-all duration-500 ${scoreData.badgeGlow}`}
                      >
                        <Zap className="w-3 h-3" />
                        {scoreData.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* AI Recommendation Summary Line */}
                <p className="text-xs text-slate-600 dark:text-slate-400 text-center mt-3 max-w-sm font-medium italic">
                  "{scoreData.recommendation}"
                </p>

                {/* Official Score Range Reference Legend Bar */}
                <div className="mt-4 w-full max-w-md p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#1E3A8A] dark:text-sky-400" />
                    Rentang Skor:
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      80–100 (Sehat)
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      60–79 (Cukup)
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      0–59 (Perlu Perhatian)
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider & Preset Switcher */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">
                  <span>Simulasi level skor kesehatan:</span>
                  <span className={`font-bold ${scoreData.textColor}`}>
                    {activeScore} Poin ({scoreData.label})
                  </span>
                </div>

                {/* Custom Styled Range Slider (Min 0, Max 100) */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeScore}
                  onChange={(e) => setActiveScore(Number(e.target.value))}
                  aria-label="Simulasi Skor Finansial"
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-[#1E3A8A] dark:accent-sky-400 bg-slate-200 dark:bg-slate-800 transition-all"
                />

                {/* Score Preset Pills with Sliding Selector */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                  {scorePresets.map((preset) => {
                    const isSelected = activeScore === preset.score;
                    return (
                      <button
                        key={preset.score}
                        type="button"
                        onClick={() => setActiveScore(preset.score)}
                        className="relative py-1.5 px-1 text-[11px] font-bold rounded-lg transition-colors text-center truncate z-10"
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeScorePresetPill"
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 32,
                            }}
                            className={`absolute inset-0 rounded-lg ${scoreData.activePillBg} -z-10`}
                          />
                        )}
                        <span
                          className={
                            isSelected
                              ? "text-white"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          }
                        >
                          {preset.label} ({preset.score})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4 Dynamic Assessment Factors Matrix */}
            <div className="grid grid-cols-2 gap-2.5 pt-5">
              {scoreData.factors.map((f, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        f.ok
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-500"
                      }`}
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {f.name}
                    </span>
                  </div>
                  <motion.span
                    key={f.val}
                    initial={{ opacity: 0.6, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-xs font-bold text-slate-900 dark:text-white shrink-0 ml-1.5"
                  >
                    {f.val}
                  </motion.span>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Card 3: Stacked AI Alerts & Multi-Wallet Manager */}
          <div className="flex flex-col gap-6 lg:gap-8 h-full">
            {/* Subcard A: Predictive Overspending Alert */}
            <SpotlightCard className="flex-1 flex flex-col justify-between p-6 sm:p-7 border-slate-200/90 dark:border-slate-800 shadow-md">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-900/40">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Sistem Prediksi Dini
                  </div>
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    Peringatan Proaktif
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Deteksi Dini Sebelum Anggaran Bocor
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                  SADAR memproyeksikan laju pengeluaran harian hingga akhir bulan
                  dan mengirim peringatan proaktif sebelum batas anggaran terlampaui.
                </p>

                {/* Simulated Overspending Progress Card */}
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Kategori Keinginan (Wants)
                    </span>
                    <span className="text-amber-800 dark:text-amber-300 font-extrabold">
                      82% Terpakai
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-amber-200/60 dark:bg-amber-950/60 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "82%" }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <span>Rp 410.000 / Rp 500.000</span>
                    <span className="font-bold text-amber-800 dark:text-amber-300">
                      Sisa Rp 90.000 untuk 4 Hari
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Proactive Advice Banner */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                <Sparkles className="w-4 h-4 text-[#1E3A8A] dark:text-sky-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">
                  <strong className="text-slate-900 dark:text-slate-200 font-bold">
                    Rekomendasi Cerdas:
                  </strong>{" "}
                  Batasi pengeluaran kategori kuliner akhir pekan ini agar alokasi
                  30% tetap aman.
                </p>
              </div>
            </SpotlightCard>

            {/* Subcard B: Multi-Account Management */}
            <SpotlightCard className="flex-1 flex flex-col justify-between p-6 sm:p-7 border-slate-200/90 dark:border-slate-800 shadow-md">
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold dark:bg-blue-950/60 dark:text-sky-300 border border-blue-100 dark:border-blue-900/30">
                    <Wallet className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
                    Multi-Akun Terpadu
                  </div>
                  <span className="text-[11px] font-bold text-[#1E3A8A] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full border border-blue-100 dark:border-blue-900/30">
                    Semua Terkoneksi
                  </span>
                </div>

                <h4 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Semua Rekening & Saldo dalam Satu Tempat
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed font-normal">
                  Gabungkan saldo rekening bank, dompet tunai, hingga e-wallet
                  favoritmu ke dalam satu ringkasan kekayaan bersih (Net Worth) yang selalu sinkron.
                </p>

                {/* Account Balances Visual Row Cards */}
                <div className="mt-4 space-y-2.5">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-sky-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                          Bank BCA & Mandiri
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
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

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-sky-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                          GoPay, OVO & DANA
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
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
                <span className="text-slate-500 dark:text-slate-400 font-semibold">
                  Total Kekayaan Bersih (Net Worth):
                </span>
                <span className="font-black text-sm text-[#1E3A8A] dark:text-sky-400">
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
