/** Production origin, overridable at build time via NEXT_PUBLIC_SITE_URL (e.g. for PR previews); never ends with a slash. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://zplit.aossie.org").replace(/\/$/, "");
