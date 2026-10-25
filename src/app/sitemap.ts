import type { MetadataRoute } from 'next';
import { routing } from '../i18n/routing';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Set NEXT_PUBLIC_SITE_URL in the hosting environment to override the production domain.
  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zplit.aossie.org';
  const baseUrl = rawBaseUrl.replace(/\/$/, '');


  return routing.locales.map((locale) => ({
    url: `${baseUrl}/${locale}`,
    changeFrequency: 'monthly',
    priority: 1,
  }));
}

