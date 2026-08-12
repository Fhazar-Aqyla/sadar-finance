import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/Components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const FaqSection = () => {
  const faqs = [
    {
      id: "faq-1",
      question:
        "Apa perbedaan SADAR Finance dengan aplikasi pencatat keuangan biasa?",
      answer:
        "SADAR Finance tidak hanya mencatat nominal, tetapi juga membantu ekstraksi data dari struk belanja fisik via OCR, mengevaluasi skor kesehatan keuangan secara objektif (0–100), dan memberikan peringatan dini jika laju pengeluaran bulananmu berpotensi overspending sebelum akhir bulan.",
    },
    {
      id: "faq-2",
      question: "Apakah data transaksi dan privasi saya aman?",
      answer:
        "Sangat aman. Seluruh data keuanganmu terenkripsi dan terisolasi secara multi-tenant. SADAR Finance tidak menjual data pengguna ke pihak ketiga dan tidak menampilkan iklan berisik.",
    },
    {
      id: "faq-3",
      question: "Bagaimana cara kerja ekstraksi struk belanja (OCR)?",
      answer:
        "Cukup ambil foto struk belanjaanmu dari minimarket, kafe, SPBU, atau restoran. AI SADAR secara otomatis mendeteksi nama toko, tanggal, total nominal, dan mengkategorikannya ke pos Needs atau Wants. Kamu tetap bisa mengedit nominalnya sebelum disimpan.",
    },
    {
      id: "faq-4",
      question: "Apakah cocok untuk mahasiswa dan pekerja first-jobber?",
      answer:
        "Sangat cocok! SADAR dirancang dengan prinsip metode alokasi 50/30/20 yang simpel untuk membantu siapa saja yang ingin menghindari sindrom 'gaji numpang lewat'.",
    },
    {
      id: "faq-5",
      question:
        "Apakah saya bisa menghubungkan beberapa rekening dan e-wallet?",
      answer:
        "Ya, kamu bisa membuat dan mengelola banyak akun sekaligus, seperti Dompet Tunai (Cash), Rekening Bank (BCA, Mandiri, BRI), hingga E-Wallet (GoPay, OVO, Dana). Saldo gabungan akan terkalkulasi otomatis.",
    },
  ];

  return (
    <section
      id="faq"
      className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-blue-100 dark:border-blue-900/40">
          <HelpCircle className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Pertanyaan Umum
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
          Semua yang perlu kamu ketahui tentang fitur, privasi, dan alur kerja
          SADAR Finance.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        <Accordion
          type="single"
          collapsible
          defaultValue="faq-1"
          className="w-full"
        >
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left hover:text-[#1E3A8A] dark:hover:text-sky-400 font-semibold">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

