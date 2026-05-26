import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
    <section id="home" className="relative flex min-h-[620px] items-center overflow-hidden bg-white pb-10 pt-[126px] max-md:min-h-[560px] max-md:pb-8 max-md:pt-[104px]">
      <div className="mx-auto flex w-[min(calc(100%_-_80px),1360px)] flex-col items-center gap-11 text-center max-md:w-[min(calc(100%_-_32px),960px)]">
        <div className="flex max-w-[1120px] flex-col items-center">
          <h1 className="m-0 font-['Plus_Jakarta_Sans',sans-serif] text-[76px] font-extrabold leading-[1.04] tracking-normal !text-[#0C3954] max-xl:text-[68px] max-lg:text-[58px] max-md:text-[44px] max-sm:text-[36px]">
            Bikin kamu lebih sadar sama
            <span className="relative mt-2 flex h-[88px] w-full justify-center overflow-hidden text-center text-[#64AB88] max-xl:h-[78px] max-lg:h-[66px] max-md:h-[54px] max-sm:h-[46px]">
              {titles.map((title, index) => (
                <motion.span
                  key={title}
                  className="absolute font-extrabold"
                  initial={{ opacity: 0, y: 70 }}
                  transition={{ type: "spring", stiffness: 64, damping: 16 }}
                  animate={
                    titleNumber === index
                      ? { y: 0, opacity: 1 }
                      : { y: titleNumber > index ? -86 : 86, opacity: 0 }
                  }
                >
                  {title}
                </motion.span>
              ))}
            </span>
          </h1>

          <p className="mt-8 max-w-[960px] text-[20px] leading-10 text-[#475569] max-lg:max-w-[820px] max-lg:text-[18px] max-lg:leading-9 max-md:mt-5 max-md:text-[15px] max-md:leading-7">
            Pantau transaksi, baca pola pengeluaran, dan dapatkan sinyal sebelum uangmu
            keburu bocor. SADAR dibuat supaya keputusan finansial sehari-hari terasa
            lebih jelas, bukan cuma lebih rapi.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 max-sm:w-full max-sm:flex-col max-sm:gap-3">
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
            className="h-12 min-w-[190px] rounded-md border-[#C9D8E6] bg-white px-6 text-[14px] font-bold text-[#0C3954] hover:bg-[#F4FAFF] max-md:h-11 max-md:min-w-[170px] max-md:text-[13px] max-sm:w-full"
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
