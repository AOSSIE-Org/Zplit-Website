import { describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import fc from "fast-check";
import FaqSection from "@/components/FaqSection";
import { SITE_LINKS } from "@/config/links";
import { catalogs, locales, renderWithIntl, translator } from "../support/intl";

const t = translator("en", "FAQ");
const items = catalogs.en.FAQ.items;
type ItemKey = keyof typeof items;

const visibleQuestions = () =>
  screen
    .queryAllByRole("heading", { level: 3 })
    .map((h) => h.textContent)
    .sort();

function search(value: string) {
  fireEvent.change(screen.getByRole("searchbox", { name: t("searchLabel") }), { target: { value } });
}

describe("FaqSection", () => {
  it("starts on the General category with the first answer open", () => {
    renderWithIntl(<FaqSection />);
    expect(screen.getByRole("heading", { level: 2, name: t("heading") })).toBeTruthy();
    expect(screen.getByRole("button", { name: t("categories.general") }).getAttribute("aria-pressed")).toBe("true");
    expect(visibleQuestions()).toEqual(
      (["whatIs", "platforms", "openSource", "contribute"] as ItemKey[]).map((k) => items[k].q).sort(),
    );
    const first = screen.getByRole("button", { name: items.whatIs.q });
    expect(first.getAttribute("aria-expanded")).toBe("true");
    const panel = screen.getByRole("region", { name: items.whatIs.q });
    expect(first.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.textContent).toBe(items.whatIs.a);
  });

  it("filters by category and shows every question under All", async () => {
    renderWithIntl(<FaqSection />);
    fireEvent.click(screen.getByRole("button", { name: t("categories.privacy") }));
    await waitFor(() => expect(visibleQuestions()).toEqual([items.secure.q, items.account.q].sort()));
    expect(screen.getByRole("button", { name: t("categories.privacy") }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: t("categories.general") }).getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: t("categories.all") }));
    await waitFor(() => expect(visibleQuestions()).toHaveLength(Object.keys(items).length));
  });

  it("opens one answer at a time and collapses it again", async () => {
    renderWithIntl(<FaqSection />);
    const platforms = screen.getByRole("button", { name: items.platforms.q });
    fireEvent.click(platforms);
    expect(platforms.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("button", { name: items.whatIs.q }).getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("region", { name: items.platforms.q }).textContent).toBe(items.platforms.a);

    fireEvent.click(platforms);
    expect(platforms.getAttribute("aria-expanded")).toBe("false");
    await waitFor(() => expect(screen.queryByRole("region", { name: items.platforms.q })).toBeNull());
  });

  it("searches questions and answers case-insensitively, and can clear the search", async () => {
    renderWithIntl(<FaqSection />);
    fireEvent.click(screen.getByRole("button", { name: t("categories.all") }));
    search("  ML KIT ");
    await waitFor(() => expect(visibleQuestions()).toEqual([items.ocr.q]));

    fireEvent.click(screen.getByRole("button", { name: t("clearSearch") }));
    expect((screen.getByRole("searchbox") as HTMLInputElement).value).toBe("");
    expect(screen.queryByRole("button", { name: t("clearSearch") })).toBeNull();
    await waitFor(() => expect(visibleQuestions()).toHaveLength(Object.keys(items).length));
  });

  it("shows an empty state that quotes the query", async () => {
    renderWithIntl(<FaqSection />);
    search("blockchain mining");
    await waitFor(() => expect(visibleQuestions()).toEqual([]));
    expect(screen.getByText(t("noResults", { query: "blockchain mining" }))).toBeTruthy();
  });

  it("publishes every question as FAQPage structured data, with < escaped", () => {
    const { container } = renderWithIntl(<FaqSection />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    expect(script.innerHTML).not.toContain("<");
    const data = JSON.parse(script.innerHTML);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity.map((q: { name: string }) => q.name)).toEqual(Object.values(items).map((i) => i.q));
    expect(data.mainEntity[0].acceptedAnswer.text).toBe(items.whatIs.a);
  });

  it("links the community card to Discord and the issue tracker", () => {
    renderWithIntl(<FaqSection />);
    const discord = screen.getAllByRole("link", { name: t("askDiscord") });
    expect(discord).toHaveLength(2); // desktop and mobile cards
    discord.forEach((link) => expect(link.getAttribute("href")).toBe(SITE_LINKS.discord));
    expect(screen.getByRole("link", { name: t("openIssue") }).getAttribute("href")).toBe(SITE_LINKS.issues);
  });

  it.each(locales)("renders %s questions from its own catalog", (locale) => {
    renderWithIntl(<FaqSection />, { locale });
    expect(screen.getByRole("button", { name: catalogs[locale].FAQ.items.whatIs.q })).toBeTruthy();
    expect(screen.getByRole("searchbox").getAttribute("placeholder")).toBe(catalogs[locale].FAQ.searchPlaceholder);
  });

  it("property: search results are exactly the questions whose text contains the query", { timeout: 30000 }, async () => {
    // Words taken from the catalog plus arbitrary text, so both matches and misses are exercised
    const words = Object.values(items).flatMap((i) => `${i.q} ${i.a}`.split(/\s+/)).filter((w) => w.length > 3);
    renderWithIntl(<FaqSection />);
    fireEvent.click(screen.getByRole("button", { name: t("categories.all") }));
    await fc.assert(
      fc.asyncProperty(fc.oneof(fc.constantFrom(...words), fc.string({ maxLength: 6 })), async (query) => {
        search(query);
        const q = query.trim().toLowerCase();
        const expected = Object.values(items)
          .filter((i) => !q || i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q))
          .map((i) => i.q)
          .sort();
        await waitFor(() => expect(visibleQuestions()).toEqual(expected));
      }),
      { numRuns: 25 },
    );
  });
});
