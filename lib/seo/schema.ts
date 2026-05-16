import type { Locale } from '@/i18n/config';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: appUrl + it.url,
    })),
  };
}

interface BusinessForSchema {
  schemaType: string;
  name: string;
  description?: string | null;
  url: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  postalCode?: string | null;
  lat?: number | null;
  lng?: number | null;
  priceRange?: string | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  images?: string[];
  openingHours?: { dayOfWeek: number; openTime: string; closeTime: string }[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function localBusinessSchema(b: BusinessForSchema) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': b.schemaType,
    '@id': `${appUrl}${b.url}#business`,
    name: b.name,
    description: b.description ?? undefined,
    url: appUrl + b.url,
    telephone: b.phone ?? undefined,
    image: b.images && b.images.length ? b.images : undefined,
    sameAs: b.website ? [b.website] : undefined,
  };

  if (b.address || b.postalCode) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: b.address ?? undefined,
      addressLocality: 'Sitges',
      postalCode: b.postalCode ?? '08870',
      addressRegion: 'Barcelona',
      addressCountry: 'ES',
    };
  }

  if (b.lat != null && b.lng != null) {
    schema.geo = { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng };
  }

  if (b.priceRange) schema.priceRange = b.priceRange;

  if (b.openingHours && b.openingHours.length) {
    schema.openingHoursSpecification = b.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAY_NAMES[h.dayOfWeek]}`,
      opens: h.openTime,
      closes: h.closeTime,
    }));
  }

  if (b.ratingAvg && b.ratingCount && b.ratingCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: b.ratingAvg.toFixed(1),
      reviewCount: b.ratingCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

interface ItemForList {
  name: string;
  url: string;
}

export function itemListSchema(items: ItemForList[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: appUrl + it.url,
      name: it.name,
    })),
  };
}

export function organizationSchema(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sitges Directorio',
    url: `${appUrl}/${locale}`,
    logo: `${appUrl}/brand/logo-mark.svg`,
    inLanguage: locale,
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: appUrl,
    name: 'Sitges Directorio',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${appUrl}/{locale}/buscar?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}
