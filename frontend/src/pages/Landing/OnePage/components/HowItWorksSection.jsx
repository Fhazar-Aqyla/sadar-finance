import React from "react";
import { Camera, Cpu, Gauge, ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/Components/ui/spotlight-card";

export const HowItWorksSection = () => {
  const steps = [
    {
      number: "01",
      icon: Camera,
      title: "Catat atau Unggah Struk Belanja",
      desc: "Foto struk fisik dari minimarket/restoran atau input transaksi harianmu secara manual dalam 3 detik.",
      color: "from-blue-600 to-teal-600",
      accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    },
    {
      number: "02",
      icon: Cpu,
      title: "AI Memproses & Mengelompokkan",
      desc: "Sistem membaca nominal, nama merchant, dan mengelompokkan pengeluaranmu ke pos Needs, Wants, atau Tabungan.",
      color: "from-teal-600 to-emerald-600",
      accent: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
    },
    {
      number: "03",
      icon: Gauge,
      title: "Ketahui Skor & Cegah Keborosan",
      desc: "Pantau kesehatan keuanganmu via Financial Score 0–100 dan terima peringatan otomatis jika pengeluaran hampir overbudget.",
      color: "from-emerald-600 to-amber-600",
      accent:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-3">
          Langkah Mudah
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Cara Kerja SADAR Finance dalam{" "}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 bg-clip-text text-transparent">
            3 Langkah Simpel.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Tidak perlu spreadsheet rumit atau pencatatan berjam-jam. Mulai sadar
          finansial dalam hitungan menit.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <SpotlightCard
              key={idx}
              className="relative p-6 sm:p-8 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-3 rounded-2xl ${step.accent}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-4xl font-black text-slate-200 dark:text-slate-800">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-teal-600 dark:text-teal-400 gap-1">
                <span>Otomatis & Cepat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
};
