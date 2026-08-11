import React, { useEffect } from "react";
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

const LandingOnePage = () => {
  useEffect(() => {
    document.title = "SADAR Finance — Smart AI-Driven Personal Finance";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white overflow-x-hidden font-sans">
      {/* 1. Glassmorphic Navigation Header */}
      <Navbar />

      <main>
        {/* 2. Hero Section with GSAP Timeline Entrance */}
        <HeroSection />

        {/* 3. GSAP ScrollTrigger 3D Perspective Tilt Showcase */}
        <ScrollShowcase />

        {/* 4. Modern Bento Grid: OCR Scanner, Health Score, Overspending Alerts */}
        <BentoFeatures />

        {/* 5. Interactive 50/30/20 Salary Budget Simulator */}
        <BudgetSimulatorSection />

        {/* 6. 3-Step How It Works Workflow */}
        <HowItWorksSection />

        {/* 7. Professional Engineering & AI Team Showcase */}
        <TeamSection />

        {/* 8. Shadcn Radix Accordion FAQ */}
        <FaqSection />

        {/* 9. High-Conversion Final CTA */}
        <CtaSection />
      </main>

      {/* 10. Minimalist Footer */}
      <FooterSection />
    </div>
  );
};

export default LandingOnePage;
