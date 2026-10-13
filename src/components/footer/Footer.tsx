"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowUpRight, Heart, Sparkle } from "lucide-react";
import MeshCanvas from "@/components/footer/MeshCanvas";
import { BrandIcon, type SocialKey } from "@/components/icons/BrandIcon";
import { SITE_LINKS } from "@/config/links";

const ease = [0.16, 1, 0.3, 1] as const;

const SOCIALS: SocialKey[] = ["github", "discord", "x", "telegram", "linkedin", "youtube"];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Pulls its child toward the cursor while hovered. */
function Magnetic({
  children,
  strength = 0.35,
  className = "inline-flex",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18 });

  const onMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) * strength);
    y.set((e.clientY - rect.top - rect.height / 2) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset} className={className}>
      {children}
    </motion.div>
  );
}

function useSmoothScrollTo() {
  const lenis = useLenis();
  const reduce = useReducedMotion();
  return (target: string | number) => {
    if (lenis) {
      lenis.scrollTo(target, { duration: 1.4 });
      return;
    }
    const top =
      typeof target === "number"
        ? target
        : (document.querySelector(target)?.getBoundingClientRect().top ?? 0) + window.scrollY;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  };
}

function Marquee() {
  const t = useTranslations("Footer.marquee");
  const words = ["m1", "m2", "m3", "m4", "m5", "m6", "m7"].map((k) => t(k));

  return (
    <div
      className="group relative flex overflow-hidden border-y border-footer-border py-5 mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:py-6"
      aria-hidden
    >
      <div className="flex shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...words, ...words].map((word, i) => (
          <span key={i} className="flex items-center whitespace-nowrap">
            <span
              className={`px-6 text-3xl font-semibold tracking-tight transition-colors duration-300 sm:px-8 sm:text-5xl ${
                i % 2 === 0
                  ? "text-footer-text/85 hover:text-accent-bright"
                  : "text-transparent [-webkit-text-stroke:1px_rgba(134,239,172,0.55)] hover:text-accent-bright"
              }`}
            >
              {word}
            </span>
            <Sparkle className="h-5 w-5 shrink-0 fill-accent-bright text-accent-bright sm:h-6 sm:w-6" />
          </span>
        ))}
      </div>
    </div>
  );
}

/** Giant wordmark that tears in two ("splits") on hover, focus or tap. */
function SplitWordmark() {
  const t = useTranslations("Footer");
  const reduce = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [hovered, setHovered] = useState(false);
  const [teaser, setTeaser] = useState(false);

  // Demonstrate the interaction once when it scrolls into view (helps touch users discover it)
  useEffect(() => {
    if (!inView || reduce) return;
    const open = window.setTimeout(() => setTeaser(true), 400);
    const close = window.setTimeout(() => setTeaser(false), 2200);
    return () => {
      window.clearTimeout(open);
      window.clearTimeout(close);
    };
  }, [inView, reduce]);

  const split = hovered || teaser;
  const spring = { type: "spring", stiffness: 180, damping: 18 } as const;
  const textClass =
    "block bg-linear-to-b from-footer-text via-footer-text/80 to-brand-primary/40 bg-clip-text text-transparent";

  return (
    <div className="relative pb-8 pt-4 sm:pb-14 sm:pt-10">
      <button
        ref={ref}
        type="button"
        aria-pressed={split}
        aria-label={`Zplit: ${t("wordmarkReveal")}`}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
        onClick={() => setHovered((v) => !v)}
        className="relative block w-full cursor-pointer select-none rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-bright"
      >
        <span className="relative block text-center text-[clamp(5.5rem,26vw,24rem)] font-bold leading-[0.82] tracking-[-0.065em]">
          {/* top half */}
          <motion.span
            aria-hidden
            className={textClass}
            style={{ clipPath: "inset(0 0 50% 0)" }}
            animate={split ? { y: "-16%", x: "-1.5%", rotate: -1.5 } : { y: 0, x: 0, rotate: 0 }}
            transition={spring}
          >
            Zplit
          </motion.span>
          {/* bottom half */}
          <motion.span
            aria-hidden
            className={`absolute inset-0 ${textClass}`}
            style={{ clipPath: "inset(50% 0 0 0)" }}
            animate={split ? { y: "16%", x: "1.5%", rotate: 1.5 } : { y: 0, x: 0, rotate: 0 }}
            transition={spring}
          >
            Zplit
          </motion.span>

          {/* revealed between the halves */}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-3"
            initial={false}
            animate={split ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0.4 }}
            transition={{ duration: 0.45, ease }}
          >
            <span className="h-px flex-1 border-t border-dashed border-accent-bright/60" />
            <span className="whitespace-nowrap text-[clamp(0.85rem,2.2vw,1.9rem)] font-semibold tracking-normal text-accent-bright">
              {t("wordmarkReveal")}
            </span>
            <span className="h-px flex-1 border-t border-dashed border-accent-bright/60" />
          </motion.span>
        </span>
      </button>
    </div>
  );
}

function StoreBadge({
  label,
  caption,
  icon,
  href,
  primary = false,
}: {
  label: string;
  caption: string;
  icon: ReactNode;
  href?: string;
  /** Brand-green variant for the available store */
  primary?: boolean;
}) {
  const content = (
    <>
      {icon}
      <div className="leading-tight">
        <p
          className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${primary ? "text-white/85" : "text-accent-soft"}`}
        >
          {caption}
        </p>
        <p className="text-base font-semibold">{label}</p>
      </div>
    </>
  );
  const base = `flex min-w-[190px] items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur-sm ${
    primary
      ? "border-brand-primary bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
      : "border-footer-border bg-footer-surface text-footer-text"
  }`;

  if (!href) {
    return (
      <div aria-disabled="true" className={`${base} opacity-70`}>
        {content}
      </div>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} transition-all duration-300 hover:-translate-y-0.5 ${
        primary ? "hover:bg-brand-hover hover:border-brand-hover" : "hover:border-brand-primary hover:bg-brand-primary/15"
      } focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright`}
    >
      {content}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Footer                                                              */
/* ------------------------------------------------------------------ */

export default function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Navigation");
  const scrollTo = useSmoothScrollTo();
  const year = new Date().getFullYear();

  const onAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollTo(href);
  };

  const columns: { title: string; links: { label: string; href: string; external?: boolean }[] }[] = [
    {
      title: t("columns.product"),
      links: [
        { label: t("links.features"), href: "#features" },
        { label: t("links.innovation"), href: "#innovation" },
        { label: t("links.faq"), href: "#faq" },
        { label: t("links.download"), href: SITE_LINKS.playStore, external: true },
      ],
    },
    {
      title: t("columns.community"),
      links: [
        { label: t("social.discord"), href: SITE_LINKS.discord, external: true },
        { label: t("social.telegram"), href: SITE_LINKS.telegram, external: true },
        { label: t("social.x"), href: SITE_LINKS.x, external: true },
        { label: t("social.youtube"), href: SITE_LINKS.youtube, external: true },
      ],
    },
    {
      title: t("columns.project"),
      links: [
        { label: t("links.sourceCode"), href: SITE_LINKS.github, external: true },
        { label: t("links.reportIssue"), href: SITE_LINKS.issues, external: true },
        { label: t("links.aossie"), href: SITE_LINKS.aossie, external: true },
        { label: t("links.stabilityNexus"), href: SITE_LINKS.stabilityNexus, external: true },
      ],
    },
  ];

  return (
    <footer className="relative isolate overflow-hidden rounded-t-[32px] bg-footer-bg text-footer-text sm:rounded-t-[48px]">
      <MeshCanvas />
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-brand-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 -z-10 h-[480px] w-[480px] rounded-full bg-aossie-gold/10 blur-[120px]" />

      {/* ---------- Download CTA ---------- */}
      <div id="download" className="mx-auto w-full max-w-[1536px] scroll-mt-24 px-6 pb-14 pt-16 sm:px-8 sm:pt-20 md:px-12 lg:px-16 lg:pb-20 lg:pt-28">
        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease }}
            className="lg:col-span-7"
          >
            <h2 className="text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-7xl">
              {t("ctaTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-base text-footer-muted sm:text-lg">
              {t.rich("ctaDesc", { br: () => <br /> })}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: 0.1, ease }}
            className="lg:col-span-5"
          >
            <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap lg:justify-end">
              <StoreBadge
                primary
                label={t("googlePlay")}
                caption={t("getItOn")}
                href={SITE_LINKS.playStore}
                icon={
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                    <path d="M3.61 1.81 13.79 12 3.61 22.19a1.5 1.5 0 0 1-.61-1.21V3.02c0-.5.24-.93.61-1.21Zm11.6 11.6 2.3 2.3-10.9 6.22 8.6-8.52Zm3.72-3.72 2.53 1.45a1.13 1.13 0 0 1 0 1.72l-2.53 1.45L16.4 12l2.53-2.31ZM6.6 2.07l10.9 6.22-2.3 2.3-8.6-8.52Z" />
                  </svg>
                }
              />
              <StoreBadge
                label={t("appStore")}
                caption={t("comingSoon")}
                icon={
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
                    <path d="M16.37 12.73c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.47.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.15.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.39-.92-2.4-3.68ZM14.1 5.98c.63-.77 1.06-1.83.94-2.89-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.28Z" />
                  </svg>
                }
              />
            </div>
          </motion.div>
        </div>
      </div>

      <Marquee />

      {/* ---------- Links ---------- */}
      <div className="mx-auto grid w-full max-w-[1536px] grid-cols-2 gap-10 px-6 py-14 sm:px-8 md:grid-cols-12 md:px-12 lg:px-16 lg:py-20">
        <div className="col-span-2 md:col-span-6">
          <div className="flex items-center gap-3">
            <Image src="/brand/icons/zplit_logo.svg" alt="" width={44} height={44} className="h-11 w-11 rounded-xl" />
            <span className="text-3xl font-semibold tracking-tight">{tNav("brandName")}</span>
          </div>
          <p className="mt-5 max-w-sm text-footer-muted">{t("tagline")}</p>

          <ul className="mt-7 flex flex-wrap gap-2.5">
            {SOCIALS.map((key) => (
              <li key={key}>
                <Magnetic>
                  <a
                    href={SITE_LINKS[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(`social.${key}`)}
                    title={t(`social.${key}`)}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-footer-border bg-footer-surface text-footer-text transition-all duration-300 hover:scale-110 hover:border-brand-primary hover:bg-brand-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
                  >
                    <BrandIcon name={key} className="h-[18px] w-[18px]" />
                  </a>
                </Magnetic>
              </li>
            ))}
          </ul>

        </div>

        {columns.map((col) => (
          <div key={col.title} className="md:col-span-2">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-soft">{col.title}</p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : { onClick: (e: React.MouseEvent<HTMLAnchorElement>) => onAnchorClick(e, link.href) })}
                    className="group inline-flex items-center gap-1 text-footer-muted transition-colors hover:text-footer-text"
                  >
                    <span className="relative">
                      {link.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent-bright transition-transform duration-300 group-hover:scale-x-100" />
                    </span>
                    {link.external && (
                      <ArrowUpRight
                        className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden
                      />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ---------- Wordmark ---------- */}
      <div className="mx-auto w-full max-w-[1536px] px-4 sm:px-8 md:px-12 lg:px-16">
        <SplitWordmark />
      </div>

      {/* ---------- Bottom bar ---------- */}
      <div className="mx-auto mt-10 flex w-full max-w-[1536px] flex-col items-center justify-between gap-5 border-t border-footer-border px-6 py-7 sm:flex-row sm:px-8 md:px-12 lg:px-16">
        <p className="text-center text-sm text-footer-muted sm:text-left">{t("copyright", { year })}</p>
        <a
          href={SITE_LINKS.aossie}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-1.5 text-sm text-footer-muted transition-colors hover:text-footer-text"
        >
          {t.rich("madeWith", {
            heart: () => (
              <Heart
                role="img"
                aria-label={t("heartLabel")}
                className="h-4 w-4 fill-brand-primary text-brand-primary transition-transform duration-300 group-hover:scale-125"
              />
            ),
          })}
        </a>
      </div>
    </footer>
  );
}
