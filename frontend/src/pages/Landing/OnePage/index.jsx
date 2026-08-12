import React, { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ScrollShowcase } from "./components/ScrollShowcase";
import { BentoFeatures } from "./components/BentoFeatures";
import { BudgetSimulatorSection } from "./components/BudgetSimulatorSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { TeamSection } from "./components/TeamSection";
import { FaqSection } from "./components/FaqSection";
import { CtaSection } from "./components/CtaSection";
import { FooterSection } from "./components/FooterSection";

gsap.registerPlugin(ScrollTrigger);

const LandingOnePage = () => {
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

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-[#25A0E2] selection:text-white overflow-x-hidden font-sans">
      {/* Top Glassmorphic Navigation */}
      <Navbar />

      <main className="relative z-10">
        {/* 1. Hero Section with Multi-Layer Parallax & Floating Stats */}
        <HeroSection />

        {/* 2. 3D Perspective Scroll Showcase */}
        <ScrollShowcase />

        {/* 3. Bento Features: OCR Scanner, Health Score, Predictive Alerts */}
        <BentoFeatures />

        {/* 4. Interactive 50/30/20 Budget Simulator */}
        <BudgetSimulatorSection />

        {/* 5. 3-Step How It Works with Connected Motion Flow */}
        <HowItWorksSection />

        {/* 6. Engineering & AI Team */}
        <TeamSection />

        {/* 7. Comprehensive FAQ */}
        <FaqSection />

        {/* 8. High-Conversion Final CTA */}
        <CtaSection />
      </main>

      {/* 9. Minimalist Footer */}
      <FooterSection />
    </div>
  );
};

export default LandingOnePage;
