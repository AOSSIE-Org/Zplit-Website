/**
 * Test double for `next-intl/server`, whose real build only runs inside Next's React Server
 * runtime. It serves the real message catalogs so server components render real text.
 * Use with `vi.mock("next-intl/server", () => import("./support/next-intl-server"))`.
 */
import { vi } from "vitest";
import { catalogs, translator, type TestLocale } from "./intl";

export const setRequestLocale = vi.fn();

export const getTranslations = vi.fn(async ({ locale, namespace }: { locale: string; namespace?: string }) =>
  translator(locale as TestLocale, namespace),
);

export const getMessages = vi.fn(async ({ locale }: { locale: string }) => catalogs[locale as TestLocale]);

/** The real helper only registers the callback with Next; the callback itself is what runs. */
export const getRequestConfig = <T,>(createConfig: T) => createConfig;
