import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { languages } from "@/config/languages";
import { catalogs, renderWithIntl, translator } from "../support/intl";
import { navigation, setPathname } from "../support/navigation";

const label = translator("en", "LanguageSwitcher")("selectLanguage");

async function openMenu(name = label) {
  fireEvent.click(screen.getByRole("button", { name }));
  // The selected option is focused on the next animation frame
  await act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
  return screen.getByRole("listbox", { name });
}

describe("LanguageSwitcher", () => {
  it("shows the current language on a collapsed trigger", () => {
    renderWithIntl(<LanguageSwitcher />);
    const trigger = screen.getByRole("button", { name: label });
    expect(trigger.textContent).toContain("English");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("lists every language, marks the current one selected and focuses it", async () => {
    setPathname("/hi");
    renderWithIntl(<LanguageSwitcher />, { locale: "hi" });
    const hiLabel = translator("hi", "LanguageSwitcher")("selectLanguage");
    expect(hiLabel).not.toBe(label);
    const listbox = await openMenu(hiLabel);
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(
      languages.map((l) => (l.localName === l.name ? l.name : `${l.name}${l.localName}`)),
    );
    expect(options.map((o) => o.getAttribute("aria-selected"))).toEqual(["false", "true"]);
    expect(document.activeElement).toBe(options[1]);
    expect(listbox.getAttribute("aria-label")).toBe(hiLabel);
  });

  it("switches locale on the same page through the router", async () => {
    setPathname("/en/privacy");
    renderWithIntl(<LanguageSwitcher />);
    await openMenu();
    fireEvent.click(screen.getByRole("option", { name: /Hindi/ }));
    expect(navigation.router.replace).toHaveBeenCalledWith("/hi/privacy");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: label }));
  });

  it("only closes when the current language is picked again", async () => {
    renderWithIntl(<LanguageSwitcher />);
    await openMenu();
    fireEvent.click(screen.getByRole("option", { name: "English" }));
    expect(navigation.router.replace).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("moves focus with the arrow, Home and End keys, wrapping around", async () => {
    renderWithIntl(<LanguageSwitcher />);
    const listbox = await openMenu();
    const options = screen.getAllByRole("option");
    expect(document.activeElement).toBe(options[0]);

    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    expect(document.activeElement).toBe(options[1]);
    expect(options[1].getAttribute("tabindex")).toBe("0");
    expect(options[0].getAttribute("tabindex")).toBe("-1");
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    expect(document.activeElement).toBe(options[0]);
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    expect(document.activeElement).toBe(options[1]);
    fireEvent.keyDown(listbox, { key: "Home" });
    expect(document.activeElement).toBe(options[0]);
    fireEvent.keyDown(listbox, { key: "End" });
    expect(document.activeElement).toBe(options[options.length - 1]);
    // Other keys are ignored
    fireEvent.keyDown(listbox, { key: "a" });
    expect(screen.getByRole("listbox")).toBeTruthy();
  });

  it("closes on Tab, Escape (returning focus) and clicks outside, but not clicks inside", async () => {
    renderWithIntl(<LanguageSwitcher />);
    const trigger = screen.getByRole("button", { name: label });

    fireEvent.keyDown(await openMenu(), { key: "Tab" });
    expect(screen.queryByRole("listbox")).toBeNull();

    await openMenu();
    fireEvent.keyDown(document, { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(document.activeElement).toBe(trigger);

    await openMenu();
    fireEvent.mouseDown(screen.getAllByRole("option")[0]);
    expect(screen.getByRole("listbox")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("falls back to the first language for a locale it does not list", async () => {
    render(
      <NextIntlClientProvider locale="fr" messages={catalogs.en} timeZone="UTC">
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );
    expect(screen.getByRole("button", { name: label }).textContent).toContain(languages[0].name);
    await openMenu();
    const options = screen.getAllByRole("option");
    expect(options.map((o) => o.getAttribute("aria-selected"))).toEqual(["false", "false"]);
    expect(document.activeElement).toBe(options[0]);
  });

  it("toggles closed from the trigger", async () => {
    renderWithIntl(<LanguageSwitcher />);
    await openMenu();
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});
