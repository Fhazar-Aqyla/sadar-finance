import * as React from "react";
import { motion } from "framer-motion";

export interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  description?: string;
  mainLinks: Array<{
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

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, ease: "easeOut" as const },
};

export function Footer({
  logo,
  brandName,
  description,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer
      id="site-footer"
      className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1E3A8A] to-[#0f172a] border-t border-slate-800/80"
    >
      {/* Aurora glow orbs (static, perf-safe) */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-sky-400/20 blur-[90px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/30 blur-[90px] rounded-full" />

      {/* Subtle top gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-9 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto_auto] gap-8 md:gap-8 lg:gap-8 items-start">
          {/* Left — brand */}
          <motion.div {...fadeUp}>
            <a href="/" className="inline-flex items-center no-underline" aria-label={brandName}>
              {logo}
            </a>
            {description && (
              <p className="mt-4 text-sm leading-relaxed text-blue-200/70 max-w-xs">
                {description}
              </p>
            )}
          </motion.div>

          {/* Middle — site map */}
          <motion.nav {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }} aria-label="Site Map" className="text-left md:text-right md:mr-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Site Map
            </h3>
            <ul className="flex flex-col gap-2 list-none p-0">
              {mainLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <a
                    href={link.href}
                    className="text-sm font-medium text-blue-100/75 no-underline hover:text-sky-300 hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>

          {/* Right — legal */}
          <motion.div {...fadeUp} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} className="text-left md:text-right">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
              Legal
            </h3>
            <ul className="flex flex-col gap-2 list-none p-0">
              {legalLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <a
                    href={link.href}
                    className="text-sm font-medium text-blue-100/75 no-underline hover:text-sky-300 hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Accent bar + copyright */}
        <div className="mt-8 lg:mt-9">
          <div className="h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
            <p className="text-xs text-blue-200/60">{copyright.text}</p>
            {copyright.license && (
              <p className="text-[11px] text-blue-200/45">{copyright.license}</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}