"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("ThemeToggle");
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for mount
  useEffect(() => {
    const handle = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border-default bg-transparent" />;
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("toggleTheme")}
      className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-border-default bg-transparent hover:bg-background-secondary transition-all duration-150 active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-primary cursor-pointer"
    >
      {!isDark ? (
        /* In light mode, show green crescent moon to switch to dark */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-brand-primary transition-transform duration-200 hover:rotate-12"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      ) : (
        /* In dark mode, show green sun to switch to light */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-brand-primary transition-transform duration-200 hover:rotate-45"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      )}
    </button>
  );
}
