"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, type Variants } from "framer-motion";

export default function Hero() {
  const t = useTranslations("Hero");

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  const featureVariants: Variants = {
    hidden: { opacity: 0, x: -14 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative pt-6 pb-4 sm:pt-8 sm:pb-6 lg:pt-10 lg:pb-8 overflow-hidden lg:overflow-visible">
      {/* Background 3-striped wavy green effect - desktop */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, x: 20 }}
        animate={{ opacity: 0.95, scale: 1, x: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] as const }}
        className="hidden lg:flex absolute right-0 top-[14%] xl:top-[10%] pointer-events-none select-none z-0 w-[56%] xl:w-[52%] max-w-[840px] overflow-visible justify-end transform-gpu"
      >
        <Image
          src="/assets/mockups/heromokupbg.svg"
          alt=""
          width={731}
          height={725}
          className="w-full h-auto object-contain translate-x-[2%] opacity-95 dark:opacity-85"
          priority
        />
      </motion.div>

      <div className="w-full max-w-[1536px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left Column: Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 flex flex-col lg:pt-20 xl:pt-24"
          >
            {/* Main Title Area */}
            <div className="flex flex-col text-center lg:text-left items-center lg:items-start">
              {/* Mobile Only: Open Source Badge above title */}
              <motion.div variants={itemVariants} className="flex lg:hidden justify-center mb-4">
                <span className="inline-flex items-center px-4 py-1 text-xs sm:text-sm font-semibold text-white bg-brand-primary rounded-full shadow-xs tracking-normal">
                  {t("openSourceBadge")}
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl lg:text-7xl font-medium tracking-tight leading-[1.1] text-brand-heading"
              >
                <span>{t("titleLine1")}</span>
                <br className="hidden sm:inline" />{" "}
                <span className="inline-flex flex-wrap items-baseline justify-center lg:justify-start gap-3.5 mt-1 sm:mt-0">
                  <span>{t("titleLine2")}</span>
                  {/* Desktop Only: Open Source Badge aligned with baseline */}
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35, duration: 0.4 }}
                    className="hidden lg:inline-flex items-center px-4 py-1 text-sm font-semibold text-white bg-brand-primary rounded-full shadow-xs tracking-normal transform -translate-y-2 hover:scale-105 transition-transform"
                  >
                    {t("openSourceBadge")}
                  </motion.span>
                </span>
              </motion.h1>

              {/* Powered By AOSSIE */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-center lg:justify-start gap-1.5 text-base sm:text-lg font-semibold text-brand-heading mt-3.5 sm:mt-4"
              >
                <span>{t("poweredBy")}</span>
                <a
                  href="https://aossie.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand-primary transition-colors cursor-pointer group"
                >
                  <span>{t("aossie")}</span>
                  <svg
                    className="w-5 h-5 inline-block transform translate-y-[-1px] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="7" y1="17" x2="17" y2="7" />
                    <polyline points="7 7 17 7 17 17" />
                  </svg>
                </a>
              </motion.div>

              {/* Mobile Only: Download CTA Button */}
              <motion.div variants={itemVariants} className="flex lg:hidden justify-center mt-6 mb-2">
                <a
                  href="#download"
                  aria-label={t("downloadApp")}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold text-white bg-brand-primary hover:bg-brand-hover active:scale-95 shadow-md shadow-brand-primary/25 transition-all duration-150"
                >
                  {t("downloadApp")}
                </a>
              </motion.div>
            </div>

            {/* Mobile Only: Phone Mockup with 3-layer green background behind it */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
              className="flex lg:hidden relative items-center justify-center my-10 w-full overflow-visible py-4"
            >
              {/* Background 3-layer wavy green effect behind mobile mockup */}
              <div className="absolute right-[-6%] bottom-[8%] pointer-events-none select-none z-0 w-[85%] max-w-[340px] overflow-visible flex justify-end">
                <Image
                  src="/assets/mockups/heromokupbg.svg"
                  alt=""
                  width={731}
                  height={725}
                  className="w-full h-auto object-contain translate-x-[4%] opacity-95 dark:opacity-85"
                />
              </div>

              {/* Mobile Phone Mockup */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full max-w-[280px] xs:max-w-[320px] sm:max-w-[360px] transform-gpu"
              >
                <Image
                  src="/assets/mockups/heromockup.png"
                  alt={t("mockupAlt")}
                  width={420}
                  height={1160}
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  priority
                />
              </motion.div>
            </motion.div>

            {/* USPs / Feature Highlights with expanded spacing */}
            <motion.ul
              variants={containerVariants}
              className="space-y-6 sm:space-y-7 text-base sm:text-lg text-foreground-primary mt-8 lg:mt-16 max-w-xl mx-auto lg:mx-0"
            >
              <motion.li variants={featureVariants} className="flex items-start gap-3.5">
                <span className="text-brand-primary shrink-0 mt-0.5">
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="leading-snug">
                  {t("features.item1Prefix")}{" "}
                  <span className="underline underline-offset-4 decoration-1 font-semibold">
                    {t("features.item1Highlight")}
                  </span>{" "}
                  {t("features.item1Suffix")}
                </span>
              </motion.li>

              <motion.li variants={featureVariants} className="flex items-start gap-3.5">
                <span className="text-brand-primary shrink-0 mt-0.5">
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="leading-snug">
                  <span className="underline underline-offset-4 decoration-1 font-semibold">
                    {t("features.item2Highlight")}
                  </span>{" "}
                  {t("features.item2Suffix")}
                </span>
              </motion.li>

              <motion.li variants={featureVariants} className="flex items-start gap-3.5">
                <span className="text-brand-primary shrink-0 mt-0.5">
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="leading-snug">
                  {t("features.item3Prefix")}{" "}
                  <span className="underline underline-offset-4 decoration-1 font-semibold">
                    {t("features.item3Highlight")}
                  </span>
                </span>
              </motion.li>
            </motion.ul>

            {/* Credibility & Trust Metrics with expanded spacing */}
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 pt-12 sm:pt-16 mt-6 lg:mt-8 max-w-2xl mx-auto lg:mx-0"
            >
              {/* Metric 1: #1 Most Loved */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 group">
                <div className="text-brand-heading shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <svg
                    className="w-8 h-11 sm:w-9 sm:h-12"
                    viewBox="0 0 29 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.8569 7.16504C14.6707 6.60124 13.8802 6.60124 13.694 7.16504L11.0061 12.2752L5.89879 12.9264L5.8133 12.9319C5.28841 13.0007 5.08389 13.6967 5.52792 14.0372L9.23176 18.0385L8.1715 23.9019L8.15003 23.9798C8.0356 24.5198 8.6573 24.9454 9.11835 24.5977L14.2755 21.5843L19.4325 24.5977L19.4995 24.6422C19.9737 24.9177 20.5661 24.4513 20.3794 23.9019L19.1789 18.2861L23.0229 14.0372L23.0878 13.9806C23.4644 13.6054 23.2097 12.9264 22.6522 12.9264L17.5449 12.2752L14.8569 7.16504ZM19.3301 14.7687L16.1 14.3568L14.2755 10.8879L12.4508 14.3568L9.26293 14.7633L11.6432 17.3347L10.9993 20.8954L14.2755 18.9811L17.422 20.8196L16.7403 17.631L19.3301 14.7687Z"
                      fill="currentColor"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M21.5278 3.92129L14.2753 0L7.02271 3.92129L0.000488281 8.24155V24.7246L3.08651 26.5561V40L14.2753 37.1785L25.9797 40L26.0002 29.8432L23.2325 31.4669V36.5549L14.2753 34.2655L5.83368 36.5549V28.3876L14.2753 32.9662L21.5278 29.0449L28.55 24.7246V8.24155L21.5278 3.92129ZM14.2753 3.12302L8.39685 6.30135L2.7051 9.80306V23.1631L8.39685 26.6649L14.2753 29.8432L20.1537 26.6649L25.8455 23.1631V9.80306L20.1537 6.30135L14.2753 3.12302Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div className="flex flex-col text-brand-heading whitespace-nowrap">
                  <span className="font-semibold text-base sm:text-lg leading-tight">
                    {t("badges.mostLovedTitle")}
                  </span>
                  <span className="font-semibold text-base sm:text-lg leading-tight text-brand-heading/90">
                    {t("badges.mostLovedSubtitle")}
                  </span>
                </div>
              </motion.div>

              {/* Metric 2: 10+ Contributors */}
              <motion.div variants={itemVariants} className="flex items-center gap-4 group">
                <div className="text-brand-heading shrink-0 group-hover:scale-105 transition-transform duration-200">
                  <svg
                    className="w-11 h-11 sm:w-12 sm:h-12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="flex flex-col text-brand-heading whitespace-nowrap">
                  <span className="font-semibold text-base sm:text-lg leading-tight">
                    {t("badges.contributorsTitle")}
                  </span>
                  <span className="font-semibold text-base sm:text-lg leading-tight text-brand-heading/90">
                    {t("badges.contributorsSubtitle")}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right Column: Desktop Phone Mockup Visual */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] as const }}
            className="hidden lg:flex lg:col-span-5 relative items-center justify-end"
          >
            <motion.div
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[420px] xl:max-w-[460px] 2xl:max-w-[500px] transform-gpu"
            >
              <Image
                src="/assets/mockups/heromockup.png"
                alt={t("mockupAlt")}
                width={420}
                height={1160}
                className="w-full h-auto object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-[1.01]"
                priority
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


