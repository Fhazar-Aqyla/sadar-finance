import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileCheck2,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import sadarLogo from "@/assets/images/landing/sadar-logo.png";
import { FooterSection } from "./OnePage/components/FooterSection";

const DEFAULT_META = {
  latestVersion: "2.0.0",
  buildNumber: 10,
  downloadUrl: "https://sadar-finance.web.id/downloads/sadar-finance-v2.0.0.apk?v=2.0.0",
  releaseNotes: [
    "Rilis Utama SADAR Finance V 2.0.0: Pratinjau & Cetak e-Statement Bulanan Resmi di Dalam Aplikasi",
    "Mode Kalender Arus Kas Bulanan Interaktif di Halaman Riwayat Keuangan",
    "Panel Admin Broadcast & Upload Foto Banner Real-Time Langsung dari Aplikasi & Web",
    "Sinkronisasi Cloud Penuh Target Tabungan, Jadwal Rutin, Piutang & Simulasi Dana Darurat",
  ],
};

const INSTALL_STEPS = [
  {
    number: "01",
    title: "Unduh File APK",
    desc: 'Klik tombol "Unduh Aplikasi Android" di atas untuk menyimpan paket instalasi resmi SADAR Finance ke perangkat Anda.',
    accent: "bg-blue-50 text-[#1E3A8A]",
    numberClass: "text-blue-200/90",
    icon: Download,
  },
  {
    number: "02",
    title: "Izinkan & Pasang",
    desc: 'Buka file APK dari notifikasi unduhan. Jika Android meminta izin pemasangan, aktifkan "Izinkan dari sumber ini" lalu ketuk Install.',
    accent: "bg-sky-50 text-sky-700",
    numberClass: "text-sky-200/90",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Buka & Mulai Atur Keuangan",
    desc: "Jalankan SADAR Finance, ikuti panduan singkat untuk akun baru, dan kelola pemasukan, pengeluaran, serta budget 50/30/20 Anda.",
    accent: "bg-emerald-50 text-emerald-700",
    numberClass: "text-emerald-200/90",
    icon: CheckCircle2,
  },
];

export const InstallPage = () => {
  const [meta, setMeta] = useState(DEFAULT_META);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    document.title = "Instalasi Aplikasi | SADAR Finance";
    window.scrollTo(0, 0);

    fetch("/api/v1/app/version")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json?.data) {
          setMeta((prev) => ({
            ...prev,
            latestVersion: json.data.latestVersion || prev.latestVersion,
            buildNumber: json.data.buildNumber || prev.buildNumber,
            downloadUrl: json.data.downloadUrl || prev.downloadUrl,
            releaseNotes:
              Array.isArray(json.data.releaseNotes) &&
                json.data.releaseNotes.length > 0
                ? json.data.releaseNotes
                : prev.releaseNotes,
          }));
        }
      })
      .catch(() => { });
  }, []);

  const handleDownloadClick = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-[#1E3A8A] selection:text-white overflow-x-hidden font-sans">
      {/* Top Navbar — identical style to Landing Page */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center py-1" aria-label="SADAR Finance">
            <img
              src={sadarLogo}
              alt="SADAR Finance"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </header>

      {/* Hero Section — matching exact HeroSection.jsx light sky-blue aesthetic */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden bg-gradient-to-b from-blue-200/90 via-indigo-100/70 to-slate-50">
        <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[340px] bg-gradient-to-tr from-blue-500/15 via-sky-400/10 to-indigo-500/15 blur-[70px] rounded-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.3]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/85 border border-blue-200/80 text-[#1E3A8A] text-xs font-bold tracking-wide shadow-xs">
              <span>Aplikasi Android Resmi</span>
              <span className="text-slate-300">•</span>
              <span>Versi {meta.latestVersion}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-3xl mx-auto">
              Pasang Aplikasi{" "}
              <span className="bg-gradient-to-r from-[#1E3A8A] via-sky-500 to-[#1E3A8A] bg-clip-text text-transparent">
                SADAR Finance
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Kelola pemasukan, pengeluaran, budget 50/30/20, dan skor kesehatan finansial langsung dari smartphone Android Anda. Cepat, aman, dan tetap bisa digunakan saat offline.
            </p>

            {/* Action Buttons — identical to HeroSection */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <a
                href={meta.downloadUrl}
                download={`SADAR-Finance-v${meta.latestVersion}.apk`}
                onClick={handleDownloadClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                {downloading ? "Memulai Unduhan..." : "Unduh Aplikasi Android (APK)"}
              </a>

              <a
                href="#panduan-instalasi"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-sm shadow-xs hover:bg-slate-50 hover:border-slate-400 transition-all"
              >
                Cara Instalasi
              </a>
            </div>

            {/* Clean Specs Strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#1E3A8A]" />
                Android 7.0 ke atas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Gratis & Bebas Iklan
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-sky-600" />
                Versi {meta.latestVersion} (Build #{meta.buildNumber})
              </span>
            </div>
          </motion.div>

          {/* Release Summary White Card — matching Bento/Landing surface */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-12 max-w-3xl mx-auto text-left rounded-2xl bg-white border border-slate-200/90 shadow-lg shadow-slate-200/50 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Catatan Rilis Terbaru
                </p>
                <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  SADAR Finance v{meta.latestVersion}
                </h2>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                Rilis Stabil
              </span>
            </div>

            <ul className="mt-5 grid sm:grid-cols-2 gap-3.5">
              {meta.releaseNotes.map((note, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* 3-Step Installation Guide — matching HowItWorksSection.jsx style */}
      <section
        id="panduan-instalasi"
        className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20"
      >
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100">
            Panduan Instalasi
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Tiga Langkah Mudah{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-500 bg-clip-text text-transparent">
              Memasang Aplikasi
            </span>
          </h2>
          <p className="mt-3 text-base text-slate-500">
            Proses pemasangan sederhana dan hanya memerlukan waktu kurang dari satu menit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {INSTALL_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-13 h-13 p-3 rounded-2xl ${step.accent} flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-4xl font-black tracking-tight ${step.numberClass}`}
                  >
                    {step.number}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <FooterSection />
    </div>
  );
};

export default InstallPage;
