"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import LegoTechStackBuilder, { ALL_TECH_MODULES } from "@/components/TechStackMiniGame";

export default function InnovationSection() {
  const t = useTranslations("Innovation");
  const [activeTab, setActiveTab] = useState<"p2p" | "techStack">("p2p");

  const p2pMethods = [
    {
      key: "wifiDirect",
      title: t("p2p.wifiDirect.title"),
      badge: t("p2p.wifiDirect.badge"),
      description: t("p2p.wifiDirect.description"),
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
    },
    {
      key: "bluetooth",
      title: t("p2p.bluetooth.title"),
      badge: t("p2p.bluetooth.badge"),
      description: t("p2p.bluetooth.description"),
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20l6-5-6-5 6-5-6-5z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7l12 10M6 17l12-10" />
        </svg>
      ),
    },
    {
      key: "nfc",
      title: t("p2p.nfc.title"),
      badge: t("p2p.nfc.badge"),
      description: t("p2p.nfc.description"),
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8.32a7.43 7.43 0 0 1 0 7.36" />
          <path d="M9.46 6.21a11.76 11.76 0 0 1 0 11.58" />
          <path d="M12.91 4.1a15.91 15.91 0 0 1 0 15.8" />
          <path d="M16.37 2a20.16 20.16 0 0 1 0 20" />
        </svg>
      ),
    },
    {
      key: "qrDeepLinks",
      title: t("p2p.qrDeepLinks.title"),
      badge: t("p2p.qrDeepLinks.badge"),
      description: t("p2p.qrDeepLinks.description"),
      icon: (
        <svg className="w-6 h-6 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <path d="M14 14h3v3h-3zM17 17h4v4h-4zM14 20h3" />
        </svg>
      ),
    },
  ];

  return (
    <section id="innovation" className="relative pt-2 pb-16 sm:pt-4 sm:pb-20 lg:pt-4 lg:pb-28 bg-background-primary transition-colors duration-200">
      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          className="flex flex-col items-start text-left mb-6 sm:mb-8"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-brand-heading">
            {t("heading")}
          </h2>

          {/* Tab Switcher Pills */}
          <div role="tablist" aria-label={t("heading")} className="inline-flex p-1.5 rounded-lg bg-brand-primary/10 mt-6 sm:mt-8">
            <button
              type="button"
              role="tab"
              id="tab-p2p"
              aria-selected={activeTab === "p2p"}
              aria-controls="tabpanel-p2p"
              onClick={() => setActiveTab("p2p")}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "p2p"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-heading hover:text-brand-primary"
              }`}
            >
              {t("tabP2P")}
            </button>
            <button
              type="button"
              role="tab"
              id="tab-techStack"
              aria-selected={activeTab === "techStack"}
              aria-controls="tabpanel-techStack"
              onClick={() => setActiveTab("techStack")}
              className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                activeTab === "techStack"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-heading hover:text-brand-primary"
              }`}
            >
              {t("tabTechStack")}
            </button>
          </div>
        </motion.div>

        {/* Tab Contents */}
        <div className="relative mt-8 sm:mt-12">
          <AnimatePresence mode="wait">
            {activeTab === "techStack" ? (
              <motion.div
                key="techStack"
                role="tabpanel"
                id="tabpanel-techStack"
                aria-labelledby="tab-techStack"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full"
              >
                <LegoTechStackBuilder modules={ALL_TECH_MODULES} />
              </motion.div>
            ) : (
              <motion.div
                key="p2p"
                role="tabpanel"
                id="tabpanel-p2p"
                aria-labelledby="tab-p2p"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {p2pMethods.map((method, idx) => (
                    <motion.div
                      key={method.key}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] as const }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className="bg-card-bg border border-card-border rounded-2xl p-6 sm:p-8 shadow-card hover:border-brand-primary/40 transition-colors duration-200 flex flex-col justify-between group transform-gpu"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-brand-surface flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                            {method.icon}
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-surface text-brand-primary border border-brand-primary/20">
                            {method.badge}
                          </span>
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-foreground-primary mb-2">
                          {method.title}
                        </h3>
                        <p className="text-sm text-foreground-muted leading-relaxed">
                          {method.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
