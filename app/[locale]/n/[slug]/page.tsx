import { notFound, permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { findSlugRedirect, getBusinessBySlug } from '@/lib/queries';
import { buildPageMetadata } from '@/lib/seo/metadata';
import {
  breadcrumbList,
  localBusinessSchema,
} from '@/lib/seo/schema';
import { JsonLd } from '@/components/seo/json-ld';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { BusinessHours } from '@/components/business/business-hours';
import { type Locale } from '@/i18n/config';
import type { Metadata } from 'next';
import { db } from '@/lib/db';

type Params = { locale: Locale; slug: string };

export async function generateStaticParams() {
  const trs = await db.businessTranslation.findMany({
    where: { business: { status: 'PUBLISHED' } },
    select: { locale: true, slug: true },
  });
  return trs.map((t) => ({ locale: t.locale, slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tr = await getBusinessBySlug(locale, slug);
  if (!tr) return {};

  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const t of tr.business.translations) pathByLocale[t.locale] = `/${t.locale}/n/${t.slug}`;

  return buildPageMetadata({
    locale,
    title: tr.seoTitle ?? tr.name,
    description: tr.seoDescription ?? tr.shortDescription ?? undefined,
    pathByLocale,
    image: tr.business.media[0]?.url,
  });
}

export default async function BusinessPage({ params }: { params: Promise<Params> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tr = await getBusinessBySlug(locale, slug);
  if (!tr) {
    // Buscar en history para 301
    const hist = await findSlugRedirect(locale, slug);
    if (hist) {
      const currentT = hist.business.translations[0];
      if (currentT) permanentRedirect((`/${locale}/n/${currentT.slug}` as unknown) as Parameters<typeof permanentRedirect>[0]);
    }
    notFound();
  }

  // Si el visitante usó un slug de otro locale por equivocación, redirect al locale correcto
  // (omitido: el routing por locale ya lo gestiona; aquí solo hay status)

  const tBiz = await getTranslations('business');
  const tCrumb = await getTranslations('breadcrumbs');

  const biz = tr.business;
  const category = biz.category;
  const parent = category.parent;

  const catT = category.translations.find((t) => t.locale === locale);
  const parentT = parent?.translations.find((t) => t.locale === locale);

  const breadcrumbs = [
    { label: tCrumb('home'), href: '/' },
    ...(parentT ? [{ label: parentT.name, href: `/${parentT.slug}` }] : []),
    ...(catT && parentT ? [{ label: catT.name, href: `/${parentT.slug}/${catT.slug}` }] : []),
    { label: tr.name },
  ];

  const path = `/${locale}/n/${tr.slug}`;
  const breadcrumbSchema = breadcrumbList([
    { name: tCrumb('home'), url: `/${locale}` },
    ...(parentT ? [{ name: parentT.name, url: `/${locale}/${parentT.slug}` }] : []),
    ...(catT && parentT
      ? [{ name: catT.name, url: `/${locale}/${parentT.slug}/${catT.slug}` }]
      : []),
    { name: tr.name, url: path },
  ]);

  const businessSchema = localBusinessSchema({
    schemaType: category.schemaType ?? 'LocalBusiness',
    name: tr.name,
    description: tr.description ?? tr.shortDescription,
    url: path,
    phone: biz.phone,
    website: biz.website,
    address: biz.address,
    postalCode: biz.postalCode,
    lat: biz.lat ? Number(biz.lat) : null,
    lng: biz.lng ? Number(biz.lng) : null,
    priceRange: biz.priceRange ? '€'.repeat(['CHEAP', 'MID', 'HIGH', 'LUXURY'].indexOf(biz.priceRange) + 1) : null,
    ratingAvg: biz.ratingAvg,
    ratingCount: biz.ratingCount,
    images: biz.media.map((m) => m.url),
    openingHours: biz.hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
    })),
  });

  const mapsUrl =
    biz.lat && biz.lng
      ? `https://www.google.com/maps/search/?api=1&query=${biz.lat}%2C${biz.lng}`
      : null;

  return (
    <>
      <JsonLd data={[breadcrumbSchema, businessSchema]} />
      <div className="mx-auto max-w-5xl px-6 py-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      <section className="mx-auto max-w-5xl px-6">
        <div className="aspect-[21/9] w-full overflow-hidden rounded-2xl bg-linear-to-br from-brand-100 to-brand-50">
          {biz.media[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={biz.media[0].url} alt={tr.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-6xl text-brand-300">
              📍
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900">{tr.name}</h1>
            {catT && (
              <p className="mt-1 text-sm text-gray-500">
                {parentT ? `${parentT.name} · ` : ''}
                {catT.name}
                {biz.district ? ` · ${biz.district}` : ''}
              </p>
            )}
          </div>
          {biz.ratingAvg && biz.ratingCount > 0 && (
            <div className="flex items-center gap-1 text-lg">
              <span className="text-amber-500">★</span>
              <span className="font-semibold text-gray-900">{biz.ratingAvg.toFixed(1)}</span>
              <span className="text-gray-500">({biz.ratingCount})</span>
            </div>
          )}
        </div>

        {tr.shortDescription && <p className="mt-4 text-lg text-gray-700">{tr.shortDescription}</p>}
        {tr.description && (
          <div className="mt-6 max-w-3xl text-gray-800 leading-relaxed whitespace-pre-line">
            {tr.description}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {biz.hours.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{tBiz('hours')}</h2>
                <div className="mt-3">
                  <BusinessHours hours={biz.hours} />
                </div>
              </div>
            )}
            {biz.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{tBiz('tags')}</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {biz.tags.map((tob) => {
                    const tagT = tob.tag.translations.find((tt) => tt.locale === locale);
                    if (!tagT) return null;
                    return (
                      <span
                        key={tob.tagId}
                        className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700"
                      >
                        {tagT.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <aside className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-lg font-semibold text-gray-900">{tBiz('contact')}</h2>
            <dl className="mt-4 space-y-3 text-sm">
              {biz.phone && (
                <div>
                  <dt className="text-gray-500">{tBiz('phone')}</dt>
                  <dd>
                    <a href={`tel:${biz.phone}`} className="text-brand-700 hover:underline">
                      {biz.phone}
                    </a>
                  </dd>
                </div>
              )}
              {biz.website && (
                <div>
                  <dt className="text-gray-500">{tBiz('website')}</dt>
                  <dd>
                    <a
                      href={biz.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-700 hover:underline"
                    >
                      {new URL(biz.website).hostname}
                    </a>
                  </dd>
                </div>
              )}
              {biz.address && (
                <div>
                  <dt className="text-gray-500">{tBiz('address')}</dt>
                  <dd className="text-gray-900">{biz.address}</dd>
                </div>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                >
                  {tBiz('openInMaps')}
                </a>
              )}
            </dl>
          </aside>
        </div>
      </section>
    </>
  );
}
