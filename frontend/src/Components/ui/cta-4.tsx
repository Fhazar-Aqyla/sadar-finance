import { ArrowRight, Check, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/Components/ui/button";
import GsapReveal from "@/Components/ui/gsap-reveal";

interface Cta4Props {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonUrl?: string;
  items?: string[];
}

const defaultItems = [
  "Pencatatan Otomatis & Cerdas",
  "Wawasan & Pola Pengeluaran",
  "Budget Alarm & Keamanan",
  "Kesehatan Finansial Terukur",
  "Keamanan Data Prioritas Utama",
];

export const Cta4 = ({
  title = "Mulai Kelola Keuanganmu Lebih Bijak dengan SADAR",
  description = "Daftar sekarang secara gratis dan nikmati kemudahan mencatat transaksi harian, memantau anggaran, serta mendapatkan analisis pengeluaran otomatis berbasis AI.",
  buttonText = "Mulai Sekarang",
  buttonUrl = "/register",
  items = defaultItems,
}: Cta4Props) => {
  const isExternal =
    buttonUrl.startsWith("http") || buttonUrl.startsWith("www");

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#2B4B9B] bg-[#1E3A8A] px-8 py-12 text-white shadow-[0_20px_50px_rgba(30,58,138,0.22)] md:px-16 md:py-16">
      {/* Decorative gradient glowing orb */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#14B8A6] opacity-20 blur-[80px] animate-[cta-pulse_7s_ease-in-out_infinite]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-[#2563EB] opacity-35 blur-[80px]"
        aria-hidden="true"
      />

      {/* Subtle dot-grid texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      {/* Floating badge */}
      <div className="absolute right-6 top-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-[#14B8A6]/40 bg-[#14B8A6]/15 px-3 py-1.5 text-[11px] font-bold text-[#5EEAD4] backdrop-blur-sm">
        <Sparkles className="h-3.5 w-3.5" />
        100% Gratis
      </div>

      <GsapReveal
        as="div"
        className="relative z-10 flex flex-col items-center justify-between gap-10 md:flex-row lg:gap-20"
        stagger={0.18}
      >
        <div className="flex flex-col items-start text-left md:w-3/5">
          <h4 className="mb-4 font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-extrabold tracking-tight text-white md:text-3xl lg:text-4xl leading-tight">
            {title}
          </h4>
          <p className="font-['Inter',sans-serif] text-blue-100 text-[13px] md:text-[14px] leading-relaxed max-w-xl">
            {description}
          </p>

          <Button
            className="mt-8 font-bold shadow-[0_8px_20px_rgba(20,184,166,0.25)] transition duration-300 hover:-translate-y-0.5"
            variant="secondary"
            size="lg"
            asChild
          >
            {isExternal ? (
              <a href={buttonUrl} target="_blank" rel="noopener noreferrer">
                {buttonText} <ArrowRight className="ml-2 size-4" />
              </a>
            ) : (
              <Link to={buttonUrl}>
                {buttonText} <ArrowRight className="ml-2 size-4" />
              </Link>
            )}
          </Button>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] font-semibold text-blue-100/70">
            {["Daftar gratis", "Tanpa kartu kredit", "Kurang dari 1 menit"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-[#14B8A6]" strokeWidth={3} />
                  {item}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="w-full md:w-2/5 border-t border-[#2B4B9B] pt-8 md:border-t-0 md:pt-0">
          <ul className="flex flex-col space-y-4 font-['Inter',sans-serif] text-[13px] md:text-[14px] font-medium text-blue-50">
            {items.map((item, idx) => (
              <li
                className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition-colors duration-300 hover:border-white/10 hover:bg-white/5"
                key={idx}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#14B8A6]/20 text-[#14B8A6] border border-[#14B8A6]/30">
                  <Check className="size-3.5 stroke-[3]" />
                </span>
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </GsapReveal>
    </section>
  );
};
