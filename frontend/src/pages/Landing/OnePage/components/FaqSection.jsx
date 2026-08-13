import React, { useState } from "react";
import { HelpCircle, ChevronDown, MessageCircle, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const FaqCard = ({ faq, isOpen, onToggle, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="group"
    >
      <div
        className={`relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer ${
          isOpen
            ? "border-[#1E3A8A]/25 dark:border-sky-500/30 shadow-lg shadow-blue-500/8"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md"
        } bg-white dark:bg-slate-900`}
        onClick={onToggle}
      >
        {/* Top gradient accent bar — visible when open */}
        <div
          className={`absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-[#1E3A8A] via-sky-400 to-emerald-400 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Question Row */}
        <div className="flex items-start gap-4 p-5 sm:p-6">
          <div
            className={`mt-0.5 w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-colors duration-300 ${
              isOpen
                ? "bg-[#1E3A8A] text-white shadow-md shadow-blue-500/20"
                : "bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-sky-400"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm sm:text-[15px] font-bold leading-snug transition-colors duration-200 ${
                isOpen
                  ? "text-[#1E3A8A] dark:text-sky-400"
                  : "text-slate-800 dark:text-slate-100 group-hover:text-[#1E3A8A] dark:group-hover:text-sky-400"
              }`}
            >
              {faq.question}
            </p>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`shrink-0 mt-1 w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-200 ${
              isOpen
                ? "bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-sky-400"
                : "text-slate-400"
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>

        {/* Answer Panel */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="answer"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 pl-[60px] sm:pl-[68px]">
                <div className="w-full h-px bg-gradient-to-r from-blue-100 dark:from-blue-900/40 to-transparent mb-4" />
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export const FaqSection = () => {
  const [openId, setOpenId] = useState("faq-1");

  const faqs = [
    {
      id: "faq-1",
      question:
        "Apa perbedaan SADAR Finance dengan aplikasi pencatat keuangan biasa?",
      answer:
        "SADAR Finance tidak sekadar mencatat transaksi secara manual, melainkan mengotomatisasi ekstraksi data dari struk kasir fisik via AI OCR, mengevaluasi skor kesehatan finansial objektif (0–100), dan memberikan peringatan proaktif sebelum kuota anggaran bulananmu mengalami overspending.",
    },
    {
      id: "faq-2",
      question: "Apakah data transaksi dan privasi saya terjamin aman?",
      answer:
        "Sangat aman. Seluruh data keuanganmu dilindungi dengan enkripsi standar industri (AES-256) dan terisolasi secara multi-tenant. SADAR Finance berkomitmen tidak menjual data pengguna ke pihak ketiga serta bebas dari gangguan iklan komersial.",
    },
    {
      id: "faq-3",
      question: "Bagaimana cara kerja ekstraksi struk belanja (AI OCR)?",
      answer:
        "Cukup ambil foto struk fisik dari kasir minimarket, kafe, SPBU, atau restoran. AI SADAR secara otomatis mendeteksi nama merchant, tanggal transaksi, total nominal, serta mengelompokkannya ke pos alokasi 50/30/20. Kamu tetap memiliki kontrol penuh untuk merevisi nominal sebelum menyimpannya.",
    },
    {
      id: "faq-4",
      question: "Apakah SADAR cocok untuk mahasiswa dan pekerja first-jobber?",
      answer:
        "Sangat cocok. SADAR dirancang dengan prinsip alokasi 50/30/20 yang simpel dan intuitif untuk membantu siapa saja membangun kebiasaan finansial yang sehat dan terbebas dari sindrom 'gaji numpang lewat'.",
    },
    {
      id: "faq-5",
      question:
        "Apakah saya bisa mengelola beberapa rekening bank dan e-wallet sekaligus?",
      answer:
        "Tentu saja. Kamu dapat menambahkan dan mengelola berbagai sumber dana sekaligus—mulai dari Dompet Tunai (Cash), Rekening Bank (BCA, Mandiri, BRI, BNI), hingga E-Wallet (GoPay, OVO, DANA). Total kekayaan bersih (Net Worth) akan terkalkulasi secara otomatis dan realtime.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-16 lg:py-24 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/60 to-white dark:from-slate-950 dark:via-slate-900/40 dark:to-slate-950 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-72 bg-blue-500/4 dark:bg-sky-400/4 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs border border-blue-100 dark:border-blue-900/40">
            <HelpCircle className="w-3.5 h-3.5" />
            Pusat Bantuan & FAQ
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-slate-900 dark:text-white">Pertanyaan yang </span>
            <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">
              Sering Diajukan
            </span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Temukan jawaban seputar keamanan data, fitur OCR struk, dan metode anggaran SADAR.
          </p>
        </motion.div>

        {/* FAQ Cards */}
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <FaqCard
              key={faq.id}
              faq={faq}
              index={index}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-950/40 dark:to-slate-900/80 border border-blue-100 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A]/10 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-sky-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Masih ada pertanyaan?
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tim kami siap membantu kamu kapan saja.
              </p>
            </div>
          </div>
          <Link
            to="/register"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Mail className="w-4 h-4" />
            Hubungi Kami
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
