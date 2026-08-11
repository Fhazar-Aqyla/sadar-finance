import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { motion } from "framer-motion";

export const CtaSection = () => {
  return (
    <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-blue-950 via-slate-900 to-teal-900 border border-teal-500/20 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl">
        {/* Ambient Breathing Glow Spheres */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-teal-500 blur-3xl rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500 blur-3xl rounded-full"
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Mulai Tanpa Biaya
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Siap Mengambil Kendali Penuh Atas{" "}
            <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Keuangan Pribadimu?
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
            Daftar sekarang dalam 30 detik. Tanpa kartu kredit, tanpa iklan berisik, murni untuk ketenangan finansialmu.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link
                to="/auth/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-base shadow-xl shadow-teal-500/25 transition-all"
              >
                Daftar Gratis Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
              <Link
                to="/auth/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base backdrop-blur-sm transition-all"
              >
                Sudah Punya Akun? Masuk
              </Link>
            </motion.div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Gratis Digunakan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-teal-400" />
              <span>Data Terisolasi & Aman</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
