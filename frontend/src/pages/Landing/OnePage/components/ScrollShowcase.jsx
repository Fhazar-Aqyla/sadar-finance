import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowUpRight,
  Shield,
  Sparkles,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import dashboardPreview from "@/assets/images/landing/dashboard-preview.png";
import dashboardMobilePreview from "@/assets/images/landing/dashboard-mobile-preview.webp";

gsap.registerPlugin(ScrollTrigger);

export const ScrollShowcase = () => {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      if (!cardRef.current) return;

      gsap.fromTo(
        cardRef.current,
        {
          rotateX: 22,
          scale: 0.88,
          transformPerspective: 1200,
          opacity: 0.85,
        },
        {
          rotateX: 0,
          scale: 1,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            end: "top 25%",
            scrub: 1.2,
          },
        },
      );

      // Stagger floating badge entrance
      gsap.from(".floating-badge", {
        y: 30,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
        },
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative py-12 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      {/* Decorative Blur Background - Bright Vibrant */}
      <div className="absolute inset-0 max-w-5xl mx-auto h-[450px] bg-gradient-to-r from-cyan-400/20 via-sky-400/25 to-teal-400/20 blur-3xl -z-10 rounded-3xl" />

      {/* 3D Mockup Container */}
      <div
        ref={cardRef}
        style={{ transformStyle: "preserve-3d" }}
        className="relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-900/95 p-2 sm:p-4 shadow-2xl shadow-sky-500/10 backdrop-blur-xl"
      >
        {/* Mockup Window Header Dots */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/80 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-3 py-0.5 rounded-full">
            sadar.app/dashboard
          </div>
          <div className="w-12" />
        </div>

        {/* Dashboard Image Preview */}
        <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[16/10] sm:aspect-[16/9]">
          <img
            src={dashboardPreview}
            alt="SADAR Finance Dashboard Desktop"
            className="hidden sm:block w-full h-full object-cover object-top"
          />
          <img
            src={dashboardMobilePreview}
            alt="SADAR Finance Dashboard Mobile"
            className="block sm:hidden w-full h-full object-fill object-top"
          />
        </div>

        {/* Floating Interactive Micro-Cards */}
        <div className="floating-badge hidden lg:flex items-center gap-3 absolute -top-6 -left-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Gaji Masuk
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              +Rp 8.000.000
            </p>
          </div>
        </div>

        <div className="floating-badge hidden lg:flex items-center gap-3 absolute -top-6 -right-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="p-2 rounded-xl bg-sky-50 text-[#25a0e2] dark:bg-sky-950/60 dark:text-[#32ccff]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Financial Score
            </p>
            <p className="text-sm font-bold text-[#25a0e2] dark:text-[#32ccff]">
              84 • Kondisi Sehat
            </p>
          </div>
        </div>

        <div className="floating-badge hidden lg:flex items-center gap-3 absolute -bottom-6 -right-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Smart Alert
            </p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">
              Budget Wants 82%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
