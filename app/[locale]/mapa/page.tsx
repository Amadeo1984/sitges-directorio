import { getTranslations, setRequestLocale } from 'next-intl/server';
import { listBusinessesForMap } from '@/lib/queries';
import { MapView } from '@/components/map/map-view';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { locales, type Locale } from '@/i18n/config';
import type { Metadata } from 'next';

type Params = { locale: Locale };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'map' });
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const l of locales) pathByLocale[l] = `/${l}/mapa`;
  return buildPageMetadata({
    locale,
    title: t('title'),
    description: t('subtitle'),
    pathByLocale,
  });
}

export default async function MapPage({ params }: { params: Promise<Params> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('map');

  const businesses = await listBusinessesForMap(locale);
  const markers = businesses
    .map((b) => {
      const tr = b.translations[0];
      if (!tr || !b.lat || !b.lng) return null;
      return {
        id: b.id,
        lat: Number(b.lat),
        lng: Number(b.lng),
        name: tr.name,
        url: `/${locale}/n/${tr.slug}`,
        featured: b.featured,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">{t('title')}</h1>
      <p className="mt-2 text-gray-600">{t('subtitle')}</p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200">
        <MapView markers={markers} className="h-[70vh] w-full" />
      </div>
    </section>
  );
}
