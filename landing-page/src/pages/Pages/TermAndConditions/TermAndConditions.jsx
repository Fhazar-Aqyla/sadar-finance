import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import sadarLogo from "@/assets/images/landing/sadar-logo.png";
import { FooterSection } from "../../Landing/OnePage/components/FooterSection";

const TermAndConditions = () => {
  useEffect(() => {
    document.title = "Syarat & Ketentuan | SADAR Finance";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="SADAR Finance">
            <img src={sadarLogo} alt="SADAR Finance" className="h-7 w-auto object-contain" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#0A1E36] to-[#1E3A8A] p-8 sm:p-10 text-white">
            <h1 className="text-2xl sm:text-3xl font-black">Syarat & Ketentuan</h1>
            <p className="mt-1 text-sm text-blue-100">SADAR Finance · Smart Personal Finance</p>
          </div>
          <div className="p-6 sm:p-10 space-y-6 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Ketentuan Umum</h2>
              <p>
                Dengan menggunakan platform SADAR Finance, Anda menyetujui Syarat & Ketentuan ini. SADAR Finance menyediakan pencatatan transaksi, scan struk otomatis, simulasi budget 50/30/20, serta analisis keuangan pribadi.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Akun & Keamanan</h2>
              <p>
                Pengguna bertanggung jawab penuh atas kerahasiaan akun dan kata sandi. Dilarang menyalahgunakan API atau mengganggu integritas infrastruktur sistem SADAR Finance.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Privasi & Data Finansial</h2>
              <p>
                Pengelolaan data pengguna mengikuti <Link to="/privacy-policy" className="text-[#1E3A8A] dark:text-sky-400 underline font-semibold">Kebijakan Privasi</Link> SADAR Finance.
              </p>
            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Batasan Tanggung Jawab</h2>
              <p>
                Analisis, grafik, dan skor kesehatan finansial bersifat informatif dan bukan nasihat investasi resmi. Keputusan finansial tetap menjadi tanggung jawab pengguna.
              </p>
            </section>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 justify-end">
              <Link
                to="/install"
                className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white text-sm font-bold"
              >
                Instal Aplikasi
              </Link>
              <Link
                to="/"
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default TermAndConditions;
