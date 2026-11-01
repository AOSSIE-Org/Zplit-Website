/** Renders components inside next-intl with the site's real message catalogs. */
import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider, createTranslator } from "next-intl";
import en from "@/messages/en.json";
import hi from "@/messages/hi.json";

export const catalogs = { en, hi } as const;
export type TestLocale = keyof typeof catalogs;
export const locales = Object.keys(catalogs) as TestLocale[];

/** Translator over the real catalog, for computing the text a component should show. */
export function translator(locale: TestLocale, namespace?: string) {
  // The catalogs are plain JSON, so the namespace is a runtime string here
  return createTranslator({ locale, messages: catalogs[locale], namespace: namespace as never }) as unknown as (
    key: string,
    values?: Record<string, string | number>,
  ) => string;
}

export function IntlWrapper({ locale = "en", children }: { locale?: TestLocale; children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale={locale} messages={catalogs[locale]} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}

export function renderWithIntl(ui: ReactElement, { locale = "en", ...options }: { locale?: TestLocale } & RenderOptions = {}) {
  const result = render(ui, {
    wrapper: ({ children }) => <IntlWrapper locale={locale}>{children}</IntlWrapper>,
    ...options,
  });
  return result;
}
