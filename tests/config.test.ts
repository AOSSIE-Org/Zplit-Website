import { describe, it, expect, vi, afterEach } from "vitest";
import fc from "fast-check";
import { SITE_LINKS } from "@/config/links";
import { languages } from "@/config/languages";
import sitemap from "@/app/sitemap";

afterEach(() => vi.unstubAllEnvs());

describe("SITE_LINKS", () => {
  it("only contains absolute HTTPS URLs", () => {
    for (const [name, url] of Object.entries(SITE_LINKS)) {
      expect(new URL(url).protocol, name).toBe("https:");
    }
  });

  it("points the code links at the Zplit app repository", () => {
    expect(SITE_LINKS.github).toBe("https://github.com/AOSSIE-Org/Zplit");
    expect(SITE_LINKS.issues).toBe(`${SITE_LINKS.github}/issues`);
  });

  it("links the Play Store listing for the org.aossie.zplit package", () => {
    expect(new URL(SITE_LINKS.playStore).searchParams.get("id")).toBe("org.aossie.zplit");
  });

  it("has no duplicate destinations", () => {
    const urls = Object.values(SITE_LINKS);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("languages", () => {
  it("has unique codes with native names", () => {
    const codes = languages.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
    for (const lang of languages) {
      expect(lang.localName.trim()).not.toBe("");
    }
  });
});

describe("sitemap base URL handling", () => {
  it("property: NEXT_PUBLIC_SITE_URL with or without a trailing slash yields clean locale URLs", () => {
    fc.assert(
      fc.property(fc.domain(), fc.nat({ max: 1 }), (domain, slashes) => {
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", `https://${domain}${"/".repeat(slashes)}`);
        for (const entry of sitemap()) {
          expect(entry.url).toMatch(new RegExp(`^https://${domain.replace(/\./g, "\\.")}/[a-z]{2}$`));
        }
      }),
    );
  });
});
