"use client";

import { useId, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Plus, Search, X } from "lucide-react";
import { SITE_LINKS } from "@/config/links";
import { BrandIcon } from "@/components/icons/BrandIcon";

const ease = [0.16, 1, 0.3, 1] as const;

type Category = "general" | "sync" | "privacy" | "features";

const FAQ_ITEMS: { key: string; category: Category }[] = [
  { key: "whatIs", category: "general" },
  { key: "noServers", category: "sync" },
  { key: "notNearby", category: "sync" },
  { key: "offline", category: "sync" },
  { key: "secure", category: "privacy" },
  { key: "account", category: "privacy" },
  { key: "splits", category: "features" },
  { key: "ocr", category: "features" },
  { key: "platforms", category: "general" },
  { key: "openSource", category: "general" },
  { key: "contribute", category: "general" },
];

const CATEGORIES = ["all", "general", "sync", "privacy", "features"] as const;

export default function FaqSection() {
  const t = useTranslations("FAQ");
  const baseId = useId();
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("general");
  const [query, setQuery] = useState("");
  const [openKey, setOpenKey] = useState<string | null>(FAQ_ITEMS[0].key);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => category === "all" || item.category === category)
      .map((item) => ({ ...item, q: t(`items.${item.key}.q`), a: t(`items.${item.key}.a`) }))
      .filter((item) => !q || item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
  }, [category, query, t]);

  // JSON-LD for search engines (FAQPage rich results)
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: t(`items.${item.key}.q`),
      acceptedAnswer: { "@type": "Answer", text: t(`items.${item.key}.a`) },
    })),
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative bg-background-primary py-16 transition-colors duration-200 sm:py-20 lg:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="mx-auto grid w-full max-w-[1536px] grid-cols-1 gap-10 px-6 sm:px-8 md:px-12 lg:grid-cols-12 lg:gap-16 lg:px-16">
        {/* Intro column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease }}
          className="lg:col-span-5"
        >
          <div>
            <h2
              id="faq-heading"
              className="text-4xl font-medium leading-[1.1] tracking-tight text-brand-heading sm:text-5xl lg:text-7xl"
            >
              {t("heading")}
            </h2>
            <p className="mt-5 max-w-md text-base text-foreground-muted sm:text-lg">{t("subheading")}</p>

            {/* Community card */}
            <div className="relative mt-8 hidden overflow-hidden rounded-2xl border border-card-border bg-card-bg p-6 shadow-card lg:block">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand-primary/15 blur-2xl" />
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-surface text-brand-primary">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </div>
              <p className="text-lg font-semibold text-foreground-secondary">{t("stillQuestions")}</p>
              <p className="mt-1 text-sm text-foreground-muted">{t("stillDesc")}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={SITE_LINKS.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-hover active:scale-95"
                >
                  <BrandIcon name="discord" className="h-4.5 w-4.5" />
                  {t("askDiscord")}
                </a>
                <a
                  href={SITE_LINKS.issues}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-full border border-border-default px-5 py-2.5 text-sm font-semibold text-foreground-primary transition-colors hover:border-brand-primary hover:text-brand-primary"
                >
                  {t("openIssue")}
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions column */}
        <div className="lg:col-span-7">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-foreground-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchLabel")}
              className="w-full rounded-2xl border border-border-default bg-background-secondary py-3.5 pl-11 pr-11 text-base text-foreground-primary placeholder:text-foreground-muted transition-colors focus:border-brand-primary focus:outline-hidden focus:ring-4 focus:ring-brand-primary/15 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={t("clearSearch")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground-muted transition-colors hover:bg-brand-surface hover:text-brand-primary"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={t("heading")}>
            {CATEGORIES.map((c) => {
              const selected = c === category;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(c)}
                  className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    selected ? "text-white" : "text-foreground-muted hover:text-brand-primary"
                  }`}
                >
                  {selected && (
                    <motion.span
                      layoutId={`${baseId}-faq-pill`}
                      className="absolute inset-0 -z-0 rounded-full bg-brand-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <span className="relative">{t(`categories.${c}`)}</span>
                </button>
              );
            })}
          </div>

          {/* Accordion */}
          <motion.ul layout className="mt-6 space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {items.map((item, i) => {
                const isOpen = openKey === item.key;
                const buttonId = `${baseId}-q-${item.key}`;
                const panelId = `${baseId}-a-${item.key}`;
                return (
                  <motion.li
                    key={item.key}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3, delay: i * 0.03, ease }}
                    className={`group overflow-hidden rounded-2xl border transition-colors duration-300 ${
                      isOpen
                        ? "border-brand-primary/40 bg-brand-surface"
                        : "border-card-border bg-card-bg hover:border-brand-primary/30"
                    }`}
                  >
                    <h3>
                      <button
                        id={buttonId}
                        type="button"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={() => setOpenKey(isOpen ? null : item.key)}
                        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-primary rounded-2xl"
                      >
                        <span className="text-base font-semibold text-foreground-secondary sm:text-lg">{item.q}</span>
                        <motion.span
                          animate={{ rotate: isOpen ? 45 : 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 24 }}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isOpen
                              ? "bg-brand-primary text-white"
                              : "bg-brand-surface text-brand-primary group-hover:bg-brand-primary group-hover:text-white"
                          }`}
                        >
                          <Plus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                        </motion.span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={buttonId}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease }}
                        >
                          <p className="px-5 pb-5 text-[15px] leading-relaxed text-foreground-muted sm:px-6 sm:pb-6 sm:text-base">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>

          {items.length === 0 && (
            <p className="mt-8 rounded-2xl border border-dashed border-border-default p-8 text-center text-foreground-muted">
              {t("noResults", { query })}
            </p>
          )}

          {/* Community card (mobile) */}
          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-card-border bg-card-bg p-6 shadow-card sm:flex-row sm:items-center sm:justify-between lg:hidden">
            <div>
              <p className="font-semibold text-foreground-secondary">{t("stillQuestions")}</p>
              <p className="mt-1 text-sm text-foreground-muted">{t("stillDesc")}</p>
            </div>
            <a
              href={SITE_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-hover active:scale-95"
            >
              <BrandIcon name="discord" className="h-4.5 w-4.5" />
              {t("askDiscord")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
