import React from "react";
import { InteractiveBudgetSlider } from "@/Components/ui/interactive-budget-slider";
import { Sparkles, Calculator, CheckCircle2 } from "lucide-react";

export const BudgetSimulatorSection = () => {
  return (
    <section
      id="simulator"
      className="py-16 lg:py-24 bg-slate-50/60 dark:bg-slate-950/40 border-y border-slate-200/70 dark:border-slate-800/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            Kalkulator Alokasi Finansial
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Coba Simulasi Anggaran{" "}
            <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
              Sebelum Mendaftar.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Metode alokasi 50/30/20 terbukti secara global membantu jutaan orang
            terbebas dari stres finansial tanggal tua.
          </p>
        </div>

        {/* Embedded Interactive Widget */}
        <div className="max-w-5xl mx-auto">
          <InteractiveBudgetSlider />
        </div>
      </div>
    </section>
  );
};
