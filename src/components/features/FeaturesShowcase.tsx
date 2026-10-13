"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ComponentType } from "react";
import { useTranslations } from "next-intl";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useLenis } from "lenis/react";
import { ArrowRight, Check } from "lucide-react";
import { SITE_LINKS } from "@/config/links";
import {
  AnalyticsVisual,
  GroupsVisual,
  OcrVisual,
  OfflineVisual,
  PrivacyVisual,
  SplitsVisual,
} from "@/components/features/FeatureVisuals";

const ease = [0.16, 1, 0.3, 1] as const;

const FEATURES: { key: string; Visual: ComponentType<{ chip: string }> }[] = [
  { key: "offline", Visual: OfflineVisual },
  { key: "groups", Visual: GroupsVisual },
  { key: "splits", Visual: SplitsVisual },
  { key: "ocr", Visual: OcrVisual },
  { key: "analytics", Visual: AnalyticsVisual },
  { key: "privacy", Visual: PrivacyVisual },
];

const POINTS = ["p1", "p2", "p3"] as const;

/** Viewport-heights of scrolling spent on each feature while the card is pinned. */
const SCROLL_PER_FEATURE_VH = 70;

const pad = (n: number) => String(n).padStart(2, "0");

function CardShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-[32px] border border-showcase-border bg-linear-to-br from-showcase-from to-showcase-to shadow-2xl shadow-black/20 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,var(--showcase-glow),transparent_45%),radial-gradient(circle_at_100%_100%,var(--showcase-glow),transparent_40%)] opacity-70" />
      {children}
    </div>
  );
}

function PointList({ featureKey }: { featureKey: string }) {
  const t = useTranslations("Features.items");
  return (
    <ul className="space-y-2 tall:space-y-2.5">
      {POINTS.map((p, i) => (
        <motion.li
          key={p}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 + i * 0.07, ease }}
          className="flex items-start gap-2.5 text-[15px] leading-snug text-white/90 xl:text-base"
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-bright" strokeWidth={3} aria-hidden />
          <span>{t(`${featureKey}.${p}`)}</span>
        </motion.li>
      ))}
    </ul>
  );
}

function CtaLink() {
  const t = useTranslations("Features");
  return (
    <a
      href={SITE_LINKS.playStore}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 rounded-lg border border-white/70 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-showcase-from focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {t("cta")}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
    </a>
  );
}

function SectionHeading() {
  const t = useTranslations("Features");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6, ease }}
    >
      <h2 className="text-4xl font-medium leading-[1.1] tracking-tight text-brand-heading sm:text-5xl lg:text-7xl">
        {t("heading")}
      </h2>
      <p className="mt-3 text-base text-foreground-muted sm:text-lg lg:mt-4">{t("subheading")}</p>
    </motion.div>
  );
}

/** Mounts the (animated) visual only while it is near the viewport. */
function LazyVisual({ Visual, chip }: { Visual: ComponentType<{ chip: string }>; chip: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px 0px" });
  return (
    <div ref={ref} className="h-full w-full">
      {inView ? <Visual chip={chip} /> : <div className="h-full w-full rounded-[26px] bg-showcase-stage" />}
    </div>
  );
}

export default function FeaturesShowcase() {
  const t = useTranslations("Features");
  const reduce = useReducedMotion();
  const lenis = useLenis();
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopVisualRef = useRef<HTMLDivElement>(null);
  const isDesktopVisualInView = useInView(desktopVisualRef, { margin: "120px 0px" });
  const [active, setActive] = useState(0);
  const total = FEATURES.length;

  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = Math.min(total - 1, Math.max(0, Math.floor(v * total)));
    setActive((prev) => (prev === next ? prev : next));
  });

  // Progress through the currently active feature (0 → 1)
  const stepProgress = useTransform(scrollYProgress, (v) => (v >= 1 ? 1 : v * total - Math.floor(v * total)));

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const scrollable = track.offsetHeight - window.innerHeight;
    const y = top + scrollable * ((index + 0.35) / total);
    if (lenis) {
      lenis.scrollTo(y, { duration: 1.1 });
    } else {
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }
  };

  // ---- Keep the active feature fully visible inside the pinned card ----
  const listViewportRef = useRef<HTMLDivElement>(null);
  const listContentRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const activeRef = useRef(active);
  const hasFitted = useRef(false);
  const [listOverflows, setListOverflows] = useState(false);
  const listY = useSpring(0, { stiffness: 220, damping: 32 });

  const fitList = useCallback(() => {
    const viewport = listViewportRef.current;
    const content = listContentRef.current;
    const item = itemRefs.current[activeRef.current];
    if (!viewport || !content || !item) return;

    const viewportH = viewport.clientHeight;
    const contentH = content.offsetHeight;
    let target: number;
    if (contentH <= viewportH) {
      target = (viewportH - contentH) / 2; // fits: vertically centre
    } else {
      // too tall: bring the active item (title + details) fully into view
      const ideal = item.offsetHeight >= viewportH ? item.offsetTop : item.offsetTop - (viewportH - item.offsetHeight) / 2;
      target = -Math.min(Math.max(ideal, 0), contentH - viewportH);
    }
    setListOverflows(contentH > viewportH + 1);

    if (!hasFitted.current || reduce) {
      listY.jump(target);
      hasFitted.current = true;
    } else {
      listY.set(target);
    }
  }, [listY, reduce]);

  useLayoutEffect(() => {
    activeRef.current = active;
    fitList();
  }, [active, fitList]);

  // Re-fit while items expand/collapse and when the viewport resizes
  useEffect(() => {
    const observer = new ResizeObserver(() => fitList());
    if (listViewportRef.current) observer.observe(listViewportRef.current);
    if (listContentRef.current) observer.observe(listContentRef.current);
    return () => observer.disconnect();
  }, [fitList]);

  const ActiveVisual = FEATURES[active].Visual;

  return (
    <section
      id="features"
      aria-label={t("heading")}
      className="relative bg-background-primary pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-8 lg:pb-24"
    >
      {/* Mobile / tablet heading (desktop heading is pinned together with the card) */}
      <div className="mx-auto w-full max-w-[1536px] px-6 sm:px-8 md:px-12 lg:hidden">
        <SectionHeading />
      </div>

      {/* ---------- Desktop: pinned heading + card driven by scroll ---------- */}
      <div
        ref={trackRef}
        className="relative hidden lg:block"
        style={{ height: `${total * SCROLL_PER_FEATURE_VH + 100}vh` }}
      >
        <div className="sticky top-20 h-[calc(100vh-5rem)]">
          <div className="mx-auto flex h-full w-full max-w-[1536px] flex-col justify-center px-6 py-5 sm:px-8 md:px-12 lg:px-16 tall:py-8">
            <div className="mb-5 shrink-0 tall:mb-8">
              <SectionHeading />
            </div>
            <CardShell className="grid min-h-0 w-full max-h-[640px] flex-1 grid-cols-12 gap-10 px-8 py-7 xl:gap-14 xl:px-12 tall:py-10">
              {/* Left: feature list */}
              <div
                ref={listViewportRef}
                className={`relative col-span-5 min-h-0 overflow-hidden ${
                  listOverflows
                    ? "mask-[linear-gradient(to_bottom,transparent,black_7%,black_93%,transparent)]"
                    : ""
                }`}
              >
                <motion.div ref={listContentRef} style={{ y: listY }} className="absolute inset-x-0 top-0">
                <p className="mb-3 font-mono text-xs font-medium tracking-[0.2em] text-accent-soft tall:mb-5" aria-live="polite">
                  <span className="sr-only">{t("stepLabel", { current: active + 1, total })}</span>
                  <span aria-hidden>
                    {pad(active + 1)} <span className="text-white/35">/ {pad(total)}</span>
                  </span>
                </p>

                <ol className="space-y-1">
                  {FEATURES.map((feature, i) => {
                    const isActive = i === active;
                    return (
                      <li
                        key={feature.key}
                        ref={(el) => {
                          itemRefs.current[i] = el;
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => goTo(i)}
                          aria-current={isActive ? "step" : undefined}
                          className={`block text-left font-semibold leading-[1.15] tracking-tight transition-colors duration-300 text-[clamp(1.3rem,min(2.5vw,3.4vh),2.6rem)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded-md cursor-pointer ${
                            isActive ? "text-white" : "text-white/25 hover:text-white/55"
                          }`}
                        >
                          {t(`items.${feature.key}.title`)}
                        </button>

                        <AnimatePresence initial={false}>
                          {isActive && (
                            <motion.div
                              key="details"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.45, ease }}
                              className="overflow-hidden"
                            >
                              <div className="pb-4 pt-2 tall:pb-5 tall:pt-3">
                                <PointList featureKey={feature.key} />
                                <div className="mt-4 flex items-center gap-5 tall:mt-5">
                                  <CtaLink />
                                  <div className="h-1 flex-1 max-w-40 overflow-hidden rounded-full bg-white/15" aria-hidden>
                                    <motion.div
                                      className="h-full origin-left rounded-full bg-accent-bright"
                                      style={{ scaleX: stepProgress }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ol>
                </motion.div>
              </div>

              {/* Right: animated visual */}
              <div ref={desktopVisualRef} className="relative col-span-7 min-h-0">
                {isDesktopVisualInView ? (
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={FEATURES[active].key}
                      initial={{ opacity: 0, scale: 1.04, filter: "blur(10px)" }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                      transition={{ duration: reduce ? 0 : 0.55, ease }}
                      className="absolute inset-0"
                    >
                      <ActiveVisual chip={t(`items.${FEATURES[active].key}.chip`)} />
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <div className="h-full w-full rounded-[26px] bg-showcase-stage" />
                )}
              </div>
            </CardShell>
          </div>
        </div>
      </div>

      {/* ---------- Mobile / tablet: stacked cards ---------- */}
      <div className="mx-auto mt-8 w-full max-w-[1536px] space-y-5 px-6 pb-4 sm:mt-10 sm:space-y-6 sm:px-8 md:px-12 lg:hidden">
        {FEATURES.map((feature, i) => (
          <motion.article
            key={feature.key}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease }}
          >
            <CardShell className="p-4 sm:p-6 md:grid md:grid-cols-2 md:items-center md:gap-8">
              <div className="aspect-square w-full sm:aspect-4/3">
                <LazyVisual Visual={feature.Visual} chip={t(`items.${feature.key}.chip`)} />
              </div>
              <div className="px-1 pb-2 pt-5 md:pt-0">
                <p className="mb-2 font-mono text-xs tracking-[0.2em] text-accent-soft">
                  {pad(i + 1)} <span className="text-white/35">/ {pad(total)}</span>
                </p>
                <h3 className="mb-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {t(`items.${feature.key}.title`)}
                </h3>
                <PointList featureKey={feature.key} />
              </div>
            </CardShell>
          </motion.article>
        ))}
        <div className="flex justify-center pt-2">
          <a
            href={SITE_LINKS.playStore}
      target="_blank"
      rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand-primary px-7 py-3 text-sm font-semibold text-white shadow-md shadow-brand-primary/25 transition-all hover:bg-brand-hover active:scale-95"
          >
            {t("cta")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
