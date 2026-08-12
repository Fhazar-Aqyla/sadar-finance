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
        "SADAR Finance tidak sekadar mencatat transaksi secara manual, melainkan mengotomatisasi ekstraksi data dari struk kasir fisik via AI OCR, mengevaluasi skor kesehatan finansial objektif (0–100), dan memberikan peringatan proaktif sebelum kuota anggaran bulananmu mengalami overspending.",
    },
    {
      id: "faq-2",
      question: "Apakah data transaksi dan privasi saya terjamin aman?",
      answer:
        "Sangat aman. Seluruh data keuanganmu dilindungi dengan enkripsi standar industri dan terisolasi secara multi-tenant. SADAR Finance berkomitmen tidak menjual data pengguna ke pihak ketiga serta bebas dari gangguan iklan komersial.",
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
      className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm border border-blue-100 dark:border-blue-900/40">
          <HelpCircle className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Pusat Bantuan & FAQ
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
          Temukan jawaban lengkap seputar keamanan data, fitur OCR struk, hingga metode anggaran SADAR.
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


