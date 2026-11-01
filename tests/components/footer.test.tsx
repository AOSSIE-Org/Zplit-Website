import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, within } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import Lenis from "lenis";
import Footer from "@/components/footer/Footer";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { SITE_LINKS } from "@/config/links";
import { catalogs, locales, renderWithIntl, translator } from "../support/intl";
import { setPathname } from "../support/navigation";
import { setIntersecting, setReducedMotion } from "../support/browser";

// The share dialog library is exercised in site-share-button.test.tsx
vi.mock("@aossie-org/social-share-button", () => ({ default: class {} }));

const t = translator("en", "Footer");
const wordmark = () => screen.getByRole("button", { name: `Zplit: ${t("wordmarkReveal")}` });

describe("Footer", () => {
  it("groups its links into product, community and project columns", () => {
    renderWithIntl(<Footer />);
    const columns = {
      [t("columns.product")]: [
        [t("links.features"), "#features"],
        [t("links.innovation"), "#innovation"],
        [t("links.faq"), "#faq"],
        [t("links.download"), SITE_LINKS.playStore],
      ],
      [t("columns.community")]: [
        [t("social.discord"), SITE_LINKS.discord],
        [t("social.telegram"), SITE_LINKS.telegram],
        [t("social.x"), SITE_LINKS.x],
        [t("social.youtube"), SITE_LINKS.youtube],
      ],
      [t("columns.project")]: [
        [t("links.sourceCode"), SITE_LINKS.github],
        [t("links.reportIssue"), SITE_LINKS.issues],
        [t("links.aossie"), SITE_LINKS.aossie],
        [t("links.stabilityNexus"), SITE_LINKS.stabilityNexus],
      ],
    };
    for (const [title, links] of Object.entries(columns)) {
      const column = screen.getByText(title).parentElement!;
      const anchors = within(column).getAllByRole("link");
      expect(anchors.map((a) => [a.textContent, a.getAttribute("href")])).toEqual(links);
      for (const a of anchors) {
        const external = !a.getAttribute("href")!.startsWith("#");
        expect(a.getAttribute("target")).toBe(external ? "_blank" : null);
        expect(a.querySelector("svg") !== null).toBe(external); // arrow icon on external links
      }
    }
  });

  it("scrolls smoothly to home-page sections from the footer", () => {
    const faq = document.createElement("section");
    faq.id = "faq";
    document.body.appendChild(faq);
    vi.spyOn(faq, "getBoundingClientRect").mockReturnValue({ top: 300 } as DOMRect);
    Object.defineProperty(window, "scrollY", { configurable: true, value: 1200 });
    renderWithIntl(<Footer />);

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => {
      screen.getByRole("link", { name: t("links.faq") }).dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 1500, behavior: "smooth" });

    // A missing section scrolls to the top of the current position
    faq.remove();
    fireEvent.click(screen.getByRole("link", { name: t("links.features") }));
    expect(window.scrollTo).toHaveBeenLastCalledWith({ top: 1200, behavior: "smooth" });
  });

  it("jumps instead of smooth scrolling for reduced motion", () => {
    setReducedMotion(true);
    renderWithIntl(<Footer />);
    fireEvent.click(screen.getByRole("link", { name: t("links.innovation") }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("uses Lenis for section links when smooth scrolling is on", () => {
    const scrollTo = vi.spyOn(Lenis.prototype, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <LenisProvider>
        <Footer />
      </LenisProvider>,
    );
    fireEvent.click(screen.getByRole("link", { name: t("links.faq") }));
    expect(scrollTo).toHaveBeenCalledWith("#faq", { duration: 1.4 });
    expect(window.scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it("links sections to the localized home page from other pages", () => {
    setPathname("/hi/terms");
    renderWithIntl(<Footer />, { locale: "hi" });
    const th = translator("hi", "Footer");
    expect(screen.getByRole("link", { name: th("links.features") }).getAttribute("href")).toBe("/hi#features");
    expect(screen.getByRole("link", { name: th("links.faq") }).getAttribute("href")).toBe("/hi#faq");
  });

  it("links the legal and support pages in the current locale", () => {
    setPathname("/hi");
    renderWithIntl(<Footer />, { locale: "hi" });
    const th = translator("hi", "Footer");
    expect(screen.getByRole("link", { name: th("links.privacy") }).getAttribute("href")).toBe("/hi/privacy");
    expect(screen.getByRole("link", { name: th("links.terms") }).getAttribute("href")).toBe("/hi/terms");
    expect(screen.getByRole("link", { name: th("links.support") }).getAttribute("href")).toBe("/hi/support");
    expect(screen.getByRole("button", { name: translator("hi", "Share")("trigger") })).toBeTruthy();
  });

  it("lists the social profiles with accessible names", () => {
    renderWithIntl(<Footer />);
    for (const key of ["github", "discord", "x", "telegram", "linkedin", "youtube"] as const) {
      const links = screen.getAllByRole("link", { name: t(`social.${key}`) });
      expect(links.some((a) => a.getAttribute("href") === SITE_LINKS[key] && a.getAttribute("title") === t(`social.${key}`))).toBe(true);
    }
  });

  it("offers the Play Store and marks the App Store as coming soon", () => {
    const { container } = renderWithIntl(<Footer />);
    const play = screen.getByRole("link", { name: `${t("getItOn")} ${t("googlePlay")}` });
    expect(play.getAttribute("href")).toBe(SITE_LINKS.playStore);
    const appStore = container.querySelector('[aria-disabled="true"]')!;
    expect(appStore.textContent).toBe(`${t("comingSoon")}${t("appStore")}`);
    expect(appStore.closest("a")).toBeNull();
  });

  it("shows the call to action, a doubled marquee and the localized tagline", () => {
    const { container } = renderWithIntl(<Footer />);
    expect(screen.getByRole("heading", { level: 2, name: t("ctaTitle") })).toBeTruthy();
    expect(screen.getByRole("heading", { level: 2 }).nextElementSibling!.querySelector("br")).toBeTruthy();
    const marquee = container.querySelector(".animate-marquee")!;
    const words = Object.values(catalogs.en.Footer.marquee);
    expect([...marquee.children].map((c) => c.textContent)).toEqual([...words, ...words]);
    expect(screen.getByText(t("tagline"))).toBeTruthy();
  });

  it("credits AOSSIE and Stability Nexus with the current year", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2031-06-15T12:00:00Z"));
    renderWithIntl(<Footer />);
    expect(screen.getByText(t("copyright", { year: 2031 }))).toBeTruthy();
    expect(screen.getByRole("img", { name: t("heartLabel") })).toBeTruthy();
    const credit = screen.getByRole("img", { name: t("heartLabel") }).closest("p")!;
    expect(within(credit).getByRole("link", { name: "AOSSIE" }).getAttribute("href")).toBe(SITE_LINKS.aossie);
    expect(within(credit).getByRole("link", { name: "Stability Nexus" }).getAttribute("href")).toBe(SITE_LINKS.stabilityNexus);
  });

  it.each(locales)("renders the %s catalog", (locale) => {
    renderWithIntl(<Footer />, { locale });
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(catalogs[locale].Footer.ctaTitle);
    expect(screen.getByText(catalogs[locale].Footer.tagline)).toBeTruthy();
  });

  describe("split wordmark", () => {
    it("splits on mouse hover and on click or tap, but ignores touch hover", () => {
      renderWithIntl(<Footer />);
      expect(wordmark().getAttribute("aria-pressed")).toBe("false");
      fireEvent.pointerEnter(wordmark(), { pointerType: "touch" });
      expect(wordmark().getAttribute("aria-pressed")).toBe("false");
      fireEvent.pointerEnter(wordmark(), { pointerType: "mouse" });
      expect(wordmark().getAttribute("aria-pressed")).toBe("true");
      fireEvent.pointerLeave(wordmark(), { pointerType: "touch" });
      expect(wordmark().getAttribute("aria-pressed")).toBe("true");
      fireEvent.pointerLeave(wordmark(), { pointerType: "mouse" });
      expect(wordmark().getAttribute("aria-pressed")).toBe("false");
      fireEvent.click(wordmark());
      expect(wordmark().getAttribute("aria-pressed")).toBe("true");
      fireEvent.click(wordmark());
      expect(wordmark().getAttribute("aria-pressed")).toBe("false");
    });

    it("demonstrates the split once when it first scrolls into view", () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      renderWithIntl(<Footer />);
      act(() => void vi.advanceTimersByTime(1000));
      expect(wordmark().getAttribute("aria-pressed")).toBe("false"); // not seen yet

      setIntersecting(true, wordmark());
      act(() => void vi.advanceTimersByTime(399));
      expect(wordmark().getAttribute("aria-pressed")).toBe("false");
      act(() => void vi.advanceTimersByTime(1));
      expect(wordmark().getAttribute("aria-pressed")).toBe("true");
      act(() => void vi.advanceTimersByTime(1800));
      expect(wordmark().getAttribute("aria-pressed")).toBe("false");
    });

    it("skips the demonstration for reduced motion", () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      setReducedMotion(true);
      renderWithIntl(<Footer />);
      setIntersecting(true, wordmark());
      act(() => void vi.advanceTimersByTime(1000));
      expect(wordmark().getAttribute("aria-pressed")).toBe("false");
    });

    it("cancels a pending demonstration when the footer unmounts", () => {
      vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
      const { unmount } = renderWithIntl(<Footer />);
      setIntersecting(true, wordmark());
      const pending = vi.getTimerCount();
      unmount();
      expect(vi.getTimerCount()).toBeLessThanOrEqual(pending - 2);
    });
  });

  describe("magnetic social icons", () => {
    const magnet = () => screen.getByRole("link", { name: t("social.github") }).parentElement!;
    const offset = () => Number(/translateX\((-?[\d.]+)px\)/.exec(magnet().style.transform)?.[1] ?? 0);
    const wait = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

    beforeEach(() => {
      MotionGlobalConfig.skipAnimations = false; // the spring motion is what is under test
    });

    function hover(clientX: number) {
      vi.spyOn(magnet(), "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 40, height: 40 } as DOMRect);
      fireEvent.pointerMove(magnet(), { clientX, clientY: 20 });
    }

    it("pull towards the pointer and spring back when it leaves", async () => {
      renderWithIntl(<Footer />);
      hover(40); // 20px right of centre × 0.35 strength = 7px
      await wait(400);
      expect(offset()).toBeGreaterThan(3);
      expect(offset()).toBeLessThan(10);
      fireEvent.pointerLeave(magnet());
      await wait(600);
      expect(Math.abs(offset())).toBeLessThan(1);
    });

    it("stay put for reduced motion", async () => {
      setReducedMotion(true);
      renderWithIntl(<Footer />);
      hover(40);
      await wait(300);
      expect(offset()).toBe(0);
    });
  });
});
