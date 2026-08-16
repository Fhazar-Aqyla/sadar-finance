import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, Shield, Smartphone, Zap, Lock } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export const CtaSection = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms for CTA Card (direct, no spring for performance)
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);
  const yCard = useTransform(scrollYProgress, [0, 1], [40, -30]);

  return (
    <section
      ref={containerRef}
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <motion.div
        style={{ scale, y: yCard }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#0f172a] p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl border border-blue-800/80"
      >
        {/* Static Aurora Glow Orbs inside Card (no continuous animation for performance) */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-400/20 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/30 blur-[90px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-5 border border-white/20 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-spin-slow" />
            Saatnya Lebih Sadar Soal Keuangan
          </motion.div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
            Mulai Perjalanan Sadar Finansialmu Hari Ini.
          </h2>

          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Buat akun gratis dalam 30 detik. Tanpa kartu kredit, tanpa biaya tersembunyi, dan dirancang khusus untuk membantu kamu mengelola keuangan dengan lebih tenang.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto relative group overflow-hidden rounded-xl"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto relative inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1E3A8A] hover:bg-slate-50 font-extrabold text-sm shadow-xl transition-all overflow-hidden"
              >
                <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-[#1E3A8A]/10 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-1000 ease-in-out" />
                <span className="relative z-10 flex items-center gap-2">
                  Mulai Sekarang <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all backdrop-blur-xs"
              >
                Masuk ke Akun
              </Link>
            </motion.div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-100 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>100% Gratis Digunakan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-300" />
              <span>Data Terisolasi & Aman</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-sky-300" />
              <span>Akses di Semua Perangkat</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
