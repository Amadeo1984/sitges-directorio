import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSubCategoryBySlugs, listBusinessesByCategory } from '@/lib/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { breadcrumbList, itemListSchema } from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BusinessCard } from '@/components/business/business-card';
import { db } from '@/lib/db';
import { type Locale, locales } from '@/i18n/config';
import type { Metadata } from 'next';

type Params = { locale: Locale; categoria: string; subcategoria: string };

export async function generateStaticParams() {
  const subs = await db.categoryTranslation.findMany({
    where: { category: { parentId: { not: null } } },
    include: { category: { include: { parent: { include: { translations: true } } } } },
  });
  return subs.flatMap((s) => {
    const parentT = s.category.parent?.translations.find((t) => t.locale === s.locale);
    if (!parentT) return [];
    return [{ locale: s.locale, categoria: parentT.slug, subcategoria: s.slug }];
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, categoria, subcategoria } = await params;
  const sub = await getSubCategoryBySlugs(locale, categoria, subcategoria);
  if (!sub) return {};

  // Construir hreflang map: para cada locale necesitamos la combinación parentSlug/subSlug
  const subTranslations = await db.categoryTranslation.findMany({
    where: { categoryId: sub.categoryId },
  });
  const parentTranslations = await db.categoryTranslation.findMany({
    where: { categoryId: sub.category.parent!.id },
  });
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const st of subTranslations) {
    const pt = parentTranslations.find((p) => p.locale === st.locale);
    if (pt) pathByLocale[st.locale] = `/${st.locale}/${pt.slug}/${st.slug}`;
  }

  const parentName = sub.category.parent!.translations.find((t) => t.locale === locale)?.name;
  const title = sub.seoTitle ?? `${sub.name} — ${parentName ?? ''} en Sitges`.trim();

  return buildPageMetadata({
    locale,
    title,
    description: sub.seoDescription ?? sub.description ?? undefined,
    pathByLocale,
  });
}

export default async function SubcategoryPage({ params }: { params: Promise<Params> }) {
  const { locale, categoria, subcategoria } = await params;
  setRequestLocale(locale);

  const sub = await getSubCategoryBySlugs(locale, categoria, subcategoria);
  if (!sub) notFound();

  const parent = sub.category.parent!;
  const parentT = parent.translations.find((t) => t.locale === locale)!;

  const t = await getTranslations('category');
  const tCrumb = await getTranslations('breadcrumbs');

  const { items } = await listBusinessesByCategory({
    locale,
    categoryId: sub.categoryId,
    limit: 24,
  });

  const path = `/${locale}/${parentT.slug}/${sub.slug}`;
  const breadcrumbs = [
    { label: tCrumb('home'), href: '/' },
    { label: parentT.name, href: `/${parentT.slug}` },
    { label: sub.name },
  ];

  const breadcrumbSchema = breadcrumbList([
    { name: tCrumb('home'), url: `/${locale}` },
    { name: parentT.name, url: `/${locale}/${parentT.slug}` },
    { name: sub.name, url: path },
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

      <section className="mx-auto max-w-6xl px-6 pb-6">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
          {sub.name} <span className="text-gray-400">— {parentT.name}</span>
        </h1>
        <p className="mt-2 text-sm text-gray-500">{t('businessCount', { count: items.length })}</p>
      </section>

      {sub.description && (
        <section className="mx-auto max-w-6xl px-6 pb-10">
          {sub.description.trimStart().startsWith('<') ? (
            <div
              className="prose prose-sm sm:prose max-w-3xl text-gray-700 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-gray-900 [&_p]:mt-2"
              // Contenido controlado, generado server-side por scripts/migrate-wp.ts (escape HTML aplicado)
              dangerouslySetInnerHTML={{ __html: sub.description }}
            />
          ) : (
            <p className="max-w-3xl text-lg text-gray-600">{sub.description}</p>
          )}
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          {t('businessesTitle')}
        </h2>
        {items.length === 0 ? (
          <p className="text-gray-600">{t('noResults')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
