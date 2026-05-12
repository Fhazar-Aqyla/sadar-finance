import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import sadarLogo from "../../../assets/images/landing/sadar-logo.png";
import girlPhone from "../../../assets/images/landing/cewek-hp.png";
import boyLaptop from "../../../assets/images/landing/cowok-laptop.png";

const features = [
  {
    title: "Smart Transaction Input",
    description:
      "Scan struk atau input manual, semua langsung tercatat tanpa ribet.",
  },
  {
    title: "Behavior Insight",
    description:
      "Pantau pengeluaranmu lewat grafik dan ringkasan yang mudah dipahami.",
  },
  {
    title: "Auto Insight Dashboard",
    description:
      "Temukan pola pengeluaran dan kebiasaan yang sering tidak kamu sadari.",
  },
  {
    title: "Smart Alert & Score",
    description:
      "Dapatkan alert finansial dan peringatan saat pengeluaran mulai berlebihan.",
  },
];

const steps = [
  {
    title: "Catat Transaksi dengan Mudah Tanpa Ribet",
    description:
      "Catat setiap pemasukan dan pengeluaran dengan cepat melalui input manual atau scan struk.",
  },
  {
    title: "Pantau, Analisis, dan Pahami Keuanganmu",
    description:
      "Lihat ringkasan keuanganmu secara real-time yang membantu kamu memahami pola pengeluaran dan kebiasaan finansialmu.",
  },
  {
    title: "Kontrol Pengeluaran dan Kondisi Finansial",
    description:
      "Gunakan insight untuk mengatur budget untuk menghindari overspending dan membangun kondisi keuangan yang lebih sehat.",
  },
];

const faqs = [
  {
    question: "Catat transaksi dengan mudah tanpa ribet",
    answer:
      "Kamu bisa mencatat pemasukan dan pengeluaran secara manual, lalu memantau ringkasannya dari dashboard.",
  },
  {
    question: "Apakah SADAR bisa membaca struk?",
    answer:
      "Ya, SADAR menyiapkan flow upload struk dan OCR sebagai dasar pencatatan otomatis.",
  },
  {
    question: "Bagaimana SADAR membantu mengontrol pengeluaran?",
    answer:
      "SADAR menampilkan insight, alert, dan health score agar pola pengeluaran lebih mudah dievaluasi.",
  },
  {
    question: "Apakah SADAR cocok untuk keuangan pribadi?",
    answer:
      "Cocok. Fitur akun, pemasukan, transaksi, budget, dan insight dibuat untuk pemantauan finansial harian.",
  },
];

const navItems = [
  { label: "Beranda", href: "#home" },
  { label: "Fitur", href: "#features" },
  { label: "Manfaat", href: "#benefits" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const shellClass = "mx-auto w-[min(calc(100%_-_48px),1080px)] max-sm:w-[min(calc(100%_-_28px),1080px)]";
const headingClass =
  "font-['Plus_Jakarta_Sans',sans-serif] font-extrabold tracking-normal text-[#0C3954]";
const sectionHeadingClass = `${headingClass} m-0 text-[40px] leading-tight max-md:text-[32px] max-sm:text-[28px]`;
const bodyClass = "font-['Inter',sans-serif] text-[#333333]";
const primaryButtonClass =
  "inline-flex min-h-9 items-center justify-center rounded-md bg-[#0C3954] px-5 text-[12px] font-bold !text-white no-underline shadow-[0_10px_22px_rgba(12,57,84,0.18)] transition hover:-translate-y-0.5 hover:bg-[#124170] hover:!text-white";

const OnePage = () => {
  const [openFaq, setOpenFaq] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "SADAR Finance | Smart Finance Management";
  }, []);

  return (
    <main className={`${bodyClass} min-h-screen overflow-hidden bg-[#EEF5FF]`}>
      <header className="sticky top-0 z-50 bg-[#EEF5FF]/95 shadow-[0_1px_0_rgba(12,57,84,0.06)] backdrop-blur">
        <div className={`${shellClass} flex min-h-[78px] items-center justify-between gap-6 max-md:min-h-[68px]`}>
          <Link to="/" aria-label="SADAR Finance" className="inline-flex shrink-0 items-center no-underline">
            <img src={sadarLogo} alt="SADAR" className="h-[21px] w-auto" />
          </Link>

          <nav className="hidden items-center justify-center gap-8 lg:flex" aria-label="Menu landing page">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative py-2 text-[12px] font-semibold !text-[#1E9BE0] no-underline transition hover:!text-[#0C3954]"
              >
                {item.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-[#64AB88] transition duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-5">
            <Link to="/login" className="text-[12px] font-semibold !text-[#1E9BE0] no-underline hover:!text-[#0C3954]">
              Masuk
            </Link>
            <Link to="/register" className={`${primaryButtonClass} min-w-[168px] max-sm:hidden`}>
              Mulai Sekarang
            </Link>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border-0 bg-[#0C3954] text-[#F8F9FA] lg:hidden"
              aria-label="Buka menu"
              aria-expanded={isMobileMenuOpen}
            >
              <i className={`${isMobileMenuOpen ? "ri-close-line" : "ri-menu-line"} text-xl`} aria-hidden="true"></i>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className={`${shellClass} grid gap-1 pb-4 lg:hidden`} aria-label="Menu landing page mobile">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-md px-3 py-2 text-[13px] font-semibold !text-[#1E9BE0] no-underline hover:bg-white hover:!text-[#0C3954]"
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${primaryButtonClass} mt-2 w-full sm:hidden`}
            >
              Mulai Sekarang
            </Link>
          </nav>
        )}
      </header>

      <section id="home" className="relative overflow-hidden pb-[170px] pt-[84px] max-lg:pb-[148px] max-md:pt-12">
        <div className={`${shellClass} relative z-10 grid grid-cols-[0.86fr_1.14fr] items-start gap-16 max-lg:grid-cols-1 max-lg:gap-10`}>
          <div className="pt-10 max-lg:pt-0">
            <h1 className={`${headingClass} m-0 text-[46px] leading-[1.05] max-sm:text-[36px]`}>
              Track Your Money
              <span className="block text-[#64AB88]">Build Your Future</span>
            </h1>
            <p className="mb-7 mt-8 max-w-[505px] text-[13px] leading-6 text-[#333333]">
              Pantau, analisis, dan pahami pengeluaranmu dengan AI agar kamu bisa
              menghindari overspending dan lebih mengontrol keuangan.
            </p>
            <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
              <Link to="/register" className={primaryButtonClass}>
                Mulai Sekarang
                <i className="ri-arrow-right-line text-[13px]" aria-hidden="true"></i>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-9 items-center gap-2 text-[12px] font-semibold text-[#0C3954] no-underline"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#0C3954]">
                  <i className="ri-play-fill text-[10px]" aria-hidden="true"></i>
                </span>
                Lihat Demo
              </a>
            </div>
          </div>

          <div className="h-[380px] rounded-[18px] bg-[#D9D9D9] shadow-[0_8px_14px_rgba(51,51,51,0.28)] max-lg:h-[320px] max-sm:h-[240px]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[245px] max-md:h-[170px]" aria-hidden="true">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 260"
            preserveAspectRatio="none"
          >
            <path
              d="M0 102C110 76 210 48 318 34C430 19 552 38 670 34C792 30 900 5 1016 6C1144 7 1247 36 1366 18C1396 13 1420 4 1440 -6V260H0V102Z"
              fill="#64AB88"
              fillOpacity="0.35"
            />
            <path
              d="M0 118C104 91 222 55 328 44C454 31 558 52 680 50C800 48 896 22 1010 22C1132 22 1252 54 1368 34C1398 29 1423 19 1440 10V260H0V118Z"
              fill="#124170"
            />
            <path
              d="M0 176C130 199 255 222 402 228C512 233 618 228 726 228C792 228 824 238 865 260H0V176Z"
              fill="#0C3954"
            />
          </svg>
        </div>
      </section>

      <section id="features" className="relative z-10 py-24 max-md:py-16">
        <div className={shellClass}>
          <div className="mx-auto max-w-[680px] text-center">
            <h2 className={sectionHeadingClass}>
              Lebih dari Sekadar <span className="text-[#64AB88]">Mencatat Keuangan</span>
            </h2>
            <p className="mx-auto mt-3 max-w-[440px] text-[12px] leading-6 text-[#333333]">
              Semua dirancang untuk membantumu lebih sadar, lebih terkontrol,
              dan lebih bijak dalam mengelola uangmu secara lebih efektif.
            </p>
          </div>

          <div className="mx-auto mt-[58px] grid max-w-[940px] grid-cols-2 gap-8 max-md:grid-cols-1">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="min-h-[218px] rounded-xl bg-white px-8 py-9 shadow-[0_1px_0_rgba(12,57,84,0.08)]"
              >
                <h3 className={`${headingClass} m-0 text-[17px] leading-snug text-[#333333]`}>
                  {feature.title}
                </h3>
                <p className="mt-4 max-w-[300px] text-[11px] leading-5 text-[#333333]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="pb-24 pt-8 max-md:pb-16">
        <div className={shellClass}>
          <div className="mx-auto max-w-[760px] text-center">
            <h2 className={sectionHeadingClass}>
              Dengan <span className="text-[#64AB88]">SADAR</span>, Kamu Bisa
            </h2>
            <p className="mx-auto mt-5 max-w-[650px] text-[16px] leading-8 text-[#333333]">
              Dari pencatatan transaksi hingga insight otomatis, semua dirancang
              untuk membantu kamu memahami dan mengontrol keuanganmu dengan lebih baik.
            </p>
          </div>

          <div className="mx-auto mt-20 grid max-w-[1060px] grid-cols-[220px_240px_240px_240px] items-end justify-center gap-10 max-xl:grid-cols-[210px_225px_225px_220px] max-xl:gap-8 max-lg:grid-cols-2 max-lg:items-center max-md:mt-16 max-sm:grid-cols-1">
            <div className="pb-10 text-right max-lg:order-3 max-lg:text-center max-sm:order-none max-sm:pb-0">
              <h3 className={`${headingClass} m-0 text-[22px] leading-[1.55] text-[#64AB88] max-md:text-[21px]`}>
                Keputusan Finansial
                <span className="block">Jadi Lebih Cerdas</span>
              </h3>
              <p className="ml-auto mt-5 max-w-[230px] text-[13px] leading-7 text-[#333333] max-lg:mx-auto">
                Insight otomatis membantu kamu memahami kebiasaanmu.
              </p>
            </div>

            <div className="relative h-[390px] w-full max-w-[240px] justify-self-center max-xl:h-[370px] max-xl:max-w-[225px] max-md:h-[390px] max-md:max-w-[240px]">
              <div className="absolute inset-x-0 bottom-0 h-[300px] rounded-[16px] bg-[#64AB88] max-xl:h-[285px] max-md:h-[300px]" />
              <img
                src={girlPhone}
                alt="Pengguna SADAR memegang ponsel"
                className="absolute bottom-0 left-1/2 z-10 h-[390px] w-auto -translate-x-1/2 max-xl:h-[370px] max-md:h-[390px]"
              />
            </div>

            <div className="relative h-[390px] w-full max-w-[240px] justify-self-center max-xl:h-[370px] max-xl:max-w-[225px] max-lg:h-[568px] max-lg:max-w-[347px] max-md:h-[390px] max-md:max-w-[240px]">
              <div className="absolute inset-x-0 bottom-0 h-[300px] rounded-[16px] bg-[#124170] max-xl:h-[285px] max-lg:h-[440px] max-md:h-[300px]" />
              <img
                src={boyLaptop}
                alt="Pengguna SADAR memakai laptop"
                className="absolute bottom-0 left-1/2 z-10 h-[390px] w-auto -translate-x-[45%] max-xl:h-[370px] max-lg:h-[568px] max-lg:origin-bottom max-lg:scale-x-[1.08] max-md:h-[390px]"
              />
            </div>

            <div className="pb-10 text-left max-lg:order-4 max-lg:self-start max-lg:pt-7 max-lg:pb-0 max-lg:text-left max-sm:order-none max-sm:pt-0">
              <h3 className={`${headingClass} m-0 text-[22px] leading-[1.55] max-md:text-[21px]`}>
                Lebih Tahu Kemana
                <span className="block">Uangmu Pergi</span>
              </h3>
              <p className="mt-5 max-w-[240px] text-[13px] leading-7 text-[#333333]">
                Lihat semua pengeluaranmu dengan jelas dan tanpa tebakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-24 max-md:py-16">
        <div className={shellClass}>
          <div className="mx-auto max-w-[420px] text-center">
            <h2 className={`${sectionHeadingClass} leading-[1.45]`}>
              Cara Mudah
              <span className="block">Mengelola Keuanganmu</span>
            </h2>
          </div>

          <div className="mt-24 grid grid-cols-3 gap-12 max-md:mt-14 max-md:grid-cols-1">
            {steps.map((step, index) => (
              <article key={step.title} className="text-center">
                <div className="mx-auto mb-8 flex h-[58px] w-[58px] items-center justify-center rounded-md bg-[#0C3954] font-['Plus_Jakarta_Sans',sans-serif] text-[28px] font-extrabold text-[#F8F9FA]">
                  {index + 1}
                </div>
                <h3 className={`${headingClass} mx-auto max-w-[260px] text-[15px] leading-6 text-[#333333]`}>
                  {step.title}
                </h3>
                <p className="mx-auto mt-5 max-w-[270px] text-[11px] leading-5 text-[#333333]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 max-md:py-14">
        <div className={`${shellClass} max-w-[760px]`}>
          <h2 className={`${sectionHeadingClass} text-center`}>
            Masih ada Pertanyaan? Kami Punya Jawabannya
          </h2>

          <div className="mt-10 grid gap-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article
                  key={faq.question}
                  className={`overflow-hidden rounded-[14px] bg-white shadow-[0_12px_30px_rgba(12,57,84,0.06)] transition ${
                    isOpen ? "border border-[#9DCCE6] bg-[#F4FAFF]" : "border border-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex min-h-[64px] w-full items-center justify-between gap-5 border-0 bg-transparent px-6 py-4 text-left text-[20px] font-extrabold leading-snug text-[#1D2430] max-sm:min-h-[56px] max-sm:px-4 max-sm:text-[15px]"
                  >
                    <span>{faq.question}</span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1D2430] shadow-[0_4px_12px_rgba(12,57,84,0.08)]">
                      <i className={`${isOpen ? "ri-subtract-line" : "ri-add-line"} text-[20px]`} aria-hidden="true"></i>
                    </span>
                  </button>
                  {isOpen && (
                    <p className="m-0 max-w-[680px] px-6 pb-6 text-[15px] leading-7 text-[#808891] max-sm:px-4 max-sm:text-[13px] max-sm:leading-6">
                      {faq.answer}
                    </p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-[130px] pt-12 max-md:pb-20">
        <div className={shellClass}>
          <div className="min-h-[360px] rounded-xl bg-[#124170] max-md:min-h-[240px]" />
        </div>
      </section>

      <footer className="min-h-[250px] bg-[#0C3954]" />
    </main>
  );
};

export default OnePage;
