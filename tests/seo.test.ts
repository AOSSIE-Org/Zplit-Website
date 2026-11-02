import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { routing } from "@/i18n/routing";
import { defaultLanguage, languages } from "@/config/languages";
import { LEGAL_DOCUMENTS } from "@/config/legal";
import { SUPPORT_PAGE } from "@/config/support";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async ({ locale }: { locale: string }) => (key: string) => `${locale}:${key}`),
}));

const SITE = "https://zplit.aossie.org";

// Clear any preview URL from the environment so the production assertions are deterministic;
// the override tests stub their own value
beforeEach(() => vi.stubEnv("NEXT_PUBLIC_SITE_URL", ""));
afterEach(() => vi.unstubAllEnvs());

// SITE_URL is read once when src/config/site.ts loads (Next inlines NEXT_PUBLIC_* at build time),
// so re-import the modules after stubbing the environment
async function loadSeo() {
  vi.resetModules();
  const [{ default: sitemap }, { generateLocaleMetadata }] = await Promise.all([
    import("@/app/sitemap"),
    import("@/i18n/metadata"),
  ]);
  return { sitemap, generateLocaleMetadata };
}

describe("Locale configuration", () => {
  it("routes every configured language with English as default", () => {
    expect(routing.locales).toEqual(languages.map((l) => l.code));
    expect(routing.defaultLocale).toBe(defaultLanguage);
    expect(defaultLanguage).toBe("en");
  });
});

describe("sitemap", () => {
  it("lists the home, legal and support pages for each locale", async () => {
    const { sitemap } = await loadSeo();
    const paths = ["", ...Object.values(LEGAL_DOCUMENTS).map((doc) => doc.path), SUPPORT_PAGE.path];
    expect(sitemap().map((entry) => entry.url)).toEqual(
      routing.locales.flatMap((l) => paths.map((path) => `${SITE}/${l}${path}`)),
    );
  });

  it("honours NEXT_PUBLIC_SITE_URL and strips a trailing slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.org/");
    const { sitemap } = await loadSeo();
    expect(sitemap()[0].url).toBe("https://preview.example.org/en");
  });
});

describe("generateLocaleMetadata", () => {
  it("builds canonical, hreflang alternates and localized titles", async () => {
    const { generateLocaleMetadata } = await loadSeo();
    const meta = await generateLocaleMetadata("hi", "Home");
    expect(meta.title).toBe("hi:metaTitle");
    expect(meta.description).toBe("hi:metaDescription");
    expect(meta.alternates?.canonical).toBe(`${SITE}/hi`);
    expect(meta.alternates?.languages).toEqual({ en: `${SITE}/en`, hi: `${SITE}/hi` });
  });

  it("uses a 1200x630 raster share image, because social platforms ignore SVG previews", async () => {
    const { generateLocaleMetadata } = await loadSeo();
    const meta = await generateLocaleMetadata("en", "Home");
    const [image] = meta.openGraph?.images as { url: string; width: number; height: number }[];
    expect(image.url).toBe(`${SITE}/og-image.png`);
    expect([image.width, image.height]).toEqual([1200, 630]);
    expect(meta.twitter).toMatchObject({ card: "summary_large_image", images: [`${SITE}/og-image.png`] });
  });

  it("sets the Open Graph locale per language", async () => {
    const { generateLocaleMetadata } = await loadSeo();
    expect((await generateLocaleMetadata("en", "Home")).openGraph).toMatchObject({ locale: "en_US" });
    expect((await generateLocaleMetadata("hi", "Home")).openGraph).toMatchObject({ locale: "hi_IN" });
  });

  it.each([...Object.values(LEGAL_DOCUMENTS), SUPPORT_PAGE])("gives $path its own canonical, alternates and title", async ({ namespace, path }) => {
    const { sitemap, generateLocaleMetadata } = await loadSeo();
    const meta = await generateLocaleMetadata("hi", namespace, path);
    expect(meta.title).toBe("hi:metaTitle");
    expect(meta.alternates?.canonical).toBe(`${SITE}/hi${path}`);
    expect(meta.alternates?.languages).toEqual({ en: `${SITE}/en${path}`, hi: `${SITE}/hi${path}` });
    expect(meta.openGraph).toMatchObject({ url: `${SITE}/hi${path}` });
    expect(sitemap().map((entry) => entry.url)).toContain(meta.alternates?.canonical);
  });

  it("respects NEXT_PUBLIC_SITE_URL for canonical URLs", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://preview.example.org/");
    const { generateLocaleMetadata } = await loadSeo();
    const meta = await generateLocaleMetadata("en", "Home");
    expect(meta.alternates?.canonical).toBe("https://preview.example.org/en");
  });
});
