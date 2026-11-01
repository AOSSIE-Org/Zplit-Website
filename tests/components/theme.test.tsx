import { describe, expect, it, beforeEach } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import ThemeToggle from "@/components/ThemeToggle";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { renderWithIntl, translator } from "../support/intl";
import { setPrefersDark, setReducedMotion } from "../support/browser";

const toggleLabel = translator("en", "ThemeToggle")("toggleTheme");

async function mountToggle() {
  const view = renderWithIntl(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
  // The button replaces its placeholder one animation frame after mount
  await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
  return view;
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = "";
});

describe("ThemeToggle", () => {
  it("renders a neutral placeholder until mounted, avoiding a hydration mismatch", () => {
    const { container } = renderWithIntl(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(screen.queryByRole("button")).toBeNull();
    expect(container.querySelector("div.rounded-full")).toBeTruthy();
  });

  it("follows the system light theme, showing the moon, and switches to dark on click", async () => {
    await mountToggle();
    const button = screen.getByRole("button", { name: toggleLabel });
    expect(button.querySelector("circle")).toBeNull(); // moon icon has no sun disc

    fireEvent.click(button);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(screen.getByRole("button", { name: toggleLabel }).querySelector("circle")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: toggleLabel }));
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("starts in dark mode when the system prefers dark", async () => {
    setPrefersDark(true);
    await mountToggle();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(screen.getByRole("button", { name: toggleLabel }).querySelector("circle")).toBeTruthy();
  });

  it("uses the Hindi label on Hindi pages", async () => {
    renderWithIntl(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
      { locale: "hi" },
    );
    await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
    expect(screen.getByRole("button", { name: translator("hi", "ThemeToggle")("toggleTheme") })).toBeTruthy();
  });
});

describe("LenisProvider", () => {
  it("wraps the page in Lenis smooth scrolling by default", () => {
    renderWithIntl(
      <LenisProvider>
        <p>content</p>
      </LenisProvider>,
    );
    expect(screen.getByText("content")).toBeTruthy();
    expect(document.documentElement.classList.contains("lenis")).toBe(true);
  });

  it("renders on the server, where the motion preference is not yet known", () => {
    const html = renderToStaticMarkup(
      <LenisProvider>
        <p>content</p>
      </LenisProvider>,
    );
    expect(html).toContain("<p>content</p>");
  });

  it("drops smooth scrolling when the user prefers reduced motion, and reacts to changes", () => {
    setReducedMotion(true);
    const { unmount } = renderWithIntl(
      <LenisProvider>
        <p>content</p>
      </LenisProvider>,
    );
    expect(screen.getByText("content")).toBeTruthy();
    expect(document.documentElement.classList.contains("lenis")).toBe(false);

    setReducedMotion(false);
    expect(document.documentElement.classList.contains("lenis")).toBe(true);
    unmount();
    expect(document.documentElement.classList.contains("lenis")).toBe(false);
  });
});
