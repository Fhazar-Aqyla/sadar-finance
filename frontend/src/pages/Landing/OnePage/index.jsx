import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedTextCycle from "@/Components/ui/animated-text-cycle";
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

const OnePage = () => {
  const [openFaq, setOpenFaq] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.title = "SADAR Finance | Manajemen Keuangan Cerdas";
  }, []);

  return (
    <main className={`${bodyClass} min-h-screen overflow-hidden bg-[#F8FBFF]`}>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#DDE8F2] bg-white shadow-[0_10px_30px_rgba(12,57,84,0.08)]">
        <div className={`${shellClass} flex min-h-[86px] items-center justify-between gap-6 max-md:min-h-[68px]`}>
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

          <div className="flex shrink-0 items-center gap-3">
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

      <section id="home" className="relative overflow-hidden bg-white pb-[190px] pt-[182px] max-lg:pb-[148px] max-md:pt-[116px]">
        <div className={`${shellClass} relative z-10 grid grid-cols-[0.86fr_1.14fr] items-start gap-20 max-xl:gap-16 max-lg:grid-cols-1 max-lg:gap-10`}>
          <div className="pt-14 max-xl:pt-10 max-lg:pt-0">
            <h1 className={`${headingClass} m-0 text-[56px] leading-[1.12] max-xl:text-[50px] max-sm:text-[36px]`}>
              Pantau Uangmu
              <span className="block !text-[#64AB88]">
                Bangun{" "}
                <AnimatedTextCycle
                  words={["Masa Depanmu", "Keuanganmu", "Tabunganmu", "Impianmu"]}
                  interval={3000}
                  className="!font-extrabold !text-[#64AB88]"
                />
              </span>
            </h1>
            <p className="mb-7 mt-5 max-w-[560px] text-[16px] leading-8 text-[#333333] max-xl:text-[14px] max-xl:leading-7">
              Pantau, analisis, dan pahami pengeluaranmu dengan bantuan cerdas agar kamu bisa
              menghindari pengeluaran berlebihan dan lebih mengontrol keuangan.
            </p>
            <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-3">
              <Link to="/register" className={primaryButtonClass}>
                Mulai Sekarang
                <i className="ri-arrow-right-line text-[13px]" aria-hidden="true"></i>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex min-h-8 items-center gap-2 text-[11px] font-semibold text-[#0C3954] no-underline"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#0C3954]">
                  <i className="ri-play-fill text-[10px]" aria-hidden="true"></i>
                </span>
                Lihat Cara Kerja
              </a>
            </div>
          </div>

          <div className="h-[475px] rounded-[18px] bg-[#D9D9D9] shadow-[0_8px_14px_rgba(51,51,51,0.28)] max-xl:h-[420px] max-lg:h-[320px] max-sm:h-[240px]" />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[265px] max-md:h-[170px]" aria-hidden="true">
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1440 260"
            preserveAspectRatio="none"
          >
            <path
              d="M0 102C110 76 210 48 318 34C430 19 552 38 670 34C792 30 900 5 1016 6C1144 7 1247 36 1366 18C1396 13 1420 4 1440 -6V260H0V102Z"
              fill="#64AB88"
              fillOpacity="0.16"
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

      <section id="features" className="relative z-10 bg-[#F8FBFF] py-24 max-md:py-16">
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
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64AB88]">Langkah 01</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>Catat transaksi harian</h3>
                <p className="mt-2 max-w-[280px] text-[12px] leading-5 text-[#7A8795]">
                  Masukkan pemasukan dan pengeluaran tanpa format rumit. SADAR menangkap nominal, catatan, dan waktunya.
                </p>
              </div>
            </div>

            <div className={compactCardClass}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64AB88]">Langkah 02</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>Data dirapikan otomatis</h3>
                <p className="mt-2 max-w-[280px] text-[12px] leading-5 text-[#7A8795]">
                  Transaksi dipetakan ke kategori yang tepat, lalu saldo dan histori bulanan ikut diperbarui.
                </p>
              </div>
            </div>

            <div className={compactCardClass}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64AB88]">Langkah 03</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>Anggaran dijaga langsung</h3>
                <p className="mt-2 max-w-[280px] text-[12px] leading-5 text-[#7A8795]">
                  Batas tiap kategori dipantau, jadi kamu tahu kapan harus mulai mengurangi pengeluaran.
                </p>
              </div>
            </div>

            <div className={`${compactCardClass} col-span-2 max-sm:col-span-1`}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64AB88]">Langkah 04</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>Pola keuangan mulai kebaca</h3>
                <p className="mt-2 max-w-[430px] text-[12px] leading-5 text-[#7A8795]">
                  Tampilan dasbor membantu kamu melihat arus kas, lonjakan pengeluaran, dan progres tabungan dalam satu pandangan.
                </p>
              </div>
            </div>

            <div className={compactCardClass}>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#64AB88]">Langkah 05</span>
                <h3 className={`${headingClass} mt-2 text-[16px] leading-[1.25] text-[#17212B]`}>Wawasan jadi aksi</h3>
                <p className="mt-2 max-w-[280px] text-[12px] leading-5 text-[#7A8795]">
                  SADAR memberi ringkasan kondisi, peringatan, dan rekomendasi kecil untuk keputusan berikutnya.
                </p>
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
