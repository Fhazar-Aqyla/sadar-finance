import React, { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { EcosystemMarquee } from "./components/EcosystemMarquee";
import { ScrollShowcase } from "./components/ScrollShowcase";
import { BentoFeatures } from "./components/BentoFeatures";
import { ComparisonSection } from "./components/ComparisonSection";
import { BudgetSimulatorSection } from "./components/BudgetSimulatorSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { TeamSection } from "./components/TeamSection";
import { FaqSection } from "./components/FaqSection";
import { CtaSection } from "./components/CtaSection";
import { FooterSection } from "./components/FooterSection";

gsap.registerPlugin(ScrollTrigger);

const LandingOnePage = () => {
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    document.title = "SADAR Finance — Smart AI-Driven Personal Finance Platform";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Initialize butter-smooth Lenis momentum scrolling
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Scroll listener for floating quick-action pill
    const handleScroll = () => {
      setShowFloatingBar(window.scrollY > 650);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleMouseMove = (e) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-[#1E3A8A] selection:text-white overflow-x-hidden font-sans relative"
    >
      {/* Interactive Global Ambient Cursor Glow Follower */}
      <div
        className="pointer-events-none fixed w-[500px] h-[500px] rounded-full bg-radial from-blue-500/6 dark:from-sky-400/6 to-transparent blur-3xl -z-0 transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${cursorPos.x - 250}px, ${cursorPos.y - 250}px, 0)`,
        }}
      />

      {/* Top Glassmorphic Navigation */}
      <Navbar />

      <main className="relative z-10">
        {/* 1. Hero Section with Multi-Layer Parallax & 3D Interactive Cards */}
        <HeroSection />

        {/* 2. Infinite Continuous Ecosystem Marquee (Banks, E-Wallets, Core Tech) */}
        <EcosystemMarquee />

        {/* 3. 3D Perspective Scroll Showcase */}
        <ScrollShowcase />

        {/* 4. Bento Features: OCR Scanner, Health Score, Predictive Alerts */}
        <BentoFeatures />

        {/* 5. Interactive Comparison: Sebelum vs Sesudah SADAR */}
        <ComparisonSection />

        {/* 6. Interactive 50/30/20 Budget Simulator */}
        <BudgetSimulatorSection />

        {/* 7. 3-Step How It Works with Connected Neon Conduit Motion Flow */}
        <HowItWorksSection />

        {/* 8. Engineering & AI Team with 3D Mouse Tilt Cards */}
        <TeamSection />

        {/* 9. Comprehensive FAQ */}
        <FaqSection />

        {/* 10. High-Conversion Final CTA with Aurora Mesh */}
        <CtaSection />
      </main>

      {/* 11. Minimalist Footer */}
      <FooterSection />

      {/* 12. Dynamic Floating Quick-Action Pill (Visible on Scroll) */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
          >
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1E3A8A] text-white text-xs font-bold shadow-xl hover:bg-[#1A3175] hover:scale-105 transition-all border border-blue-400/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coba SADAR Gratis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={scrollToTop}
              aria-label="Kembali ke atas"
              className="p-3 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingOnePage;
