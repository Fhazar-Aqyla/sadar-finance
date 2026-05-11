import React, { useState } from "react";
import { Link } from "react-router-dom";

import dashboardImage from "../../../assets/images/mac-img.png";
import userOne from "../../../assets/images/user-illustarator-1.png";
import userTwo from "../../../assets/images/user-illustarator-2.png";
import "./sadarLanding.css";

const features = [
  {
    title: "Smart Transaction Input",
    description:
      "Catat pemasukan dan pengeluaran dengan cepat, rapi, dan mudah dipantau setiap hari.",
  },
  {
    title: "Behavior Insight",
    description:
      "Pahami kebiasaan belanja dari kategori, frekuensi transaksi, dan pola pengeluaran.",
  },
  {
    title: "Auto Insight Dashboard",
    description:
      "Lihat ringkasan kondisi keuangan lewat visualisasi yang mudah dibaca.",
  },
  {
    title: "Smart Alert & Score",
    description:
      "Dapatkan peringatan risiko overspending dan skor kesehatan finansial.",
  },
];

const steps = [
  {
    title: "Catat Transaksi dengan Mudah Tanpa Ribet",
    description:
      "Masukkan pemasukan dan pengeluaran secara cepat melalui input manual atau upload struk.",
  },
  {
    title: "Pantau, Analisis, dan Pahami Keuanganmu",
    description:
      "Lihat ringkasan, tren, kategori dominan, dan insight yang membantu membaca kebiasaan finansial.",
  },
  {
    title: "Kontrol Pengeluaran dan Kondisi Finansial",
    description:
      "Gunakan budget, alert, dan health score untuk menjaga arus kas tetap sehat.",
  },
];

const bentoItems = [
  {
    className: "bento-wide",
    icon: "ri-bank-card-line",
    title: "Kelola transaksi harian",
    text: "Semua catatan pengeluaran dan pemasukan tersusun dalam satu tempat.",
  },
  {
    icon: "ri-line-chart-line",
    title: "Lihat tren bulanan",
    text: "Pantau perubahan arus kas dari waktu ke waktu.",
  },
  {
    className: "bento-tall",
    icon: "ri-receipt-line",
    title: "Upload struk",
    text: "Simpan bukti transaksi sebagai dasar pencatatan otomatis.",
  },
  {
    icon: "ri-pie-chart-2-line",
    title: "Kategori otomatis",
    text: "Bantu kelompokkan transaksi agar analisis lebih mudah.",
  },
  {
    className: "bento-wide",
    icon: "ri-shield-check-line",
    title: "Health score",
    text: "Ukur kesehatan finansial dari kebiasaan transaksi dan budget.",
  },
  {
    icon: "ri-notification-3-line",
    title: "Smart alert",
    text: "Dapatkan sinyal saat pengeluaran mulai tidak terkendali.",
  },
  {
    icon: "ri-wallet-3-line",
    title: "Budget planner",
    text: "Atur batas belanja dan pantau sisa ruang finansial.",
  },
  {
    className: "bento-wide",
    icon: "ri-brain-line",
    title: "AI financial insight",
    text: "Insight praktis untuk memahami keputusan finansial berikutnya.",
  },
];

const faqs = [
  {
    question: "Apakah SADAR bisa mencatat pemasukan dan pengeluaran?",
    answer:
      "Bisa. SADAR menyediakan fitur transaksi dan pemasukan agar arus kas pribadi lebih mudah dipantau.",
  },
  {
    question: "Apakah upload struk sudah didukung?",
    answer:
      "Backend sudah menyediakan flow OCR untuk upload struk dan riwayat scan sebagai fondasi otomatisasi pencatatan.",
  },
  {
    question: "Apa fungsi health score?",
    answer:
      "Health score membantu membaca kondisi finansial berdasarkan pola transaksi, budget, dan risiko overspending.",
  },
  {
    question: "Apakah project ini punya API documentation?",
    answer:
      "Ya. Backend menyediakan Swagger UI di /api-docs saat server berjalan.",
  },
];

const OnePage = () => {
  const [openFaq, setOpenFaq] = useState(0);

  document.title = "SADAR Finance | Smart Finance Management";

  return (
    <main className="sadar-page">
      <header className="sadar-header">
        <Link to="/" className="sadar-logo" aria-label="SADAR Finance">
          SADAR
        </Link>
        <nav className="sadar-nav" aria-label="Navigasi utama">
          <a href="#features">Fitur</a>
          <a href="#benefits">Manfaat</a>
          <a href="#how-it-works">Cara Kerja</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="sadar-header-actions">
          <Link to="/login" className="sadar-link">
            Masuk
          </Link>
          <Link to="/register" className="sadar-button sadar-button-primary">
            Mulai Sekarang
          </Link>
        </div>
      </header>

      <section className="sadar-hero" id="hero">
        <div className="sadar-shell sadar-hero-grid">
          <div className="sadar-hero-copy">
            <p className="sadar-eyebrow">Smart finance companion</p>
            <h1>
              Track Your Money
              <span>Build Your Future</span>
            </h1>
            <p>
              Pantau, analisis, dan pahami pengeluaranmu dengan AI agar kamu
              bisa menghindari overspending dan mengambil keputusan finansial
              yang lebih baik.
            </p>
            <div className="sadar-hero-actions">
              <Link to="/register" className="sadar-button sadar-button-primary">
                Mulai Sekarang
              </Link>
              <a href="#how-it-works" className="sadar-button sadar-button-ghost">
                <i className="ri-play-circle-line" aria-hidden="true"></i>
                Lihat Demo
              </a>
            </div>
          </div>

          <div className="sadar-hero-card" aria-label="Preview dashboard SADAR Finance">
            <img src={dashboardImage} alt="Preview dashboard SADAR Finance" />
            <div className="sadar-stat-card sadar-stat-income">
              <span>Pemasukan</span>
              <strong>+18%</strong>
            </div>
            <div className="sadar-stat-card sadar-stat-risk">
              <span>Risk Alert</span>
              <strong>Low</strong>
            </div>
          </div>
        </div>
        <div className="sadar-wave sadar-wave-soft"></div>
        <div className="sadar-wave sadar-wave-main"></div>
        <div className="sadar-wave sadar-wave-deep"></div>
      </section>

      <section className="sadar-section" id="features">
        <div className="sadar-shell">
          <div className="sadar-section-heading">
            <h2>
              Lebih dari Sekadar <span>Mencatat Keuangan</span>
            </h2>
            <p>
              SADAR dirancang untuk membantu kamu lebih sadar, lebih terkontrol,
              dan lebih bijak dalam mengelola uangmu secara lebih efektif.
            </p>
          </div>

          <div className="sadar-feature-grid">
            {features.map((feature) => (
              <article className="sadar-feature-card" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sadar-section sadar-benefit-section" id="benefits">
        <div className="sadar-shell">
          <div className="sadar-section-heading">
            <h2>
              Dengan <span>SADAR</span>, Kamu Bisa
            </h2>
            <p>
              Dari pencatatan transaksi hingga insight otomatis, semua dirancang
              untuk membantu kamu memahami dan mengontrol keuangan dengan lebih
              baik.
            </p>
          </div>

          <div className="sadar-benefit-grid">
            <div className="sadar-benefit-text sadar-benefit-left">
              <h3>Keputusan Finansial Jadi Lebih Cerdas</h3>
              <p>
                Insight otomatis membantu kamu memahami kebiasaanmu sebelum
                mengambil keputusan.
              </p>
            </div>
            <div className="sadar-person-card sadar-person-one">
              <img src={userOne} alt="Pengguna memantau transaksi SADAR" />
            </div>
            <div className="sadar-person-card sadar-person-two">
              <img src={userTwo} alt="Pengguna menganalisis dashboard SADAR" />
            </div>
            <div className="sadar-benefit-text sadar-benefit-right">
              <h3>Lebih Tahu Kemana Uangmu Pergi</h3>
              <p>
                Lihat semua pengeluaran dengan jelas dan tanpa tebakan.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="sadar-section" id="how-it-works">
        <div className="sadar-shell">
          <div className="sadar-section-heading sadar-narrow-heading">
            <h2>Cara Mudah Mengelola Keuanganmu</h2>
          </div>

          <div className="sadar-step-grid">
            {steps.map((step, index) => (
              <article className="sadar-step" key={step.title}>
                <div className="sadar-step-number">{index + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sadar-section sadar-bento-section" aria-label="Highlight fitur SADAR">
        <div className="sadar-shell">
          <div className="sadar-bento-grid">
            {bentoItems.map((item) => (
              <article className={`sadar-bento-card ${item.className || ""}`} key={item.title}>
                <i className={item.icon} aria-hidden="true"></i>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sadar-section" id="faq">
        <div className="sadar-shell sadar-faq-shell">
          <div className="sadar-section-heading">
            <h2>Masih ada Pertanyaan? Kami Punya Jawabannya</h2>
          </div>

          <div className="sadar-faq-list">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <article className={`sadar-faq-item ${isOpen ? "is-open" : ""}`} key={faq.question}>
                  <button type="button" onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                    <span>{faq.question}</span>
                    <i className={isOpen ? "ri-subtract-line" : "ri-add-line"} aria-hidden="true"></i>
                  </button>
                  {isOpen && <p>{faq.answer}</p>}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="sadar-cta" id="cta">
        <div className="sadar-shell">
          <div className="sadar-cta-panel">
            <div>
              <p className="sadar-eyebrow">Mulai lebih sadar hari ini</p>
              <h2>Bangun kebiasaan finansial yang lebih sehat bersama SADAR.</h2>
            </div>
            <Link to="/register" className="sadar-button sadar-button-light">
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </section>

      <footer className="sadar-footer">
        <div className="sadar-shell sadar-footer-grid">
          <div>
            <Link to="/" className="sadar-logo sadar-footer-logo">
              SADAR
            </Link>
            <p>
              Smart AI-Driven Automated Receipt & Finance Management untuk
              membantu pengguna mencatat, memahami, dan mengontrol keuangan.
            </p>
          </div>
          <div>
            <h3>Produk</h3>
            <a href="#features">Fitur</a>
            <a href="#benefits">Manfaat</a>
            <a href="#how-it-works">Cara Kerja</a>
          </div>
          <div>
            <h3>Akses</h3>
            <Link to="/login">Masuk</Link>
            <Link to="/register">Daftar</Link>
            <a href="#faq">FAQ</a>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default OnePage;
