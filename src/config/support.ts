import { SITE_LINKS } from "./links";

/** The localized page that explains how to support Zplit, linked from the footer. */
export const SUPPORT_PAGE = { path: "/support", namespace: "SupportPage" } as const;

/** Organisations listed as supporters on the support page (proper nouns, so not translated; no tier is claimed). */
export const SUPPORTERS = [
  { name: "Google Summer of Code", link: SITE_LINKS.gsoc },
  { name: "Stability Nexus", link: SITE_LINKS.stabilityNexus },
] as const;
