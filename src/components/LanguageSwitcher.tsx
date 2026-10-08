"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { languages } from "@/config/languages";
import { useTranslations, useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("LanguageSwitcher");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = languages.findIndex((lang) => lang.code === locale);
  const [focusedIndex, setFocusedIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  useEffect(() => {
    if (isOpen) {
      const idx = selectedIndex >= 0 ? selectedIndex : 0;
      requestAnimationFrame(() => {
        optionsRef.current[idx]?.focus();
      });
    }
  }, [isOpen, selectedIndex]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLanguageSelect = (newLocale: string) => {
    setIsOpen(false);
    triggerRef.current?.focus();
    if (newLocale !== locale) {
      startTransition(() => {
        router.replace(pathname, { locale: newLocale });
      });
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (focusedIndex + 1) % languages.length;
      setFocusedIndex(next);
      optionsRef.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (focusedIndex - 1 + languages.length) % languages.length;
      setFocusedIndex(prev);
      optionsRef.current[prev]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
      optionsRef.current[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = languages.length - 1;
      setFocusedIndex(last);
      optionsRef.current[last]?.focus();
    } else if (e.key === "Tab") {
      setIsOpen(false);
    }
  };

  const handleToggleOpen = () => {
    const nextOpen = !isOpen;
    if (nextOpen) {
      setFocusedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    }
    setIsOpen(nextOpen);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Pill Toggle Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggleOpen}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("selectLanguage")}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border-default bg-transparent text-nav-text hover:bg-background-secondary transition-all duration-150 active:scale-95 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary text-xs sm:text-sm font-medium"
      >
        {/* Green Globe Icon */}
        <svg
          className="w-4 h-4 text-brand-primary shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        {/* Selected Language Name */}
        <span>{currentLanguage.name}</span>

        {/* Chevron Icon with Rotation */}
        <svg
          className={`w-3.5 h-3.5 text-nav-text shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Modern Floating Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={t("selectLanguage")}
          onKeyDown={handleListKeyDown}
          className="absolute left-0 mt-2 w-44 origin-top-left rounded-2xl border border-border-default bg-background-primary/95 backdrop-blur-lg p-1.5 shadow-xl z-50 transition-all"
        >
          {languages.map((lang, index) => {
            const isSelected = lang.code === locale;
            return (
              <button
                key={lang.code}
                ref={(el) => {
                  optionsRef.current[index] = el;
                }}
                type="button"
                role="option"
                tabIndex={index === focusedIndex ? 0 : -1}
                aria-selected={isSelected}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-xl transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary ${
                  isSelected
                    ? "bg-brand-primary/10 text-brand-primary font-semibold"
                    : "text-nav-text hover:bg-background-secondary"
                }`}
              >
                <div className="flex flex-col text-left">
                  <span>{lang.name}</span>
                  {lang.localName !== lang.name && (
                    <span className="text-[10px] text-foreground-muted font-normal">
                      {lang.localName}
                    </span>
                  )}
                </div>

                {isSelected && (
                  <svg
                    className="w-4 h-4 text-brand-primary shrink-0 ml-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
