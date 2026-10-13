"use client";

import { useRef, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useLenis } from "lenis/react";
import { useTranslations } from "next-intl";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { SITE_LINKS } from "@/config/links";
import { BrandIcon } from "@/components/icons/BrandIcon";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const t = useTranslations("Navigation");
  const tLang = useTranslations("LanguageSwitcher");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const lenis = useLenis();
  const [overDark, setOverDark] = useState(false);
  const { scrollY } = useScroll();

  // Switch to a dark glass while the navbar floats over the (always dark) footer
  const headerRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  useMotionValueEvent(scrollY, "change", () => {
    footerRef.current ??= document.querySelector("footer");
    const footer = footerRef.current;
    const header = headerRef.current;
    if (!footer || !header) return;
    const next = footer.getBoundingClientRect().top <= header.offsetHeight / 2;
    setOverDark((prev) => (prev === next ? prev : next));
  });

  const scrollToTarget = (target: string | number) => {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.2 });
      return;
    }
    if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "smooth" });
    } else {
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navLinks = [
    { name: t("features"), href: "#features" },
    { name: t("innovation"), href: "#innovation" },
    { name: t("faq"), href: "#faq" },
  ];

  // On the home page the logo scrolls back to the top; elsewhere it navigates home.
  const handleScrollToTop = (e: React.MouseEvent) => {
    if (pathname !== "/") return;
    e.preventDefault();
    setMobileMenuOpen(false);
    scrollToTarget(0);
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      scrollToTarget(href);
      setMobileMenuOpen(false);
    }
  };

  return (
    <motion.header
      ref={headerRef}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
      className={`w-full bg-background-primary/70 backdrop-blur-xl backdrop-saturate-150 sticky top-0 z-50 border-b border-border-default/40 shadow-[0_1px_24px_rgba(0,0,0,0.04)] transition-colors duration-300 transform-gpu ${
        overDark ? "nav-on-dark" : ""
      }`}
    >
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        <div className="flex items-center justify-between h-16 sm:h-20 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              onClick={handleScrollToTop}
              aria-label={`${t("brandName")} – ${t("backToTop")}`}
              title={t("backToTop")}
              className="flex items-center gap-2 group rounded-lg transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
            >
              <span className="text-3xl sm:text-[2rem] font-semibold tracking-tight text-brand-primary">
                {t("brandName")}
              </span>
            </Link>
          </div>

          {/* Center/Middle Group: Language Switcher, Nav Links, Theme Toggle */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            <LanguageSwitcher />

            <>
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
            </>

            <ThemeToggle />
          </nav>

          {/* Right: Contribute + Download */}
          <div className="hidden lg:flex items-center justify-self-end gap-3">
            <a
              href={SITE_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("contribute")}
              title={t("contribute")}
              className="inline-flex items-center justify-center gap-2 h-10 px-3 xl:px-5 rounded-full text-sm font-semibold text-nav-text border border-border-default hover:border-brand-primary hover:text-brand-primary active:scale-95 transition-all duration-150"
            >
              <BrandIcon name="github" className="h-4 w-4" />
              <span className="hidden xl:inline">{t("contribute")}</span>
            </a>
            <a
              href={SITE_LINKS.playStore}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("downloadApp")}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-brand-primary hover:bg-brand-hover active:scale-95 shadow-sm transition-all duration-150"
            >
              {t("downloadApp")}
            </a>
          </div>

          {/* Mobile Menu Button & Quick Actions */}
          <div className="flex items-center gap-2 lg:hidden">
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
        <div className="lg:hidden border-b border-border-default/40 bg-background-primary/70 px-4 pt-2 pb-6 space-y-4 shadow-lg backdrop-blur-xl backdrop-saturate-150">
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
              href={SITE_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-sm font-semibold text-foreground-primary border border-border-default hover:border-brand-primary hover:text-brand-primary transition-all"
            >
              <BrandIcon name="github" className="h-4 w-4" />
              {t("contribute")}
            </a>
            <a
              href={SITE_LINKS.playStore}
              target="_blank"
              rel="noopener noreferrer"
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
