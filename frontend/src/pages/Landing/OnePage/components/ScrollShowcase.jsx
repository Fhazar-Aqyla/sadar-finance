import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import {
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Layers,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import dashboardPreview from "@/assets/images/landing/dashboard-preview.png";
import dashboardMobilePreview from "@/assets/images/landing/dashboard-mobile-preview.webp";

export const ScrollShowcase = () => {
  const containerRef = useRef(null);

  // Mouse tilt motion values for 3D card tilt on hover
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springTiltConfig = { damping: 20, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springTiltConfig);
  const smoothMouseY = useSpring(mouseY, springTiltConfig);

  const hoverRotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const hoverRotateX = useTransform(smoothMouseY, [-0.5, 0.5], [8, -8]);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Scroll parallax progression
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // 3D Perspective Tilt Parallax on scroll
  const scrollRotateX = useTransform(smoothProgress, [0, 0.45], [22, 0]);
  const scale = useTransform(smoothProgress, [0, 0.45, 0.9], [0.86, 1, 0.96]);
  const yMockup = useTransform(smoothProgress, [0, 1], [80, -60]);
  const opacity = useTransform(
    smoothProgress,
    [0, 0.25, 0.9, 1],
    [0.75, 1, 1, 0.85]
  );

  // Floating Badges Parallax with multi-depth offsets
  const yBadge1 = useTransform(smoothProgress, [0, 1], [100, -130]);
  const yBadge2 = useTransform(smoothProgress, [0, 1], [-90, 140]);
  const yBadge3 = useTransform(smoothProgress, [0, 1], [120, -110]);

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative py-16 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden [perspective:1400px]"
    >
      {/* Background glow beneath dashboard */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-blue-600/10 dark:bg-sky-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 dark:via-sky-500/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-300/30 dark:via-sky-500/20 to-transparent pointer-events-none" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl mx-auto mb-16 relative z-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs border border-blue-100 dark:border-blue-900/40">
          <Layers className="w-3.5 h-3.5" />
          Dashboard Preview
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="text-slate-900 dark:text-white">Semua dalam Satu </span>
          <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">Dashboard Modern.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
          Ringkasan pengeluaran, skor finansial, dan peringatan anggaran — semuanya dalam satu tampilan bersih dan responsif.
        </p>
      </motion.div>

      {/* 3D Mockup Container with Perspective Parallax and Interactive Mouse Tilt */}
      <motion.div
        style={{
          rotateX: scrollRotateX,
          scale,
          y: yMockup,
          opacity,
          transformPerspective: 1400,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-900/95 p-2.5 sm:p-4 shadow-2xl transition-shadow backdrop-blur-md"
      >
        <motion.div
          style={{
            rotateY: hoverRotateY,
            rotateX: hoverRotateX,
            transformStyle: "preserve-3d",
          }}
          className="relative w-full"
        >
          {/* Mockup Window Header Dots & URL bar */}
          <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-800/80 mb-2 bg-slate-950/60 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-xs" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-xs" />
            </div>
            <div className="text-[11px] font-mono text-slate-400 bg-slate-800/70 border border-slate-700/50 px-4 py-0.5 rounded-full flex items-center gap-2 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1E3A8A] dark:bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1E3A8A] dark:bg-sky-400"></span>
              </span>
              <span>https://sadar.app/dashboard</span>
            </div>
            <div className="w-12 text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                LIVE
              </span>
            </div>
          </div>

          {/* Dashboard Image Preview with Neon Border Accent */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/10] sm:aspect-[16/9] shadow-2xl border border-slate-800/60">
            <img
              src={dashboardPreview}
              alt="SADAR Finance Dashboard Desktop"
              className="hidden sm:block w-full h-full object-cover object-top hover:scale-[1.01] transition-transform duration-700"
            />
            <img
              src={dashboardMobilePreview}
              alt="SADAR Finance Dashboard Mobile"
              className="block sm:hidden w-full h-full object-fill object-top"
            />
          </div>

          {/* Floating Interactive Micro-Cards (Parallax Float & Spring Elevation) */}
          <motion.div
            style={{ y: yBadge1, translateZ: 40 }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            whileHover={{ scale: 1.08, translateZ: 60 }}
            className="hidden lg:flex items-center gap-3 absolute -top-8 -left-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl transition-all cursor-default"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Pemasukan Rutin
                </p>
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white">
                +Rp 8.000.000
              </p>
            </div>
          </motion.div>

          <motion.div
            style={{ y: yBadge2, translateZ: 40 }}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            whileHover={{ scale: 1.08, translateZ: 60 }}
            className="hidden lg:flex items-center gap-3 absolute -top-8 -right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl transition-all cursor-default"
          >
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Skor Finansial
              </p>
              <p className="text-sm font-black text-[#1E3A8A] dark:text-sky-300 flex items-center gap-1.5">
                <span>84 / 100</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              </p>
            </div>
          </motion.div>

          <motion.div
            style={{ y: yBadge3, translateZ: 40 }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            whileHover={{ scale: 1.08, translateZ: 60 }}
            className="hidden lg:flex items-center gap-3 absolute -bottom-8 -right-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xl transition-all cursor-default"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Peringatan Anggaran
              </p>
              <p className="text-sm font-black text-amber-700 dark:text-amber-400">
                Kuota Keinginan Capai 82%
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};
