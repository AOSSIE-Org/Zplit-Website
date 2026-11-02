import type { MetadataRoute } from 'next';
import { routing } from '../i18n/routing';
import { SITE_URL } from '@/config/site';
import { LEGAL_DOCUMENTS } from '@/config/legal';
import { SUPPORT_PAGE } from '@/config/support';

export const dynamic = 'force-static';

/** Localized pages, relative to the locale root. */
const PAGES = [
  { path: '', priority: 1 },
  { path: LEGAL_DOCUMENTS.privacy.path, priority: 0.3 },
  { path: LEGAL_DOCUMENTS.terms.path, priority: 0.3 },
  { path: SUPPORT_PAGE.path, priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.flatMap((locale) =>
    PAGES.map(({ path, priority }) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: 'monthly' as const,
      priority,
    }))
  );
}

