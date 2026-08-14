import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Button } from "@/Components/ui/button";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import phoneShot from "../../assets/images/landing/dashboard-mobile-preview.webp";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const titles = [
  "pengeluaran",
  "tabungan",
  "budget",
  "cashflow",
  "keputusan",
];

const FloatBudgetCard = () => (
  <div className="hero-float absolute -left-16 top-14 z-20 hidden w-[168px] rounded-2xl border border-[#DDE8F2] bg-white/95 p-3.5 shadow-[0_18px_40px_rgba(30,58,138,0.12)] backdrop-blur md:block lg:-left-20">
    <div className="flex items-center justify-between gap-2">
      <p className="m-0 text-[10px] font-bold text-[#7A8795]">Budget Makan</p>
      <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-extrabold text-[#14B8A6]">
        78%
      </span>
    </div>
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8F0F7]">
      <div className="h-full w-[78%] rounded-full bg-[#14B8A6]" />
    </div>
    <p className="m-0 mt-2 text-[10px] font-semibold text-[#475569]">
      Rp 780 rb dari Rp 1 jt
    </p>
  </div>
);

const FloatCashflowCard = () => (
  <div className="hero-float absolute -right-10 top-1/2 z-20 hidden w-[176px] -translate-y-1/2 rounded-2xl border border-[#DDE8F2] bg-white/95 p-3.5 shadow-[0_18px_40px_rgba(30,58,138,0.12)] backdrop-blur md:block lg:-right-14">
    <div className="flex items-center justify-between">
      <p className="m-0 text-[10px] font-bold text-[#7A8795]">Cashflow</p>
      <span className="flex items-center gap-0.5 rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-extrabold text-[#14B8A6]">
        <i className="ri-arrow-up-line text-[10px]" aria-hidden="true"></i>12%
      </span>
    </div>
    <p className="m-0 mt-1 text-[17px] font-extrabold text-[#1E3A8A]">
      +Rp 620 rb
    </p>
    <div className="mt-2 flex h-8 items-end gap-1">
      {[40, 62, 50, 74, 58, 84, 68].map((height, index) => (
        <span
          key={height + index}
          className={`flex-1 rounded-t-sm ${index % 2 === 0 ? "bg-[#14B8A6]" : "bg-[#1E3A8A]"}`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  </div>
);

const FloatScoreCard = () => (
  <div className="hero-float absolute -left-12 bottom-16 z-20 hidden w-[168px] rounded-2xl border border-[#DDE8F2] bg-white/95 p-3.5 shadow-[0_18px_40px_rgba(30,58,138,0.12)] backdrop-blur md:block lg:-left-16">
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 shrink-0">
        <svg viewBox="0 0 44 44" className="h-11 w-11 -rotate-90">
          <circle cx="22" cy="22" r="19" fill="none" stroke="#E8F0F7" strokeWidth="5" />
          <circle
            cx="22"
            cy="22"
            r="19"
            fill="none"
            stroke="#14B8A6"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="119"
            strokeDashoffset="17"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[12px] font-black text-[#1E3A8A]">
          85
        </span>
      </div>
      <div>
        <p className="m-0 text-[9px] font-bold uppercase tracking-wider text-[#7A8795]">
          Skor Finansial
        </p>
        <p className="m-0 text-[11px] font-extrabold text-[#14B8A6]">
          Sangat Sehat
        </p>
      </div>
    </div>
  </div>
);

const FloatTransactionCard = () => (
  <div className="hero-float absolute -right-6 top-16 z-20 hidden w-[176px] rounded-2xl border border-[#DDE8F2] bg-white/95 p-3 shadow-[0_18px_40px_rgba(30,58,138,0.12)] backdrop-blur md:block lg:-right-2">
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FFF0ED] text-[#D86B5D]">
        <i className="ri-cup-line text-[15px]" aria-hidden="true"></i>
      </span>
      <div className="min-w-0">
        <p className="m-0 truncate text-[10px] font-bold text-[#334155]">
          Kopi & makan
        </p>
        <p className="m-0 text-[10px] font-extrabold text-[#D86B5D]">
          -Rp 86 rb
        </p>
      </div>
    </div>
  </div>
);

const GsapHero = () => {
  const [titleNumber, setTitleNumber] = useState(0);
  const scope = useRef(null);

  const currentTitle = useMemo(() => titles[titleNumber], [titleNumber]);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reduced) {
        gsap.set(
          [
            ".hero-badge",
            ".hero-line-inner",
            ".hero-sub",
            ".hero-cta",
            ".hero-phone",
            ".hero-float",
          ],
          { opacity: 1, y: 0, scale: 1 },
        );
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.1,
      });

      tl.fromTo(
        ".hero-badge",
        { y: -16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
      )
        .fromTo(
          ".hero-line-inner",
          { yPercent: 112 },
          { yPercent: 0, duration: 0.9, stagger: 0.12, ease: "power4.out" },
          "-=0.25",
        )
        .fromTo(
          ".hero-sub",
          { y: 18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          "-=0.5",
        )
        .fromTo(
          ".hero-cta",
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
          "-=0.35",
        )
        .fromTo(
          ".hero-phone",
          { y: 70, opacity: 0, rotateX: 14 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1.1,
            ease: "back.out(1.6)",
          },
          "-=0.65",
        )
        .fromTo(
          ".hero-float",
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.12 },
          "-=0.75",
        );

      tl.to(
        ".hero-float",
        {
          y: -8,
          duration: 2.2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          stagger: { each: 0.45 },
        },
        "+=0.4",
      );

      const parallax = gsap.utils.toArray(".hero-parallax");
      parallax.forEach((el) => {
        const speed = Number(el.dataset.speed || 30);
        gsap.to(el, {
          y: -speed,
          ease: "none",
          scrollTrigger: {
            trigger: scope.current,
            start: "top top",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });
    },
    { scope },
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((current) =>
        current === titles.length - 1 ? 0 : current + 1,
      );
    }, 2200);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, setTitleNumber]);

  return (
    <section
      id="home"
      ref={scope}
      className="hero-scroll-wrap relative overflow-hidden pb-24 pt-[120px] max-md:pb-16 max-md:pt-[100px]"
    >
      <div className="mx-auto grid w-[min(calc(100%_-_64px),1360px)] grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 max-md:w-[min(calc(100%_-_32px),960px)]">
        {/* ===== Copy ===== */}
        <div className="flex max-w-[640px] flex-col items-center text-center lg:items-start lg:text-left">
          <span className="hero-badge inline-flex min-h-7 items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50/60 px-4 text-[11px] font-bold text-[#14B8A6]">
            <Sparkles className="h-3.5 w-3.5" />
            Kelola keuangan tanpa ribet
          </span>

          <h1
            className="mt-5 font-['Plus_Jakarta_Sans',sans-serif] !text-[54px] font-black !leading-[1.06] tracking-normal text-[#1E3A8A] max-xl:!text-[48px] max-lg:!text-[42px] max-md:!text-[38px] max-sm:!text-[30px]"
            style={{ marginTop: "20px", marginBottom: 0 }}
          >
            <span className="block overflow-hidden pb-1">
              <span className="hero-line-inner block whitespace-nowrap max-lg:whitespace-normal">
                Bikin kamu lebih sadar sama
              </span>
            </span>
            <span className="relative block h-[62px] w-full overflow-hidden max-xl:h-[54px] max-lg:h-[48px] max-md:h-[42px] max-sm:h-[34px]">
              <span className="hero-line-inner block h-full">
                <span className="relative flex h-full w-full items-center justify-center overflow-hidden text-center !text-[#14B8A6] lg:justify-start lg:text-left">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={currentTitle}
                      className="font-black leading-[1.04]"
                      initial={{ opacity: 0, y: -72 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 72 }}
                      transition={{
                        type: "spring",
                        stiffness: 86,
                        damping: 20,
                        opacity: { duration: 0.16 },
                      }}
                    >
                      {currentTitle}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
            </span>
          </h1>

          <p
            className="hero-sub mt-6 max-w-[560px] text-center text-[17px] leading-8 text-[#475569] max-lg:text-[16px] max-lg:leading-7 max-md:text-[14px] max-md:leading-6 lg:text-left"
            style={{ marginTop: "24px", marginBottom: 0 }}
          >
            Kelola pemasukan, pengeluaran, budget, dan tabungan dalam satu
            tempat. SADAR membantu kamu melihat ke mana uang berjalan dan kapan
            harus mulai menahan diri.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <Button
              asChild
              size="lg"
              className="hero-cta h-12 min-w-[184px] rounded-md bg-[#1E3A8A] px-6 text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(30,58,138,0.15)] hover:bg-[#1A3175] max-md:h-11 max-md:min-w-[168px] max-md:text-[13px]"
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
              className="hero-cta h-12 min-w-[184px] rounded-md border-[#DDE6EF] bg-white/90 px-6 text-[14px] font-bold text-[#1E3A8A] shadow-[0_10px_24px_rgba(30,58,138,0.06)] hover:bg-white max-md:h-11 max-md:min-w-[168px] max-md:text-[13px]"
            >
              <a href="#how-it-works" className="gap-2 no-underline">
                <PlayCircle className="h-4 w-4" />
                Lihat Cara Kerja
              </a>
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-semibold text-[#7A8795] lg:justify-start">
            {["Gratis selamanya", "Tanpa ribet", "Data pribadi aman"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-50 text-[#14B8A6]">
                    <i className="ri-check-line text-[10px]" aria-hidden="true"></i>
                  </span>
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        {/* ===== Visual ===== */}
        <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
          <div
            aria-hidden="true"
            className="hero-parallax pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(20,184,166,0.18)_0%,rgba(30,58,138,0.12)_42%,rgba(255,255,255,0)_70%)]"
            data-speed={60}
          />

          <div
            className="hero-phone relative z-10 mx-auto w-[280px] sm:w-[300px]"
            style={{ perspective: "1200px" }}
          >
            <div className="relative rounded-[44px] border-[10px] border-[#0F172A] bg-[#0F172A] shadow-[0_40px_80px_-20px_rgba(30,58,138,0.35)]">
              <div className="absolute left-1/2 top-2.5 z-20 h-3.5 w-20 -translate-x-1/2 rounded-full bg-[#0F172A]" />
              <div className="h-[540px] overflow-hidden rounded-[34px] bg-[#F8FBFF]">
                <img
                  src={phoneShot}
                  alt="Tampilan aplikasi SADAR Finance di ponsel"
                  className="h-full w-full object-cover object-top"
                  loading="eager"
                />
              </div>
            </div>

            <div className="hero-parallax" data-speed={26}>
              <FloatBudgetCard />
              <FloatScoreCard />
            </div>
            <div className="hero-parallax" data-speed={16}>
              <FloatCashflowCard />
              <FloatTransactionCard />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[#7A8795] lg:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
          Scroll
        </span>
        <span className="hero-scroll-dot h-6 w-px bg-gradient-to-b from-[#14B8A6] to-transparent" />
      </div>
    </section>
  );
};

export default GsapHero;