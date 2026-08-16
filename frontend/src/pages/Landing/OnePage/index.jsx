import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ScrollShowcase } from "./components/ScrollShowcase";
import { BentoFeatures } from "./components/BentoFeatures";
import { ComparisonSection } from "./components/ComparisonSection";
import { HowItWorksSection } from "./components/HowItWorksSection";
import { BudgetSimulatorSection } from "./components/BudgetSimulatorSection";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { TeamSection } from "./components/TeamSection";
import { FaqSection } from "./components/FaqSection";
import { CtaSection } from "./components/CtaSection";
import { FooterSection } from "./components/FooterSection";

gsap.registerPlugin(ScrollTrigger);

const LandingOnePage = () => {
  const lenisRef = useRef(null);

  useEffect(() => {
    document.title = "SADAR Finance — Sadar ke Mana Uangmu Pergi";

    // Initialize butter-smooth Lenis momentum scrolling
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.8,
    });
    lenisRef.current = lenis;

    // Jump straight to top on mount without animating
    lenis.scrollTo(0, { immediate: true });

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tickerCallback);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white dark:from-slate-950 dark:via-slate-900/80 dark:to-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-[#1E3A8A] selection:text-white overflow-x-hidden font-sans relative">
      {/* Top Glassmorphic Navigation */}
      <Navbar />

      <main className="relative z-10">
        {/* 1. Hero Section with Multi-Layer Parallax & 3D Interactive Cards */}
        <HeroSection />

        {/* 2. 3D Perspective Scroll Showcase */}
        <ScrollShowcase />

        {/* 3. Bento Features: Auto Categorization, Health Score, Predictive Alerts */}
        <BentoFeatures />

        {/* 4. Interactive Comparison: Sebelum vs Sesudah SADAR */}
        <ComparisonSection />

        {/* 5. 3-Step How It Works with Connected Neon Conduit Motion Flow */}
        <HowItWorksSection />

        {/* 6. Interactive 50/30/20 Budget Simulator */}
        <BudgetSimulatorSection />

        {/* 7. Testimonials: Center Featured Card with Smooth Carousel & Side Previews */}
        <TestimonialsSection />

        {/* 8. Engineering & AI Team with 3D Mouse Tilt Cards */}
        <TeamSection />

        {/* 9. Comprehensive FAQ with Smooth Accordion */}
        <FaqSection />

        {/* 10. High-Conversion Final CTA with Aurora Mesh */}
        <CtaSection />
      </main>

      {/* 11. Minimalist Footer with Partner Branding */}
      <FooterSection />
    </div>
  );
};

export const OnePage = LandingOnePage;
export default LandingOnePage;
