import React, { useRef } from "react";
import { SpotlightCard } from "@/Components/ui/spotlight-card";
import { Users, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import diahAvatar from "@/assets/images/users/team-diah.jpg";
import marselaAvatar from "@/assets/images/users/team-marsela.jpg";
import dzakyAvatar from "@/assets/images/users/team-dzaky.jpg";
import farrelAvatar from "@/assets/images/users/team-farrel.jpg";
import fhazarAvatar from "@/assets/images/users/team-fhazar.jpg";
import habibAvatar from "@/assets/images/users/team-habib.jpg";

// Clean SVG Icons for GitHub, LinkedIn, and Instagram
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 0 0 1.65-1.64c0-.91-.74-1.65-1.65-1.65-.9 0-1.64.74-1.64 1.65 0 .9.74 1.64 1.64 1.64m1.39 9.74v-8.37H5.07v8.37h2.78z" />
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

// Individual Team Card Component
const TeamMemberCard = ({ member }) => {
  return (
    <motion.div
      style={{ y: member.yOffset }}
      className="h-full"
    >
      <SpotlightCard className="relative h-full p-6 pt-8 text-center flex flex-col items-center justify-between shadow-xs border-slate-200/90 dark:border-slate-800 transition-shadow duration-300 hover:shadow-xl group overflow-hidden">
        {/* Soft Ambient Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-[#1E3A8A]/10 to-sky-400/10 blur-2xl rounded-full pointer-events-none" />

        <div className="relative flex flex-col items-center">
          {/* Avatar with Gradient Ring & Glow */}
          <motion.div
            whileHover={{ scale: 1.08, rotate: 2 }}
            className="relative w-24 h-24 mb-4 cursor-pointer"
          >
            <div className="absolute -inset-2 bg-gradient-to-br from-[#1E3A8A]/20 to-sky-400/20 dark:from-[#1E3A8A]/30 dark:to-sky-500/15 blur-xl rounded-full" />
            <div className="relative w-full h-full p-[3px] rounded-2xl bg-gradient-to-br from-[#1E3A8A] via-sky-400 to-emerald-400 shadow-md">
              <img
                src={member.avatar}
                alt={member.name}
                style={
                  member.objectPosition
                    ? { objectPosition: member.objectPosition }
                    : {}
                }
                className="w-full h-full object-cover rounded-[13px] bg-slate-100 dark:bg-slate-800"
              />
            </div>
          </motion.div>

          {/* Name & Role */}
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-sky-400 transition-colors">
            {member.name}
          </h3>
          <span className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#1E3A8A] to-sky-500 text-white text-xs font-bold shadow-sm border border-white/20 dark:border-sky-400/30">
            <Sparkles className="w-3 h-3" />
            {member.role}
          </span>
          <span className="mt-2.5 inline-block px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A]/80 text-xs font-bold dark:bg-blue-950/50 dark:text-sky-300/90 border border-blue-100/80 dark:border-blue-900/40 shadow-2xs">
            {member.badge}
          </span>
        </div>

        {/* Verified Social Links */}
        <div className="relative flex items-center gap-2 mt-6 pt-4 w-full border-t border-slate-100 dark:border-slate-800 justify-center">
          {member.socials.github && (
            <a
              href={member.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              aria-label="GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
          {member.socials.linkedin && (
            <a
              href={member.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl text-slate-400 hover:text-[#1E3A8A] hover:bg-blue-50 dark:hover:text-sky-400 dark:hover:bg-blue-950/40 transition-colors"
              aria-label="LinkedIn"
            >
              <LinkedinIcon className="w-4 h-4" />
            </a>
          )}
          {member.socials.instagram && (
            <a
              href={member.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:text-pink-400 dark:hover:bg-pink-950/40 transition-colors"
              aria-label="Instagram"
            >
              <InstagramIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </SpotlightCard>
    </motion.div>
  );
};

export const TeamSection = () => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yCol1 = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const yCol2 = useTransform(scrollYProgress, [0, 1], [-20, 20]);
  const yCol3 = useTransform(scrollYProgress, [0, 1], [35, -35]);

  const team = [
    {
      name: "Diah Ayu Puspasari",
      role: "Data Scientist",
      avatar: diahAvatar,
      badge: "Behavior Analysis & Feature Engineering",
      yOffset: yCol1,
      socials: {
        github: "https://github.com/Diahayuups",
        linkedin: "https://www.linkedin.com/in/diahaps/",
        instagram: "https://www.instagram.com/diahayupsss",
      },
    },
    {
      name: "Fhazar Raffiful Aqyla",
      role: "Frontend Developer",
      avatar: fhazarAvatar,
      objectPosition: "center 30%",
      badge: "Frontend & Web Architecture",
      yOffset: yCol2,
      socials: {
        github: "https://github.com/Fhazar-Aqyla",
        linkedin: "https://www.linkedin.com/in/fhazaraqyla/",
        instagram: "https://www.instagram.com/fhazar_aqyla/",
      },
    },
    {
      name: "Dzaky Jaisy Al-Qorney",
      role: "AI Engineer",
      avatar: dzakyAvatar,
      badge: "OCR & NLP Pipeline",
      yOffset: yCol3,
      socials: {
        github: "https://github.com/iMiNerVaa",
        linkedin: "https://www.linkedin.com/in/dj-al/",
        instagram: "https://www.instagram.com/_zerxx_/",
      },
    },
    {
      name: "Marsela",
      role: "Data Scientist",
      avatar: marselaAvatar,
      badge: "Data Analysis & Insights",
      yOffset: yCol1,
      socials: {
        github: "https://github.com/Marsela0603",
        linkedin: "https://www.linkedin.com/in/marsela-marsela-30a763248",
        instagram: "https://www.linkedin.com/in/marsela-marsela-30a763248",
      },
    },
    {
      name: "Muhammad Habib Rafi",
      role: "Backend Developer",
      avatar: habibAvatar,
      badge: "Backend & API Services",
      yOffset: yCol2,
      socials: {
        github: "https://github.com/mhmdhabibrafi",
        linkedin: "https://www.linkedin.com/in/mhmdhabibrafi",
        instagram:
          "https://www.instagram.com/mhmdhabibrafi?igsh=MWV6bnR1N2R2Njd2YQ==",
      },
    },
    {
      name: "Farrel Al Faqih Ekatama",
      role: "AI Engineer",
      avatar: farrelAvatar,
      badge: "ML Modeling & Analytics",
      yOffset: yCol3,
      socials: {
        github: "https://github.com/farrelalfaqih",
        linkedin:
          "https://www.linkedin.com/in/farrel-al-faqih-ekatama-339980217/",
        instagram:
          "https://www.instagram.com/farrelalfaqih.fae?igsh=MWEzcDZnMW1nMjE5dQ==",
      },
    },
  ];

  return (
    <section
      id="team"
      ref={containerRef}
      className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-blue-500/5 dark:bg-sky-400/5 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-violet-300/5 dark:bg-violet-500/4 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-300/6 dark:bg-sky-500/4 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-[#1E3A8A] dark:bg-blue-950/60 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs border border-blue-100 dark:border-blue-900/40">
          <Users className="w-3.5 h-3.5 text-[#1E3A8A] dark:text-sky-400" />
          Tim di Balik SADAR
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          <span className="text-slate-900 dark:text-white">Didedikasikan untuk Mendorong{" "}</span>
          <span className="bg-gradient-to-r from-[#1E3A8A] to-sky-400 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400">
            Literasi Finansial Indonesia.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-500 dark:text-slate-400">
          Dikembangkan secara kolaboratif oleh talenta Frontend, Backend, AI Engineer, dan Data Scientist untuk menghadirkan platform personal finance yang cerdas dan nyaman.
        </p>
      </div>

      {/* Team Cards Grid with 3D Gyroscope & Column Parallax */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {team.map((member, idx) => (
          <TeamMemberCard key={idx} member={member} />
        ))}
      </div>
    </section>
  );
};
