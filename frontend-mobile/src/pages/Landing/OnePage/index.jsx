import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hero } from "@/Components/ui/animated-hero";
import { ContainerScroll } from "@/Components/ui/container-scroll-animation";
import { GradientBackground } from "@/Components/ui/gradient-background";
import { Cta4 } from "@/Components/ui/cta-4";
import { Footer } from "@/Components/ui/footer";
import ModernTeamShowcase from "@/Components/ui/cybernetic-team-showcase";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import sadarLogo from "../../../assets/images/landing/sadar-logo.png";
import girlPhone from "../../../assets/images/landing/cewek-hp.png";
import boyLaptop from "../../../assets/images/landing/cowok-laptop.png";
import dashboardPreview from "../../../assets/images/landing/dashboard-preview.png";
import diahAvatar from "../../../assets/images/users/diah.png";
import marselaAvatar from "../../../assets/images/users/marsela.png";
import dzakyAvatar from "../../../assets/images/users/dzaky.png";
import farrelAvatar from "../../../assets/images/users/farrel.png";
import fhazarAvatar from "../../../assets/images/users/fhazar.jpg";
import habibAvatar from "../../../assets/images/users/habib.png";

const navItems = [
  { label: "Beranda", href: "#home" },
  { label: "Fitur", href: "#features" },
  { label: "Manfaat", href: "#benefits" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Tim", href: "#team" },
  { label: "FAQ", href: "#faq" },
];

const hasAuthToken = () => {
  try {
    return Boolean(JSON.parse(localStorage.getItem("authUser") || "null")?.token);
  } catch {
    return false;
  }
};

const faqs = [
  {
    question: "Apa itu SADAR Finance?",
    answer:
      "SADAR Finance adalah aplikasi manajemen keuangan personal untuk mencatat transaksi, membaca pola pengeluaran, dan memberi wawasan agar kamu lebih sadar saat mengatur uang.",
  },
  {
    question: "Apakah SADAR bisa mengelompokkan transaksi otomatis?",
    answer:
      "Bisa. Data transaksi dapat dibantu kecerdasan buatan untuk masuk ke kategori seperti makan, transportasi, belanja, tagihan, dan tabungan.",
  },
  {
    question: "Apakah cocok untuk mahasiswa dan pekerja?",
    answer:
      "Cocok. SADAR dirancang untuk kebutuhan harian, mulai dari memantau uang saku, gaji bulanan, anggaran kategori, sampai progres tabungan.",
  },
  {
    question: "Apakah saya bisa mengatur batas anggaran?",
    answer:
      "Bisa. Kamu dapat menentukan batas untuk kategori tertentu agar pengeluaran lebih mudah dipantau setiap bulan.",
  },
  {
    question: "Apakah data keuangan saya aman?",
    answer:
      "Data keuangan dibuat untuk dikelola secara pribadi dan hanya digunakan untuk membantu pencatatan, ringkasan, dan analisis di akunmu.",
  },
];

const teamData = [
  {
    name: "Diah Ayu Puspasari",
    title: "Data Scientist",
    avatar: diahAvatar,
    socials: { 
      github: "https://github.com/Diahayuups", 
      linkedin: "https://www.linkedin.com/in/diahaps/", 
      instagram: "https://www.instagram.com/diahayupsss" 
    }
  },
  {
    name: "Marsela",
    title: "Data Scientist",
    avatar: marselaAvatar,
    socials: { 
      github: "https://github.com/Marsela0603", 
      linkedin: "https://www.linkedin.com/in/marsela-marsela-30a763248", 
      instagram: "https://www.linkedin.com/in/marsela-marsela-30a763248" 
    }
  },
  {
    name: "Dzaky Jaisy Al-Qorney",
    title: "AI Engineer",
    avatar: dzakyAvatar,
    socials: { 
      github: "https://github.com/iMiNerVaa", 
      linkedin: "https://www.linkedin.com/in/dj-al/", 
      instagram: "https://www.instagram.com/_zerxx_/" 
    }
  },
  {
    name: "Farrel Al Faqih Ekatama",
    title: "AI Engineer",
    avatar: farrelAvatar,
    socials: { 
      github: "https://github.com/farrelalfaqih", 
      linkedin: "https://www.linkedin.com/in/farrel-al-faqih-ekatama-339980217/", 
      instagram: "https://www.instagram.com/farrelalfaqih.fae?igsh=MWEzcDZnMW1nMjE5dQ==" 
    }
  },
  {
    name: "Fhazar Raffiful Aqyla",
    title: "Full Stack Developer",
    avatar: fhazarAvatar,
    objectPosition: "center 30%",
    socials: { 
      github: "https://github.com/Fhazar-Aqyla", 
      linkedin: "https://www.linkedin.com/in/fhazaraqyla/", 
      instagram: "https://www.instagram.com/fhazar_aqyla/" 
    }
  },
  {
    name: "Muhammad Habib Rafi",
    title: "Full Stack Developer",
    avatar: habibAvatar,
    socials: { 
      github: "https://github.com/mhmdhabibrafi", 
      linkedin: "https://www.linkedin.com/in/mhmdhabibrafi", 
      instagram: "https://www.instagram.com/mhmdhabibrafi?igsh=MWV6bnR1N2R2Njd2YQ==" 
    }
  }
];

const scalePopVariants = {
  offscreen: { scale: 0.96, opacity: 0 },
  onscreen: (index = 0) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.15,
      duration: 0.8,
      delay: index * 0.1,
    }
  })
};

const slideFromLeftVariants = {
  offscreen: { x: -50, opacity: 0 },
  onscreen: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.1,
      duration: 0.8,
    }
  }
};

const slideFromRightVariants = {
  offscreen: { x: 50, opacity: 0 },
  onscreen: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.1,
      duration: 0.8,
    }
  }
};

const scaleUpVariants = {
  offscreen: { scale: 0.95, opacity: 0 },
  onscreen: (index = 0) => ({
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.15,
      duration: 0.8,
      delay: index * 0.1,
    }
  })
};

const chronologicalStepVariants = {
  offscreen: { x: 30, opacity: 0 },
  onscreen: (index = 0) => ({
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.15,
      duration: 0.8,
      delay: index * 0.12,
    }
  })
};

const headerFadeInVariants = {
  offscreen: { y: 20, opacity: 0 },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.1,
      duration: 0.8,
    }
  }
};

const shellClass =
  "mx-auto w-[min(calc(100%_-_96px),1360px)] max-lg:w-[min(calc(100%_-_48px),1080px)] max-sm:w-[min(calc(100%_-_28px),1080px)]";
const headingClass =
  "font-['Plus_Jakarta_Sans',sans-serif] !font-extrabold tracking-normal !text-[#1E3A8A]";
const sectionHeadingClass = `${headingClass} m-0 text-[40px] leading-[1.18] max-md:text-[32px] max-sm:text-[28px]`;
const bodyClass = "font-['Inter',sans-serif] text-[#333333]";
const primaryButtonClass =
  "inline-flex min-h-8 items-center justify-center rounded-md bg-[#1E3A8A] px-4 text-[11px] font-bold !text-white no-underline shadow-[0_10px_22px_rgba(30,58,138,0.15)] transition hover:-translate-y-0.5 hover:bg-[#1A3175] hover:!text-white";
const sectionBadgeClass =
  "mb-5 inline-flex min-h-7 items-center justify-center rounded-full border border-teal-200 bg-teal-50/50 px-6 text-[12px] font-bold text-[#14B8A6] shadow-[0_4px_14px_rgba(20,184,166,0.05)]";
const cardClass =
  "rounded-[28px] border border-[#DDE8F2] bg-white p-8 shadow-[0_18px_46px_rgba(30,58,138,0.06)]";
const compactCardClass =
  "relative overflow-hidden rounded-[14px] border border-[#DDE8F2] bg-white p-5 shadow-[0_14px_34px_rgba(30,58,138,0.05)]";
const stepTitleClass = `${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`;
const stepBodyClass = "mt-2 max-w-[280px] text-[12px] leading-5 text-[#7A8795]";

const DashboardPreview = () => (
  <img
    src={dashboardPreview}
    alt="SADAR Finance Dashboard"
    className="h-full w-full object-cover object-top"
  />
);

const StepTransactionPreview = () => (
  <div className="mt-5 grid gap-2">
    {[
      {
        icon: "ri-arrow-down-line",
        label: "Gaji freelance",
        amount: "+Rp 1,8 jt",
        tone: "text-[#14B8A6]",
        bg: "bg-teal-50",
      },
      {
        icon: "ri-cup-line",
        label: "Kopi & makan",
        amount: "-Rp 86 rb",
        tone: "text-[#D86B5D]",
        bg: "bg-[#FFF0ED]",
      },
    ].map((item) => (
      <div
        key={item.label}
        className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E6EEF5] bg-[#FBFDFF] px-3"
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.bg} ${item.tone}`}
        >
          <i className={`${item.icon} text-[15px]`} aria-hidden="true"></i>
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#334155]">
          {item.label}
        </span>
        <span className={`text-[11px] font-bold ${item.tone}`}>
          {item.amount}
        </span>
      </div>
    ))}
  </div>
);

const StepCategoryPreview = () => (
  <div className="mt-5 grid grid-cols-2 gap-2">
    {[
      ["Makan", "42%", "bg-[#14B8A6]"],
      ["Transport", "24%", "bg-[#1E3A8A]"],
      ["Tagihan", "21%", "bg-[#78B7D8]"],
      ["Tabungan", "13%", "bg-[#F0B86E]"],
    ].map(([label, value, color]) => (
      <div
        key={label}
        className="rounded-[10px] border border-[#E6EEF5] bg-[#FBFDFF] p-3"
      >
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-[#334155]">
          <span className="truncate">{label}</span>
          <span>{value}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8F0F7]">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: value }}
          />
        </div>
      </div>
    ))}
  </div>
);

const StepBudgetPreview = () => (
  <div className="mt-5 grid gap-3">
    {[
      ["Makan", "78%", "bg-[#14B8A6]"],
      ["Belanja", "91%", "bg-[#D86B5D]"],
    ].map(([label, value, color]) => (
      <div key={label}>
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-[#334155]">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#E8F0F7]">
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: value }}
          />
        </div>
      </div>
    ))}
    <div className="flex items-center gap-2 rounded-[10px] bg-[#FFF7E8] px-3 py-2 text-[10px] font-semibold text-[#9A6A22]">
      <i className="ri-alert-line text-[14px]" aria-hidden="true"></i>
      Belanja hampir lewat batas bulan ini
    </div>
  </div>
);

const StepDashboardPreview = () => (
  <div className="mt-6 grid grid-cols-[1.1fr_0.9fr] gap-4 max-md:grid-cols-1">
    <div className="rounded-[12px] border border-[#E6EEF5] bg-[#FBFDFF] p-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[#7A8795]">
            Cashflow
          </p>
          <p className="m-0 mt-1 text-[18px] font-extrabold text-[#1E3A8A]">
            +Rp 620 rb
          </p>
        </div>
        <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-[#14B8A6]">
          +12%
        </span>
      </div>
      <div className="mt-5 flex h-24 items-end gap-2">
        {[44, 68, 52, 78, 60, 88, 72].map((height, index) => (
          <span
            key={height + index}
            className={`flex-1 rounded-t-md ${index % 2 === 0 ? "bg-[#14B8A6]" : "bg-[#1E3A8A]"}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>

    <div className="grid gap-2">
      {[
        ["Saldo aktif", "Rp 4,2 jt", "ri-wallet-3-line"],
        ["Tabungan", "Rp 1,1 jt", "ri-safe-2-line"],
        ["Pengeluaran", "Rp 2,5 jt", "ri-line-chart-line"],
      ].map(([label, value, icon]) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-[12px] border border-[#E6EEF5] bg-white px-3 py-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-50 text-[#14B8A6]">
            <i className={`${icon} text-[16px]`} aria-hidden="true"></i>
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-[10px] font-semibold text-[#7A8795]">
              {label}
            </p>
            <p className="m-0 text-[13px] font-extrabold text-[#1E3A8A]">
              {value}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const stepInsightItems = [
  {
    icon: "ri-lightbulb-flash-line",
    bgColor: "#E6FFFA",
    textColor: "#0D9488",
    title: "Kurangi jajan 15%",
    subtitle: "Target tabungan bulan ini bisa naik Rp 180 rb.",
  },
  {
    icon: "ri-file-search-line",
    bgColor: "#FEF3C7",
    textColor: "#D97706",
    title: "Evaluasi langganan bulanan",
    subtitle: "Hemat hingga Rp 99 rb dari hiburan & aplikasi tak terpakai.",
  },
  {
    icon: "ri-shield-check-line",
    bgColor: "#E0F2FE",
    textColor: "#0284C7",
    title: "Alokasi otomatis 20% ke tabungan",
    subtitle: "Amankan alokasi di awal bulan agar keuangan tetap seimbang.",
  },
];

const StepInsightPreview = () => (
  <div className="mt-5 grid gap-2.5">
    {stepInsightItems.map((item) => (
      <div
        key={item.title}
        className="rounded-[12px] border border-[#DDE8F2] bg-[#FBFDFF] p-3 transition-all hover:border-[#14B8A6]/30 hover:shadow-sm"
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: item.bgColor, color: item.textColor }}
          >
            <i className={`${item.icon} text-[18px]`} aria-hidden="true"></i>
          </span>
          <div>
            <p className="m-0 text-[11px] font-extrabold text-[#1E3A8A]">
              {item.title}
            </p>
            <p className="m-0 mt-0.5 text-[10px] leading-4 text-[#7A8795]">
              {item.subtitle}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const OnePage = () => {
  const [openFaq, setOpenFaq] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = hasAuthToken();

  useEffect(() => {
    document.title = "SADAR Finance | Manajemen Keuangan Cerdas";
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobileMenuOpen]);

  return (
    <main className={`${bodyClass} min-h-screen overflow-hidden bg-[#F8FBFF]`}>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#DDE8F2] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div
          className={`${shellClass} sadar-landing-header-shell grid min-h-[64px] grid-cols-[1fr_auto_1fr] items-center gap-6 max-lg:grid-cols-[1fr_auto] max-md:min-h-[56px]`}
        >
          <Link
            to="/"
            aria-label="SADAR Finance"
            className="inline-flex shrink-0 items-center no-underline"
          >
            <img src={sadarLogo} alt="SADAR" className="h-[28px] w-auto" />
          </Link>

          <nav
            className="hidden items-center justify-center gap-8 lg:flex"
            aria-label="Menu landing page"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative py-2 text-[12px] font-semibold !text-[#475569] no-underline transition hover:!text-[#1E3A8A]"
              >
                {item.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-[#14B8A6] transition duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="sadar-landing-actions flex shrink-0 items-center justify-end gap-3">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="text-[12px] font-semibold !text-[#475569] no-underline hover:!text-[#1E3A8A]"
            >
              {isAuthenticated ? "Dashboard" : "Masuk"}
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className={`${primaryButtonClass} min-w-[118px] max-sm:hidden`}
            >
              {isAuthenticated ? "Buka Aplikasi" : "Mulai Sekarang"}
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border-0 bg-[#1E3A8A] text-[#F8F9FA] lg:hidden"
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <i
                className={`${isMobileMenuOpen ? "ri-close-line" : "ri-menu-line"} text-xl`}
                aria-hidden="true"
              ></i>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav
            className="absolute inset-x-0 top-full grid max-h-[calc(100dvh-56px)] gap-1 overflow-y-auto border-b border-[#DDE8F2] bg-white px-4 py-3 shadow-[0_14px_28px_rgba(15,23,42,0.12)] lg:hidden"
            aria-label="Menu landing page mobile"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-[13px] font-semibold !text-[#475569] no-underline hover:bg-[#F1F5F9] hover:!text-[#1E3A8A]"
              >
                {item.label}
              </a>
            ))}
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${primaryButtonClass} mt-2 w-full sm:hidden`}
            >
              {isAuthenticated ? "Buka Aplikasi" : "Mulai Sekarang"}
            </Link>
          </nav>
        )}
      </header>

      <div className="relative overflow-hidden bg-white">
        <GradientBackground
          aria-hidden="true"
          enableCenterContent={false}
          className="pointer-events-none absolute inset-x-0 top-0 h-[76rem] max-md:h-[66rem]"
          animationDuration={11}
          overlay
          overlayOpacity={0.04}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-[54rem] h-[26rem] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.72)_54%,#FFFFFF_100%)] max-md:top-[48rem] max-md:h-[22rem]"
        />
        <div className="relative z-10">
          <Hero isAuthenticated={isAuthenticated} />

          <ContainerScroll>
            <DashboardPreview />
          </ContainerScroll>
        </div>
      </div>

      <section
        id="features"
        className="relative z-10 bg-[#F8FBFF] pb-24 pt-14 max-md:py-16"
      >
        <div className={shellClass}>
          <motion.div 
            initial="offscreen" 
            whileInView="onscreen" 
            viewport={{ once: true, amount: 0.3 }} 
            variants={headerFadeInVariants} 
            className="mx-auto max-w-[680px] text-center"
          >
            <span className={sectionBadgeClass}>Fitur SADAR</span>
            <h2 className={sectionHeadingClass}>
              Lebih dari Sekadar{" "}
              <span className="!text-[#14B8A6]">Mencatat Keuangan</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[440px] text-[13px] leading-6 text-[#333333]">
              Semua dirancang untuk membantumu lebih sadar, lebih terkontrol,
              dan lebih bijak dalam mengelola uangmu secara lebih efektif.
            </p>
          </motion.div>

          <div className="mt-10 grid auto-rows-[minmax(178px,auto)] grid-cols-3 gap-4 max-lg:auto-rows-auto max-lg:grid-cols-2 max-sm:grid-cols-1">
            <motion.div 
              variants={scalePopVariants} 
              custom={0} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={compactCardClass}
            >
              <div>
                <h3 className={stepTitleClass}>Catat transaksi harian</h3>
                <p className={stepBodyClass}>
                  Masukkan pemasukan dan pengeluaran. Data yang dibutuhkan cukup
                  nominal, catatan, kategori, dan tanggal transaksi.
                </p>
                <StepTransactionPreview />
              </div>
            </motion.div>

            <motion.div 
              variants={scalePopVariants} 
              custom={1} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={compactCardClass}
            >
              <div>
                <h3 className={stepTitleClass}>Kategori langsung kebaca</h3>
                <p className={stepBodyClass}>
                  SADAR mengelompokkan transaksi ke makan, transport, tagihan,
                  dan tabungan supaya histori bulanan rapi.
                </p>
                <StepCategoryPreview />
              </div>
            </motion.div>

            <motion.div 
              variants={scalePopVariants} 
              custom={2} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={compactCardClass}
            >
              <div>
                <h3 className={stepTitleClass}>Budget dipantau real-time</h3>
                <p className={stepBodyClass}>
                  Batas tiap kategori dibandingkan dengan pengeluaran berjalan,
                  jadi sinyal boros muncul lebih cepat.
                </p>
                <StepBudgetPreview />
              </div>
            </motion.div>

            <motion.div 
              variants={scalePopVariants} 
              custom={3} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={`${compactCardClass} col-span-2 max-sm:col-span-1`}
            >
              <div>
                <h3 className={stepTitleClass}>Dashboard merangkum arus kas</h3>
                <p className="mt-2 max-w-[460px] text-[12px] leading-5 text-[#7A8795]">
                  Chart dan ringkasan menampilkan saldo aktif, pemasukan,
                  pengeluaran, serta progres tabungan dalam satu pandangan.
                </p>
                <StepDashboardPreview />
              </div>
            </motion.div>

            <motion.div 
              variants={scalePopVariants} 
              custom={4} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={compactCardClass}
            >
              <div>
                <h3 className={stepTitleClass}>Insight jadi rekomendasi</h3>
                <p className={stepBodyClass}>
                  Pola belanja diterjemahkan jadi saran praktis, peringatan, dan
                  langkah kecil yang bisa langsung kamu ikuti.
                </p>
                <StepInsightPreview />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-white pb-24 pt-8 max-md:pb-16">
        <div className={shellClass}>
          <motion.div 
            initial="offscreen" 
            whileInView="onscreen" 
            viewport={{ once: true, amount: 0.3 }} 
            variants={headerFadeInVariants} 
            className="mx-auto max-w-[760px] text-center"
          >
            <span className={sectionBadgeClass}>Manfaat</span>
            <h2 className={sectionHeadingClass}>
              Dengan <span className="!text-[#14B8A6]">SADAR</span>, Kamu Bisa
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-[14px] leading-7 text-[#333333]">
              Dari pencatatan transaksi hingga wawasan otomatis, semua dirancang
              untuk membantu kamu memahami dan mengontrol keuanganmu dengan
              lebih baik.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 grid max-w-[1100px] grid-cols-[250px_240px_240px_250px] items-end justify-center gap-10 max-xl:grid-cols-[235px_225px_225px_235px] max-xl:gap-8 max-lg:grid-cols-2 max-lg:items-center max-md:mt-14 max-sm:grid-cols-1">
            <motion.div 
              variants={slideFromLeftVariants} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className="pb-9 text-right max-lg:order-3 max-lg:text-center max-sm:order-none max-sm:pb-0"
            >
              <h3
                className={`${headingClass} m-0 text-[22px] leading-[1.22] !text-[#14B8A6] max-md:text-[21px]`}
              >
                <span className="block whitespace-nowrap">
                  Keputusan Finansial
                </span>
                <span className="block">Jadi Lebih Cerdas</span>
              </h3>
              <p className="ml-auto mt-3 max-w-[230px] text-[13px] leading-6 text-[#333333] max-lg:mx-auto">
                Wawasan otomatis membantu kamu memahami kebiasaanmu.
              </p>
            </motion.div>

            <motion.div 
              variants={scaleUpVariants} 
              custom={0} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className="relative h-[390px] w-full max-w-[240px] justify-self-center max-xl:h-[370px] max-xl:max-w-[225px] max-md:h-[390px] max-md:max-w-[240px]"
            >
              <div className="absolute inset-x-0 bottom-0 h-[300px] rounded-[16px] bg-[#14B8A6] max-xl:h-[285px] max-md:h-[300px]" />
              <img
                src={girlPhone}
                alt="Pengguna SADAR memegang ponsel"
                className="absolute bottom-0 left-1/2 z-10 h-[390px] w-auto -translate-x-1/2 max-xl:h-[370px] max-md:h-[390px]"
              />
            </motion.div>

            <motion.div 
              variants={scaleUpVariants} 
              custom={1} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className="relative h-[390px] w-full max-w-[240px] justify-self-center max-xl:h-[370px] max-xl:max-w-[225px] max-md:h-[390px] max-md:max-w-[240px]"
            >
              <div className="absolute inset-x-0 bottom-0 h-[300px] rounded-[16px] bg-[#1E3A8A] max-xl:h-[285px] max-md:h-[300px]" />
              <img
                src={boyLaptop}
                alt="Pengguna SADAR memakai laptop"
                className="absolute bottom-0 left-1/2 z-10 h-[390px] w-auto -translate-x-[45%] max-xl:h-[370px] max-md:h-[390px]"
              />
            </motion.div>

            <motion.div 
              variants={slideFromRightVariants} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className="pb-9 text-left max-lg:order-4 max-lg:self-start max-lg:pt-7 max-lg:pb-0 max-lg:text-center max-sm:order-none max-sm:pt-0"
            >
              <h3
                className={`${headingClass} m-0 text-[22px] leading-[1.22] max-md:text-[21px]`}
              >
                <span className="block whitespace-nowrap">
                  Lebih Tahu Kemana
                </span>
                <span className="block">Uangmu Pergi</span>
              </h3>
              <p className="mt-3 max-w-[240px] text-[13px] leading-6 text-[#333333] max-lg:mx-auto">
                Lihat semua pengeluaranmu dengan jelas dan tanpa tebakan.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="bg-[#F8FBFF] pb-28 pt-24 max-md:pb-20 max-md:pt-16"
      >
        <div className={shellClass}>
          <motion.div 
            initial="offscreen" 
            whileInView="onscreen" 
            viewport={{ once: true, amount: 0.3 }} 
            variants={headerFadeInVariants} 
            className="mx-auto max-w-[640px] text-center"
          >
            <span className={sectionBadgeClass}>Cara Kerja</span>
            <h2 className={sectionHeadingClass}>
              Cara SADAR Membantu
              <span className="block !text-[#14B8A6]">
                Keuanganmu Tetap Terkontrol
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-[500px] text-[13px] leading-6 text-[#6B7280]">
              Alurnya dibuat sederhana: kamu mencatat, SADAR merapikan data,
              lalu wawasan dan peringatan muncul saat kamu perlu ambil
              keputusan.
            </p>
          </motion.div>

          <div className="mx-auto mt-11 grid grid-cols-4 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1 max-w-[1200px]">
            {/* Step 1 */}
            <motion.article 
              variants={chronologicalStepVariants} 
              custom={0} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={`${cardClass} flex flex-col justify-between min-h-[360px] p-6`}
            >
              <div className="w-full h-[160px] rounded-[20px] bg-[#F8FBFF] border border-[#EFF4FA] flex items-center justify-center relative overflow-hidden">
                {/* Glowing Concentric Circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-[#14B8A6]/10 animate-pulse" />
                  <div className="w-20 h-20 rounded-full border border-[#14B8A6]/20 absolute flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#14B8A6] text-white flex items-center justify-center shadow-lg shadow-[#14B8A6]/30">
                      <i className="ri-wallet-3-line text-[20px]"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6]">Step 1</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>
                  Input Transaksi Cerdas
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#7A8795]">
                  Catat pemasukan dan pengeluaran harian dengan cepat, rapi, dan mudah ditinjau ulang.
                </p>
              </div>
            </motion.article>

            {/* Step 2 */}
            <motion.article 
              variants={chronologicalStepVariants} 
              custom={1} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={`${cardClass} flex flex-col justify-between min-h-[360px] p-6`}
            >
              <div className="w-full h-[160px] rounded-[20px] bg-[#F8FBFF] border border-[#EFF4FA] flex items-center justify-center relative overflow-hidden">
                {/* Auto Categorization Graphic */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <div className="bg-[#1E3A8A] text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-sm z-10">
                    SADAR AI
                  </div>
                  <div className="flex gap-1.5 z-10">
                    <span className="bg-teal-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Makan
                    </span>
                    <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      Transport
                    </span>
                  </div>
                  {/* Decorative background grid/lines */}
                  <div className="absolute inset-x-0 top-1/2 h-[1px] border-t border-dashed border-[#E2E8F0] -translate-y-1/2" />
                </div>
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6]">Step 2</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>
                  Wawasan Otomatis
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#7A8795]">
                  SADAR membaca pola transaksi lalu menampilkan ringkasan yang membantu kamu mengambil keputusan.
                </p>
              </div>
            </motion.article>

            {/* Step 3 */}
            <motion.article 
              variants={chronologicalStepVariants} 
              custom={2} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={`${cardClass} flex flex-col justify-between min-h-[360px] p-6`}
            >
              <div className="w-full h-[160px] rounded-[20px] bg-[#F8FBFF] border border-[#EFF4FA] flex items-center justify-center relative overflow-hidden">
                {/* Budget Limit warning */}
                <div className="w-full px-6 flex flex-col items-center gap-3">
                  <div className="w-full h-2.5 bg-[#E8F0F7] rounded-full overflow-hidden relative">
                    <div className="h-full bg-[#D86B5D] rounded-full" style={{ width: '88%' }} />
                  </div>
                  <div className="bg-[#FFF7E8] text-[#9A6A22] border border-[#F0B86E]/40 px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1">
                    <i className="ri-alert-line text-[11px]"></i> Limit Hampir Habis!
                  </div>
                </div>
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6]">Step 3</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>
                  Penjaga Anggaran
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#7A8795]">
                  Tetapkan batas anggaran dan dapatkan sinyal lebih awal saat pengeluaran mulai mendekati batas.
                </p>
              </div>
            </motion.article>

            {/* Step 4 */}
            <motion.article 
              variants={chronologicalStepVariants} 
              custom={3} 
              initial="offscreen" 
              whileInView="onscreen" 
              viewport={{ once: true, amount: 0.2 }} 
              className={`${cardClass} flex flex-col justify-between min-h-[360px] p-6`}
            >
              <div className="w-full h-[160px] rounded-[20px] bg-[#F8FBFF] border border-[#EFF4FA] flex items-center justify-center relative overflow-hidden">
                {/* Health Score graphic */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-[6px] border-[#14B8A6]/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-[6px] border-[#14B8A6] border-r-transparent border-b-transparent rotate-45" />
                    <div className="flex flex-col items-center">
                      <span className="text-[15px] font-black text-[#1E3A8A] leading-none">85</span>
                      <span className="text-[6px] font-bold uppercase tracking-widest text-[#14B8A6] mt-0.5">Sangat Sehat</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex-1 flex flex-col justify-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#14B8A6]">Step 4</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>
                  Skor Kesehatan Keuangan
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#7A8795]">
                  Lihat gambaran kondisi finansial dari arus kas, kebiasaan belanja, dan progres tabungan.
                </p>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      <ModernTeamShowcase teamMembers={teamData} />

      <section
        id="faq"
        className="bg-[#F8FBFF] pb-4 pt-0 max-md:pb-4 max-md:pt-0"
      >
        <div className={`${shellClass} max-w-[860px]`}>
          <div className="mx-auto max-w-[640px] text-center">
            <span className={sectionBadgeClass}>FAQ</span>
            <h2 className={`${sectionHeadingClass} text-center`}>
              Masih ada Pertanyaan? <span className="!text-[#14B8A6]">Kami Punya Jawabannya</span>
            </h2>
          </div>

          <div className="mt-9 grid h-[456px] content-start gap-3 max-md:h-[408px] max-sm:h-[388px]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article
                  key={faq.question}
                  className={`overflow-hidden rounded-[12px] bg-white shadow-[0_10px_26px_rgba(30,58,138,0.04)] transition border-2 ${
                    isOpen
                      ? "border-[#1E3A8A] bg-[#F5F9FF]"
                      : "border-[#E4ECF3]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-3 text-left text-[16px] font-extrabold leading-snug !text-[#1E3A8A] max-sm:min-h-[52px] max-sm:px-4 max-sm:text-[14px]"
                  >
                    <span>{faq.question}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white !text-[#1E3A8A] shadow-[0_4px_10px_rgba(30,58,138,0.03)]">
                      <i
                        className={`${isOpen ? "ri-subtract-line" : "ri-add-line"} text-[18px]`}
                        aria-hidden="true"
                      ></i>
                    </span>
                  </button>
                  {isOpen && (
                    <p className="m-0 max-w-[720px] px-5 pb-5 text-[13px] leading-6 text-[#667085] max-sm:px-4 max-sm:text-[12px] max-sm:leading-6">
                      {faq.answer}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-[66px] pt-16 max-md:pb-10 max-md:pt-10">
        <div className={shellClass}>
          <Cta4
            buttonText={isAuthenticated ? "Buka Dashboard" : "Mulai Sekarang"}
            buttonUrl={isAuthenticated ? "/dashboard" : "/register"}
          />
        </div>
      </section>

      <Footer
        logo={<img src={sadarLogo} alt="SADAR" className="h-[30px] w-auto brightness-0 invert" />}
        brandName="SADAR Finance"
        socialLinks={[
          {
            icon: (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                <path d="M9 18c-4.51 2-5-2-7-2" />
              </svg>
            ),
            href: "https://github.com/Fhazar-Aqyla/sadar-finance",
            label: "GitHub",
          },
        ]}
        mainLinks={[
          { href: "#home", label: "Beranda" },
          { href: "#features", label: "Fitur" },
          { href: "#benefits", label: "Manfaat" },
          { href: "#how-it-works", label: "Cara Kerja" },
          { href: "#team", label: "Tim" },
          { href: "#faq", label: "FAQ" },
        ]}
        legalLinks={[
          { href: "#", label: "Kebijakan Privasi" },
          { href: "#", label: "Syarat & Ketentuan" },
        ]}
        copyright={{
          text: "© 2026 SADAR Finance"
        }}
      />
    </main>
  );
};

export default OnePage;
