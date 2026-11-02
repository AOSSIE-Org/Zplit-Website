import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";
import { languages } from "@/config/languages";
import { LEGAL_DOCUMENTS } from "@/config/legal";
import { SUPPORT_PAGE } from "@/config/support";

type Catalog = { [key: string]: string | Catalog };

function flatten(catalog: Catalog, prefix = ""): Record<string, string> {
  return Object.entries(catalog).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) };
  }, {});
}

const placeholders = (text: string) => (text.match(/\{(\w+)/g) ?? []).sort();

const catalogs: Record<string, Catalog> = { en, hi };
const english = flatten(en);
const translations = Object.keys(catalogs).filter((code) => code !== "en");

describe("Translation catalogs", () => {
  it("ships a catalog for every configured language", () => {
    for (const { code } of languages) {
      expect(catalogs[code], code).toBeDefined();
    }
  });

  it.each(translations)("%s has exactly the same keys as English", (code) => {
    expect(Object.keys(flatten(catalogs[code])).sort()).toEqual(Object.keys(english).sort());
  });

  it.each(Object.keys(catalogs))("%s has no empty strings", (code) => {
    const empty = Object.entries(flatten(catalogs[code])).filter(([, text]) => text.trim() === "");
    expect(empty).toEqual([]);
  });

  it.each(translations)("%s keeps every ICU placeholder used in English", (code) => {
    const translated = flatten(catalogs[code]);
    for (const [key, text] of Object.entries(english)) {
      expect(placeholders(translated[key]), key).toEqual(placeholders(text));
    }
  });

  it.each(Object.keys(catalogs))("%s defines the home page SEO title and description", (code) => {
    const flat = flatten(catalogs[code]);
    expect(flat["Home.metaTitle"]?.trim()).toBeTruthy();
    expect(flat["Home.metaDescription"]?.trim()).toBeTruthy();
  });

  it.each(Object.keys(catalogs))("%s defines the SEO title and description of every legal page and the support page", (code) => {
    const flat = flatten(catalogs[code]);
    for (const { namespace } of [...Object.values(LEGAL_DOCUMENTS), SUPPORT_PAGE]) {
      expect(flat[`${namespace}.metaTitle`]?.trim(), namespace).toBeTruthy();
      expect(flat[`${namespace}.metaDescription`]?.trim(), namespace).toBeTruthy();
    }
  });
});
