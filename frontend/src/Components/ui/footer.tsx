import * as React from "react";
import { Button } from "@/Components/ui/button";
import GsapReveal from "@/Components/ui/gsap-reveal";

export interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  description?: string;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
  }>;
  featureLinks?: Array<{
    href: string;
    label: string;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
}

const defaultFeatureLinks = [
  { href: "#features", label: "Catat Transaksi" },
  { href: "#features", label: "Wawasan Otomatis" },
  { href: "#how-it-works", label: "Budget & Alert" },
  { href: "#how-it-works", label: "Financial Score" },
];

export function Footer({
  logo,
  brandName,
  description = "SADAR Finance membantu kamu mencatat, memahami, dan mengontrol keuangan pribadi dengan lebih sadar.",
  socialLinks,
  mainLinks,
  featureLinks = defaultFeatureLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="relative w-screen overflow-hidden left-1/2 -translate-x-1/2 border-t border-[#2B4B9B] bg-[#1E3A8A] text-white font-['Inter',sans-serif]">
      {/* Top accent line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#14B8A6]/70 to-transparent"
      />
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[640px] -translate-x-1/2 rounded-full bg-[#14B8A6] opacity-10 blur-[90px]"
      />

      <div className="relative mx-auto w-[min(calc(100%_-_96px),1360px)] max-lg:w-[min(calc(100%_-_48px),1080px)] max-sm:w-[min(calc(100%_-_28px),1080px)] px-4 pb-6 pt-12">
        <GsapReveal
          as="div"
          className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8"
          stagger={0.1}
        >
          {/* Brand */}
          <div className="max-w-[300px]">
            <a
              href="/"
              className="inline-flex items-center gap-x-2 no-underline text-white hover:opacity-90 transition"
              aria-label={brandName}
            >
              {logo}
            </a>
            <p className="mt-4 text-[13px] leading-6 text-blue-100/70">
              {description}
            </p>
            <ul className="mt-5 flex list-none space-x-2 p-0">
              {socialLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-white/20 text-white hover:bg-white hover:border-white hover:text-[#1E3A8A] bg-transparent"
                    asChild
                  >
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                    >
                      {link.icon}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigasi */}
          <nav aria-label="Navigasi footer">
            <h4 className="m-0 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#14B8A6]">
              Navigasi
            </h4>
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
              {mainLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <a
                    href={link.href}
                    className="text-[13px] font-medium !text-blue-100/80 no-underline transition hover:!text-[#14B8A6]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Fitur */}
          <nav aria-label="Fitur footer">
            <h4 className="m-0 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#14B8A6]">
              Fitur
            </h4>
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
              {featureLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <a
                    href={link.href}
                    className="text-[13px] font-medium !text-blue-100/80 no-underline transition hover:!text-[#14B8A6]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal footer">
            <h4 className="m-0 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#14B8A6]">
              Legal
            </h4>
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
              {legalLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <a
                    href={link.href}
                    className="text-[13px] font-medium !text-blue-100/80 no-underline transition hover:!text-[#14B8A6]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </GsapReveal>

        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-3 border-t border-white/10 pt-6 md:flex-row">
          <div className="text-sm leading-5 !text-white/70 text-left">
            <div className="font-medium !text-white">{copyright.text}</div>
            {copyright.license && (
              <div className="text-[12px] !text-white/50">
                {copyright.license}
              </div>
            )}
          </div>
          <p className="m-0 text-[12px] !text-white/60">
            Dibuat dengan sepenuh hati oleh tim SADAR Finance
          </p>
        </div>
      </div>
    </footer>
  );
}