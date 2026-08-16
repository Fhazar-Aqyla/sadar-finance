import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion as Motion, useReducedMotion } from "framer-motion";
import { MessageSquareQuote } from "lucide-react";

import afifahImg from "@/assets/images/testimonial/Afifah Rosita (Mahasiswa Akutansi).png";
import daffaImg from "@/assets/images/testimonial/Daffa Nazriel Zaidan (Junior UIUX).jpeg";
import darrenImg from "@/assets/images/testimonial/Darren Jokin Genova (Mahasiswa Akutansi).png";
import fachryImg from "@/assets/images/testimonial/Fachry Jiyad Setiawan (Mahasiswa Manajemen).jpeg";
import fadelImg from "@/assets/images/testimonial/Fadel Rahmadhan (Founder JD Nirwana).jpg";
import fadilahImg from "@/assets/images/testimonial/Fadilah Nur Yasin (Member AISEC President University).jpeg";
import ferryImg from "@/assets/images/testimonial/Ferry Noer Henriawan (Junior Web Programmer).png";
import haidarImg from "@/assets/images/testimonial/Haidar Sabillul Haq (Graphic Designer).jpeg";
import ireneImg from "@/assets/images/testimonial/Irene Delfine Harya (Mahasiswa Ners).jpeg";
import komarudinImg from "@/assets/images/testimonial/Komarudin (Senior Software Development).jpeg";
import rifqyImg from "@/assets/images/testimonial/Rifqy Syaripudin (Mahasiswa Sistem Informasi).webp";
import wardahImg from "@/assets/images/testimonial/Wardah Ulfiyatusholihah (Mahasiswa Manajemen).png";

const testimonials = [
  {
    tempId: 0,
    text: "Alokasi 50/30/20-nya ngebantu banget! Rekap pengeluaran bulanannya rapi dan gampang dipahami.",
    image: afifahImg,
    name: "Afifah Rosita",
    role: "Mahasiswa Akuntansi",
  },
  {
    tempId: 1,
    text: "UI-nya clean dan estetik parah. Catat pengeluaran harian jadi berasa satisfying banget.",
    image: daffaImg,
    name: "Daffa Nazriel Zaidan",
    role: "Junior UI/UX Designer",
  },
  {
    tempId: 2,
    text: "Tracking pengeluaran jadi sat-set tanpa ribet. Fitur skor finansialnya bikin makin semangat nabung.",
    image: darrenImg,
    name: "Darren Jokin Genova",
    role: "Mahasiswa Akuntansi",
  },
  {
    tempId: 3,
    text: "Uang saku bulanan jadi jauh lebih awet. Ngerem banget kebiasaan jajan impulsif di awal bulan.",
    image: fachryImg,
    name: "Fachry Jiyad Setiawan",
    role: "Mahasiswa Manajemen",
  },
  {
    tempId: 4,
    text: "Praktis banget buat misahin kas pribadi sama operasional bisnis. Tracking asetnya jelas dan real-time.",
    image: fadelImg,
    name: "Fadel Rahmadhan",
    role: "Founder JD Nirwana",
  },
  {
    tempId: 5,
    text: "Tinggal foto struk belanja, langsung kecatat otomatis. Penyelamat buat yang jadwalnya super padat!",
    image: fadilahImg,
    name: "Fadilah Nur Yasin",
    role: "Member AIESEC President University",
  },
  {
    tempId: 6,
    text: "Aplikasinya enteng, responsif, dan bebas iklan. Rekomendasi anggarannya beneran masuk akal.",
    image: ferryImg,
    name: "Ferry Noer Henriawan",
    role: "Junior Web Programmer",
  },
  {
    tempId: 7,
    text: "Sebagai freelance video editor, ngebantu banget misahin fee project ke pos tabungan. Chart-nya enak dilihat!",
    image: haidarImg,
    name: "Haidar Sabillul Haq",
    role: "Video Editor",
  },
  {
    tempId: 8,
    text: "Habis shift klinis rumah sakit nggak sempat catat manual. Pakai SADAR simpel dan ada alert limitnya.",
    image: ireneImg,
    name: "Irene Delfine Harya",
    role: "Praktisi Keperawatan",
  },
  {
    tempId: 9,
    text: "Kategorisasi otomatisnya cerdas dan akurat. Simpel, fungsional, dan nggak bertele-tele.",
    image: komarudinImg,
    name: "Komarudin",
    role: "Senior Software Developer",
  },
  {
    tempId: 10,
    text: "Insight AI-nya mantap. Sekarang langsung ketahuan pos mana yang bikin boncos tiap bulannya.",
    image: rifqyImg,
    name: "Rifqy Syaripudin",
    role: "Mahasiswa Sistem Informasi",
  },
  {
    tempId: 11,
    text: "Dulu sering kalap belanja online, sekarang ada notif batas budget yang ngerem kebiasaan boros.",
    image: wardahImg,
    name: "Wardah Ulfiyatusholihah",
    role: "Mahasiswa Manajemen",
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
      <div className="flex flex-col h-full justify-between pt-1">
        <div className="flex-1 flex items-center my-auto">
          <p className="text-base sm:text-lg font-medium italic leading-relaxed text-slate-600 dark:text-slate-400">
            “{testimonial.text}”
          </p>
        </div>
        <footer className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
          <img
            width={40}
            height={40}
            src={testimonial.image}
            alt={`Avatar ${testimonial.name}`}
            loading="lazy"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-[#1E3A8A]/15 dark:ring-sky-500/30"
          />
          <div className="min-w-0 flex flex-col justify-center gap-0.5">
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
  const pausedRef = useRef(paused);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

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
    if (reducedMotion) return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current) handleMove(1);
    }, 5000);
    return () => clearInterval(id);
  }, [reducedMotion, handleMove]);

  return (
    <section
      id="testimonials"
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="absolute top-1/3 -left-24 w-72 h-72 bg-blue-500/6 dark:bg-sky-400/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-80 h-80 bg-violet-400/5 dark:bg-violet-500/4 blur-[110px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <Motion.div
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
      </Motion.div>

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