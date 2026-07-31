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

// Animated Blob Component
interface AnimatedBlobProps {
  color: string;
  position: string;
  delay?: string;
}

const AnimatedBlob = ({ color, position, delay = "" }: AnimatedBlobProps) => (
  <div 
    className={`absolute ${position} w-72 h-72 ${color} rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob`}
    style={delay ? { animationDelay: delay } : undefined}
  />
);

// Gradient Wave Component
const GradientWave = () => (
  <div className="absolute inset-0 opacity-20">
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1440 560">
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <path fill="url(#gradient1)" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,234.7C960,224,1056,192,1152,186.7C1248,181,1344,203,1392,213.3L1440,224L1440,560L1392,560C1344,560,1248,560,1152,560C1056,560,960,560,864,560C768,560,672,560,576,560C480,560,384,560,288,560C192,560,96,560,48,560L0,560Z" />
    </svg>
  </div>
);

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

        <div className="absolute inset-0">
          <AnimatedBlob color="bg-purple-500/30" position="top-0 -left-4" />
          <AnimatedBlob color="bg-cyan-500/30" position="top-0 -right-4" delay="2s" />
          <AnimatedBlob color="bg-indigo-500/30" position="-bottom-8 left-20" delay="4s" />
        </div>
        <GradientWave />

        <div className="relative z-10 flex w-full flex-col">
          <div className="max-w-[680px] pt-12 max-lg:max-w-[560px] max-lg:pt-4">
            <blockquote
              className="m-0"
              style={{
                transition:
                  "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
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
