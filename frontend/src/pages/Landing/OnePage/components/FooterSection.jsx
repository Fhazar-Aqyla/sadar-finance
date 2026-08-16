import React from "react";
import sadarLogo from "@/assets/images/landing/sadar-logo.png";
import logoDbsDicoding from "@/assets/images/logo-dbs-dicoding-cropped.png";
import logoCodingCamp from "@/assets/images/logo-coding-camp-cropped.png";
import { Footer } from "@/Components/ui/footer";

export const FooterSection = () => {
  const mainLinks = [
    { label: "Beranda", href: "#home" },
    { label: "Fitur Unggulan", href: "#features" },
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Simulasi Anggaran", href: "#simulator" },
    { label: "Testimoni", href: "#testimonials" },
    { label: "Tim Kami", href: "#team" },
    { label: "FAQ", href: "#faq" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privancy-policy" },
    { label: "Terms of Service", href: "/term-conditions" },
  ];

  const partners = [
    {
      name: "DBS Foundation x Dicoding",
      logo: logoDbsDicoding,
    },
    {
      name: "Coding Camp 2025 powered by DBS Foundation",
      logo: logoCodingCamp,
    },
  ];

  return (
    <Footer
      logo={
        <div className="bg-white/95 hover:bg-white transition-all px-3 py-1.5 rounded-lg border border-white/20 shadow-sm inline-flex items-center hover:scale-[1.02] duration-200">
          <img
            src={sadarLogo}
            alt="SADAR Finance"
            className="h-6 sm:h-7 w-auto object-contain"
          />
        </div>
      }
      brandName="SADAR Finance"
      description="Platform keuangan pribadi berbasis AI untuk mengelola keuanganmu lebih cerdas."
      partners={partners}
      partnersLabel="Didukung Oleh"
      mainLinks={mainLinks}
      legalLinks={legalLinks}
      copyright={{
        text: `© ${new Date().getFullYear()} SADAR Finance. Hak Cipta Dilindungi.`,
        license: "Dibuat oleh Tim SADAR Finance",
      }}
    />
  );
};
