import * as React from "react";

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

const GeometricPattern = () => (
  <svg
    className="absolute right-0 top-0 w-[380px] h-[320px] text-slate-400/15 dark:text-slate-500/15 pointer-events-none"
    viewBox="0 0 520 460"
    fill="none"
    aria-hidden="true"
  >
    <g stroke="currentColor" strokeWidth="1">
      <path d="M120 460 L120 300 L280 300" />
      <path d="M280 300 L280 140 L440 140" />
      <path d="M440 140 L440 0" />
      <path d="M120 300 L40 220 L40 40 L120 -40" />
      <path d="M280 460 L280 300" />
      <path d="M440 460 L440 300 L600 300" />
      <path d="M40 460 L40 300 L-80 300" />
      <path d="M-40 140 L80 140 L120 100" />
      <path d="M440 220 L520 300" />
      <path d="M280 220 L380 220" />
    </g>
  </svg>
);

export function Footer({
  logo,
  brandName,
  description,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-slate-50/40 to-blue-50/30 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-blue-950/30 border-t border-slate-200/80 dark:border-slate-800/80">
      {/* Subtle top gradient accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#1E3A8A]/40 dark:via-sky-400/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-7 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 lg:gap-6">
          {/* Left — brand */}
          <div>
            <a href="/" className="inline-flex items-center no-underline" aria-label={brandName}>
              {logo}
            </a>
            {description && (
              <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
                {description}
              </p>
            )}
          </div>

          {/* Middle — site map */}
          <nav aria-label="Site Map">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Site Map
            </h3>
            <ul className="list-none p-0 space-y-2">
              {mainLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <a
                    href={link.href}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 no-underline hover:text-[#1E3A8A] dark:hover:text-sky-400 hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right — legal */}
          <div className="relative overflow-hidden rounded-xl">
            <GeometricPattern />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Legal
            </h3>
            <ul className="list-none p-0 space-y-2">
              {legalLinks.map((link, i) => (
                <li key={i} className="m-0">
                  <a
                    href={link.href}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 no-underline hover:text-[#1E3A8A] dark:hover:text-sky-400 hover:underline underline-offset-4 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Accent bar + copyright */}
        <div className="mt-6 lg:mt-7">
          <div className="h-0.5 bg-gradient-to-r from-[#1E3A8A] via-sky-400 to-[#14B8A6]" />
          <p className="pt-3 text-xs text-slate-500 dark:text-slate-400">{copyright.text}</p>
          {copyright.license && (
            <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">{copyright.license}</p>
          )}
        </div>
      </div>
    </footer>
  );
}