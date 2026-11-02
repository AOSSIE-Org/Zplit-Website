import { describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, screen, within } from "@testing-library/react";
import RootRedirectLayout from "@/app/(root)/layout";
import RootPage, { generateMetadata as rootMetadata } from "@/app/(root)/page";
import LocaleLayout, { generateMetadata as layoutMetadata, generateStaticParams as layoutParams, dynamicParams } from "@/app/[locale]/layout";
import Home from "@/app/[locale]/page";
import NotFound from "@/app/[locale]/not-found";
import ErrorBoundary from "@/app/[locale]/error";
import PrivacyPage, { generateMetadata as privacyMetadata, generateStaticParams as privacyParams } from "@/app/[locale]/privacy/page";
import TermsPage, { generateMetadata as termsMetadata, generateStaticParams as termsParams } from "@/app/[locale]/terms/page";
import SupportPage, { generateMetadata as supportMetadata, generateStaticParams as supportParams } from "@/app/[locale]/support/page";
import requestConfig from "@/i18n/request";
import { SITE_URL } from "@/config/site";
import { SITE_LINKS } from "@/config/links";
import { setRequestLocale } from "../support/next-intl-server";
import { catalogs, locales, renderWithIntl, translator, type TestLocale } from "../support/intl";
import { setPathname } from "../support/navigation";

vi.mock("next-intl/server", () => import("../support/next-intl-server"));
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "font-inter-var" }),
  Noto_Sans_Devanagari: () => ({ variable: "font-devanagari-var" }),
}));
vi.mock("@aossie-org/social-share-button", () => ({ default: class {} }));

const params = (locale: string) => ({ params: Promise.resolve({ locale }) });

/** Awaits a page that returns an async server component (React DOM's client renderer cannot). */
async function resolveServerElement(element: ReactElement): Promise<ReactElement> {
  const render = element.type as (props: unknown) => Promise<ReactElement>;
  return render(element.props);
}

/** Finds the first element of `type` in a server component's returned tree. */
function findElement(node: ReactNode, type: unknown): ReactElement<Record<string, unknown>> | undefined {
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = findElement(child, type);
      if (found) return found;
    }
    return undefined;
  }
  if (!isValidElement<{ children?: ReactNode }>(node)) return undefined;
  if (node.type === type) return node as ReactElement<Record<string, unknown>>;
  return findElement(node.props.children, type);
}

describe("/ (root redirect)", () => {
  it("forwards to the default locale with a script, a meta refresh and a no-JS link", async () => {
    const html = renderToStaticMarkup(<RootRedirectLayout>{await RootPage()}</RootRedirectLayout>);
    expect(html).toContain('<html lang="en">');
    expect(html).toContain('<script>location.replace("/en")</script>');
    expect(html).toContain('<meta http-equiv="refresh" content="0; url=/en"/>');
    expect(html).toContain(`<noscript><a href="/en">${catalogs.en.Home.continue}</a></noscript>`);
    expect(html).not.toContain("stylesheet");
  });

  it("ships the English home page metadata", async () => {
    const meta = await rootMetadata();
    expect(meta.title).toBe(catalogs.en.Home.metaTitle);
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/en`);
  });
});

describe("[locale] layout", () => {
  it("statically generates every locale and nothing else", () => {
    expect(layoutParams()).toEqual(locales.map((locale) => ({ locale })));
    expect(dynamicParams).toBe(false);
  });

  it.each(locales)("sets <html lang>, fonts and the %s messages for client components", async (locale) => {
    const tree = await LocaleLayout({ children: <main>page</main>, ...params(locale) });
    expect(setRequestLocale).toHaveBeenCalledWith(locale);
    expect(tree.type).toBe("html");
    const { lang, className } = tree.props as { lang: string; className: string };
    expect(lang).toBe(locale);
    expect(className).toContain("font-inter-var");
    expect(className).toContain("font-devanagari-var");
    const { NextIntlClientProvider } = await import("next-intl");
    expect(findElement(tree, NextIntlClientProvider)?.props.messages).toBe(catalogs[locale]);
    expect(findElement(tree, "main")).toBeTruthy();
  });

  it("returns the localized home metadata", async () => {
    const meta = await layoutMetadata(params("hi"));
    expect(meta.title).toBe(catalogs.hi.Home.metaTitle);
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/hi`);
  });

  it("rejects unknown locales with a 404", async () => {
    await expect(LocaleLayout({ children: null, ...params("fr") })).rejects.toThrow("NEXT_NOT_FOUND");
    await expect(layoutMetadata(params("fr"))).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("[locale] home page", () => {
  it.each(locales)("renders every section with %s structured data", async (locale) => {
    setPathname(`/${locale}`);
    const { container } = renderWithIntl(await Home(params(locale)), { locale });
    expect(setRequestLocale).toHaveBeenCalledWith(locale);
    for (const id of ["features", "innovation", "faq"]) expect(container.querySelector(`main #${id}`)).toBeTruthy();
    expect(container.querySelector("header")).toBeTruthy();
    expect(container.querySelector("footer")).toBeTruthy();

    const jsonLd = JSON.parse(container.querySelector("#schema-jsonld")!.innerHTML);
    expect(jsonLd).toMatchObject({
      "@type": "WebPage",
      name: catalogs[locale].Home.heading,
      description: catalogs[locale].Home.metaDescription,
      inLanguage: locale,
      publisher: { name: "AOSSIE", url: SITE_URL, logo: `${SITE_URL}/brand/icons/aossie_logo.svg` },
    });
  });
});

describe("legal pages", () => {
  const pages = [
    { name: "privacy", Page: PrivacyPage, metadata: privacyMetadata, staticParams: privacyParams, heading: "Privacy Policy", namespace: "PrivacyPage" },
    { name: "terms", Page: TermsPage, metadata: termsMetadata, staticParams: termsParams, heading: "Terms of Service", namespace: "TermsPage" },
  ] as const;

  it.each(pages)("/$name is generated for every locale with its own canonical URL", async ({ name, metadata, staticParams, namespace }) => {
    expect(staticParams()).toEqual(locales.map((locale) => ({ locale })));
    const meta = await metadata(params("hi"));
    expect(meta.title).toBe(catalogs.hi[namespace].metaTitle);
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/hi/${name}`);
  });

  it.each(pages)("/$name renders the repository document in English", async ({ Page, heading }) => {
    const { container } = renderWithIntl(await resolveServerElement(await Page(params("en"))));
    const article = container.querySelector("article")!;
    expect(within(article).getByRole("heading", { level: 1 }).textContent).toBe(heading);
    expect(article.querySelector('[lang="en"]')).toBeTruthy();
    expect(within(article).queryByRole("note")).toBeNull();
  });

  it("notes on translated pages that the document is English-only and links within the locale", async () => {
    setPathname("/hi/terms");
    const { container } = renderWithIntl(await resolveServerElement(await TermsPage(params("hi"))), { locale: "hi" });
    const article = container.querySelector("article")!;
    expect(within(article).getByRole("note").textContent).toBe(catalogs.hi.Legal.englishOnly);
    const privacyLinks = within(article).getAllByRole("link", { name: "Privacy Policy" });
    expect(privacyLinks.length).toBeGreaterThan(0);
    privacyLinks.forEach((a) => expect(a.getAttribute("href")).toBe("/hi/privacy"));
  });
});

describe("/support", () => {
  it("is generated for every locale with its own canonical URL", async () => {
    expect(supportParams()).toEqual(locales.map((locale) => ({ locale })));
    const meta = await supportMetadata(params("en"));
    expect(meta.title).toBe(catalogs.en.SupportPage.metaTitle);
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/en/support`);
  });

  it.each(locales)("presents the %s support widget between the navbar and footer", async (locale) => {
    setPathname(`/${locale}/support`);
    const { container } = renderWithIntl(await SupportPage(params(locale)), { locale });
    const main = container.querySelector("main")!;
    expect(main.previousElementSibling?.tagName).toBe("HEADER");
    expect(main.nextElementSibling?.tagName).toBe("FOOTER");
    const page = catalogs[locale].SupportPage;
    expect(within(main).getByText(page.metaTitle)).toBeTruthy();
    expect(within(main).getByText(page.organizationDescription)).toBeTruthy();
    expect(within(main).getByText(catalogs[locale].Footer.tagline)).toBeTruthy();
    expect(within(main).getByRole("link", { name: /AOSSIE/ }).getAttribute("href")).toBe(SITE_LINKS.aossie);
    expect(within(main).getByText(page.supportedBy)).toBeTruthy();
    // Supporters are listed by name, each linking to its site, with no sponsorship tier claimed
    expect(within(main).getByRole("link", { name: /Google Summer of Code/ }).getAttribute("href")).toBe(SITE_LINKS.gsoc);
    expect(within(main).getByRole("link", { name: /Stability Nexus/ }).getAttribute("href")).toBe(SITE_LINKS.stabilityNexus);
    for (const tier of ["Platinum", "Gold", "Silver", "Bronze"]) expect(main.textContent).not.toContain(tier);
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    fireEvent.click(within(main).getByRole("button", { name: /GitHub Sponsors/ }));
    expect(open).toHaveBeenCalledWith(SITE_LINKS.githubSponsors, expect.anything(), expect.anything());
    open.mockRestore();
  });
});

describe("not-found page", () => {
  it.each(locales)("explains the %s 404 and links home", (locale) => {
    setPathname(`/${locale}/missing`);
    renderWithIntl(<NotFound />, { locale });
    const t = translator(locale as TestLocale, "NotFound");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(t("title"));
    expect(screen.getByText(t("description"))).toBeTruthy();
    expect(screen.getByRole("link", { name: t("home") }).getAttribute("href")).toBe(`/${locale}`);
  });
});

describe("error boundary", () => {
  it("logs the error and offers a retry", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("boom");
    const reset = vi.fn();
    renderWithIntl(<ErrorBoundary error={error} reset={reset} />, { locale: "hi" });
    expect(consoleError).toHaveBeenCalledWith(error);
    const t = translator("hi", "Error");
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(t("title"));
    fireEvent.click(screen.getByRole("button", { name: t("retry") }));
    expect(reset).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});

describe("i18n request config", () => {
  const load = (requestLocale: string | undefined) =>
    (requestConfig as unknown as (p: { requestLocale: Promise<string | undefined> }) => Promise<{ locale: string; messages: unknown }>)({
      requestLocale: Promise.resolve(requestLocale),
    });

  it.each(locales)("loads the %s catalog for a supported locale", async (locale) => {
    const config = await load(locale);
    expect(config.locale).toBe(locale);
    expect(config.messages).toEqual(catalogs[locale]);
  });

  it.each([undefined, "", "fr", "EN"])("falls back to English for %j", async (requested) => {
    const config = await load(requested);
    expect(config.locale).toBe("en");
    expect(config.messages).toEqual(catalogs.en);
  });
});
