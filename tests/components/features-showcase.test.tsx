import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import Lenis from "lenis";
import FeaturesShowcase from "@/components/features/FeaturesShowcase";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { SITE_LINKS } from "@/config/links";
import { catalogs, locales, renderWithIntl, translator } from "../support/intl";
import { nextFrames, scrollPage, setIntersecting, setReducedMotion, triggerResize } from "../support/browser";

const t = translator("en", "Features");
const KEYS = ["offline", "groups", "splits", "ocr", "analytics", "privacy"] as const;

/** jsdom has no layout: give the scroll track a position and height (6 × 70vh + 100vh at an 800px viewport). */
const VIEWPORT = 800;
const TRACK_TOP = 1000;
const TRACK_HEIGHT = 5.2 * VIEWPORT;
const SCROLLABLE = TRACK_HEIGHT - VIEWPORT;

function layoutTrack(container: HTMLElement) {
  const track = container.querySelector<HTMLElement>(".relative.hidden.lg\\:block")!;
  Object.defineProperty(track, "offsetTop", { configurable: true, value: TRACK_TOP });
  Object.defineProperty(track, "offsetHeight", { configurable: true, value: TRACK_HEIGHT });
  Object.defineProperty(track, "clientHeight", { configurable: true, value: TRACK_HEIGHT });
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue({ top: TRACK_TOP } as DOMRect);
  Object.defineProperty(window, "innerHeight", { configurable: true, value: VIEWPORT });
  return track;
}

const desktopList = (container: HTMLElement) => container.querySelector<HTMLElement>("ol")!;
const activeTitle = (container: HTMLElement) =>
  within(desktopList(container)).getAllByRole("button").find((b) => b.getAttribute("aria-current") === "step")?.textContent;


describe("FeaturesShowcase", () => {
  it("lists every feature as a step, starting on the first", () => {
    const { container } = renderWithIntl(<FeaturesShowcase />);
    expect(screen.getByRole("region", { name: t("heading") }).id).toBe("features");
    const steps = within(desktopList(container)).getAllByRole("button");
    expect(steps.map((b) => b.textContent)).toEqual(KEYS.map((k) => t(`items.${k}.title`)));
    expect(activeTitle(container)).toBe(t("items.offline.title"));
    expect(screen.getByText(t("stepLabel", { current: 1, total: 6 }))).toBeTruthy();
    // Only the active step shows its points and call to action
    expect(within(desktopList(container)).getByText(t("items.offline.p1"))).toBeTruthy();
    expect(within(desktopList(container)).queryByText(t("items.groups.p1"))).toBeNull();
  });

  it("renders a stacked card per feature for mobile, with every point", () => {
    renderWithIntl(<FeaturesShowcase />);
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(KEYS.length);
    cards.forEach((card, i) => {
      expect(within(card).getByRole("heading", { level: 3 }).textContent).toBe(t(`items.${KEYS[i]}.title`));
      expect(within(card).getByText(t(`items.${KEYS[i]}.p3`))).toBeTruthy();
      expect(card.textContent).toContain(`0${i + 1} / 06`);
    });
    const ctas = screen.getAllByRole("link", { name: t("cta") });
    expect(ctas.length).toBeGreaterThanOrEqual(2);
    ctas.forEach((a) => expect(a.getAttribute("href")).toBe(SITE_LINKS.playStore));
  });

  it("mounts the animated visuals only once they come near the viewport", async () => {
    const { container } = renderWithIntl(<FeaturesShowcase />);
    layoutTrack(container);
    await scrollPage(0, { scrollHeight: 20000, clientHeight: VIEWPORT });
    const chips = () => KEYS.filter((k) => screen.queryAllByText(t(`items.${k}.chip`)).length > 0);
    expect(chips()).toEqual([]);

    // One mobile card scrolls into view
    const groupsCard = screen.getAllByRole("article")[1];
    setIntersecting(true, groupsCard.querySelector(".h-full.w-full")!);
    expect(chips()).toEqual(["groups"]);

    // The pinned desktop card comes into view: it shows the active feature's visual
    setIntersecting(true, container.querySelector(".col-span-7")!);
    await nextFrames();
    expect(chips()).toEqual(["offline", "groups"]);
  });

  it("advances the active feature as the pinned track scrolls", async () => {
    const { container } = renderWithIntl(<FeaturesShowcase />);
    layoutTrack(container);
    const page = { scrollHeight: 20000, clientHeight: VIEWPORT };

    await scrollPage(TRACK_TOP + SCROLLABLE * (2.5 / 6), page);
    expect(activeTitle(container)).toBe(t("items.splits.title"));
    expect(screen.getByText(t("stepLabel", { current: 3, total: 6 }))).toBeTruthy();
    expect(within(desktopList(container)).getByText(t("items.splits.p2"))).toBeTruthy();

    await scrollPage(TRACK_TOP + SCROLLABLE * (2.9 / 6), page); // further within the same feature
    expect(activeTitle(container)).toBe(t("items.splits.title"));

    await scrollPage(TRACK_TOP + SCROLLABLE + 500, page); // past the end: stays on the last feature
    expect(activeTitle(container)).toBe(t("items.privacy.title"));

    await scrollPage(0, page); // before the track: first feature
    expect(activeTitle(container)).toBe(t("items.offline.title"));
  });

  it("scrolls to a feature's slice of the track when its title is clicked", () => {
    const { container } = renderWithIntl(<FeaturesShowcase />);
    layoutTrack(container);
    fireEvent.click(within(desktopList(container)).getByRole("button", { name: t("items.ocr.title") }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: TRACK_TOP + SCROLLABLE * (3.35 / 6), behavior: "smooth" });
  });

  it("swaps the pinned visual without a cross-fade for reduced motion", async () => {
    setReducedMotion(true);
    const { container } = renderWithIntl(<FeaturesShowcase />);
    layoutTrack(container);
    await scrollPage(0, { scrollHeight: 20000, clientHeight: VIEWPORT });
    const stage = container.querySelector<HTMLElement>(".col-span-7")!;
    setIntersecting(true, stage);
    await scrollPage(TRACK_TOP + SCROLLABLE * (4.5 / 6), { scrollHeight: 20000, clientHeight: VIEWPORT });
    expect(within(stage).getByText(t("items.analytics.chip"))).toBeTruthy();
    expect(within(stage).queryByText(t("items.offline.chip"))).toBeNull();
  });

  it("jumps without smooth scrolling for reduced motion", () => {
    setReducedMotion(true);
    const { container } = renderWithIntl(<FeaturesShowcase />);
    layoutTrack(container);
    fireEvent.click(within(desktopList(container)).getByRole("button", { name: t("items.groups.title") }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: TRACK_TOP + SCROLLABLE * (1.35 / 6), behavior: "auto" });
  });

  it("hands the scroll to Lenis when smooth scrolling is on", () => {
    const scrollTo = vi.spyOn(Lenis.prototype, "scrollTo").mockImplementation(() => {});
    const { container } = renderWithIntl(
      <LenisProvider>
        <FeaturesShowcase />
      </LenisProvider>,
    );
    layoutTrack(container);
    fireEvent.click(within(desktopList(container)).getByRole("button", { name: t("items.privacy.title") }));
    expect(scrollTo).toHaveBeenCalledWith(TRACK_TOP + SCROLLABLE * (5.35 / 6), { duration: 1.1 });
    expect(window.scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  describe("fitting the feature list into the pinned card", () => {
    async function layoutList(container: HTMLElement, { viewport, content, itemTop, itemHeight }: Record<string, number>) {
      // Park the track at its start so the first feature is the active one
      layoutTrack(container);
      await scrollPage(0, { scrollHeight: 20000, clientHeight: VIEWPORT });
      const list = desktopList(container);
      const viewportEl = list.closest<HTMLElement>(".col-span-5")!;
      const contentEl = list.parentElement!;
      Object.defineProperty(viewportEl, "clientHeight", { configurable: true, value: viewport });
      Object.defineProperty(contentEl, "offsetHeight", { configurable: true, value: content });
      const item = list.children[0] as HTMLElement;
      Object.defineProperty(item, "offsetTop", { configurable: true, value: itemTop });
      Object.defineProperty(item, "offsetHeight", { configurable: true, value: itemHeight });
      triggerResize();
      await nextFrames();
      return { viewportEl, contentEl };
    }

    it("centres a list that fits, without the fade mask", async () => {
      setReducedMotion(true); // positions jump instead of springing
      const { container } = renderWithIntl(<FeaturesShowcase />);
      const { viewportEl, contentEl } = await layoutList(container, { viewport: 500, content: 300, itemTop: 0, itemHeight: 100 });
      expect(contentEl.style.transform).toBe("translateY(100px)");
      expect(viewportEl.className).not.toContain("mask-");
    });

    it("brings the active item into view and fades the edges when the list overflows", async () => {
      setReducedMotion(true);
      const { container } = renderWithIntl(<FeaturesShowcase />);
      const { viewportEl, contentEl } = await layoutList(container, { viewport: 300, content: 900, itemTop: 400, itemHeight: 100 });
      // Centre the item: 400 - (300 - 100) / 2 = 300
      expect(contentEl.style.transform).toBe("translateY(-300px)");
      expect(viewportEl.className).toContain("mask-");

      // An item taller than the viewport is aligned to its top, clamped to the scrollable range
      await layoutList(container, { viewport: 300, content: 900, itemTop: 700, itemHeight: 400 });
      expect(contentEl.style.transform).toBe("translateY(-600px)");
    });

    it("springs to the new position when motion is allowed", async () => {
      MotionGlobalConfig.skipAnimations = false;
      const { container } = renderWithIntl(<FeaturesShowcase />);
      const { contentEl } = await layoutList(container, { viewport: 300, content: 900, itemTop: 400, itemHeight: 100 });
      expect(contentEl.style.transform).not.toBe("translateY(-300px)"); // not jumped
      await act(() => new Promise((resolve) => setTimeout(resolve, 600)));
      const y = Number(/translateY\((-?[\d.]+)px\)/.exec(contentEl.style.transform)?.[1]);
      expect(y).toBeLessThan(-50);
      expect(y).toBeGreaterThanOrEqual(-300);
    });
  });

  it.each(locales)("uses the %s catalog", (locale) => {
    renderWithIntl(<FeaturesShowcase />, { locale });
    const heading = catalogs[locale].Features.heading;
    expect(screen.getAllByRole("heading", { level: 2, name: heading })).toHaveLength(2);
    expect(screen.getAllByText(catalogs[locale].Features.items.privacy.title).length).toBeGreaterThan(0);
  });
});
