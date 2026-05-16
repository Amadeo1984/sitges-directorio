import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';
import { listRootCategories } from '@/lib/queries';
import { SearchBar } from '@/components/search/search-bar';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/json-ld';
import { organizationSchema, webSiteSchema } from '@/lib/seo/schema';
import { locales, type Locale } from '@/i18n/config';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const l of locales) pathByLocale[l] = `/${l}`;
  return buildPageMetadata({
    locale,
    title: `${t('name')} — ${t('tagline')}`,
    description: t('tagline'),
    pathByLocale,
  });
}

const ICONS: Record<string, string> = {
  utensils: '🍽️',
  bed: '🏨',
  martini: '🍸',
  umbrella: '🏖️',
  tree: '🌿',
  briefcase: '🛠️',
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  const categories = await listRootCategories(locale);

  return (
    <>
      <JsonLd data={[organizationSchema(locale), webSiteSchema()]} />

      <section className="bg-linear-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight text-brand-900 sm:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-700 sm:text-xl">
            {t('heroSubtitle')}
          </p>
          <div className="mt-10 flex justify-center">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-gray-900">
          {t('verticalsTitle')}
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {categories.map((cat) => {
            const tr = cat.translations[0];
            if (!tr) return null;
            return (
              <Link
                key={cat.id}
                href={`/${tr.slug}`}
                className="group rounded-xl border border-gray-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md"
              >
                <div className="text-4xl">{cat.icon ? ICONS[cat.icon] ?? '📍' : '📍'}</div>
                <div className="mt-4 text-lg font-medium text-gray-900 group-hover:text-brand-700">
                  {tr.name}
                </div>
                <div className="mt-1 text-xs text-gray-500">{cat._count.children} subcategorías</div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
