"use client";

import React, { useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// --- CUSTOM SVG ICONS FOR ZERO DEPENDENCY BUILD STABILITY ---
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

// --- TYPE SAFETY ---
export interface TeamMember {
  name: string;
  title: string;
  avatar: string;
  socials: Record<'github' | 'linkedin' | 'instagram', string>;
}

interface ModernTeamShowcaseProps {
  teamMembers: TeamMember[];
  tagline?: string;
}

// --- CODE ORGANIZATION ---
const iconMap = {
    github: GithubIcon,
    linkedin: LinkedinIcon,
    instagram: InstagramIcon,
};

const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: (i: number) => ({
        y: 0,
        opacity: 1,
        transition: { type: "spring", bounce: 0.4, duration: 0.8, delay: i * 0.1 } as const
    })
};

// --- PERFORMANCE & REUSABILITY ---
const TeamMemberCard = React.memo(({ member, index }: { member: TeamMember; index: number }) => {
    // --- MOTION HANDLER OPTIMIZATION ---
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30, bounce: 0.2 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30, bounce: 0.2 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }, [x, y]);

    const handleMouseLeave = useCallback(() => {
        x.set(0);
        y.set(0);
    }, [x, y]);

    // Color accents: Teal for Fhazar, Diah, Dzaky (indices 0, 2, 4). Blue for Marsela, Farrel, Habib (indices 1, 3, 5).
    const isTealAccent = index % 2 === 0;
    const accentBgClass = isTealAccent ? "bg-[#14B8A6]" : "bg-[#1E3A8A]";
    const accentTextClass = isTealAccent ? "text-[#14B8A6] bg-teal-50" : "text-[#1E3A8A] bg-blue-50";
    const accentBorderClass = isTealAccent ? "border-teal-100 group-hover:border-[#14B8A6]" : "border-blue-100 group-hover:border-[#1E3A8A]";
    const ringBlurColor = isTealAccent ? "bg-teal-500/10" : "bg-blue-500/10";
    
    // Social media icon border hover states and main colors
    const socialBorderClass = isTealAccent 
      ? "border-teal-100 hover:border-[#14B8A6] hover:bg-teal-50/50" 
      : "border-blue-100 hover:border-[#1E3A8A] hover:bg-blue-50/50";
    const socialIconColor = isTealAccent ? "text-[#14B8A6]" : "text-[#1E3A8A]";

    return (
        <motion.div
            variants={cardVariants}
            custom={index}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.3 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="group relative aspect-[4/5] w-full rounded-3xl bg-transparent cursor-pointer"
        >
            <div 
                style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
                className="absolute inset-2 flex flex-col items-center text-center bg-white/95 backdrop-blur-md p-6 pt-8 rounded-[24px] border border-[#CFDEF0] shadow-[0_12px_36px_rgba(30,58,138,0.04)] transition-all duration-500 group-hover:border-teal-200/50 group-hover:shadow-[0_22px_56px_rgba(30,58,138,0.08)] overflow-hidden"
            >
                {/* Visual Accent Top Bar to break the white design */}
                <div className={`absolute top-0 inset-x-0 h-1.5 ${accentBgClass}`} />

                {/* Glowing Background Ring Behind Avatar */}
                <div className={`absolute top-8 w-28 h-28 rounded-full ${ringBlurColor} blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`relative w-28 h-28 rounded-full overflow-hidden border-2 ${accentBorderClass} transition-colors duration-500 mb-5 bg-[#F8FBFF]`}>
                    <img 
                        src={member.avatar} 
                        alt={`Portrait of ${member.name}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src='https://placehold.co/400x400/cccccc/ffffff?text=??'; }}
                    />
                </div>
                
                {/* Wrapped name text (no truncation) letting long names wrap nicely to 2 lines */}
                <h3 className="text-[17px] font-extrabold text-[#1E3A8A] font-['Plus_Jakarta_Sans',sans-serif] tracking-tight leading-snug break-words px-1">
                    {member.name}
                </h3>
                
                <p className={`text-[10px] font-bold uppercase tracking-wider mt-2.5 px-3 py-1 rounded-full ${accentTextClass}`}>
                    {member.title}
                </p>
                
                <div className="flex items-center space-x-3 mt-auto pt-4">
                    {Object.entries(member.socials)
                      .filter(([_, link]) => !!link && link.trim() !== "" && link.trim() !== "#")
                      .map(([key, link], i) => {
                        const Icon = iconMap[key as keyof typeof iconMap];
                        return (
                            <a 
                                key={key} 
                                href={link} 
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${member.name}'s ${key}`}
                                className={`flex items-center justify-center w-8 h-8 rounded-full border bg-white ${socialBorderClass} transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-200/50`}
                            >
                                <Icon className={`w-[14px] h-[14px] ${socialIconColor}`} />
                            </a>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
});

// The main team showcase component
const ModernTeamShowcase: React.FC<ModernTeamShowcaseProps> = ({ teamMembers, tagline }) => {
    return (
        <section id="team" className="relative w-full bg-[#F8FBFF] py-24 px-8 md:px-16 overflow-hidden">
            {/* Aurora Background Effects inside Section */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <div className="aurora-bg">
                    <div className="aurora-shape-1"></div>
                    <div className="aurora-shape-2"></div>
                </div>
            </div>
            
            {/* Standardized Header */}
            <div className="relative z-10 flex flex-col items-center text-center mb-16 mx-auto max-w-[680px]">
                <span className="mb-5 inline-flex min-h-7 items-center justify-center rounded-full border border-teal-200 bg-teal-50/50 px-6 text-[12px] font-bold text-[#14B8A6] shadow-[0_4px_14px_rgba(20,184,166,0.05)]">
                    Tim Kami
                </span>
                <h2 className="font-['Plus_Jakarta_Sans',sans-serif] !font-extrabold tracking-normal !text-[#1E3A8A] m-0 text-[40px] leading-[1.18] max-md:text-[32px] max-sm:text-[28px]">
                    Kenali Tim <span className="!text-[#14B8A6]">SADAR</span>
                </h2>
                <p className="mx-auto mt-4 max-w-[600px] text-[13px] leading-6 text-[#6B7280]">
                    {tagline || "Kami adalah sekelompok mahasiswa dan pengembang yang berkomitmen membantu masyarakat memahami serta mengelola keuangan pribadi dengan lebih cerdas."}
                </p>
            </div>

            {/* Layout for 6 Members in 3-column Grid (Auto-wrapping to 2 rows) */}
            <div className="relative z-10 w-full max-w-5xl mx-auto responsive-grid">
                {teamMembers.map((member, index) => (
                    <TeamMemberCard key={member.name} member={member} index={index} />
                ))}
            </div>
        </section>
    );
};

export default ModernTeamShowcase;
