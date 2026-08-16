import React from "react";
import sadarLogoLight from "@/assets/images/landing/logo-sadar-light.png";
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

  return (
    <Footer
      logo={
        <img
          src={sadarLogoLight}
          alt="SADAR Finance"
          className="h-7 sm:h-8 w-auto object-contain"
        />
      }
      brandName="SADAR Finance"
      description="Platform keuangan pribadi berbasis AI untuk mengelola keuanganmu lebih cerdas."
      mainLinks={mainLinks}
      legalLinks={legalLinks}
      copyright={{
        text: `© ${new Date().getFullYear()} SADAR Finance. Hak Cipta Dilindungi.`,
        license: "Dibuat oleh Tim SADAR Finance",
      }}
    />
  );
};
