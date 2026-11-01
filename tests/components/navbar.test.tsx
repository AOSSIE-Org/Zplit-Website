import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, within } from "@testing-library/react";
import Lenis from "lenis";
import Navbar from "@/components/Navbar";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { SITE_LINKS } from "@/config/links";
import { renderWithIntl, translator } from "../support/intl";
import { setPathname } from "../support/navigation";
import { scrollPage } from "../support/browser";

const t = translator("en", "Navigation");

function renderNavbar(locale: "en" | "hi" = "en") {
  return renderWithIntl(<Navbar />, { locale });
}

describe("Navbar", () => {
  it("shows the brand, section links and external calls to action from the catalog", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: `${t("brandName")} – ${t("backToTop")}` })).toHaveProperty(
      "href",
      expect.stringMatching(/\/en$/),
    );
    for (const key of ["features", "innovation", "faq"]) {
      expect(screen.getByRole("link", { name: t(key) }).getAttribute("href")).toBe(`#${key}`);
    }
    const contribute = screen.getByRole("link", { name: t("contribute") });
    expect(contribute.getAttribute("href")).toBe(SITE_LINKS.github);
    expect(contribute.getAttribute("rel")).toBe("noopener noreferrer");
    expect(screen.getByRole("link", { name: t("downloadApp") }).getAttribute("href")).toBe(SITE_LINKS.playStore);
  });

  it("renders Hindi navigation text on Hindi pages", () => {
    setPathname("/hi");
    renderNavbar("hi");
    const hi = translator("hi", "Navigation");
    expect(screen.getByRole("link", { name: hi("features") })).toBeTruthy();
    expect(screen.getByRole("link", { name: hi("downloadApp") })).toBeTruthy();
    expect(hi("features")).not.toBe(t("features"));
  });

  it("opens and closes the mobile drawer from the menu button", () => {
    renderNavbar();
    const toggle = screen.getByRole("button", { name: t("toggleMenu") });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getAllByRole("link", { name: t("features") })).toHaveLength(1);

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    // Drawer adds its own copy of each section link plus a language label
    expect(screen.getAllByRole("link", { name: t("features") })).toHaveLength(2);
    expect(screen.getByText(translator("en", "LanguageSwitcher")("label"))).toBeTruthy();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it.each(["contribute", "downloadApp"])("closes the drawer after following the %s link", (key) => {
    renderNavbar();
    const toggle = screen.getByRole("button", { name: t("toggleMenu") });
    fireEvent.click(toggle);
    const links = screen.getAllByRole("link", { name: t(key) });
    fireEvent.click(links[links.length - 1]);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("scrolls to sections on the home page instead of navigating, and closes the drawer", () => {
    const section = document.createElement("section");
    section.id = "faq";
    document.body.appendChild(section);
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: t("toggleMenu") }));
    const [, drawerLink] = screen.getAllByRole("link", { name: t("faq") });

    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => {
      drawerLink.dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "start" });
    expect(screen.getByRole("button", { name: t("toggleMenu") }).getAttribute("aria-expanded")).toBe("false");
    section.remove();
  });

  it("scrolls back to the top when the logo is clicked on the home page", () => {
    renderNavbar();
    fireEvent.click(screen.getByRole("button", { name: t("toggleMenu") }));
    fireEvent.click(screen.getByRole("link", { name: `${t("brandName")} – ${t("backToTop")}` }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    expect(screen.getByRole("button", { name: t("toggleMenu") }).getAttribute("aria-expanded")).toBe("false");
  });

  it("links sections to the home page from other pages without scrolling", () => {
    setPathname("/en/privacy");
    renderNavbar();
    expect(screen.getByRole("link", { name: t("faq") }).getAttribute("href")).toBe("/en#faq");
    fireEvent.click(screen.getByRole("link", { name: t("faq") }));
    fireEvent.click(screen.getByRole("link", { name: `${t("brandName")} – ${t("backToTop")}` }));
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("uses Lenis smooth scrolling when it is available", () => {
    const scrollTo = vi.spyOn(Lenis.prototype, "scrollTo").mockImplementation(() => {});
    renderWithIntl(
      <LenisProvider>
        <Navbar />
      </LenisProvider>,
    );
    fireEvent.click(screen.getByRole("link", { name: t("innovation") }));
    expect(scrollTo).toHaveBeenCalledWith("#innovation", { duration: 1.2 });
    fireEvent.click(screen.getByRole("link", { name: `${t("brandName")} – ${t("backToTop")}` }));
    expect(scrollTo).toHaveBeenCalledWith(0, { duration: 1.2 });
    expect(window.scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it("keeps the light glass style on pages without a footer", async () => {
    const { container } = renderNavbar();
    await scrollPage(2000);
    expect(container.querySelector("header")!.className).not.toContain("nav-on-dark");
  });

  it("switches to the dark glass style while it floats over the footer", async () => {
    const { container } = renderWithIntl(
      <>
        <Navbar />
        <footer data-testid="footer" />
      </>,
    );
    const header = container.querySelector("header")!;
    const footer = screen.getByTestId("footer");
    Object.defineProperty(header, "offsetHeight", { configurable: true, value: 80 });
    const footerTop = vi.spyOn(footer, "getBoundingClientRect");

    // Footer top 10px below the viewport top: under the header (80px tall)
    footerTop.mockReturnValue({ top: 10 } as DOMRect);
    await scrollPage(3000);
    expect(header.className).toContain("nav-on-dark");
    await scrollPage(3100); // still over the footer
    expect(header.className).toContain("nav-on-dark");
    // Scrolled back up: the footer is far below the header again
    footerTop.mockReturnValue({ top: 900 } as DOMRect);
    await scrollPage(1500);
    expect(header.className).not.toContain("nav-on-dark");
    within(header).getByRole("button", { name: t("toggleMenu") });
  });
});
