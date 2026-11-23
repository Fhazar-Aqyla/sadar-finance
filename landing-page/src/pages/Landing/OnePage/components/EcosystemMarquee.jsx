import React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Cpu,
  Lock,
  Sparkles,
  Wallet,
  Landmark,
  CreditCard,
  ScanLine,
  EyeOff,
} from "lucide-react";

export const EcosystemMarquee = () => {
  const financialPartners = [
    {
      name: "Bank BCA",
      type: "Bank Transfer",
      icon: Landmark,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      name: "Bank Mandiri",
      type: "Virtual Account",
      icon: CreditCard,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      name: "Bank BRI",
      type: "Direct Debit",
      icon: Landmark,
      color: "text-sky-600 dark:text-sky-400",
    },
    {
      name: "Bank BNI",
      type: "Virtual Account",
      icon: CreditCard,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      name: "GoPay Indonesia",
      type: "E-Wallet",
      icon: Wallet,
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      name: "OVO Cash",
      type: "E-Wallet",
      icon: Wallet,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      name: "DANA Dompet",
      type: "E-Wallet",
      icon: Wallet,
      color: "text-blue-500 dark:text-blue-300",
    },
    {
      name: "ShopeePay",
      type: "E-Wallet",
      icon: Wallet,
      color: "text-orange-500 dark:text-orange-400",
    },
    {
      name: "Kas Tunai (Cash)",
      type: "Multi-Wallet",
      icon: Wallet,
      color: "text-emerald-500 dark:text-emerald-300",
    },
  ];

  const techFeatures = [
    {
      title: "AI Vision OCR Engine",
      desc: "Ekstraksi Struk < 2 Detik",
      icon: ScanLine,
      color: "text-blue-600 dark:text-sky-400",
    },
    {
      title: "Formula 50 / 30 / 20",
      desc: "Alokasi Otomatis",
      icon: Cpu,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "Enkripsi AES-256",
      desc: "Privasi Standar Perbankan",
      icon: Lock,
      color: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "100% Bebas Iklan",
      desc: "Tanpa Iklan Komersial",
      icon: EyeOff,
      color: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Skor Finansial Realtime",
      desc: "Evaluasi Objektif 0-100",
      icon: Sparkles,
      color: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Multi-Device Sync",
      desc: "Akses Web & Mobile",
      icon: Zap,
      color: "text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <section className="py-10 border-y border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 overflow-hidden relative">
      {/* Background ambient glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-20 bg-blue-500/5 dark:bg-sky-400/5 blur-3xl pointer-events-none rounded-full" />

      {/* Label Header */}
      <div className="max-w-7xl mx-auto px-4 text-center mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Mendukung Seluruh Sumber Rekening & Didukung Teknologi Cerdas
        </p>
      </div>

      {/* Row 1: Financial Sources Marquee (Scrolls Left) */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 28,
            ease: "linear",
          }}
          whileHover={{ animationPlayState: "paused" }}
          className="flex gap-4 w-max shrink-0 py-2 cursor-default"
        >
          {[
            ...financialPartners,
            ...financialPartners,
            ...financialPartners,
          ].map((partner, idx) => {
            const Icon = partner.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-blue-400/60 dark:hover:border-sky-500/60 hover:scale-105 transition-all"
              >
                <div
                  className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 ${partner.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {partner.name}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {partner.type}
                  </p>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Row 2: Tech & Security Marquee (Scrolls Right) */}
      <div className="relative w-full overflow-hidden mt-3 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={{ x: ["-50%", "0%"] }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: 32,
            ease: "linear",
          }}
          whileHover={{ animationPlayState: "paused" }}
          className="flex gap-4 w-max shrink-0 py-2 cursor-default"
        >
          {[...techFeatures, ...techFeatures, ...techFeatures].map(
            (tech, idx) => {
              const Icon = tech.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-400/60 dark:hover:border-emerald-500/60 hover:scale-105 transition-all"
                >
                  <div
                    className={`p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/80 ${tech.color}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {tech.title}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-medium">
                      {tech.desc}
                    </span>
                  </div>
                </div>
              );
            },
          )}
        </motion.div>
      </div>
    </section>
  );
};
