import { getTranslations, setRequestLocale } from 'next-intl/server';
import { searchBusinesses } from '@/lib/queries';
import { BusinessCard } from '@/components/business/business-card';
import { SearchBar } from '@/components/search/search-bar';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { type Locale, locales } from '@/i18n/config';
import type { Metadata } from 'next';

type Params = { locale: Locale };
type SearchParams = { q?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale } = await params;
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const l of locales) pathByLocale[l] = `/${l}/buscar`;
  return buildPageMetadata({
    locale,
    title: 'Buscar — Sitges Directorio',
    pathByLocale,
    noindex: true,
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const { q = '' } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('search');
  const items = q ? await searchBusinesses({ locale, q }) : [];

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <SearchBar initialQ={q} />

      {q ? (
        <>
          <h1 className="mt-8 text-2xl font-semibold text-gray-900">
            {t('resultsTitle', { q })}
          </h1>
          {items.length === 0 ? (
            <div className="mt-6 text-gray-600">
              <p>{t('noResults')}</p>
              <p className="mt-1">{t('tryAgain')}</p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((b) => {
                const bt = b.translations[0];
                if (!bt) return null;
                return (
                  <BusinessCard
                    key={b.id}
                    slug={bt.slug}
                    name={bt.name}
                    shortDescription={bt.shortDescription}
                    category={b.category.translations[0]?.name}
                    ratingAvg={b.ratingAvg}
                    ratingCount={b.ratingCount}
                    featured={b.featured}
                    priceRange={b.priceRange}
                    image={b.media[0]?.url}
                    district={b.district}
                  />
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
