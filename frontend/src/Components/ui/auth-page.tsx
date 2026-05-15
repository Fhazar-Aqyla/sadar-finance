import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Col } from "reactstrap";

const financeQuotes = [
  {
    quote: "Do not save what is left after spending, but spend what is left after saving.",
    author: "Warren Buffett",
  },
  {
    quote: "A budget is telling your money where to go instead of wondering where it went.",
    author: "Dave Ramsey",
  },
  {
    quote: "An investment in knowledge pays the best interest.",
    author: "Benjamin Franklin",
  },
];

export function AuthPage() {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setQuoteIndex((currentIndex) => (currentIndex + 1) % financeQuotes.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  const activeQuote = financeQuotes[quoteIndex];

  return (
    <Col lg={6} className="sadar-auth-visual-panel">
      <div className="relative flex h-full min-h-[720px] overflow-hidden bg-[#0C3954] p-10 text-white max-lg:min-h-[320px] max-lg:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(100,171,136,0.20),transparent_20rem),radial-gradient(circle_at_76%_18%,rgba(44,155,224,0.18),transparent_18rem),linear-gradient(180deg,#124170_0%,#0C3954_46%,#082D43_100%)]" />
        <div className="absolute inset-0 opacity-65">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#082D43] via-[#082D43]/78 to-transparent" />

        <div className="relative z-10 flex w-full flex-col">
          <div className="mt-auto max-w-[560px] pb-12 max-lg:pb-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.blockquote
                key={activeQuote.author}
                className="m-0"
                initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.42, ease: "easeOut" }}
              >
                <p className="m-0 text-[19px] font-medium leading-[1.55] tracking-normal text-white/92 max-xl:text-[18px] max-lg:text-[16px]">
                  &ldquo;{activeQuote.quote}&rdquo;
                </p>
                <footer className="mt-4 font-mono text-[13px] font-bold text-white/86">
                  ~ {activeQuote.author}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
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
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <svg
        className="h-full w-full text-[#D7F4E7]"
        viewBox="0 0 696 316"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.045 + path.id * 0.008}
            initial={{ pathLength: 0.3, opacity: 0.5 }}
            animate={{
              pathLength: 1,
              opacity: [0.16, 0.46, 0.16],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + path.id * 0.22,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}
