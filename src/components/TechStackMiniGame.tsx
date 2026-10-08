"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, useAnimation, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useTranslations } from "next-intl";

// --- Authentic SVG Icons for Zplit Tech Stack ---

// 1. Zplit App Base Icon
const IconZplit = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

// 2. Flutter Official Logo
const IconFlutter = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M14.314 0L2.3 12 6 15.7 21.684 0h-7.37zM14.314 11.033l-5.63 5.632 5.63 5.635h7.37L16.05 16.665l5.634-5.632h-7.37z" />
  </svg>
);

// 3. Riverpod State Management Logo
const IconRiverpod = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9.5" />
    <circle cx="12" cy="12" r="5.5" strokeDasharray="3 3" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// 4. Hive / Drift Database Logo
const IconHive = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M12 2l8.5 4.9v9.8L12 21.5 3.5 16.7V6.9L12 2zm0 2.3L5.5 7.9v7.8L12 19.3l6.5-3.6V7.9L12 4.3zM12 7l4.5 2.6v5.2L12 17.4l-4.5-2.6V9.6L12 7z" />
  </svg>
);

// 5. Encrypted Storage (Hardware Keystore & Vault)
const IconEncryptedStorage = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="11" width="18" height="11" rx="3" ry="3" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    <path d="M12 17.5v2" />
  </svg>
);

// 6. Google ML Kit OCR Logo
const IconMlKit = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 7V4h3" />
    <path d="M17 4h3v3" />
    <path d="M20 17v3h-3" />
    <path d="M7 20H4v-3" />
    <path d="M8 9h8" />
    <path d="M12 9v6" />
    <path d="M9 15h6" />
  </svg>
);

// 7. TensorFlow Lite Official Logo
const IconTensorFlow = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M1.292 5.856L11.54 0v24l-4.095-2.397V8.252l-6.153 3.593V5.856zm21.416 0L12.46 0v24l4.095-2.397V8.252l6.153 3.593V5.856z" />
  </svg>
);

// 8. fl_chart Library Logo
const IconFlChart = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
    <path d="M3 20h18" />
  </svg>
);

// 9. Real-time Analytics Live Pulse Logo
const IconRealtimeAnalytics = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// 10. USDC / DAI Official Web3 Currency Logo
const IconUsdcDai = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v10M9 9.5a2.5 2.5 0 0 1 5 0c0 2-3 2-3 3.5h3" />
  </svg>
);

// 11. Smart Contracts EVM Blockchain Logo
const IconSmartContracts = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M11.999 0L4.5 12.22l7.499 4.432 7.5-4.432L11.999 0zm0 18.064L4.5 13.633 12 24l7.5-10.367-7.501 4.431z" />
  </svg>
);

// 12. E2E Encryption Shield & Key Logo
const IconE2E = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="10.5" r="1.5" />
    <path d="M12 12v3.5" />
  </svg>
);

// 13. Zero-Knowledge Private Mesh Sync Logo
const IconZkSync = ({ className, size }: { className?: string; size?: number | string }) => (
  <svg
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

// --- Grid & Lego Dimensions ---
const GRID_CONSTANTS = {
  STUD_WIDTH: 65,
  ROW_HEIGHT: 78,
  MAX_ROWS: 20,
  COLS: 6,
  APEX_HEIGHT: 150,
};

const STUD_THEMES = {
  brandGreen: {
    wall: "linear-gradient(90deg, #006124 0%, #00843d 20%, #00b643 38%, #10d456 50%, #00b643 62%, #00843d 80%, #006124 100%)",
    cap: "linear-gradient(135deg, #4ade80 0%, #22c55e 40%, #00b643 70%, #00843d 100%)",
    shadow: "radial-gradient(ellipse, rgba(0,50,15,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  flutterBlue: {
    wall: "linear-gradient(90deg, #01579b 0%, #0288d1 20%, #03a9f4 38%, #29b6f6 50%, #03a9f4 62%, #0288d1 80%, #01579b 100%)",
    cap: "linear-gradient(135deg, #81d4fa 0%, #4fc3f7 40%, #0288d1 70%, #01579b 100%)",
    shadow: "radial-gradient(ellipse, rgba(1,87,155,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  riverpodBlue: {
    wall: "linear-gradient(90deg, #0d47a1 0%, #1565c0 20%, #1e88e5 38%, #42a5f5 50%, #1e88e5 62%, #1565c0 80%, #0d47a1 100%)",
    cap: "linear-gradient(135deg, #90caf9 0%, #64b5f6 40%, #1e88e5 70%, #1565c0 100%)",
    shadow: "radial-gradient(ellipse, rgba(13,71,161,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  hiveAmber: {
    wall: "linear-gradient(90deg, #b45309 0%, #d97706 20%, #f59e0b 38%, #fbbf24 50%, #f59e0b 62%, #d97706 80%, #b45309 100%)",
    cap: "linear-gradient(135deg, #fef08a 0%, #fde047 40%, #f59e0b 70%, #d97706 100%)",
    shadow: "radial-gradient(ellipse, rgba(180,83,9,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  storageSlate: {
    wall: "linear-gradient(90deg, #1e293b 0%, #334155 20%, #475569 38%, #64748b 50%, #475569 62%, #334155 80%, #1e293b 100%)",
    cap: "linear-gradient(135deg, #94a3b8 0%, #64748b 40%, #475569 70%, #334155 100%)",
    shadow: "radial-gradient(ellipse, rgba(15,23,42,0.7) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.5)",
  },
  mlkitPurple: {
    wall: "linear-gradient(90deg, #581c87 0%, #7e22ce 20%, #9333ea 38%, #a855f7 50%, #9333ea 62%, #7e22ce 80%, #581c87 100%)",
    cap: "linear-gradient(135deg, #e9d5ff 0%, #d8b4fe 40%, #a855f7 70%, #9333ea 100%)",
    shadow: "radial-gradient(ellipse, rgba(88,28,135,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  tfOrange: {
    wall: "linear-gradient(90deg, #9a3412 0%, #c2410c 20%, #ea580c 38%, #ff6f00 50%, #ea580c 62%, #c2410c 80%, #9a3412 100%)",
    cap: "linear-gradient(135deg, #fed7aa 0%, #fdba74 40%, #ff6f00 70%, #ea580c 100%)",
    shadow: "radial-gradient(ellipse, rgba(154,52,18,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  chartTeal: {
    wall: "linear-gradient(90deg, #115e59 0%, #0f766e 20%, #0d9488 38%, #14b8a6 50%, #0d9488 62%, #0f766e 80%, #115e59 100%)",
    cap: "linear-gradient(135deg, #99f6e4 0%, #5eead4 40%, #2dd4bf 70%, #14b8a6 100%)",
    shadow: "radial-gradient(ellipse, rgba(17,94,89,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  analyticsIndigo: {
    wall: "linear-gradient(90deg, #312e81 0%, #3730a3 20%, #4338ca 38%, #6366f1 50%, #4338ca 62%, #3730a3 80%, #312e81 100%)",
    cap: "linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 40%, #6366f1 70%, #4f46e5 100%)",
    shadow: "radial-gradient(ellipse, rgba(49,46,129,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  usdcBlue: {
    wall: "linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 20%, #2563eb 38%, #2775ca 50%, #2563eb 62%, #1d4ed8 80%, #1e3a8a 100%)",
    cap: "linear-gradient(135deg, #bfdbfe 0%, #93c5fd 40%, #2775ca 70%, #2563eb 100%)",
    shadow: "radial-gradient(ellipse, rgba(30,58,138,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  contractsViolet: {
    wall: "linear-gradient(90deg, #4c1d95 0%, #5b21b6 20%, #6d28d9 38%, #7c3aed 50%, #6d28d9 62%, #5b21b6 80%, #4c1d95 100%)",
    cap: "linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 40%, #8b5cf6 70%, #6d28d9 100%)",
    shadow: "radial-gradient(ellipse, rgba(76,29,149,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  securityRose: {
    wall: "linear-gradient(90deg, #881337 0%, #9f1239 20%, #be123c 38%, #e11d48 50%, #be123c 62%, #9f1239 80%, #881337 100%)",
    cap: "linear-gradient(135deg, #fecdd3 0%, #fda4af 40%, #f43f5e 70%, #e11d48 100%)",
    shadow: "radial-gradient(ellipse, rgba(136,19,55,0.6) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.7)",
  },
  zkSyncBlue: {
    wall: "linear-gradient(90deg, #0f172a 0%, #1e293b 20%, #2563eb 38%, #3b82f6 50%, #2563eb 62%, #1e293b 80%, #0f172a 100%)",
    cap: "linear-gradient(135deg, #93c5fd 0%, #60a5fa 40%, #3b82f6 70%, #2563eb 100%)",
    shadow: "radial-gradient(ellipse, rgba(15,23,42,0.8) 0%, transparent 70%)",
    rim: "rgba(255,255,255,0.6)",
  },
};

type StudColor = keyof typeof STUD_THEMES;

const LegoStud = React.memo(({ color = "brandGreen", yOffset = 0 }: { color?: StudColor; yOffset?: number }) => {
  const t = STUD_THEMES[color] || STUD_THEMES.brandGreen;
  const studHeight = 15;
  const studWidth = 70;
  const studCapHeight = 15;

  return (
    <div className="flex-1 flex items-end justify-center relative" style={{ transform: `translateY(${yOffset}px)` }}>
      <div
        className="absolute bottom-[-3px] left-1/2 -translate-x-1/2 w-[75%] rounded-[50%] z-0"
        style={{ height: "10px", background: t.shadow }}
      />

      <div className="relative z-10" style={{ width: `${studWidth}%`, maxWidth: "40px", marginBottom: "-1px" }}>
        <div
          className="w-full relative overflow-hidden"
          style={{ height: `${studHeight}px`, borderRadius: "50% / 20%", background: t.wall }}
        >
          <div
            className="absolute top-0 h-full w-[25%] left-[20%]"
            style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.25), transparent)" }}
          />
        </div>

        <div
          className="absolute left-0 w-full rounded-[50%] flex items-center justify-center overflow-hidden"
          style={{
            top: `-${studCapHeight / 2}px`,
            height: `${studCapHeight}px`,
            background: t.cap,
            boxShadow: `inset 0px 2px 4px rgba(255,255,255,0.6), inset 0px -2px 4px rgba(0,0,0,0.2), 0px 1px 1px rgba(0,0,0,0.4)`,
            borderTop: `1px solid ${t.rim}`,
          }}
        >
          <span
            className="text-[9px] font-black tracking-widest select-none pointer-events-none opacity-75"
            style={{
              color: "rgba(0,0,0,0.2)",
              textShadow: "0px 1px 0px rgba(255,255,255,0.6)",
              transform: "scaleY(0.55) translateY(-1px)",
            }}
          >
            Z
          </span>
        </div>
      </div>
    </div>
  );
});
LegoStud.displayName = "LegoStud";

interface LegoBlockProps {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  topColor: string;
  faceGradient: string;
  bottomColor: string;
  topHeight?: number;
  bottomHeight?: number;
  roundedTop?: boolean;
  roundedBottom?: boolean;
  className?: string;
  children: React.ReactNode;
  studs?: number;
  studColor?: StudColor;
  hideStuds?: boolean | number[];
  studYOffset?: number;
}

const LegoBlock = React.memo(({
  mouseX,
  mouseY,
  topColor,
  faceGradient,
  bottomColor,
  topHeight = 18,
  bottomHeight = 14,
  roundedTop = false,
  roundedBottom = false,
  className = "",
  children,
  studs = 0,
  studColor = "brandGreen",
  hideStuds = false,
  studYOffset = 12,
}: LegoBlockProps) => {
  const topDarkenEnd = 80;
  const topShadow = "inset 0px 0px 4px rgba(0,0,0,0.28)";
  const faceShadow = "inset 0px 2px 6px rgba(255,255,255,0.45)";

  const highlightBg = useMotionTemplate`radial-gradient(circle 120px at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.25), transparent)`;

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className="relative w-full"
        style={{
          height: `${topHeight}px`,
          background: `linear-gradient(to bottom, ${topColor}, color-mix(in srgb, ${topColor} ${topDarkenEnd}%, black))`,
          boxShadow: topShadow,
          borderRadius: roundedTop ? "4px 4px 0 0" : "0",
        }}
      >
        {studs > 0 && (
          <div className="absolute bottom-full left-0 w-full flex">
            {[...Array(studs)].map((_, i) => {
              const isHidden = Array.isArray(hideStuds) ? hideStuds.includes(i) : hideStuds;
              return isHidden ? (
                <div key={i} className="flex-1" />
              ) : (
                <LegoStud key={i} color={studColor} yOffset={studYOffset} />
              );
            })}
          </div>
        )}
      </div>
      <div
        className="relative w-full border-x border-black/5 overflow-hidden"
        style={{
          background: faceGradient,
          boxShadow: faceShadow,
        }}
      >
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none opacity-60"
          style={{
            background: highlightBg,
          }}
        />
        <div className="relative z-30">{children}</div>
      </div>
      <div
        className="relative w-full"
        style={{
          height: `${bottomHeight}px`,
          background: bottomColor,
          boxShadow: "inset 0px 2px 4px rgba(0,0,0,0.15)",
          borderRadius: roundedBottom ? "0 0 4px 4px" : "0",
        }}
      />
    </div>
  );
});
LegoBlock.displayName = "LegoBlock";

// --- Exact Zplit Tech Stack Items from Image ---
export interface TechModule {
  id: string;
  name: string;
  desc: string;
  category: "Frontend" | "Storage" | "AI/ML" | "Visualization" | "Future: Web3" | "Security";
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  studs: number;
  colors: {
    topColor: string;
    faceGradient: string;
    bottomColor: string;
    studColor: StudColor;
    iconBg: string;
    iconColor: string;
  };
}

export const ALL_TECH_MODULES: TechModule[] = [
  // 1. Frontend
  {
    id: "flutter",
    name: "Flutter",
    desc: "Android, iOS, Web",
    category: "Frontend",
    icon: IconFlutter,
    studs: 4,
    colors: {
      topColor: "#02569b",
      faceGradient: "linear-gradient(180deg, #29b6f6 0%, #0288d1 50%, #01579b 100%)",
      bottomColor: "#013f70",
      studColor: "flutterBlue",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  {
    id: "riverpod",
    name: "Riverpod",
    desc: "State Management",
    category: "Frontend",
    icon: IconRiverpod,
    studs: 2,
    colors: {
      topColor: "#0d47a1",
      faceGradient: "linear-gradient(180deg, #42a5f5 0%, #1e88e5 50%, #1565c0 100%)",
      bottomColor: "#0a2f6c",
      studColor: "riverpodBlue",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  // 2. Storage
  {
    id: "hive-drift",
    name: "Hive / Drift",
    desc: "Local DB Storage",
    category: "Storage",
    icon: IconHive,
    studs: 4,
    colors: {
      topColor: "#b45309",
      faceGradient: "linear-gradient(180deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
      bottomColor: "#78350f",
      studColor: "hiveAmber",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  {
    id: "encrypted-storage",
    name: "Encrypted Storage",
    desc: "KeyStore Vault",
    category: "Storage",
    icon: IconEncryptedStorage,
    studs: 2,
    colors: {
      topColor: "#334155",
      faceGradient: "linear-gradient(180deg, #64748b 0%, #475569 50%, #334155 100%)",
      bottomColor: "#1e293b",
      studColor: "storageSlate",
      iconBg: "bg-white/15 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  // 3. AI / ML
  {
    id: "mlkit-ocr",
    name: "ML Kit OCR",
    desc: "Receipt Scanner",
    category: "AI/ML",
    icon: IconMlKit,
    studs: 2,
    colors: {
      topColor: "#7e22ce",
      faceGradient: "linear-gradient(180deg, #c084fc 0%, #9333ea 50%, #7e22ce 100%)",
      bottomColor: "#581c87",
      studColor: "mlkitPurple",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  {
    id: "tflite",
    name: "TensorFlow Lite",
    desc: "Edge Neural AI",
    category: "AI/ML",
    icon: IconTensorFlow,
    studs: 4,
    colors: {
      topColor: "#c2410c",
      faceGradient: "linear-gradient(180deg, #fb923c 0%, #ff6f00 50%, #ea580c 100%)",
      bottomColor: "#7c2d12",
      studColor: "tfOrange",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  // 4. Visualization
  {
    id: "flchart",
    name: "fl_chart",
    desc: "Financial Charts",
    category: "Visualization",
    icon: IconFlChart,
    studs: 2,
    colors: {
      topColor: "#0f766e",
      faceGradient: "linear-gradient(180deg, #2dd4bf 0%, #14b8a6 50%, #0d9488 100%)",
      bottomColor: "#115e59",
      studColor: "chartTeal",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  {
    id: "realtime-analytics",
    name: "Real-time Analytics",
    desc: "Live Insights",
    category: "Visualization",
    icon: IconRealtimeAnalytics,
    studs: 4,
    colors: {
      topColor: "#3730a3",
      faceGradient: "linear-gradient(180deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)",
      bottomColor: "#312e81",
      studColor: "analyticsIndigo",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  // 5. Future: Web3
  {
    id: "usdc-settlement",
    name: "USDC / DAI",
    desc: "Settlements",
    category: "Future: Web3",
    icon: IconUsdcDai,
    studs: 2,
    colors: {
      topColor: "#1d4ed8",
      faceGradient: "linear-gradient(180deg, #60a5fa 0%, #2775ca 50%, #1d4ed8 100%)",
      bottomColor: "#1e3a8a",
      studColor: "usdcBlue",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  {
    id: "smart-contracts",
    name: "Smart Contracts",
    desc: "Future Web3",
    category: "Future: Web3",
    icon: IconSmartContracts,
    studs: 4,
    colors: {
      topColor: "#5b21b6",
      faceGradient: "linear-gradient(180deg, #a78bfa 0%, #7c3aed 50%, #6d28d9 100%)",
      bottomColor: "#4c1d95",
      studColor: "contractsViolet",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  // 6. Security
  {
    id: "e2e-encryption",
    name: "E2E Encryption",
    desc: "AES-256 GCM",
    category: "Security",
    icon: IconE2E,
    studs: 2,
    colors: {
      topColor: "#9f1239",
      faceGradient: "linear-gradient(180deg, #fb7185 0%, #e11d48 50%, #be123c 100%)",
      bottomColor: "#881337",
      studColor: "securityRose",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
  {
    id: "zk-sync",
    name: "Zero-Knowledge Sync",
    desc: "Private Mesh",
    category: "Security",
    icon: IconZkSync,
    studs: 4,
    colors: {
      topColor: "#1e293b",
      faceGradient: "linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)",
      bottomColor: "#0f172a",
      studColor: "zkSyncBlue",
      iconBg: "bg-black/25 shadow-inner",
      iconColor: "text-white drop-shadow-sm",
    },
  },
];

const ModuleBlock = React.memo(({
  module,
  hiddenStuds = [],
  onClick,
  isAnimating,
  startRect,
  mouseX,
  mouseY,
  onAnimationComplete,
  isEquipped = false,
}: {
  module: TechModule;
  hiddenStuds?: number[];
  onClick: (e: React.MouseEvent) => void;
  isAnimating?: boolean;
  startRect?: DOMRect | null;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  onAnimationComplete?: (id: string) => void;
  isEquipped?: boolean;
}) => {
  const t = useTranslations("TechStack");
  const moduleName = t(`modules.${module.id}.name`);
  const moduleDesc = t(`modules.${module.id}.desc`);
  const actionLabel = isEquipped
    ? t("actions.remove", { name: moduleName })
    : t("actions.equip", { name: moduleName });

  const widthPx = module.studs * GRID_CONSTANTS.STUD_WIDTH;
  const isCompact = module.studs <= 2;
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAnimating && startRect && wrapperRef.current) {
      const endRect = wrapperRef.current.getBoundingClientRect();
      const dx = startRect.left - endRect.left;
      const dy = startRect.top - endRect.top;

      const apexY = Math.min(dy, 0) - GRID_CONSTANTS.APEX_HEIGHT;

      const animation = wrapperRef.current.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(1, 1)`, filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))", offset: 0 },
          { transform: `translate(${dx}px, ${dy}px) scale(1.1, 0.85)`, filter: "drop-shadow(0px 5px 5px rgba(0,0,0,0.3))", offset: 0.15 },
          { transform: `translate(${dx * 0.75}px, ${dy + (apexY - dy) * 0.5}px) scale(0.9, 1.15)`, filter: "drop-shadow(0px 30px 20px rgba(0,0,0,0.05))", offset: 0.35 },
          { transform: `translate(${dx * 0.5}px, ${apexY}px) scale(1, 1)`, filter: "drop-shadow(0px 40px 20px rgba(0,0,0,0))", offset: 0.55 },
          { transform: `translate(${dx * 0.25}px, ${apexY * 0.5}px) scale(0.9, 1.15)`, filter: "drop-shadow(0px 30px 20px rgba(0,0,0,0.05))", offset: 0.75 },
          { transform: `translate(0px, 0px) scale(1.15, 0.85)`, filter: "drop-shadow(0px 5px 5px rgba(0,0,0,0.3))", offset: 0.9 },
          { transform: `translate(0px, 0px) scale(1, 1)`, filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.2))", offset: 1 },
        ],
        {
          duration: 1100,
          easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          fill: "both",
        }
      );

      animation.onfinish = () => onAnimationComplete?.(module.id);
      return () => animation.cancel();
    }
  }, [isAnimating, startRect, onAnimationComplete, module.id]);

  return (
    <div ref={wrapperRef} className="z-40 relative lego-block-wrapper transform-gpu will-change-transform" style={{ width: widthPx }}>
      <button
        type="button"
        onClick={onClick}
        aria-label={actionLabel}
        className="cursor-pointer w-full shrink-0 touch-none group relative focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary rounded-lg hover:-translate-y-1.5 active:scale-95 transition-all duration-200 text-left"
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors z-30 rounded-lg pointer-events-none" />
        <LegoBlock
          mouseX={mouseX}
          mouseY={mouseY}
          topColor={module.colors.topColor}
          faceGradient={module.colors.faceGradient}
          bottomColor={module.colors.bottomColor}
          roundedTop
          roundedBottom
          studs={module.studs}
          studColor={module.colors.studColor}
          hideStuds={hiddenStuds}
        >
          <div className={`flex items-center w-full h-[58px] ${isCompact ? "px-2.5 gap-2" : "px-3.5 gap-3"}`}>
            {isCompact ? (
              <>
                <div className={`w-7 h-7 rounded-md ${module.colors.iconBg} flex items-center justify-center shrink-0`}>
                  <module.icon className={module.colors.iconColor} size={16} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-sans font-bold text-white text-[13px] leading-tight tracking-wide truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                    {moduleName}
                  </h4>
                  <p className="text-[10px] text-white/80 leading-none truncate mt-0.5">{moduleDesc}</p>
                </div>
              </>
            ) : (
              <>
                <div className={`w-8 h-8 rounded-lg ${module.colors.iconBg} flex items-center justify-center shrink-0`}>
                  <module.icon className={module.colors.iconColor} size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-sans font-bold text-white text-[15px] leading-tight tracking-wide truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                    {moduleName}
                  </h4>
                  <p className="text-[11px] text-white/80 leading-none truncate mt-0.5">{moduleDesc}</p>
                </div>
              </>
            )}
          </div>
        </LegoBlock>
      </button>
    </div>
  );
});
ModuleBlock.displayName = "ModuleBlock";

export interface LegoTechStackBuilderProps {
  modules?: TechModule[];
  className?: string;
}

export default function LegoTechStackBuilder({
  modules = ALL_TECH_MODULES,
  className = "",
}: LegoTechStackBuilderProps) {
  const t = useTranslations("TechStack");
  const [equippedIds, setEquippedIds] = useState<string[]>([]);
  const [animatingBlocks, setAnimatingBlocks] = useState<Record<string, DOMRect>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Frontend", "Storage", "AI/ML", "Visualization", "Future: Web3", "Security"] as const;

  const controls = useAnimation();
  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isPointerTicking = useRef(false);

  // Clean up any running timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPointerTicking.current) return;
    isPointerTicking.current = true;
    const currentTarget = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;

    requestAnimationFrame(() => {
      const rect = currentTarget.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouseX.set(((clientX - rect.left) / rect.width) * 100);
        mouseY.set(((clientY - rect.top) / rect.height) * 100);
      }
      isPointerTicking.current = false;
    });
  }, [mouseX, mouseY]);

  const handleAnimationComplete = useCallback((id: string) => {
    setAnimatingBlocks((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleToggleEquip = useCallback((id: string, e: React.MouseEvent) => {
    if (animatingBlocks[id]) return;

    const el = (e.currentTarget as HTMLElement).closest(".lego-block-wrapper");
    if (!el) return;
    const startRect = el.getBoundingClientRect();

    setAnimatingBlocks((prev) => ({ ...prev, [id]: startRect }));

    setEquippedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });

    const impactTimer = setTimeout(() => {
      controls.start({ y: [0, 8, -2, 0], transition: { duration: 0.35, times: [0, 0.4, 0.7, 1], ease: "easeInOut" } });
    }, 990);
    timersRef.current.push(impactTimer);
  }, [animatingBlocks, controls]);

  const handleEquipAll = useCallback(() => {
    // Clear any pending timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    const remaining = modules.filter((m) => !equippedIds.includes(m.id));
    if (remaining.length === 0) return;

    remaining.forEach((m, idx) => {
      const timer = setTimeout(() => {
        setEquippedIds((prev) => (prev.includes(m.id) ? prev : [...prev, m.id]));
        if (idx === remaining.length - 1) {
          const finishTimer = setTimeout(() => {
            controls.start({ y: [0, 8, -2, 0], transition: { duration: 0.35, times: [0, 0.4, 0.7, 1], ease: "easeInOut" } });
          }, 200);
          timersRef.current.push(finishTimer);
        }
      }, idx * 75);
      timersRef.current.push(timer);
    });
  }, [modules, equippedIds, controls]);

  const handleReset = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setEquippedIds([]);
    setAnimatingBlocks({});
  }, []);

  const moduleMap = useMemo(() => new Map(modules.map((m) => [m.id, m])), [modules]);
  const equippedModules = useMemo(
    () =>
      equippedIds
        .map((id) => moduleMap.get(id))
        .filter((m): m is TechModule => m !== undefined),
    [equippedIds, moduleMap]
  );

  const unequippedModules = useMemo(
    () =>
      modules.filter(
        (m) => !equippedIds.includes(m.id) && (selectedCategory === "All" || m.category === selectedCategory)
      ),
    [modules, equippedIds, selectedCategory]
  );

  // Compute 2D Grid
  const { grid, positionedModules } = useMemo(() => {
    const calculatedGrid: (string | null)[][] = [];
    const positioned = equippedModules.map((m) => {
      let placedRow = -1;
      let placedCol = -1;
      for (let r = 0; r < GRID_CONSTANTS.MAX_ROWS; r++) {
        if (!calculatedGrid[r]) calculatedGrid[r] = Array(GRID_CONSTANTS.COLS).fill(null);
        let contiguous = 0;
        for (let c = 0; c < GRID_CONSTANTS.COLS; c++) {
          if (!calculatedGrid[r][c]) {
            contiguous++;
            if (contiguous === m.studs) {
              placedRow = r;
              placedCol = c - m.studs + 1;
              break;
            }
          } else {
            contiguous = 0;
          }
        }
        if (placedRow !== -1) break;
      }
      if (placedRow !== -1) {
        for (let i = 0; i < m.studs; i++) {
          calculatedGrid[placedRow][placedCol + i] = m.id;
        }
      } else {
        placedRow = 0;
        placedCol = 0;
      }
      return { module: m, rowIndex: placedRow, colIndex: placedCol };
    });
    return { grid: calculatedGrid, positionedModules: positioned };
  }, [equippedModules]);

  const hiddenServerStuds = useMemo(() => {
    const studs: number[] = [];
    if (grid[0]) {
      grid[0].forEach((occupantId, idx) => {
        if (occupantId && !animatingBlocks[occupantId]) studs.push(idx);
      });
    }
    return studs;
  }, [grid, animatingBlocks]);

  const positionedModulesWithStuds = useMemo(() => {
    return positionedModules.map(({ module, rowIndex, colIndex }) => {
      const hiddenLocalStuds: number[] = [];
      if (grid[rowIndex + 1]) {
        for (let i = 0; i < module.studs; i++) {
          const occupantId = grid[rowIndex + 1][colIndex + i];
          if (occupantId && !animatingBlocks[occupantId]) {
            hiddenLocalStuds.push(i);
          }
        }
      }
      return {
        module,
        rowIndex,
        colIndex,
        hiddenLocalStuds,
      };
    });
  }, [positionedModules, grid, animatingBlocks]);

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`w-full relative select-none font-sans flex flex-col ${className}`}
    >
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-12 lg:gap-16 relative z-10 w-full min-h-[520px]">
        {/* LEFT: Available Tech Modules with clean category segregation */}
        <div className="flex-1 w-full max-w-[620px] flex flex-col justify-start">
          {/* Category Filter Segregation Tabs - Anchored at the Top */}
          <div className="flex flex-wrap items-center justify-between w-full gap-3 mb-6">
            <div className="flex flex-wrap items-center gap-1.5 bg-brand-primary/5 p-1 rounded-xl">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-brand-primary text-white shadow-xs"
                      : "text-foreground-muted hover:text-foreground-primary hover:bg-background-secondary"
                  }`}
                >
                  {t(`categories.${cat}`)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {equippedIds.length < modules.length ? (
                <button
                  type="button"
                  onClick={handleEquipAll}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-brand-heading hover:bg-brand-surface transition-colors cursor-pointer"
                >
                  {t("controls.equipAll", { count: modules.length })}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-foreground-muted hover:text-foreground-primary hover:bg-background-secondary transition-colors cursor-pointer"
                >
                  {t("controls.reset")}
                </button>
              )}
            </div>
          </div>

          {/* Module pool */}
          <div className="flex flex-wrap items-center justify-start gap-4 min-h-[220px]">
            {unequippedModules.length === 0 ? (
              <div className="w-full flex flex-col items-center justify-center py-10 text-center">
                <div className="w-11 h-11 rounded-full bg-brand-surface flex items-center justify-center text-brand-primary mb-2">
                  <IconZplit size={24} />
                </div>
                <p className="text-sm font-semibold text-foreground-primary">
                  {selectedCategory !== "All"
                    ? t("empty.allEquipped", { category: t(`categories.${selectedCategory}`) })
                    : t("empty.allEquippedGeneric")}
                </p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  {t("empty.hint")}
                </p>
              </div>
            ) : (
              unequippedModules.map((module) => {
                const startRect = animatingBlocks[module.id];
                return (
                  <ModuleBlock
                    key={module.id}
                    module={module}
                    isEquipped={false}
                    mouseX={mouseX}
                    mouseY={mouseY}
                    isAnimating={!!startRect}
                    startRect={startRect || null}
                    onAnimationComplete={handleAnimationComplete}
                    onClick={(e) => handleToggleEquip(module.id, e)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: Stacking Base Block "Zplit app" grounded at Base */}
        <div className="flex flex-col items-center justify-end w-full lg:w-auto mt-8 lg:mt-0 self-stretch lg:self-end">
          <div className="scale-[0.85] sm:scale-[0.95] lg:scale-100 origin-bottom shrink-0 flex flex-col items-center justify-end">
            {/* Fixed-height container: Base block NEVER translates in Y */}
            <div className="relative w-[390px] h-[500px] flex flex-col justify-end">
              <motion.div animate={controls} className="relative w-full">
                {/* Stacked Equipped Modules Growing Upward with Smooth Drop Animations */}
                <div className="absolute left-0 w-full h-0 z-20" style={{ bottom: "calc(100% - 14px)" }}>
                  <AnimatePresence>
                    {positionedModulesWithStuds.map(({ module, rowIndex, colIndex, hiddenLocalStuds }) => {
                      const startRect = animatingBlocks[module.id];

                      return (
                        <motion.div
                          key={module.id}
                          initial={{ opacity: 0, y: -25, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -20, scale: 0.9 }}
                          transition={{ duration: 0.28, ease: "easeOut" }}
                          className="absolute"
                          style={{
                            bottom: rowIndex * GRID_CONSTANTS.ROW_HEIGHT,
                            left: colIndex * GRID_CONSTANTS.STUD_WIDTH,
                            zIndex: rowIndex * 10,
                          }}
                        >
                          <ModuleBlock
                            module={module}
                            isEquipped={true}
                            hiddenStuds={hiddenLocalStuds}
                            mouseX={mouseX}
                            mouseY={mouseY}
                            isAnimating={!!startRect}
                            startRect={startRect || null}
                            onAnimationComplete={handleAnimationComplete}
                            onClick={(e) => handleToggleEquip(module.id, e)}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Base Block: Zplit app in Brand Green permanently anchored at Bottom */}
                <LegoBlock
                  mouseX={mouseX}
                  mouseY={mouseY}
                  topColor="#00b643"
                  faceGradient="linear-gradient(180deg, #10d456 0%, #00b643 50%, #00843d 100%)"
                  bottomColor="#006124"
                  roundedTop
                  roundedBottom
                  studs={6}
                  studColor="brandGreen"
                  hideStuds={hiddenServerStuds}
                  className="relative z-10 shadow-[0_15px_35px_rgba(0,0,0,0.25)] rounded-xl"
                >
                  <div className="px-5 py-4 pt-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shadow-inner shrink-0 border border-white/20">
                        <IconZplit className="w-6 h-6 text-white drop-shadow-md" size={24} />
                      </div>
                      <div className="text-white drop-shadow-md">
                        <h3 className="font-sans font-bold text-[17px] tracking-wide truncate drop-shadow-md">
                          {t("base.title")}
                        </h3>
                        <p className="font-mono text-[10px] font-bold text-green-100/90 tracking-[0.2em] uppercase mt-1 drop-shadow-xs">
                          {equippedModules.length === 0
                            ? t("base.selectTech")
                            : t("base.level", { level: equippedModules.length * 10 })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/20 text-white shadow-xs">
                        {t("base.badge")}
                      </span>
                    </div>
                  </div>
                </LegoBlock>
              </motion.div>
            </div>
          </div>

          {/* Action / Show me all at once / Reset Controls at Bottom */}
          <div className="h-16 w-full flex items-center justify-center mt-6 gap-6">
            {equippedModules.length < modules.length && (
              <button
                type="button"
                onClick={handleEquipAll}
                className="text-xs font-semibold text-foreground-muted hover:text-brand-primary transition-colors uppercase tracking-widest cursor-pointer"
              >
                {t("controls.showAll")}
              </button>
            )}

            {equippedModules.length > 0 && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-foreground-muted hover:text-foreground-primary transition-colors uppercase tracking-widest cursor-pointer"
              >
                {t("controls.reset")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
