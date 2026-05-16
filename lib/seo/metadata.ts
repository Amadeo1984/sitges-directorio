import type { Metadata } from 'next';
import { locales, type Locale, defaultLocale } from '@/i18n/config';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

const ogLocale: Record<Locale, string> = {
  es: 'es_ES',
  ca: 'ca_ES',
  en: 'en_US',
  fr: 'fr_FR',
};

interface PageMetaInput {
  locale: Locale;
  title: string;
  description?: string;
  /** Map of locale → relative path (must start with /) for hreflang alternates. */
  pathByLocale: Partial<Record<Locale, string>>;
  /** Force noindex for search results, internal pages, etc. */
  noindex?: boolean;
  /** Optional OG image override. */
  image?: string;
}

export function buildPageMetadata({
  locale,
  title,
  description,
  pathByLocale,
  noindex,
  image,
}: PageMetaInput): Metadata {
  const canonicalPath = pathByLocale[locale];
  const canonical = canonicalPath ? `${appUrl}${canonicalPath}` : undefined;

  const languages: Record<string, string> = {};
  for (const loc of locales) {
    const path = pathByLocale[loc];
    if (path) languages[loc] = `${appUrl}${path}`;
  }
  // x-default → locale por defecto (es) si está disponible
  const defaultPath = pathByLocale[defaultLocale];
  if (defaultPath) languages['x-default'] = `${appUrl}${defaultPath}`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: 'Sitges Directorio',
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}
