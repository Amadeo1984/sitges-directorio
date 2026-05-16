import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getRootCategoryBySlug, listBusinessesByCategory } from '@/lib/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { breadcrumbList, itemListSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BusinessCard } from '@/components/business/business-card';
import { locales, type Locale } from '@/i18n/config';
import { db } from '@/lib/db';
import type { Metadata } from 'next';

type Params = { locale: Locale; categoria: string };

export async function generateStaticParams() {
  const cats = await db.categoryTranslation.findMany({
    where: { category: { parentId: null } },
    select: { locale: true, slug: true },
  });
  return cats.map((c) => ({ locale: c.locale, categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, categoria } = await params;
  const cat = await getRootCategoryBySlug(locale, categoria);
  if (!cat) return {};

  const pathByLocale: Partial<Record<Locale, string>> = {};
  const allTrans = await db.categoryTranslation.findMany({
    where: { categoryId: cat.categoryId },
  });
  for (const t of allTrans) pathByLocale[t.locale] = `/${t.locale}/${t.slug}`;

  return buildPageMetadata({
    locale,
    title: cat.seoTitle ?? `${cat.name} en Sitges`,
    description: cat.seoDescription ?? cat.description ?? undefined,
    pathByLocale,
  });
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { locale, categoria } = await params;
  setRequestLocale(locale);

  const cat = await getRootCategoryBySlug(locale, categoria);
  if (!cat) notFound();

  const t = await getTranslations('category');
  const tCrumb = await getTranslations('breadcrumbs');

  // Top negocios incluyendo descendientes
  const { items } = await listBusinessesByCategory({
    locale,
    categoryId: cat.categoryId,
    includeChildren: true,
    limit: 12,
  });

  const path = `/${locale}/${cat.slug}`;
  const breadcrumbs = [
    { label: tCrumb('home'), href: '/' },
    { label: cat.name },
  ];

  const breadcrumbSchema = breadcrumbList([
    { name: tCrumb('home'), url: `/${locale}` },
    { name: cat.name, url: path },
  ]);

  const itemSchema = itemListSchema(
    items.map((b) => ({
      name: b.translations[0]?.name ?? '',
      url: `/${locale}/n/${b.translations[0]?.slug ?? ''}`,
    })),
  );

  return (
    <>
      <JsonLd data={[breadcrumbSchema, itemSchema]} />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">{cat.name}</h1>
        {cat.description && (
          <p className="mt-3 max-w-3xl text-lg text-gray-600">{cat.description}</p>
        )}
      </section>

      {/* Subcategorías */}
      {cat.category.children.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900">{t('subcategoriesTitle')}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cat.category.children.map((sub) => {
              const subT = sub.translations[0];
              if (!subT) return null;
              return (
                <Link
                  key={sub.id}
                  href={`/${cat.slug}/${subT.slug}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:shadow-sm"
                >
                  <div className="font-medium text-gray-900">{subT.name}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {t('businessCount', { count: sub._count.businesses })}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Top negocios */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-xl font-semibold text-gray-900">{t('businessesTitle')}</h2>
        {items.length === 0 ? (
          <p className="mt-4 text-gray-600">{t('noResults')}</p>
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
      </section>
    </>
  );
}
