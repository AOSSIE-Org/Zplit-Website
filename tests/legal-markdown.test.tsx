import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { LegalDocument, parseLegalMarkdown, resolveLegalHref } from "@/lib/legal-markdown";

const links = { privacy: "/en/privacy", terms: "/en/terms" };

describe("parseLegalMarkdown", () => {
  it("splits headings, paragraphs and lists", () => {
    const blocks = parseLegalMarkdown("# Title\n\nOne\ntwo\n\n## Part\n\n* a\n* b\n  continued\n\nEnd");
    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "Title" },
      { type: "paragraph", text: "One two" },
      { type: "heading", level: 2, text: "Part" },
      { type: "list", items: ["a", "b continued"] },
      { type: "paragraph", text: "End" },
    ]);
  });

  it("starts a list straight after a paragraph line", () => {
    expect(parseLegalMarkdown("Intro\n* one\n- two")).toEqual([
      { type: "paragraph", text: "Intro" },
      { type: "list", items: ["one", "two"] },
    ]);
  });

  it("handles Windows line endings", () => {
    expect(parseLegalMarkdown("## A\r\n\r\ntext\r\n")).toEqual([
      { type: "heading", level: 2, text: "A" },
      { type: "paragraph", text: "text" },
    ]);
  });
});

describe("resolveLegalHref", () => {
  it("maps the legal files to site pages", () => {
    expect(resolveLegalHref("PRIVACY.md", links)).toBe("/en/privacy");
    expect(resolveLegalHref("./TERMS.md", links)).toBe("/en/terms");
  });

  it("keeps http(s) and mailto links and drops unsafe ones", () => {
    expect(resolveLegalHref("https://example.org", links)).toBe("https://example.org");
    expect(resolveLegalHref("mailto:contact@aossie.org", links)).toBe("mailto:contact@aossie.org");
    expect(resolveLegalHref("javascript:alert(1)", links)).toBeNull();
    expect(resolveLegalHref("other.md", links)).toBeNull();
  });

  it("keeps site paths but drops protocol-relative links to other hosts", () => {
    expect(resolveLegalHref("/support", links)).toBe("/support");
    expect(resolveLegalHref("//example.org", links)).toBeNull();
    expect(resolveLegalHref("/\\example.org", links)).toBeNull();
  });
});

describe("LegalDocument", () => {
  it("renders inline formatting, safe links and English language markup", () => {
    const html = renderToStaticMarkup(
      <LegalDocument
        links={links}
        source={"# Privacy\n\n**Bold** `theme` [Terms](TERMS.md) [GitHub](https://github.com) [x](javascript:alert(1))"}
      />,
    );
    expect(html).toContain('<div lang="en">');
    expect(html).toContain("<h1>Privacy</h1>");
    expect(html).toContain("<strong>Bold</strong>");
    expect(html).toContain("<code>theme</code>");
    expect(html).toContain('<a href="/en/terms">Terms</a>');
    expect(html).toContain('<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>');
    expect(html).not.toContain("javascript:");
  });
});

describe("legal Markdown properties", () => {
  // Same rule as SAFE_HREF: a single leading slash is a site path; "//host" and "/\host" are protocol-relative
  const SAFE = /^(https?:|mailto:|#|\/(?![/\\]))/i;

  it("property: links resolve to the site's legal pages, a safe URL, or nothing", () => {
    fc.assert(
      fc.property(fc.oneof(fc.webUrl(), fc.string(), fc.constantFrom("PRIVACY.md", "./TERMS.md", "javascript:alert(1)", "data:text/html,x", "//example.org", "/\\example.org", "/support")), (href) => {
        const resolved = resolveLegalHref(href, links);
        if (resolved !== null) expect(resolved === links.privacy || resolved === links.terms || SAFE.test(resolved)).toBe(true);
        if (/^\s*(javascript|data|vbscript):/i.test(href)) expect(resolved).toBeNull();
      }),
    );
  });

  it("property: rendered documents never carry an unsafe link and keep every list item", () => {
    const word = fc.stringMatching(/^[A-Za-z]{1,8}$/);
    const href = fc.oneof(fc.webUrl(), fc.constantFrom("javascript:alert(1)", "PRIVACY.md", "other.md", "data:x"));
    fc.assert(
      fc.property(fc.array(fc.tuple(word, href), { minLength: 1, maxLength: 6 }), (items) => {
        const source = items.map(([label, url]) => `* [${label}](${url})`).join("\n");
        expect(parseLegalMarkdown(source)).toEqual([{ type: "list", items: items.map(([label, url]) => `[${label}](${url})`) }]);
        const html = renderToStaticMarkup(<LegalDocument source={source} links={links} />);
        for (const [, value] of html.matchAll(/href="([^"]*)"/g)) expect(SAFE.test(value)).toBe(true);
        for (const [label] of items) expect(html).toContain(label);
      }),
    );
  });
});
