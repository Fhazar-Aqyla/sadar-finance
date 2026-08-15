import React, { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";

const testimonials = [
  {
    tempId: 0,
    text: "Fitur foto struknya luar biasa. Tinggal scan, transaksi langsung tercatat dan dikelompokkan otomatis ke pos 50/30/20.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Rizky Pratama",
    role: "Karyawan Swasta",
  },
  {
    tempId: 1,
    text: "SADAR bikin aku sadar pengeluaran bulanan lebih besar dari dugaanku. Skor finansialnya jujur banget, sekarang lebih disiplin menabung.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Aisyah Putri",
    role: "Mahasiswa S2",
  },
  {
    tempId: 2,
    text: "Sebagai owner UMKM, memisahkan uang pribadi dan bisnis itu susah. SADAR memudahkannya, net worth terlihat real-time.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Budi Santoso",
    role: "Owner UMKM",
  },
  {
    tempId: 3,
    text: "Aplikasinya ringan, bebas iklan, dan enak dipakai. Fitur peringatan sebelum overbudget bikin aku nggak kalap di akhir bulan.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Nadia Rahma",
    role: "Content Creator",
  },
  {
    tempId: 4,
    text: "Dulu catat keuangan di notes, sering lupa. Sekarang semua otomatis. Data aman, tanpa kartu kredit, langsung bisa dipakai.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Farhan Maulana",
    role: "Fresh Graduate",
  },
  {
    tempId: 5,
    text: "Analisa pengeluarannya detail dan mudah dimengerti. Sebagai ibu rumah tangga, ini bantu banget ngatur kebutuhan keluarga.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Siti Nurhaliza",
    role: "Ibu Rumah Tangga",
  },
  {
    tempId: 6,
    text: "Sebagai freelancer, penghasilan tidak menentu. SADAR bantu aku alokasikan pendapatan ke kebutuhan dan masa depan secara proporsional.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Dimas Anggara",
    role: "Freelancer",
  },
  {
    tempId: 7,
    text: "Awalnya skeptis, tapi setelah sebulan pakai, kebiasaan finansialku berubah total. Rekomendasi untuk siapa pun yang mau mulai melek finansial.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Anisa Wulandari",
    role: "Business Analyst",
  },
  {
    tempId: 8,
    text: "Desainnya bersih dan nyaman dipakai setiap hari. Laporan bulanan SADAR bantu aku memantau target tabungan dengan mudah.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Putri Maharani",
    role: "Desainer Grafis",
  },
  {
    tempId: 9,
    text: "Data pengeluarannya detail dan gampang dibaca. SADAR bantu aku menemukan pola belanja yang selama ini tidak kusadari.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Andi Wijaya",
    role: "Data Analyst",
  },
  {
    tempId: 10,
    text: "Kelola keuangan bareng SADAR jadi terasa mudah. Fitur pengelompokan otomatisnya akurat dan selalu konsisten.",
    image:
      "https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Tania Kusuma",
    role: "Digital Marketer",
  },
  {
    tempId: 11,
    text: "Integrasi bank dan e-wallet lancar, datanya selalu sinkron. Sebagai orang teknis, aku puas dengan keandalan SADAR.",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150",
    name: "Yoga Pradana",
    role: "Software Engineer",
  },
];

const TestimonialCard = ({ position, testimonial, handleMove, cardSize }) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={`absolute left-1/2 top-1/2 cursor-pointer p-7 border transition-all duration-500 ease-in-out rounded-2xl select-none ${
        isCenter
          ? "z-10 bg-white dark:bg-slate-900 border-[#1E3A8A]/25 dark:border-sky-500/30 ring-2 ring-[#1E3A8A]/10 dark:ring-sky-500/15"
          : "z-0 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-[#1E3A8A]/40"
      }`}
      style={{
        width: cardSize,
        height: cardSize,
        transform: `
          translate(-50%, -50%)
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter
          ? "0px 20px 50px -14px rgba(30, 58, 138, 0.28), 0px 8px 0px 4px rgba(30, 58, 138, 0.08)"
          : "0px 12px 28px -14px rgba(15, 23, 42, 0.18)",
      }}
    >
      {isCenter && (
        <div className="absolute inset-x-7 top-0 h-[2px] rounded-full bg-gradient-to-r from-[#1E3A8A] via-sky-400 to-emerald-400" />
      )}
      <div className="flex flex-col h-full">
        <p className="text-base sm:text-lg font-semibold leading-relaxed line-clamp-5 text-slate-700 dark:text-slate-300">
          “{testimonial.text}”
        </p>
        <footer className="flex items-center gap-2.5 mt-auto pt-5">
          <img
            width={40}
            height={40}
            src={testimonial.image}
            alt={`Avatar ${testimonial.name}`}
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#1E3A8A]/15 dark:ring-sky-500/30"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate text-slate-900 dark:text-white">
              {testimonial.name}
            </p>
            <p className="text-xs leading-tight truncate text-slate-500 dark:text-slate-400">
              {testimonial.role}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const TestimonialsSection = () => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(testimonials);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();

  const handleMove = useCallback((steps) => {
    setTestimonialsList((prev) => {
      const newList = [...prev];
      if (steps > 0) {
        for (let i = steps; i > 0; i--) {
          const item = newList.shift();
          if (!item) return prev;
          newList.push({ ...item, tempId: Math.random() });
        }
      } else {
        for (let i = steps; i < 0; i++) {
          const item = newList.pop();
          if (!item) return prev;
          newList.unshift({ ...item, tempId: Math.random() });
        }
      }
      return newList;
    });
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (reducedMotion || paused) return undefined;
    const id = setInterval(() => handleMove(1), 2000);
    return () => clearInterval(id);
  }, [reducedMotion, paused, handleMove]);

  return (
    <section
      id="testimonials"
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/3 -left-24 w-72 h-72 bg-blue-500/6 dark:bg-sky-400/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-violet-400/5 dark:bg-violet-500/4 blur-[110px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-3xl mx-auto mb-10 relative z-10"
      >
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs border border-blue-100 dark:border-blue-900/40">
          <MessageSquareQuote className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Testimoni Pengguna
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="text-slate-900 dark:text-white">Suara Pengguna yang{" "}</span>
          <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">
            Sadar Finansial.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mx-auto">
          Ribuan orang telah merasakan perubahan nyata dalam mengelola keuangan bersama SADAR. Ini cerita mereka.
        </p>
      </motion.div>

      {/* Stagger Fan Deck */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: cardSize + 200 }}
        role="region"
        aria-label="Testimoni pengguna"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {testimonialsList.map((testimonial, index) => {
          const position = testimonialsList.length % 2
            ? index - (testimonialsList.length + 1) / 2
            : index - testimonialsList.length / 2;
          return (
            <TestimonialCard
              key={testimonial.tempId}
              testimonial={testimonial}
              handleMove={handleMove}
              position={position}
              cardSize={cardSize}
            />
          );
        })}
      </div>
    </section>
  );
};