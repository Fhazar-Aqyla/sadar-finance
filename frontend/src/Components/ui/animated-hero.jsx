import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/Components/ui/button";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["pengeluaran", "tabungan", "budget", "cashflow", "keputusan"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((current) => (current === titles.length - 1 ? 0 : current + 1));
    }, 2200);

    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <section id="home" className="relative flex min-h-[620px] items-center overflow-hidden pb-10 pt-[126px] max-md:min-h-[560px] max-md:pb-8 max-md:pt-[104px]">
      <div
        className="mx-auto flex w-[min(calc(100%_-_64px),1480px)] flex-col items-center text-center max-md:w-[min(calc(100%_-_32px),960px)]"
        style={{ gap: "22px" }}
      >
        <div className="flex max-w-[1320px] flex-col items-center">
          <h1
            className="font-['Plus_Jakarta_Sans',sans-serif] !text-[52px] font-black !leading-[1.06] tracking-normal text-[#0C3954] max-xl:!text-[48px] max-lg:!text-[44px] max-md:!text-[38px] max-sm:!text-[31px]"
            style={{ margin: 0 }}
          >
            <span className="block whitespace-nowrap max-lg:whitespace-normal">
              Bikin kamu lebih sadar sama
            </span>
            <span
              className="relative flex h-[62px] w-full justify-center overflow-hidden text-center text-[#64AB88] max-xl:h-[58px] max-lg:h-[54px] max-md:h-[44px] max-sm:h-[36px]"
              style={{ marginTop: "8px" }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={titles[titleNumber]}
                  className="absolute font-black leading-[1.04]"
                  initial={{ opacity: 0, y: -72 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 72 }}
                  transition={{ type: "spring", stiffness: 86, damping: 20, opacity: { duration: 0.16 } }}
                >
                  {titles[titleNumber]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p
            className="max-w-[820px] text-center text-[18px] leading-8 text-[#475569] max-lg:max-w-[720px] max-lg:text-[16px] max-lg:leading-7 max-md:text-[14px] max-md:leading-6"
            style={{ margin: "30px 0 0" }}
          >
            <span className="block">Kelola pemasukan, pengeluaran, budget, dan tabungan dalam satu tempat</span>
            <span className="block">supaya kamu lebih gampang melihat ke mana uang berjalan</span>
            <span className="block">dan kapan harus mulai menahan diri.</span>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 max-sm:w-full max-sm:flex-col max-sm:gap-3" style={{ marginTop: 0 }}>
          <Button
            asChild
            size="lg"
            className="h-12 min-w-[190px] rounded-md bg-[#0C3954] px-6 text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(12,57,84,0.18)] hover:bg-[#124170] max-md:h-11 max-md:min-w-[170px] max-md:text-[13px] max-sm:w-full"
          >
            <Link to="/register" className="gap-2 no-underline">
              Mulai Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 min-w-[190px] rounded-md border-[#C9D8E6] bg-white/90 px-6 text-[14px] font-bold text-[#0C3954] shadow-[0_10px_24px_rgba(12,57,84,0.08)] hover:bg-white max-md:h-11 max-md:min-w-[170px] max-md:text-[13px] max-sm:w-full"
          >
            <a href="#how-it-works" className="gap-2 no-underline">
              <PlayCircle className="h-4 w-4" />
              Lihat Cara Kerja
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

export { Hero };
