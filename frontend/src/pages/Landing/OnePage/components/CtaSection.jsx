import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, CheckCircle2, Shield } from "lucide-react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const CtaSection = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Parallax transforms for CTA Card
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.93, 1, 0.97]);
  const yCard = useTransform(smoothProgress, [0, 1], [40, -25]);

  return (
    <section
      ref={containerRef}
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <motion.div
        style={{ scale, y: yCard }}
        className="relative rounded-3xl overflow-hidden bg-[#1E3A8A] p-8 sm:p-12 lg:p-16 text-center text-white shadow-xl border border-blue-900"
      >
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-5 border border-white/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Mulai Tanpa Biaya
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Siap Mengambil Kendali Penuh Atas Keuangan Pribadimu?
          </h2>

          <p className="mt-4 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto font-normal leading-relaxed">
            Daftar sekarang dalam 30 detik. Tanpa kartu kredit, tanpa iklan
            berisik, murni untuk ketenangan finansialmu.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#1E3A8A] hover:bg-slate-100 font-bold text-base shadow-md transition-all"
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
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 text-white font-semibold text-base transition-all"
              >
                Sudah Punya Akun? Masuk
              </Link>
            </motion.div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs text-blue-100 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Gratis Digunakan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-sky-300" />
              <span>Data Terisolasi & Aman</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

