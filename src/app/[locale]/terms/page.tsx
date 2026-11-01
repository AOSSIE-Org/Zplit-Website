import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import LegalPage from "@/components/LegalPage";
import { LEGAL_DOCUMENTS } from "@/config/legal";
import { generateLocaleMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";

const { namespace, path } = LEGAL_DOCUMENTS.terms;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateLocaleMetadata(locale, namespace, path);
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <LegalPage locale={locale} document="terms" />;
}
