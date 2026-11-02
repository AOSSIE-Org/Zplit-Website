import { describe, expect, it } from "vitest";
import { act, screen } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import Hero from "@/components/Hero";
import { SITE_LINKS } from "@/config/links";
import { locales, renderWithIntl, translator } from "../support/intl";
import { setReducedMotion } from "../support/browser";

/** The floating phone mockups (one for mobile, one for desktop). */
function floatingMockups() {
  return screen.getAllByRole("img", { name: translator("en", "Hero")("mockupAlt") }).map((img) => img.parentElement!);
}

const wait = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

describe("Hero", () => {
  it.each(locales)("renders the %s headline, highlights and badges from the catalog", (locale) => {
    const t = translator(locale, "Hero");
    renderWithIntl(<Hero />, { locale });
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toContain(t("titleLine1"));
    expect(heading.textContent).toContain(t("titleLine2"));
    for (const key of ["features.item1Highlight", "features.item2Highlight", "features.item3Highlight", "badges.mostLovedTitle", "badges.contributorsTitle"]) {
      expect(screen.getByText(t(key))).toBeTruthy();
    }
    // Badge shown twice: above the title on mobile, beside it on desktop
    expect(screen.getAllByText(t("openSourceBadge"))).toHaveLength(2);
  });

  it("links to AOSSIE and the Play Store in new tabs", () => {
    const t = translator("en", "Hero");
    renderWithIntl(<Hero />);
    const aossie = screen.getByRole("link", { name: t("aossie") });
    expect(aossie.getAttribute("href")).toBe(SITE_LINKS.aossie);
    expect(aossie.getAttribute("target")).toBe("_blank");
    const download = screen.getByRole("link", { name: t("downloadApp") });
    expect(download.getAttribute("href")).toBe(SITE_LINKS.playStore);
    expect(download.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("shows the app mockup with localized alt text and decorative backgrounds", () => {
    renderWithIntl(<Hero />, { locale: "hi" });
    const mockups = screen.getAllByRole("img", { name: translator("hi", "Hero")("mockupAlt") });
    expect(mockups).toHaveLength(2);
    mockups.forEach((img) => expect(img.getAttribute("src")).toBe("/assets/mockups/heromockup.webp"));
    const backgrounds = document.querySelectorAll('img[src="/assets/mockups/heromokupbg.svg"]');
    expect(backgrounds).toHaveLength(2);
    backgrounds.forEach((img) => expect(img.getAttribute("alt")).toBe(""));
  });

  it("floats the phone mockups up and down", async () => {
    MotionGlobalConfig.skipAnimations = false;
    renderWithIntl(<Hero />);
    await wait(400);
    for (const mockup of floatingMockups()) expect(mockup.style.transform).toMatch(/translateY\(-\d/);
  });

  it("keeps the mockups still when the user prefers reduced motion", async () => {
    MotionGlobalConfig.skipAnimations = false;
    setReducedMotion(true);
    renderWithIntl(<Hero />);
    await wait(400);
    for (const mockup of floatingMockups()) expect(mockup.style.transform).not.toMatch(/translateY\(-\d/);
  });
});
