"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import {
  Bluetooth,
  Check,
  Download,
  Lock,
  Nfc,
  QrCode,
  Receipt,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

/**
 * The visuals are illustrations of the mobile app, so they intentionally use a
 * fixed "app screen" palette (white cards on a deep green stage) that stays the
 * same in light and dark mode — just like a product photo would.
 */

/** Cycles through `length` states every `interval` ms (paused for reduced motion). */
function useTicker(length: number, interval: number) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIndex((v) => (v + 1) % length), interval);
    return () => window.clearInterval(id);
  }, [length, interval, reduce]);

  return index;
}

function Stage({ children, ref }: { children: ReactNode; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className="@container relative h-full w-full overflow-hidden rounded-[26px] bg-showcase-stage isolate">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_22%_18%,rgba(74,222,128,0.38),transparent_55%),radial-gradient(circle_at_85%_92%,rgba(0,182,67,0.35),transparent_50%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.14] bg-[radial-gradient(rgba(255,255,255,0.9)_1px,transparent_1px)] bg-size-[18px_18px]" />
      {/* Scale the whole composition down in narrow containers (phones) */}
      <div className="absolute inset-0 origin-center scale-[0.86] @sm:scale-95 @md:scale-100">{children}</div>
    </div>
  );
}

function GlassChip({
  children,
  className = "",
  delay = 0.35,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay, ease }}
      className={`absolute z-20 inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/15 px-3 py-2 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md @md:text-sm @md:px-3.5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white @md:h-8 @md:w-8 @md:text-xs"
      style={{ backgroundColor: color }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

const MEMBERS = [
  { name: "Aarav", color: "#00B643" },
  { name: "Maya", color: "#0ea5e9" },
  { name: "Leo", color: "#f59e0b" },
  { name: "Zoe", color: "#a855f7" },
];

/* ------------------------------------------------------------------ */
/* 1. Offline-first P2P sync                                           */
/* ------------------------------------------------------------------ */

function MiniPhone({
  label,
  rows,
  highlight,
  className = "w-[36%]",
}: {
  label: string;
  rows: { title: string; amount: string }[];
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative rounded-[22px] ${className} bg-white p-2 shadow-2xl ring-4 ring-black/20 @md:p-3`}>
      <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-zinc-200" />
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="truncate text-[10px] font-semibold text-zinc-800 @md:text-xs">{label}</span>
        <WifiOff className="h-3 w-3 shrink-0 text-zinc-400" aria-hidden />
      </div>
      <div className="space-y-1.5">
        {rows.map((row, i) => (
          <motion.div
            key={row.title}
            initial={highlight ? { opacity: 0, x: -12, backgroundColor: "rgba(0,182,67,0.25)" } : false}
            animate={{ opacity: 1, x: 0, backgroundColor: "rgba(0,182,67,0.06)" }}
            transition={{ duration: 0.7, delay: highlight ? 0.9 + i * 0.35 : 0, ease }}
            className="flex items-center justify-between gap-1 rounded-lg px-1.5 py-1.5 @md:px-2 @md:py-2"
          >
            <span className="truncate text-[9px] text-zinc-600 @md:text-[11px]">{row.title}</span>
            <span className="text-[9px] font-semibold text-zinc-900 @md:text-[11px]">{row.amount}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function OfflineVisual({ chip }: { chip: string }) {
  const t = useTranslations("Features.visuals");
  const reduce = useReducedMotion();
  const methods = ["WiFi Direct", "Bluetooth", "NFC"];
  const methodIndex = useTicker(methods.length, 1800);
  const MethodIcon = [Wifi, Bluetooth, Nfc][methodIndex];

  const rows = [
    { title: t("expenseCab"), amount: "$24.50" },
    { title: t("expenseDinner"), amount: "$86.40" },
    { title: t("expenseGroceries"), amount: "$32.10" },
  ];

  return (
    <Stage>
      <GlassChip className="right-4 top-4 @md:right-6 @md:top-6">
        <WifiOff className="h-4 w-4" aria-hidden />
        {chip}
      </GlassChip>

      <div className="absolute inset-0 flex items-center justify-between px-[7%] pt-6">
        <MiniPhone label={t("yourPhone")} rows={rows} />

        {/* Data packets travelling between devices */}
        <div className="relative mx-1 h-16 flex-1" aria-hidden>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <path
              d="M0 20 Q 50 -4 100 20"
              fill="none"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
              strokeDasharray="3 3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-accent-bright shadow-[0_0_14px_4px_rgba(74,222,128,0.7)]"
              initial={{ left: "0%", opacity: 0 }}
              animate={
                reduce
                  ? { left: "50%", opacity: 1, top: "20%" }
                  : { left: ["0%", "50%", "100%"], top: ["50%", "18%", "50%"], opacity: [0, 1, 0] }
              }
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
            />
          ))}
          <motion.div
            className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md @md:h-12 @md:w-12"
            animate={reduce ? undefined : { scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={methodIndex}
                initial={{ opacity: 0, rotate: -30, scale: 0.6 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.6 }}
                transition={{ duration: 0.3 }}
              >
                <MethodIcon className="h-5 w-5" />
              </motion.span>
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="relative w-[36%]">
          {!reduce &&
            [0, 1].map((i) => (
              <motion.span
                key={i}
                aria-hidden
                className="absolute inset-0 rounded-[26px] border-2 border-accent-bright/60"
                animate={{ scale: [1, 1.18], opacity: [0.7, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i, ease: "easeOut" }}
              />
            ))}
          <MiniPhone label={t("friendPhone")} rows={rows} highlight className="w-full" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease }}
        className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-2xl border border-white/20 bg-black/25 px-3.5 py-2 text-white backdrop-blur-md @md:bottom-6"
      >
        <RefreshCw className={`h-4 w-4 text-accent-bright ${reduce ? "" : "animate-spin [animation-duration:2.4s]"}`} aria-hidden />
        <span className="text-[11px] font-semibold @md:text-sm">{t("synced")}</span>
        <span className="text-[11px] text-white/60 @md:text-sm">
          <AnimatePresence mode="wait">
            <motion.span
              key={methodIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="inline-block"
            >
              {t("via", { method: methods[methodIndex] })}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Group management                                                 */
/* ------------------------------------------------------------------ */

export function GroupsVisual({ chip }: { chip: string }) {
  const t = useTranslations("Features.visuals");
  const inviteIndex = useTicker(4, 1400);
  const inviteMethods = [QrCode, Nfc, Bluetooth, Wifi];

  return (
    <Stage>
      <GlassChip className="right-4 top-4 @md:right-6 @md:top-6">
        <Users className="h-4 w-4" aria-hidden />
        {chip}
      </GlassChip>

      <div className="absolute inset-0 flex items-center justify-center px-[8%] pt-12 @md:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -2 }}
          transition={{ duration: 0.7, ease }}
          className="w-full max-w-[340px] rounded-2xl bg-white p-4 shadow-2xl @md:p-5"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00B643] text-sm font-bold text-white">
              {t("groupName").slice(0, 1)}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 @md:text-base">{t("groupName")}</p>
              <p className="text-[11px] text-zinc-500 @md:text-xs">{t("members", { count: MEMBERS.length })}</p>
            </div>
          </div>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.18, delayChildren: 0.3 } } }}
            className="space-y-2"
          >
            {MEMBERS.map((m, i) => (
              <motion.li
                key={m.name}
                variants={{
                  hidden: { opacity: 0, x: -16, scale: 0.9 },
                  visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 22 } },
                }}
                className={`flex items-center justify-between rounded-xl bg-zinc-50 px-2.5 py-1.5 ${
                  i === MEMBERS.length - 1 ? "@max-sm:hidden" : ""
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Avatar name={m.name} color={m.color} />
                  <span className="text-xs font-medium text-zinc-800 @md:text-sm">{m.name}</span>
                </span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#00B643]/15">
                  <Check className="h-3 w-3 text-[#00B643]" strokeWidth={3} aria-hidden />
                </span>
              </motion.li>
            ))}
          </motion.ul>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-[11px] font-medium text-zinc-500 @md:text-xs">{t("inviteVia")}</span>
            <div className="flex gap-1.5">
              {inviteMethods.map((Icon, i) => (
                <motion.span
                  key={i}
                  animate={{
                    backgroundColor: i === inviteIndex ? "#00B643" : "#f4f4f5",
                    color: i === inviteIndex ? "#ffffff" : "#52525b",
                    scale: i === inviteIndex ? 1.12 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg @md:h-8 @md:w-8"
                >
                  <Icon className="h-3.5 w-3.5 @md:h-4 @md:w-4" aria-hidden />
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Smart splits                                                     */
/* ------------------------------------------------------------------ */

const SPLIT_TOTAL = 120;
const SPLIT_MODES = [
  [25, 25, 25, 25],
  [40, 30, 20, 10],
  [35, 25, 30, 10],
];

export function SplitsVisual({ chip }: { chip: string }) {
  const t = useTranslations("Features.visuals");
  const mode = useTicker(SPLIT_MODES.length, 2400);
  const shares = SPLIT_MODES[mode];
  const modeLabels = [t("modeEqual"), t("modePercent"), t("modeCustom")];
  const owed = SPLIT_TOTAL - (SPLIT_TOTAL * shares[0]) / 100;

  return (
    <Stage>
      <GlassChip className="right-4 top-4 @md:right-6 @md:top-6">
        <Sparkles className="h-4 w-4" aria-hidden />
        {chip}
      </GlassChip>

      <div className="absolute inset-0 flex items-center justify-center px-[8%] pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="w-full max-w-[380px] rounded-2xl bg-white p-4 shadow-2xl @md:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#00B643]/12 text-[#00843D]">
                <Receipt className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-bold text-zinc-900">{t("splitExpense")}</p>
                <p className="text-[11px] text-zinc-500">{t("paidByYou")}</p>
              </div>
            </div>
            <span className="text-base font-bold text-zinc-900 @md:text-lg">${SPLIT_TOTAL.toFixed(2)}</span>
          </div>

          {/* Segmented control */}
          <div className="relative mb-3 grid grid-cols-3 rounded-lg bg-zinc-100 p-1">
            <motion.span
              aria-hidden
              className="absolute bottom-1 left-1 top-1 rounded-md bg-[#00B643] shadow-sm"
              style={{ width: "calc((100% - 0.5rem) / 3)" }}
              animate={{ x: `${mode * 100}%` }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
            {modeLabels.map((label, i) => (
              <span
                key={label}
                className={`relative z-10 py-1 text-center text-[11px] font-semibold transition-colors @md:text-xs ${
                  i === mode ? "text-white" : "text-zinc-500"
                }`}
              >
                {label}
              </span>
            ))}
          </div>

          <ul className="space-y-2">
            {MEMBERS.map((m, i) => (
              <li key={m.name} className="flex items-center gap-2.5">
                <Avatar name={m.name} color={m.color} />
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-[11px] @md:text-xs">
                    <span className="font-medium text-zinc-700">{m.name}</span>
                    <span className="font-semibold tabular-nums text-zinc-900">
                      ${((SPLIT_TOTAL * shares[i]) / 100).toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: m.color }}
                      animate={{ width: `${(shares[i] / 40) * 100}%` }}
                      transition={{ type: "spring", stiffness: 140, damping: 20 }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease }}
        className="absolute bottom-4 left-4 z-20 rounded-2xl border border-white/20 bg-black/25 px-3.5 py-2 text-white backdrop-blur-md @md:bottom-6 @md:left-6"
      >
        <p className="text-[10px] text-white/70 @md:text-xs">{t("youAreOwed")}</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={owed}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-base font-bold tabular-nums text-accent-bright @md:text-xl"
          >
            ${owed.toFixed(2)}
          </motion.p>
        </AnimatePresence>
      </motion.div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* 4. Receipt OCR                                                      */
/* ------------------------------------------------------------------ */

export function OcrVisual({ chip }: { chip: string }) {
  const t = useTranslations("Features.visuals");
  const reduce = useReducedMotion();

  const fields = [
    { label: t("merchant"), value: t("merchantValue") },
    { label: t("total"), value: "$86.40" },
    { label: t("date"), value: t("dateValue") },
  ];

  return (
    <Stage>
      <GlassChip className="right-4 top-4 @md:right-6 @md:top-6">
        <ScanLine className="h-4 w-4" aria-hidden />
        {chip}
      </GlassChip>

      <div className="absolute inset-0 flex items-center justify-center gap-[5%] px-[6%] pt-8">
        {/* Receipt with scanner frame */}
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ duration: 0.7, ease }}
          className="relative w-[40%] max-w-[190px]"
        >
          <div className="relative bg-white px-3 pb-5 pt-4 shadow-2xl @md:px-4">
            <p className="mb-1 text-center text-[10px] font-bold uppercase tracking-wider text-zinc-800 @md:text-xs">
              {t("merchantValue")}
            </p>
            <div className="mx-auto mb-3 h-1 w-1/2 rounded bg-zinc-200" />
            {[70, 55, 80, 45].map((w, i) => (
              <div key={i} className="mb-1.5 flex justify-between gap-2">
                <div className="h-1.5 rounded bg-zinc-200" style={{ width: `${w}%` }} />
                <div className="h-1.5 w-6 rounded bg-zinc-300" />
              </div>
            ))}
            <div className="mt-3 flex justify-between border-t border-dashed border-zinc-300 pt-2 text-[10px] font-bold text-zinc-900 @md:text-xs">
              <span>{t("total")}</span>
              <span>$86.40</span>
            </div>
            {/* Zig-zag tear edge */}
            <svg className="absolute -bottom-2 left-0 h-2 w-full" viewBox="0 0 100 8" preserveAspectRatio="none" aria-hidden>
              <polygon
                fill="#ffffff"
                points="0,0 100,0 100,8 95,0 90,8 85,0 80,8 75,0 70,8 65,0 60,8 55,0 50,8 45,0 40,8 35,0 30,8 25,0 20,8 15,0 10,8 5,0 0,8"
              />
            </svg>
          </div>

          {/* Scanner corners */}
          {["-left-3 -top-3 border-l-2 border-t-2", "-right-3 -top-3 border-r-2 border-t-2", "-bottom-5 -left-3 border-b-2 border-l-2", "-bottom-5 -right-3 border-b-2 border-r-2"].map(
            (pos) => (
              <span key={pos} aria-hidden className={`absolute h-5 w-5 rounded-sm border-accent-bright ${pos}`} />
            )
          )}
          <span
            aria-hidden
            className={`absolute -left-2 -right-2 h-0.5 rounded-full bg-accent-bright shadow-[0_0_16px_4px_rgba(74,222,128,0.75)] ${
              reduce ? "top-1/2" : "animate-scan"
            }`}
          />
        </motion.div>

        {/* Extracted fields */}
        <div className="w-[48%] max-w-[240px] rounded-2xl border border-white/20 bg-white/12 p-3 text-white backdrop-blur-md @md:p-4">
          <p className="mb-2.5 flex items-center gap-1.5 text-[10px] font-semibold text-accent-soft @md:text-xs">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            {t("detected")}
          </p>
          <div className="space-y-2">
            {fields.map((field, i) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.45, ease }}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5 @md:py-2"
              >
                <div className="min-w-0">
                  <p className="text-[9px] uppercase tracking-wide text-zinc-400 @md:text-[10px]">{field.label}</p>
                  <p className="truncate text-[11px] font-semibold text-zinc-900 @md:text-sm">{field.value}</p>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.95 + i * 0.45 }}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#00B643]"
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} aria-hidden />
                </motion.span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* 5. Visual analytics                                                 */
/* ------------------------------------------------------------------ */

export function AnalyticsVisual({ chip }: { chip: string }) {
  const t = useTranslations("Features.visuals");

  const categories = [
    { label: t("catFood"), pct: 38, amount: 471, color: "#00B643" },
    { label: t("catTravel"), pct: 27, amount: 335, color: "#38bdf8" },
    { label: t("catStay"), pct: 22, amount: 273, color: "#FFCD00" },
    { label: t("catFun"), pct: 13, amount: 161, color: "#c084fc" },
  ];
  const weekly = [42, 68, 35, 90, 58, 76];

  let offset = 0;

  return (
    <Stage>
      <GlassChip className="right-4 top-4 @md:right-6 @md:top-6">
        <Download className="h-4 w-4" aria-hidden />
        {chip}
      </GlassChip>

      <div className="absolute inset-0 flex items-center justify-center px-[7%] pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="w-full max-w-[420px] rounded-2xl bg-white p-4 shadow-2xl @md:p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold text-zinc-900">{t("groupSpending")}</p>
            <span className="rounded-full bg-[#00B643]/12 px-2 py-0.5 text-[10px] font-semibold text-[#00843D] @md:text-xs">
              {t("thisMonth")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Donut */}
            <div className="relative w-[42%] shrink-0">
              <svg viewBox="0 0 100 100" className="w-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f4f4f5" strokeWidth="14" />
                {categories.map((c, i) => {
                  const start = offset;
                  offset += c.pct;
                  return (
                    <motion.circle
                      key={c.label}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={c.color}
                      strokeWidth="14"
                      pathLength={100}
                      strokeDashoffset={-start}
                      initial={{ strokeDasharray: "0 100" }}
                      animate={{ strokeDasharray: `${c.pct - 1} 100` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.2, ease }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-zinc-900 @md:text-lg">$1,240</span>
              </div>
            </div>

            {/* Legend */}
            <ul className="flex-1 space-y-1.5">
              {categories.map((c, i) => (
                <motion.li
                  key={c.label}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12 }}
                  className="flex items-center justify-between text-[11px] @md:text-xs"
                >
                  <span className="flex items-center gap-1.5 text-zinc-600">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.label}
                  </span>
                  <span className="font-semibold tabular-nums text-zinc-900">${c.amount}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Weekly bars */}
          <div className="mt-4 flex h-16 items-end gap-2 border-t border-zinc-100 pt-3 @md:h-20">
            {weekly.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.7, delay: 0.6 + i * 0.08, ease }}
                className={`flex-1 rounded-t-md ${i === 3 ? "bg-[#00B643]" : "bg-[#00B643]/25"}`}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </Stage>
  );
}

/* ------------------------------------------------------------------ */
/* 6. Privacy by design                                                */
/* ------------------------------------------------------------------ */

const CIPHER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const CIPHER_SEED = "k9Qx+2fLzA7mR0vT4bWc8yNe";

function useCipherText(length: number, inView = true) {
  const reduce = useReducedMotion();
  const [text, setText] = useState(CIPHER_SEED.slice(0, length));

  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => {
      setText(
        Array.from({ length }, () => CIPHER_CHARS[Math.floor(Math.random() * CIPHER_CHARS.length)]).join("")
      );
    }, 90);
    return () => window.clearInterval(id);
  }, [length, reduce, inView]);

  return text;
}

export function PrivacyVisual({ chip }: { chip: string }) {
  const t = useTranslations("Features.visuals");
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef);
  const cipher = useCipherText(20, inView);

  const stats = [
    { value: "0", label: t("servers"), pos: "left-[6%] top-[30%]" },
    { value: "0", label: t("trackers"), pos: "right-[6%] top-[42%]" },
    { value: "100%", label: t("onDevice"), pos: "left-[10%] bottom-[16%]" },
  ];

  return (
    <Stage ref={stageRef}>
      <GlassChip className="right-4 top-4 @md:right-6 @md:top-6">
        <Lock className="h-4 w-4" aria-hidden />
        {chip}
      </GlassChip>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex h-[62%] aspect-square items-center justify-center">
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute inset-0 h-full w-full"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            aria-hidden
          >
            <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 6" />
            <circle cx="100" cy="4" r="4" fill="#4ade80" />
          </motion.svg>
          <motion.svg
            viewBox="0 0 200 200"
            className="absolute inset-[14%] h-[72%] w-[72%]"
            animate={reduce ? undefined : { rotate: -360 }}
            transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
            aria-hidden
          >
            <circle cx="100" cy="100" r="96" fill="none" stroke="rgba(74,222,128,0.5)" strokeWidth="1.5" strokeDasharray="30 14" />
          </motion.svg>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.15 }}
            className="relative flex h-[44%] w-[44%] items-center justify-center rounded-[28%] bg-linear-to-br from-accent-bright to-[#00843D] shadow-[0_0_60px_10px_rgba(74,222,128,0.35)]"
          >
            <ShieldCheck className="h-1/2 w-1/2 text-white" strokeWidth={1.8} aria-hidden />
          </motion.div>
        </div>
      </div>

      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -5, 0] }}
          transition={{
            opacity: { delay: 0.4 + i * 0.15, duration: 0.4 },
            scale: { delay: 0.4 + i * 0.15, duration: 0.4 },
            y: { duration: 3 + i, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`absolute z-10 rounded-xl border border-white/20 bg-white/12 px-3 py-1.5 text-white backdrop-blur-md @md:px-4 @md:py-2 ${s.pos}`}
        >
          <p className="text-base font-bold leading-tight @md:text-2xl">{s.value}</p>
          <p className="text-[10px] text-white/70 @md:text-xs">{s.label}</p>
        </motion.div>
      ))}

      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-xl border border-white/15 bg-black/30 px-3 py-1.5 backdrop-blur-md @md:bottom-6 @md:right-6">
        <Lock className="h-3.5 w-3.5 shrink-0 text-accent-bright" aria-hidden />
        <span className="hidden text-[10px] text-white/60 @sm:inline @md:text-xs">{t("encrypted")}</span>
        <span className="font-mono text-[10px] tracking-wider text-accent-soft @md:text-xs" aria-hidden>
          {cipher}
        </span>
      </div>
    </Stage>
  );
}
