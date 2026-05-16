import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { locales, type Locale } from '@/i18n/config';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

type Entry = MetadataRoute.Sitemap[number];

function alternates(pathByLocale: Partial<Record<Locale, string>>) {
  const languages: Record<string, string> = {};
  for (const [loc, path] of Object.entries(pathByLocale)) {
    if (path) languages[loc] = `${appUrl}${path}`;
  }
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: Entry[] = [];

  // Homes por locale
  for (const loc of locales) {
    entries.push({
      url: `${appUrl}/${loc}`,
      changeFrequency: 'daily',
      priority: 1,
      alternates: alternates(Object.fromEntries(locales.map((l) => [l, `/${l}`]))),
    });
  }

  // Categorías raíz y subcategorías
  const catTranslations = await db.categoryTranslation.findMany({
    include: { category: { include: { parent: { include: { translations: true } } } } },
  });
  // Agrupar por categoryId para emitir un entry por traducción + alternates
  const byCatId = new Map<string, typeof catTranslations>();
  for (const t of catTranslations) {
    const arr = byCatId.get(t.categoryId) ?? [];
    arr.push(t);
    byCatId.set(t.categoryId, arr);
  }
  for (const [, trans] of byCatId) {
    for (const t of trans) {
      const isRoot = !t.category.parentId;
      const path = isRoot
        ? `/${t.locale}/${t.slug}`
        : `/${t.locale}/${
            t.category.parent!.translations.find((p) => p.locale === t.locale)?.slug
          }/${t.slug}`;
      const altMap: Partial<Record<Locale, string>> = {};
      for (const other of trans) {
        const otherIsRoot = !other.category.parentId;
        altMap[other.locale] = otherIsRoot
          ? `/${other.locale}/${other.slug}`
          : `/${other.locale}/${
              other.category.parent!.translations.find((p) => p.locale === other.locale)?.slug
            }/${other.slug}`;
      }
      entries.push({
        url: `${appUrl}${path}`,
        changeFrequency: 'weekly',
        priority: isRoot ? 0.8 : 0.7,
        alternates: alternates(altMap),
      });
    }
  }

  // Negocios publicados
  const bizTranslations = await db.businessTranslation.findMany({
    where: { business: { status: 'PUBLISHED' } },
    include: { business: { select: { translations: true, updatedAt: true } } },
  });
  const byBizId = new Map<string, typeof bizTranslations>();
  for (const t of bizTranslations) {
    const arr = byBizId.get(t.businessId) ?? [];
    arr.push(t);
    byBizId.set(t.businessId, arr);
  }
  for (const [, trans] of byBizId) {
    for (const t of trans) {
      const altMap: Partial<Record<Locale, string>> = {};
      for (const other of trans) {
        altMap[other.locale] = `/${other.locale}/n/${other.slug}`;
      }
      entries.push({
        url: `${appUrl}/${t.locale}/n/${t.slug}`,
        lastModified: t.business.updatedAt,
        changeFrequency: 'monthly',
        priority: 0.6,
        alternates: alternates(altMap),
      });
    }
  }

  // /mapa por locale
  for (const loc of locales) {
    entries.push({
      url: `${appUrl}/${loc}/mapa`,
      changeFrequency: 'weekly',
      priority: 0.5,
      alternates: alternates(Object.fromEntries(locales.map((l) => [l, `/${l}/mapa`]))),
    });
  }

  return entries;
}
