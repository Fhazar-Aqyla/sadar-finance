import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Hero } from "@/Components/ui/animated-hero";
import { ContainerScroll } from "@/Components/ui/container-scroll-animation";
import { GradientBackground } from "@/Components/ui/gradient-background";
import sadarLogo from "../../../assets/images/landing/sadar-logo.png";
import girlPhone from "../../../assets/images/landing/cewek-hp.png";
import boyLaptop from "../../../assets/images/landing/cowok-laptop.png";

const navItems = [
  { label: "Beranda", href: "#home" },
  { label: "Fitur", href: "#features" },
  { label: "Manfaat", href: "#benefits" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const faqs = [
  {
    question: "Apa itu SADAR Finance?",
    answer: "SADAR Finance adalah aplikasi manajemen keuangan personal untuk mencatat transaksi, membaca pola pengeluaran, dan memberi wawasan agar kamu lebih sadar saat mengatur uang.",
  },
  {
    question: "Apakah SADAR bisa mengelompokkan transaksi otomatis?",
    answer: "Bisa. Data transaksi dapat dibantu kecerdasan buatan untuk masuk ke kategori seperti makan, transportasi, belanja, tagihan, dan tabungan.",
  },
  {
    question: "Apakah cocok untuk mahasiswa dan pekerja?",
    answer: "Cocok. SADAR dirancang untuk kebutuhan harian, mulai dari memantau uang saku, gaji bulanan, anggaran kategori, sampai progres tabungan.",
  },
  {
    question: "Apakah saya bisa mengatur batas anggaran?",
    answer: "Bisa. Kamu dapat menentukan batas untuk kategori tertentu agar pengeluaran lebih mudah dipantau setiap bulan.",
  },
  {
    question: "Apakah data keuangan saya aman?",
    answer: "Data keuangan dibuat untuk dikelola secara pribadi dan hanya digunakan untuk membantu pencatatan, ringkasan, dan analisis di akunmu.",
  },
];

const shellClass = "mx-auto w-[min(calc(100%_-_96px),1360px)] max-lg:w-[min(calc(100%_-_48px),1080px)] max-sm:w-[min(calc(100%_-_28px),1080px)]";
const headingClass =
  "font-['Plus_Jakarta_Sans',sans-serif] !font-extrabold tracking-normal !text-[#0C3954]";
const sectionHeadingClass = `${headingClass} m-0 text-[40px] leading-[1.18] max-md:text-[32px] max-sm:text-[28px]`;
const bodyClass = "font-['Inter',sans-serif] text-[#333333]";
const primaryButtonClass =
  "inline-flex min-h-8 items-center justify-center rounded-md bg-[#0C3954] px-4 text-[11px] font-bold !text-white no-underline shadow-[0_10px_22px_rgba(12,57,84,0.18)] transition hover:-translate-y-0.5 hover:bg-[#124170] hover:!text-white";
const sectionBadgeClass =
  "mb-5 inline-flex min-h-7 items-center justify-center rounded-full border border-[#DDE6EF] bg-white px-6 text-[12px] font-bold text-[#0C3954] shadow-[0_4px_14px_rgba(12,57,84,0.05)]";
const cardClass =
  "rounded-[28px] border border-[#DDE8F2] bg-white p-8 shadow-[0_18px_46px_rgba(12,57,84,0.09)]";
const compactCardClass =
  "relative overflow-hidden rounded-[14px] border border-[#DDE8F2] bg-white p-5 shadow-[0_14px_34px_rgba(12,57,84,0.08)]";
const stepLabelClass = "text-[10px] font-bold uppercase tracking-[0.12em] text-[#64AB88]";
const stepTitleClass = `${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`;
const stepBodyClass = "mt-2 max-w-[280px] text-[12px] leading-5 text-[#7A8795]";

const DashboardPreview = () => <div className="h-full w-full bg-[#F8FBFF]" />;

const StepTransactionPreview = () => (
  <div className="mt-5 grid gap-2">
    {[
      { icon: "ri-arrow-down-line", label: "Gaji freelance", amount: "+Rp 1,8 jt", tone: "text-[#64AB88]", bg: "bg-[#EAF6F0]" },
      { icon: "ri-cup-line", label: "Kopi & makan", amount: "-Rp 86 rb", tone: "text-[#D86B5D]", bg: "bg-[#FFF0ED]" },
    ].map((item) => (
      <div key={item.label} className="flex h-11 items-center gap-3 rounded-[10px] border border-[#E6EEF5] bg-[#FBFDFF] px-3">
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${item.bg} ${item.tone}`}>
          <i className={`${item.icon} text-[15px]`} aria-hidden="true"></i>
        </span>
        <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-[#334155]">{item.label}</span>
        <span className={`text-[11px] font-bold ${item.tone}`}>{item.amount}</span>
      </div>
    ))}
  </div>
);

const StepCategoryPreview = () => (
  <div className="mt-5 grid grid-cols-2 gap-2">
    {[
      ["Makan", "42%", "bg-[#64AB88]"],
      ["Transport", "24%", "bg-[#124170]"],
      ["Tagihan", "21%", "bg-[#78B7D8]"],
      ["Tabungan", "13%", "bg-[#F0B86E]"],
    ].map(([label, value, color]) => (
      <div key={label} className="rounded-[10px] border border-[#E6EEF5] bg-[#FBFDFF] p-3">
        <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-[#334155]">
          <span className="truncate">{label}</span>
          <span>{value}</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E8F0F7]">
          <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
        </div>
      </div>
    ))}
  </div>
);

const StepBudgetPreview = () => (
  <div className="mt-5 grid gap-3">
    {[
      ["Makan", "78%", "bg-[#64AB88]"],
      ["Belanja", "91%", "bg-[#D86B5D]"],
    ].map(([label, value, color]) => (
      <div key={label}>
        <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-[#334155]">
          <span>{label}</span>
          <span>{value}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[#E8F0F7]">
          <div className={`h-full rounded-full ${color}`} style={{ width: value }} />
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
          <p className="m-0 text-[10px] font-bold uppercase tracking-[0.1em] text-[#7A8795]">Cashflow</p>
          <p className="m-0 mt-1 text-[18px] font-extrabold text-[#0C3954]">+Rp 620 rb</p>
        </div>
        <span className="rounded-full bg-[#EAF6F0] px-2 py-1 text-[10px] font-bold text-[#64AB88]">+12%</span>
      </div>
      <div className="mt-5 flex h-24 items-end gap-2">
        {[44, 68, 52, 78, 60, 88, 72].map((height, index) => (
          <span
            key={height + index}
            className={`flex-1 rounded-t-md ${index % 2 === 0 ? "bg-[#64AB88]" : "bg-[#124170]"}`}
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
    </div>

    <div className="grid gap-2">
      {[
        ["Saldo aktif", "Rp 4,2 jt", "ri-wallet-3-line"],
        ["Tabungan", "Rp 1,1 jt", "ri-piggy-bank-line"],
        ["Pengeluaran", "Rp 2,5 jt", "ri-line-chart-line"],
      ].map(([label, value, icon]) => (
        <div key={label} className="flex items-center gap-3 rounded-[12px] border border-[#E6EEF5] bg-white px-3 py-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EEF7F3] text-[#64AB88]">
            <i className={`${icon} text-[16px]`} aria-hidden="true"></i>
          </span>
          <div className="min-w-0">
            <p className="m-0 truncate text-[10px] font-semibold text-[#7A8795]">{label}</p>
            <p className="m-0 text-[13px] font-extrabold text-[#0C3954]">{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StepInsightPreview = () => (
  <div className="mt-5 grid gap-2">
    <div className="rounded-[12px] border border-[#DDE8F2] bg-[#FBFDFF] p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#EAF6F0] text-[#64AB88]">
          <i className="ri-lightbulb-flash-line text-[16px]" aria-hidden="true"></i>
        </span>
        <div>
          <p className="m-0 text-[11px] font-extrabold text-[#0C3954]">Kurangi jajan 15%</p>
          <p className="m-0 mt-1 text-[10px] leading-4 text-[#7A8795]">Target tabungan bulan ini bisa naik Rp 180 rb.</p>
        </div>
      </div>
    </div>
    <div className="rounded-[12px] bg-[#0C3954] px-3 py-2 text-[10px] font-semibold text-white">
      Rekomendasi siap dipakai di keputusan berikutnya
    </div>
  </div>
);

const OnePage = () => {
  const [openFaq, setOpenFaq] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "SADAR Finance | Manajemen Keuangan Cerdas";
  }, []);

  return (
    <main className={`${bodyClass} min-h-screen overflow-hidden bg-[#F8FBFF]`}>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#DDE8F2] bg-white shadow-[0_10px_30px_rgba(12,57,84,0.08)]">
        <div className={`${shellClass} grid min-h-[86px] grid-cols-[1fr_auto_1fr] items-center gap-6 max-lg:grid-cols-[1fr_auto] max-md:min-h-[68px]`}>
          <Link to="/" aria-label="SADAR Finance" className="inline-flex shrink-0 items-center no-underline">
            <img src={sadarLogo} alt="SADAR" className="h-[21px] w-auto" />
          </Link>

          <nav className="hidden items-center justify-center gap-8 lg:flex" aria-label="Menu landing page">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="group relative py-2 text-[12px] font-semibold !text-[#0C3954] no-underline transition hover:!text-[#124170]"
              >
                {item.label}
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-[#64AB88] transition duration-300 group-hover:scale-x-100" />
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center justify-end gap-3">
            <Link to="/login" className="text-[12px] font-semibold !text-[#0C3954] no-underline hover:!text-[#124170]">
              Masuk
            </Link>
            <Link to="/register" className={`${primaryButtonClass} min-w-[118px] max-sm:hidden`}>
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
                className="rounded-md px-3 py-2 text-[13px] font-semibold !text-[#0C3954] no-underline hover:bg-[#F8FBFF] hover:!text-[#124170]"
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
          <Hero />

          <ContainerScroll>
            <DashboardPreview />
          </ContainerScroll>
        </div>
      </div>

      <section id="features" className="relative z-10 bg-[#F8FBFF] pb-24 pt-14 max-md:py-16">
        <div className={shellClass}>
          <div className="mx-auto max-w-[680px] text-center">
            <span className={sectionBadgeClass}>Fitur SADAR</span>
            <h2 className={sectionHeadingClass}>
              Lebih dari Sekadar <span className="!text-[#64AB88]">Mencatat Keuangan</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[440px] text-[13px] leading-6 text-[#333333]">
              Semua dirancang untuk membantumu lebih sadar, lebih terkontrol,
              dan lebih bijak dalam mengelola uangmu secara lebih efektif.
            </p>
          </div>

          <div className="mx-auto mt-11 grid max-w-[1080px] gap-3">
            <div className="grid grid-cols-[0.82fr_1.28fr] gap-3 max-lg:grid-cols-1">
              <article className={`${cardClass} min-h-[318px]`}>
                <div className="mb-14 h-[102px] rounded-[22px] border border-dashed border-[#D5E2EF] bg-[#FBFDFF]" />
                <h3 className={`${headingClass} m-0 text-[17px] leading-snug`}>Input Transaksi Cerdas</h3>
                <p className="mt-3 mb-0 max-w-[280px] text-[12px] leading-5 text-[#667585]">
                  Catat pemasukan dan pengeluaran harian dengan cepat, rapi, dan mudah ditinjau ulang.
                </p>
              </article>

              <article className={`${cardClass} min-h-[318px]`}>
                <h3 className={`${headingClass} m-0 text-[17px] leading-snug`}>Wawasan Pengeluaran Otomatis</h3>
                <p className="mt-3 mb-0 max-w-[300px] text-[12px] leading-5 text-[#667585]">
                  SADAR membaca pola transaksi lalu menampilkan ringkasan yang membantu kamu mengambil keputusan.
                </p>
                <div className="mt-10 h-[104px] rounded-[18px] border border-[#E5EDF5] bg-[#FBFDFF] shadow-[0_12px_28px_rgba(12,57,84,0.04)]" />
              </article>
            </div>

            <div className="grid grid-cols-[1.28fr_0.82fr] gap-3 max-lg:grid-cols-1">
              <article className={`${cardClass} min-h-[318px]`}>
                <div className="mx-auto mb-14 h-[96px] max-w-[560px] rounded-[18px] border border-[#E5EDF5] bg-[#FBFDFF] shadow-[0_12px_28px_rgba(12,57,84,0.04)]" />
                <h3 className={`${headingClass} m-0 text-[17px] leading-snug`}>Penjaga Anggaran</h3>
                <p className="mt-3 mb-0 max-w-[520px] text-[12px] leading-5 text-[#667585]">
                  Tetapkan batas anggaran dan dapatkan sinyal lebih awal saat pengeluaran mulai mendekati batas.
                </p>
              </article>

              <article className={`${cardClass} min-h-[318px]`}>
                <h3 className={`${headingClass} m-0 text-[17px] leading-snug`}>Skor Kesehatan Keuangan</h3>
                <p className="mt-3 mb-0 max-w-[320px] text-[12px] leading-5 text-[#667585]">
                  Lihat gambaran kondisi finansial dari arus kas, kebiasaan belanja, dan progres tabungan.
                </p>
                <div className="mt-10 h-[118px] rounded-[18px] border border-[#E5EDF5] bg-[#FBFDFF]" />
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="bg-white pb-24 pt-8 max-md:pb-16">
        <div className={shellClass}>
          <div className="mx-auto max-w-[760px] text-center">
            <span className={sectionBadgeClass}>Manfaat</span>
            <h2 className={sectionHeadingClass}>
              Dengan <span className="!text-[#64AB88]">SADAR</span>, Kamu Bisa
            </h2>
            <p className="mx-auto mt-4 max-w-[600px] text-[14px] leading-7 text-[#333333]">
              Dari pencatatan transaksi hingga wawasan otomatis, semua dirancang
              untuk membantu kamu memahami dan mengontrol keuanganmu dengan lebih baik.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-[1100px] grid-cols-[250px_240px_240px_250px] items-end justify-center gap-10 max-xl:grid-cols-[235px_225px_225px_235px] max-xl:gap-8 max-lg:grid-cols-2 max-lg:items-center max-md:mt-14 max-sm:grid-cols-1">
            <div className="pb-9 text-right max-lg:order-3 max-lg:text-center max-sm:order-none max-sm:pb-0">
              <h3 className={`${headingClass} m-0 text-[22px] leading-[1.22] !text-[#64AB88] max-md:text-[21px]`}>
                <span className="block whitespace-nowrap">Keputusan Finansial</span>
                <span className="block">Jadi Lebih Cerdas</span>
              </h3>
              <p className="ml-auto mt-3 max-w-[230px] text-[13px] leading-6 text-[#333333] max-lg:mx-auto">
                Wawasan otomatis membantu kamu memahami kebiasaanmu.
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
                className="absolute bottom-0 left-1/2 z-10 h-[390px] w-auto -translate-x-[45%] max-xl:h-[370px] max-lg:h-[568px] max-lg:origin-bottom max-lg:scale-x-[4.50] max-md:h-[390px]"
              />
            </div>

            <div className="pb-9 text-left max-lg:order-4 max-lg:self-start max-lg:pt-7 max-lg:pb-0 max-lg:text-center max-sm:order-none max-sm:pt-0">
              <h3 className={`${headingClass} m-0 text-[22px] leading-[1.22] max-md:text-[21px]`}>
                <span className="block whitespace-nowrap">Lebih Tahu Kemana</span>
                <span className="block">Uangmu Pergi</span>
              </h3>
              <p className="mt-3 max-w-[240px] text-[13px] leading-6 text-[#333333] max-lg:mx-auto">
                Lihat semua pengeluaranmu dengan jelas dan tanpa tebakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#F8FBFF] pb-28 pt-24 max-md:pb-20 max-md:pt-16">
        <div className={shellClass}>
          <div className="mx-auto max-w-[640px] text-center">
            <span className={sectionBadgeClass}>Cara Kerja</span>
            <h2 className={sectionHeadingClass}>
              Cara SADAR Membantu
              <span className="block !text-[#64AB88]">Keuanganmu Tetap Terkontrol</span>
            </h2>
            <p className="mx-auto mt-4 max-w-[500px] text-[13px] leading-6 text-[#6B7280]">
              Alurnya dibuat sederhana: kamu mencatat, SADAR merapikan data, lalu wawasan dan peringatan muncul saat kamu perlu ambil keputusan.
            </p>
          </div>

          <div className="mt-10 grid auto-rows-[minmax(178px,auto)] grid-cols-3 gap-4 max-lg:auto-rows-auto max-lg:grid-cols-2 max-sm:grid-cols-1">
            <div className={compactCardClass}>
              <div>
                <span className={stepLabelClass}>Langkah 01</span>
                <h3 className={stepTitleClass}>Catat transaksi harian</h3>
                <p className={stepBodyClass}>
                  Masukkan pemasukan dan pengeluaran. Data yang dibutuhkan cukup nominal, catatan, kategori, dan tanggal transaksi.
                </p>
                <StepTransactionPreview />
              </div>
            </div>

            <div className={compactCardClass}>
              <div>
                <span className={stepLabelClass}>Langkah 02</span>
                <h3 className={stepTitleClass}>Kategori langsung kebaca</h3>
                <p className={stepBodyClass}>
                  SADAR mengelompokkan transaksi ke makan, transport, tagihan, dan tabungan supaya histori bulanan rapi.
                </p>
                <StepCategoryPreview />
              </div>
            </div>

            <div className={compactCardClass}>
              <div>
                <span className={stepLabelClass}>Langkah 03</span>
                <h3 className={stepTitleClass}>Budget dipantau real-time</h3>
                <p className={stepBodyClass}>
                  Batas tiap kategori dibandingkan dengan pengeluaran berjalan, jadi sinyal boros muncul lebih cepat.
                </p>
                <StepBudgetPreview />
              </div>
            </div>

            <div className={`${compactCardClass} col-span-2 max-sm:col-span-1`}>
              <div>
                <span className={stepLabelClass}>Langkah 04</span>
                <h3 className={stepTitleClass}>Dashboard merangkum arus kas</h3>
                <p className="mt-2 max-w-[460px] text-[12px] leading-5 text-[#7A8795]">
                  Chart dan ringkasan menampilkan saldo aktif, pemasukan, pengeluaran, serta progres tabungan dalam satu pandangan.
                </p>
                <StepDashboardPreview />
              </div>
            </div>

            <div className={compactCardClass}>
              <div>
                <span className={stepLabelClass}>Langkah 05</span>
                <h3 className={stepTitleClass}>Insight jadi rekomendasi</h3>
                <p className={stepBodyClass}>
                  Pola belanja diterjemahkan jadi saran praktis, peringatan, dan langkah kecil yang bisa langsung kamu ikuti.
                </p>
                <StepInsightPreview />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="faq" className="bg-[#F8FBFF] pb-36 pt-0 max-md:pb-24 max-md:pt-0">
        <div className={`${shellClass} max-w-[860px]`}>
          <div className="mx-auto max-w-[640px] text-center">
            <span className={sectionBadgeClass}>FAQ</span>
            <h2 className={`${sectionHeadingClass} text-center`}>
              Masih ada Pertanyaan? Kami Punya Jawabannya
            </h2>
          </div>

          <div className="mt-9 grid gap-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <article
                  key={faq.question}
                  className={`overflow-hidden rounded-[12px] bg-white shadow-[0_10px_26px_rgba(12,57,84,0.075)] transition ${
                    isOpen ? "border border-[#9DCCE6] bg-[#F4FAFF]" : "border border-[#E4ECF3]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex min-h-[56px] w-full items-center justify-between gap-4 border-0 bg-transparent px-5 py-3 text-left text-[16px] font-extrabold leading-snug !text-[#0C3954] max-sm:min-h-[52px] max-sm:px-4 max-sm:text-[14px]"
                  >
                    <span>{faq.question}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white !text-[#0C3954] shadow-[0_4px_10px_rgba(12,57,84,0.06)]">
                      <i className={`${isOpen ? "ri-subtract-line" : "ri-add-line"} text-[18px]`} aria-hidden="true"></i>
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

      <section className="pb-[130px] pt-0 max-md:pb-20 max-md:pt-0">
        <div className={shellClass}>
          <div className="min-h-[360px] rounded-xl bg-[#124170] max-md:min-h-[240px]" />
        </div>
      </section>

      <footer className="min-h-[250px] bg-[#0C3954]" />
    </main>
  );
};

export default OnePage;
