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

export function AuthPage() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = window.setInterval(() => {
      // Mulai fade out
      setIsVisible(false);
      
      // Ganti quote dan fade in setelah transisi selesai (500ms)
      setTimeout(() => {
        setQuoteIndex(
          (currentIndex) => (currentIndex + 1) % financeQuotes.length,
        );
        setIsVisible(true);
      }, 500);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const activeQuote = financeQuotes[quoteIndex];

  return (
    <Col lg={6} className="sadar-auth-visual-panel d-none d-lg-block">
      <div className="relative flex h-full min-h-[720px] overflow-hidden bg-[#1E3A8A] p-10 text-white max-lg:min-h-[320px] max-lg:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(20,184,166,0.18),transparent_20rem),radial-gradient(circle_at_76%_18%,rgba(20,184,166,0.18),transparent_18rem),linear-gradient(180deg,#2563EB_0%,#1E3A8A_46%,#111E3F_100%)]" />
        
        <div className="absolute inset-0 opacity-65">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>

        <div className="relative z-10 flex w-full flex-col">
          <div className="max-w-[680px] pt-12 max-lg:max-w-[560px] max-lg:pt-4">
            <blockquote 
              className="m-0"
              style={{
                transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <p className="m-0 text-[24px] font-semibold leading-[1.45] tracking-normal text-white/92 max-xl:text-[22px] max-lg:text-[18px]">
                &ldquo;{activeQuote.quote}&rdquo;
              </p>
              <footer className="mt-5 font-mono text-[15px] font-bold text-white/86 max-lg:text-[13px]">
                ~ {activeQuote.author}
              </footer>
            </blockquote>
          </div>
        </div>
      </div>
    </Col>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(255,255,255,${0.03 + i * 0.005})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.15}
            opacity={0.3}
          />
        ))}
      </svg>
    </div>
  );
}
