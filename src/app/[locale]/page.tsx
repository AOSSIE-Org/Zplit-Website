import { getTranslations, setRequestLocale } from "next-intl/server";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InnovationSection from "@/components/InnovationSection";
import FeaturesShowcase from "@/components/features/FeaturesShowcase";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/footer/Footer";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Home" });

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": t("heading"),
    "description": t("metaDescription"),
    "publisher": {
      "@type": "Organization",
      "name": "AOSSIE",
      "url": "https://zplit.aossie.org",
      "logo": "https://zplit.aossie.org/brand/icons/aossie_logo.svg",
    },
    "inLanguage": locale,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background-primary text-foreground-primary font-sans transition-colors duration-200">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        id="schema-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />

      <main className="flex-1">
        <Hero />
        <FeaturesShowcase />
        <InnovationSection />
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
}
