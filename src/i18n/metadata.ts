import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { SITE_URL } from '@/config/site';

/** Metadata for a localized page; `path` is relative to the locale root (e.g. '/privacy'). */
export async function generateLocaleMetadata(
  locale: string,
  namespace: string,
  path = ''
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace });

  const siteUrl = SITE_URL;
  const localeUrl = `${siteUrl}/${locale}${path}`;

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    icons: {
      icon: [
        { url: '/brand/icons/favicon.ico', sizes: 'any' },
        { url: '/brand/icons/zplit_logo.svg', type: 'image/svg+xml' },
      ],
    },
    alternates: {
      canonical: localeUrl,
      languages: {
        en: `${siteUrl}/en${path}`,
        hi: `${siteUrl}/hi${path}`,
      },
    },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: localeUrl,

      siteName: 'Zplit',
      // Social platforms do not render SVG previews, so the share image is a 1200x630 PNG
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: t('metaTitle'),
        },
      ],
      locale: locale === 'en' ? 'en_US' : 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('metaTitle'),
      description: t('metaDescription'),
      images: [`${siteUrl}/og-image.png`],
    },
  };
}
