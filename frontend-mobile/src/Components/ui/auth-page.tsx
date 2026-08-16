import React, { useEffect, useState } from "react";
import { Col } from "reactstrap";

const financeQuotes = [
  {
    quote:
      "Jangan menabung dari sisa pengeluaran, tetapi keluarkan dari sisa setelah menabung.",
    author: "Warren Buffett",
  },
  {
    quote:
      "Anggaran adalah cara memberi arah pada uang, bukan menebak ke mana uang pergi.",
    author: "Dave Ramsey",
  },
  {
    quote: "Investasi pada pengetahuan selalu memberi imbal hasil terbaik.",
    author: "Benjamin Franklin",
  },
];

// Gradient Wave Component
const GradientWave = () => (
  <div className="sadar-auth-wave absolute inset-0 opacity-20">
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path fill="url(#gradient1)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z" />
    </svg>
  </div>
);

export function AuthPage() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex(
        (currentIndex) => (currentIndex + 1) % financeQuotes.length,
      );
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const activeQuote = financeQuotes[quoteIndex];

  return (
    <Col lg={6} className="sadar-auth-visual-panel">
      <div className="sadar-auth-visual relative flex h-full overflow-hidden bg-[#1e3a8a] p-10 text-white">
        <div className="sadar-auth-visual-depth absolute inset-0" />

        <div className="sadar-auth-aurora" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <GradientWave />

        <div className="relative z-10 flex w-full flex-col">
          <div className="sadar-auth-quote max-w-[680px] pt-12">
            <div className="sadar-auth-quote-glass">
              <div className="sadar-auth-quote-shine" aria-hidden="true" />
              <div className="sadar-auth-quote-kicker">
                <span className="sadar-auth-quote-symbol" aria-hidden="true"><i className="ri-double-quotes-l" /></span>
                <span>Inspirasi finansial</span>
              </div>
              <blockquote
                key={quoteIndex}
                className="m-0 sadar-auth-quote-content is-visible"
                aria-live="polite"
              >
                <p className="m-0 text-[24px] font-semibold leading-[1.45] tracking-normal text-white/92 max-xl:text-[22px] max-lg:text-[18px]">
                  &ldquo;{activeQuote.quote}&rdquo;
                </p>
                <footer className="mt-5 font-mono text-[15px] font-bold text-white/86 max-lg:text-[13px]">
                  <span aria-hidden="true">—</span> {activeQuote.author}
                </footer>
              </blockquote>
              <div className="sadar-auth-quote-progress" aria-label={`Kutipan ${quoteIndex + 1} dari ${financeQuotes.length}`}>
                {financeQuotes.map((quote, index) => (
                  <span key={quote.author} className={index === quoteIndex ? "is-active" : ""} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Col>
  );
}
