import React, { useState } from "react";
import { HelpCircle, ChevronDown, MessageCircle, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        className={`relative rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer ${
          isOpen
            ? "border-[#1E3A8A]/25 dark:border-sky-500/30 shadow-md shadow-blue-500/8"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md"
        } bg-white dark:bg-slate-900`}
        onClick={onToggle}
      >
        {/* Top gradient accent bar — visible when open */}
        <div
          className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#1E3A8A] via-sky-400 to-emerald-400 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Question Row */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div
            className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center transition-colors duration-300 ${
              isOpen
                ? "bg-[#1E3A8A] text-white shadow-sm shadow-blue-500/20"
                : "bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-sky-400"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold leading-snug transition-colors duration-200 ${
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
            className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors duration-200 ${
              isOpen
                ? "bg-blue-50 dark:bg-blue-950/60 text-[#1E3A8A] dark:text-sky-400"
                : "text-slate-400"
            }`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
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
              <div className="px-4 pb-4 pl-[46px]">
                <div className="w-full h-px bg-gradient-to-r from-blue-100 dark:from-blue-900/40 to-transparent mb-3" />
                <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
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
      question: "Apa bedanya SADAR dengan aplikasi pencatat keuangan biasa?",
      answer:
        "Aplikasi biasa mengharuskan kamu mencatat transaksi satu per satu secara manual. SADAR mengotomatiskan semuanya: foto struk, AI langsung mencatat dan mengelompokkannya.",
    },
    {
      id: "faq-2",
      question: "Apakah data transaksi dan privasi saya terjamin aman?",
      answer:
        "Ya. Semua data dienkripsi AES-256, terisolasi per pengguna, tidak pernah dijual ke pihak ketiga, dan bebas dari iklan.",
    },
    {
      id: "faq-3",
      question: "Bagaimana cara kerja ekstraksi struk belanja (AI OCR)?",
      answer:
        "Cukup foto struk dari kasir. AI mendeteksi merchant, tanggal, dan nominal, lalu mengelompokkannya ke pos alokasi 50/30/20 secara otomatis. Kamu tetap bisa mengoreksinya sebelum disimpan.",
    },
    {
      id: "faq-4",
      question: "Apakah SADAR cocok untuk mahasiswa dan pekerja first-jobber?",
      answer:
        "Sangat cocok. Formula 50/30/20 yang simpel membantu siapa saja membangun kebiasaan finansial sehat tanpa perlu memahami teori keuangan.",
    },
    {
      id: "faq-5",
      question: "Apakah bisa mengelola beberapa rekening bank dan e-wallet sekaligus?",
      answer:
        "Bisa. Tambahkan saldo dari dompet tunai, rekening bank (BCA, Mandiri, BRI, BNI), hingga e-wallet (GoPay, OVO, DANA). Net worth terhitung otomatis dan real-time.",
    },
    {
      id: "faq-6",
      question: "Apakah SADAR benar-benar gratis?",
      answer:
        "Ya, sepenuhnya gratis dan tanpa iklan. Semua fitur bisa langsung dicoba tanpa kartu kredit.",
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs border border-blue-100 dark:border-blue-900/40">
            <HelpCircle className="w-3.5 h-3.5" />
            FAQ
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            <span className="text-slate-900 dark:text-white">Sering </span>
            <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">
              Ditanyakan
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
            Jawaban cepat seputar keamanan data, fitur OCR struk, dan metode anggaran SADAR.
          </p>
        </motion.div>

        {/* FAQ Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4 items-start">
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
          <a
            href="mailto:halo@sadarfinance.com"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1A3175] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Mail className="w-4 h-4" />
            Hubungi Kami
          </a>
        </motion.div>
      </div>
    </section>
  );
};
