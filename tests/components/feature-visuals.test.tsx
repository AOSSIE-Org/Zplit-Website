import { describe, expect, it, vi } from "vitest";
import { act, screen } from "@testing-library/react";
import fc from "fast-check";
import {
  AnalyticsVisual,
  GroupsVisual,
  OcrVisual,
  OfflineVisual,
  PrivacyVisual,
  SplitsVisual,
} from "@/components/features/FeatureVisuals";
import { locales, renderWithIntl, translator } from "../support/intl";
import { setIntersecting, setReducedMotion } from "../support/browser";

const t = translator("en", "Features.visuals");

/**
 * Fakes the tickers' intervals. jsdom drives requestAnimationFrame from an interval too, so
 * `tick` also advances a few frames for framer-motion to commit the new state.
 */
const fakeIntervals = () => vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });

async function tick(ms: number) {
  act(() => void vi.advanceTimersByTime(ms));
  await frames();
}

async function frames(count = 4) {
  for (let i = 0; i < count; i++) {
    await act(async () => {
      vi.advanceTimersByTime(16);
    });
  }
}


describe("OfflineVisual", () => {
  it("shows both phones' expenses and cycles through the sync methods", async () => {
    fakeIntervals();
    renderWithIntl(<OfflineVisual chip="Offline chip" />);
    expect(screen.getByText("Offline chip")).toBeTruthy();
    expect(screen.getByText(t("yourPhone"))).toBeTruthy();
    expect(screen.getByText(t("friendPhone"))).toBeTruthy();
    expect(screen.getAllByText(t("expenseDinner"))).toHaveLength(2);
    expect(screen.getAllByText("$86.40")).toHaveLength(2);
    expect(screen.getByText(t("synced"))).toBeTruthy();

    expect(screen.getByText(t("via", { method: "WiFi Direct" }))).toBeTruthy();
    await tick(1800);
    expect(screen.getByText(t("via", { method: "Bluetooth" }))).toBeTruthy();
    await tick(1800);
    expect(screen.getByText(t("via", { method: "NFC" }))).toBeTruthy();
    await tick(1800);
    expect(screen.getByText(t("via", { method: "WiFi Direct" }))).toBeTruthy();
  });

  it("holds still for reduced motion: no ticker, pulse rings or spinning icon", async () => {
    fakeIntervals();
    setReducedMotion(true);
    const { container } = renderWithIntl(<OfflineVisual chip="chip" />);
    await tick(5400);
    expect(screen.getByText(t("via", { method: "WiFi Direct" }))).toBeTruthy();
    expect(container.querySelectorAll(".border-accent-bright\\/60")).toHaveLength(0);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("pulses and spins with motion allowed", () => {
    const { container } = renderWithIntl(<OfflineVisual chip="chip" />);
    expect(container.querySelectorAll(".border-accent-bright\\/60")).toHaveLength(2);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("stops its ticker when unmounted", () => {
    fakeIntervals();
    const before = vi.getTimerCount();
    const { unmount } = renderWithIntl(<OfflineVisual chip="chip" />);
    expect(vi.getTimerCount()).toBe(before + 1);
    unmount();
    expect(vi.getTimerCount()).toBe(before);
  });
});

describe("GroupsVisual", () => {
  it("lists the group members and highlights invite methods in turn", async () => {
    fakeIntervals();
    const { container } = renderWithIntl(<GroupsVisual chip="Groups chip" />);
    expect(screen.getByText(t("groupName"))).toBeTruthy();
    expect(screen.getByText(t("members", { count: 4 }))).toBeTruthy();
    for (const name of ["Aarav", "Maya", "Leo", "Zoe"]) expect(screen.getByText(name)).toBeTruthy();

    const invites = () =>
      [...container.querySelectorAll<HTMLElement>(".rounded-lg.h-7")].map((el) => el.style.backgroundColor);
    await frames(20);
    expect(invites()[0]).toBe("rgb(0, 132, 61)");
    expect(invites()[1]).not.toBe("rgb(0, 132, 61)");
    await tick(1400);
    expect(invites()[0]).not.toBe("rgb(0, 132, 61)");
    expect(invites()[1]).toBe("rgb(0, 132, 61)");
  });
});

describe("SplitsVisual", () => {
  it("recalculates each share and what you are owed as the split mode changes", async () => {
    fakeIntervals();
    renderWithIntl(<SplitsVisual chip="Splits chip" />);
    expect(screen.getByText("$120.00")).toBeTruthy();
    const active = () => screen.getAllByText(/^(Equal|Percent|Custom)$/).find((el) => el.className.includes("text-white"))?.textContent;

    // Equal: 4 × $30, you paid so you are owed the other three shares
    expect(active()).toBe(t("modeEqual"));
    expect(screen.getAllByText("$30.00")).toHaveLength(4);
    expect(screen.getByText("$90.00")).toBeTruthy();

    await tick(2400); // 40 / 30 / 20 / 10 %
    expect(active()).toBe(t("modePercent"));
    expect(["$48.00", "$36.00", "$24.00", "$12.00"].every((v) => screen.queryByText(v))).toBe(true);
    expect(screen.getByText("$72.00")).toBeTruthy();

    await tick(2400); // custom 35 / 25 / 30 / 10 %
    expect(active()).toBe(t("modeCustom"));
    expect(screen.getByText("$78.00")).toBeTruthy();
  });
});

describe("OcrVisual", () => {
  it("shows the receipt and the fields detected on-device", () => {
    const { container } = renderWithIntl(<OcrVisual chip="OCR chip" />);
    expect(screen.getByText(t("detected"))).toBeTruthy();
    expect(screen.getAllByText(t("merchantValue"))).toHaveLength(2);
    expect(screen.getByText(t("dateValue"))).toBeTruthy();
    expect(screen.getAllByText("$86.40")).toHaveLength(2);
    expect(container.querySelector(".animate-scan")).toBeTruthy();
  });

  it("parks the scan line in the middle for reduced motion", () => {
    setReducedMotion(true);
    const { container } = renderWithIntl(<OcrVisual chip="OCR chip" />);
    expect(container.querySelector(".animate-scan")).toBeNull();
    expect(container.querySelector(".top-1\\/2.bg-accent-bright")).toBeTruthy();
  });
});

describe("AnalyticsVisual", () => {
  it("draws a donut segment and legend entry per category, plus weekly bars", () => {
    const { container } = renderWithIntl(<AnalyticsVisual chip="Analytics chip" />);
    expect(screen.getByText("$1,240")).toBeTruthy();
    const legend = [
      ["catFood", "$471"],
      ["catTravel", "$335"],
      ["catStay", "$273"],
      ["catFun", "$161"],
    ];
    for (const [key, amount] of legend) {
      expect(screen.getByText(t(key)).closest("li")!.textContent).toBe(`${t(key)}${amount}`);
    }
    // Background ring + 4 segments, laid end to end (offsets 0, 38, 65, 87)
    const circles = [...container.querySelectorAll("circle")].slice(1, 5);
    expect(circles.map((c) => c.getAttribute("stroke-dashoffset"))).toEqual(["0", "-38", "-65", "-87"]);
    expect(container.querySelectorAll(".rounded-t-md")).toHaveLength(6);
  });
});

describe("PrivacyVisual", () => {
  const cipher = (container: HTMLElement) => container.querySelector(".font-mono")!.textContent!;

  it("shows the privacy stats and re-rolls the cipher text only while on screen", async () => {
    fakeIntervals();
    const { container } = renderWithIntl(<PrivacyVisual chip="Privacy chip" />);
    expect(screen.getByText(t("servers"))).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
    expect(screen.getByText(t("encrypted"))).toBeTruthy();

    const seed = cipher(container);
    expect(seed).toBe("k9Qx+2fLzA7mR0vT4bWc");
    await tick(500);
    expect(cipher(container)).toBe(seed); // not in view yet

    setIntersecting(true);
    await tick(90);
    const rolled = cipher(container);
    expect(rolled).not.toBe(seed);
    expect(rolled).toMatch(/^[A-Za-z0-9+/]{20}$/);

    setIntersecting(false);
    await tick(90 * 5);
    expect(cipher(container)).toBe(rolled);
  });

  it("keeps the cipher fixed for reduced motion", async () => {
    fakeIntervals();
    setReducedMotion(true);
    const { container } = renderWithIntl(<PrivacyVisual chip="chip" />);
    setIntersecting(true);
    await tick(900);
    expect(cipher(container)).toBe("k9Qx+2fLzA7mR0vT4bWc");
  });
});

describe("all feature visuals", () => {
  const visuals = { OfflineVisual, GroupsVisual, SplitsVisual, OcrVisual, AnalyticsVisual, PrivacyVisual };

  it.each(locales)("render their %s labels", (locale) => {
    const tl = translator(locale, "Features.visuals");
    renderWithIntl(
      <>
        {Object.values(visuals).map((Visual, i) => (
          <Visual key={i} chip={`chip-${i}`} />
        ))}
      </>,
      { locale },
    );
    for (const key of ["yourPhone", "groupName", "splitExpense", "detected", "groupSpending", "trackers"]) {
      expect(screen.getAllByText(tl(key)).length).toBeGreaterThan(0);
    }
  });

  it("property: every visual renders any chip text it is given", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.values(visuals)),
        fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim() === s && s.length > 0),
        (Visual, chip) => {
          const { container, unmount } = renderWithIntl(<Visual chip={chip} />);
          const chipEl = container.querySelector(".z-20.inline-flex")!;
          expect(chipEl.textContent).toBe(chip);
          unmount();
        },
      ),
      { numRuns: 40 },
    );
  });
});
