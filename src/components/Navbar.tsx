"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const t = useTranslations("Navigation");
  const tLang = useTranslations("LanguageSwitcher");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: t("innovation"), href: "#innovation" },
    { name: t("features"), href: "#features" },
    { name: t("faq"), href: "#faq" },
  ];

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className="w-full bg-background-primary/85 backdrop-blur-md sticky top-0 z-50 border-b border-border-default/40 transition-colors duration-200 transform-gpu"
    >
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              onClick={handleScrollToTop}
              aria-label={t("brandName")}
              className="flex items-center gap-2 group transition-transform active:scale-95"
            >
              <span className="text-3xl sm:text-[2rem] font-semibold tracking-tight text-brand-primary">
                {t("brandName")}
              </span>
            </Link>
          </div>

          {/* Center/Middle Group: Language Switcher, Nav Links, Theme Toggle */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            <LanguageSwitcher />

            <div className="flex items-center gap-7 lg:gap-9">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="text-[15px] font-normal text-nav-text hover:text-brand-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <ThemeToggle />
          </nav>

          {/* Right: CTA Button */}
          <div className="hidden md:flex items-center">
            <a
              href="#download"
              aria-label={t("downloadApp")}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-brand-primary hover:bg-brand-hover active:scale-95 shadow-sm transition-all duration-150"
            >
              {t("downloadApp")}
            </a>
          </div>

          {/* Mobile Menu Button & Quick Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-nav-text hover:bg-background-secondary focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary"
              aria-label={t("toggleMenu")}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border-default bg-background-primary/95 px-4 pt-2 pb-6 space-y-4 shadow-lg backdrop-blur-lg">
          <div className="flex flex-col space-y-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2 rounded-md text-base font-medium text-foreground-primary hover:bg-background-secondary hover:text-brand-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border-default flex flex-col gap-4">
            <div className="flex items-center justify-between px-3">
              <span className="text-sm font-medium text-foreground-muted">{tLang("label")}</span>
              <LanguageSwitcher />
            </div>

            <a
              href="#download"
              onClick={() => setMobileMenuOpen(false)}
              aria-label={t("downloadApp")}
              className="w-full text-center py-2.5 px-4 rounded-full text-sm font-semibold text-white bg-brand-primary hover:bg-brand-hover shadow-sm transition-all"
            >
              {t("downloadApp")}
            </a>
          </div>
        </div>
      )}
    </motion.header>
  );
}
