import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Shield, Smartphone } from "lucide-react";

export const CtaSection = () => {
  return (
    <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-blue-100/80 via-indigo-50/70 to-white p-8 sm:p-12 lg:p-16 text-center border border-blue-200/70 shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.28]" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-[#1E3A8A] mb-3">
            SADAR Finance untuk Android
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-slate-900">
            Mulai Perjalanan{" "}
            <span className="bg-gradient-to-r from-[#1E3A8A] via-sky-500 to-[#1E3A8A] bg-clip-text text-transparent">
              Sadar Finansialmu
            </span>{" "}
            Hari Ini.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            Pasang aplikasi SADAR Finance secara gratis di smartphone Android Anda. Cepat, aman, dan tetap bisa mencatat transaksi saat offline.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all"
            >
              Masuk ke SADAR Web <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/install"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm shadow-xs transition-all"
            >
              <Smartphone className="w-4 h-4 text-[#1E3A8A]" />
              Unduh Aplikasi Android (APK)
            </Link>
          </div>

          <div className="mt-9 pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Gratis & Bebas Iklan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#1E3A8A]" />
              <span>Data Terenkripsi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <span>Siap Online & Offline</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
