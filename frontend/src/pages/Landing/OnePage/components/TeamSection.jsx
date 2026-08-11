import React from "react";
import { SpotlightCard } from "@/Components/ui/spotlight-card";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import diahAvatar from "@/assets/images/users/diah.png";
import marselaAvatar from "@/assets/images/users/marsela.png";
import dzakyAvatar from "@/assets/images/users/dzaky.png";
import farrelAvatar from "@/assets/images/users/farrel.png";
import fhazarAvatar from "@/assets/images/users/fhazar.jpg";
import habibAvatar from "@/assets/images/users/habib.png";

// Clean SVG Icons for GitHub, LinkedIn, and Instagram
const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
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

export const TeamSection = () => {
  const team = [
    {
      name: "Fhazar Raffiful Aqyla",
      role: "Full Stack Developer",
      avatar: fhazarAvatar,
      objectPosition: "center 30%",
      badge: "Lead Architecture",
      socials: {
        github: "https://github.com/Fhazar-Aqyla",
        linkedin: "https://www.linkedin.com/in/fhazaraqyla/",
        instagram: "https://www.instagram.com/fhazar_aqyla/",
      },
    },
    {
      name: "Muhammad Habib Rafi",
      role: "Full Stack Developer",
      avatar: habibAvatar,
      badge: "Frontend & UI/UX",
      socials: {
        github: "https://github.com/mhmdhabibrafi",
        linkedin: "https://www.linkedin.com/in/mhmdhabibrafi",
        instagram: "https://www.instagram.com/mhmdhabibrafi?igsh=MWV6bnR1N2R2Njd2YQ==",
      },
    },
    {
      name: "Dzaky Jaisy Al-Qorney",
      role: "AI Engineer",
      avatar: dzakyAvatar,
      badge: "OCR & NLP Pipeline",
      socials: {
        github: "https://github.com/iMiNerVaa",
        linkedin: "https://www.linkedin.com/in/dj-al/",
        instagram: "https://www.instagram.com/_zerxx_/",
      },
    },
    {
      name: "Farrel Al Faqih Ekatama",
      role: "AI Engineer",
      avatar: farrelAvatar,
      badge: "ML Modeling & Analytics",
      socials: {
        github: "https://github.com/farrelalfaqih",
        linkedin: "https://www.linkedin.com/in/farrel-al-faqih-ekatama-339980217/",
        instagram: "https://www.instagram.com/farrelalfaqih.fae?igsh=MWEzcDZnMW1nMjE5dQ==",
      },
    },
    {
      name: "Diah Ayu Puspasari",
      role: "Data Scientist",
      avatar: diahAvatar,
      badge: "Behavior & Forecasting",
      socials: {
        github: "https://github.com/Diahayuups",
        linkedin: "https://www.linkedin.com/in/diahaps/",
        instagram: "https://www.instagram.com/diahayupsss",
      },
    },
    {
      name: "Marsela",
      role: "Data Scientist",
      avatar: marselaAvatar,
      badge: "Data Modeling & Insights",
      socials: {
        github: "https://github.com/Marsela0603",
        linkedin: "https://www.linkedin.com/in/marsela-marsela-30a763248",
        instagram: "https://www.linkedin.com/in/marsela-marsela-30a763248",
      },
    },
  ];

  return (
    <section id="team" className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-3">
          <Users className="w-3.5 h-3.5" />
          Tim Pengembang
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Dibuat dengan Dedikasi untuk{" "}
          <span className="bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
            Masyarakat Indonesia.
          </span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
          Kolaborasi antara Full Stack Engineer, AI Engineer, dan Data Scientist untuk menghadirkan solusi personal finance terbaik.
        </p>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <SpotlightCard className="h-full p-6 text-center flex flex-col items-center justify-between shadow-sm">
              <div className="flex flex-col items-center">
                {/* Avatar Photo */}
                <motion.div
                  whileHover={{ scale: 1.06 }}
                  className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-teal-500/40 p-1 bg-gradient-to-tr from-teal-500 to-blue-600 shadow-lg mb-4 cursor-pointer"
                >
                  <img
                    src={member.avatar}
                    alt={member.name}
                    style={member.objectPosition ? { objectPosition: member.objectPosition } : {}}
                    className="w-full h-full object-cover rounded-xl bg-slate-100 dark:bg-slate-800"
                  />
                </motion.div>

                {/* Name & Role */}
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mt-0.5">
                  {member.role}
                </p>
                <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium dark:bg-slate-800 dark:text-slate-400">
                  {member.badge}
                </span>
              </div>

              {/* Verified Social Links */}
              <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                {member.socials.github && (
                  <motion.a
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    href={member.socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
                    aria-label="GitHub"
                  >
                    <GithubIcon className="w-4 h-4" />
                  </motion.a>
                )}
                {member.socials.linkedin && (
                  <motion.a
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    href={member.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:bg-blue-950/40 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <LinkedinIcon className="w-4 h-4" />
                  </motion.a>
                )}
                {member.socials.instagram && (
                  <motion.a
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    href={member.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:text-pink-400 dark:hover:bg-pink-950/40 transition-colors"
                    aria-label="Instagram"
                  >
                    <InstagramIcon className="w-4 h-4" />
                  </motion.a>
                )}
              </div>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
