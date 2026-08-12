import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { motion } from "framer-motion";

export const CtaSection = () => {
  return (
    <section className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0bb9a8] via-[#25a0e2] to-[#2c9be0] border border-white/20 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl shadow-sky-500/25">
        {/* Ambient Breathing Glow Spheres */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-24 -left-24 w-80 h-80 bg-white/20 blur-3xl rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="pointer-events-none absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-200/25 blur-3xl rounded-full"
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider mb-5 backdrop-blur-md border border-white/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Mulai Tanpa Biaya
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Siap Mengambil Kendali Penuh Atas{" "}
            <span className="text-yellow-200 drop-shadow-sm">
              Keuangan Pribadimu?
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white/90 max-w-2xl mx-auto font-normal">
            Daftar sekarang dalam 30 detik. Tanpa kartu kredit, tanpa iklan
            berisik, murni untuk ketenangan finansialmu.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#1a85be] hover:text-[#0bb9a8] font-bold text-base shadow-xl shadow-sky-950/20 hover:bg-sky-50 transition-all"
              >
                Daftar Gratis Sekarang <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-white/40 bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md transition-all"
              >
                Sudah Punya Akun? Masuk
              </Link>
            </motion.div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs text-white/80 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Gratis Digunakan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-white" />
              <span>Data Terisolasi & Aman</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
