import * as React from "react";
import { Button } from "@/Components/ui/button";

export interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{
    icon: React.ReactNode;
    href: string;
    label: string;
  }>;
  mainLinks: Array<{
    href: string;
    label: string;
  }>;
  legalLinks: Array<{
    href: string;
    label: string;
  }>;
  copyright: {
    text: string;
    license?: string;
  };
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="w-screen relative left-1/2 -translate-x-1/2 pb-8 pt-16 border-t border-[#2B4B9B] bg-[#1E3A8A] text-white font-['Inter',sans-serif]">
      <div className="mx-auto w-[min(calc(100%_-_96px),1360px)] max-lg:w-[min(calc(100%_-_48px),1080px)] max-sm:w-[min(calc(100%_-_28px),1080px)] px-4">
        <div className="md:flex md:items-start md:justify-between">
          <a
            href="/"
            className="flex items-center gap-x-2 no-underline text-white hover:opacity-90 transition"
            aria-label={brandName}
          >
            {logo}
          </a>
          <ul className="flex list-none mt-6 md:mt-0 space-x-3 p-0">
            {socialLinks.map((link, i) => (
              <li key={i} className="m-0">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-full border-white/20 text-white hover:bg-white hover:border-white hover:text-[#1E3A8A] bg-transparent"
                  asChild
                >
                  <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="border-t border-[#2B4B9B] mt-6 pt-6 md:mt-8 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end p-0">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm font-semibold !text-white no-underline hover:!text-[#14B8A6] hover:underline underline-offset-4 transition"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="mt-6 lg:mt-4 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end p-0">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <a
                    href={link.href}
                    className="text-sm !text-white/80 no-underline hover:!text-white hover:underline underline-offset-4 transition"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-6 text-sm leading-6 !text-white/70 whitespace-nowrap lg:mt-0 lg:row-[1/3] lg:col-[1/4] text-left">
            <div className="font-medium !text-white">{copyright.text}</div>
            {copyright.license && <div className="text-[12px] !text-white/50">{copyright.license}</div>}
          </div>
        </div>
      </div>
    </footer>
  );
}
