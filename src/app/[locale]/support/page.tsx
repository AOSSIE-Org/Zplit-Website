import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer/Footer";
import SupportContent from "@/components/SupportContent";
import { SUPPORT_PAGE } from "@/config/support";
import { generateLocaleMetadata } from "@/i18n/metadata";
import { routing } from "@/i18n/routing";

const { namespace, path } = SUPPORT_PAGE;

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

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-background-primary text-foreground-primary font-sans transition-colors duration-200">
      <Navbar />

      {/*
        The support widget's "auto" theme reads the colours of the nearest ancestor when the theme
        class changes. <main> switches them at once (no colour transition), so it never reads a
        half-faded value.
      */}
      <main className="flex-1 bg-background-primary text-foreground-primary">
        <SupportContent />
      </main>

      <Footer />
    </div>
  );
}
