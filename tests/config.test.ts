import fs from "fs";
import path from "path";
import { describe, it, expect, vi, afterEach } from "vitest";
import fc from "fast-check";
import { SITE_LINKS } from "@/config/links";
import { languages } from "@/config/languages";
import { LEGAL_DOCUMENTS } from "@/config/legal";
import { SUPPORT_PAGE, SUPPORTERS } from "@/config/support";

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

  it("links the AOSSIE-Org GitHub Sponsors page", () => {
    expect(SITE_LINKS.githubSponsors).toBe("https://github.com/sponsors/AOSSIE-Org");
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

describe("LEGAL_DOCUMENTS", () => {
  it.each(Object.entries(LEGAL_DOCUMENTS))("%s renders a Markdown file that exists at the repository root", (_, { file }) => {
    expect(fs.existsSync(path.join(process.cwd(), file))).toBe(true);
  });

  it("gives each document its own page path", () => {
    const paths = Object.values(LEGAL_DOCUMENTS).map((doc) => doc.path);
    expect(new Set(paths).size).toBe(paths.length);
    paths.forEach((p) => expect(p).toMatch(/^\/[a-z]+$/));
  });
});

describe("SUPPORT_PAGE", () => {
  it("has its own page path, distinct from the legal pages", () => {
    expect(SUPPORT_PAGE.path).toMatch(/^\/[a-z]+$/);
    expect(Object.values(LEGAL_DOCUMENTS).map((doc) => doc.path)).not.toContain(SUPPORT_PAGE.path);
  });
});

describe("SUPPORTERS", () => {
  it("lists Google Summer of Code and Stability Nexus with their sites and no tier", () => {
    expect(SUPPORTERS).toEqual([
      { name: "Google Summer of Code", link: SITE_LINKS.gsoc },
      { name: "Stability Nexus", link: SITE_LINKS.stabilityNexus },
    ]);
    expect(SITE_LINKS.gsoc).toBe("https://summerofcode.withgoogle.com");
    for (const supporter of SUPPORTERS) expect(supporter).not.toHaveProperty("sponsorshipTier");
  });
});

describe("SITE_URL", () => {
  // SITE_URL is resolved once at module load (Next inlines NEXT_PUBLIC_* at build time), so re-import it
  async function loadSiteUrl() {
    vi.resetModules();
    return (await import("@/config/site")).SITE_URL;
  }

  it("defaults to the HTTPS production origin without a trailing slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    const siteUrl = await loadSiteUrl();
    expect(siteUrl).toBe("https://zplit.aossie.org");
    expect(new URL(siteUrl).protocol).toBe("https:");
    expect(siteUrl.endsWith("/")).toBe(false);
  });

  it("property: NEXT_PUBLIC_SITE_URL with or without a trailing slash yields clean page URLs", async () => {
    await fc.assert(
      fc.asyncProperty(fc.domain(), fc.nat({ max: 1 }), async (domain, slashes) => {
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", `https://${domain}${"/".repeat(slashes)}`);
        vi.resetModules();
        const { default: sitemap } = await import("@/app/sitemap");
        for (const entry of sitemap()) {
          expect(entry.url).toMatch(new RegExp(`^https://${domain.replace(/\./g, "\\.")}/[a-z]{2}(/[a-z]+)?$`));
        }
      }),
      { numRuns: 25 },
    );
  });
});
