"use client";

import { useTranslations } from "next-intl";
import SupportUsButton from "@aossie-org/support-us-button";
import "@aossie-org/support-us-button/style.css";
import { SITE_LINKS } from "@/config/links";
import { SUPPORT_PAGE, SUPPORTERS } from "@/config/support";

/**
 * Zplit's support page body. The package styles are scoped to its own root, and the "auto"
 * theme takes the font and colours from the page around it.
 */
export default function SupportContent() {
  const t = useTranslations(SUPPORT_PAGE.namespace);
  const tNav = useTranslations("Navigation");
  const tFooter = useTranslations("Footer");

  return (
    <SupportUsButton
      Theme="auto"
      // The Zplit mark is a filled tile, which a one-colour rendering turns into a solid square
      monochromeLogos={false}
      heading={t("metaTitle")}
      labels={{ madeBy: t("madeBy"), supportedBy: t("supportedBy") }}
      organizationInformation={{
        name: "AOSSIE",
        desc: t("organizationDescription"),
        image: "/brand/icons/aossie_logo.svg",
        link: SITE_LINKS.aossie,
      }}
      projectInformation={{
        name: tNav("brandName"),
        description: tFooter("tagline"),
        image: "/brand/icons/zplit_logo.svg",
      }}
      sponsors={SUPPORTERS.map(({ name, link }) => ({ name, link }))}
      ctaSection={{ sponsorLink: [{ name: "GitHub Sponsors", url: SITE_LINKS.githubSponsors }] }}
    />
  );
}
