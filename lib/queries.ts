import 'server-only';
import { Locale, BusinessStatus, Prisma } from '@prisma/client';
import { db } from './db';

/** Trae una categoría raíz por su slug en un locale dado. */
export async function getRootCategoryBySlug(locale: Locale, slug: string) {
  const tr = await db.categoryTranslation.findFirst({
    where: { locale, slug, category: { parentId: null } },
    include: {
      category: {
        include: {
          children: {
            include: {
              translations: { where: { locale } },
              _count: { select: { businesses: { where: { status: 'PUBLISHED' } } } },
            },
            orderBy: { order: 'asc' },
          },
          translations: { where: { locale } },
        },
      },
    },
  });
  return tr;
}

/** Trae una subcategoría dentro de una raíz por sus slugs en un locale. */
export async function getSubCategoryBySlugs(locale: Locale, rootSlug: string, subSlug: string) {
  const root = await db.categoryTranslation.findFirst({
    where: { locale, slug: rootSlug, category: { parentId: null } },
    include: { category: true },
  });
  if (!root) return null;
  const tr = await db.categoryTranslation.findFirst({
    where: { locale, slug: subSlug, category: { parentId: root.categoryId } },
    include: {
      category: {
        include: {
          parent: { include: { translations: { where: { locale } } } },
          translations: { where: { locale } },
        },
      },
    },
  });
  return tr;
}

/** Lista negocios publicados por categoría (incluye descendientes). */
export async function listBusinessesByCategory(opts: {
  locale: Locale;
  categoryId: string;
  includeChildren?: boolean;
  limit?: number;
  offset?: number;
  tagKey?: string;
}) {
  let categoryIds: string[] = [opts.categoryId];
  if (opts.includeChildren) {
    const children = await db.category.findMany({
      where: { parentId: opts.categoryId },
      select: { id: true },
    });
    categoryIds = categoryIds.concat(children.map((c) => c.id));
  }

  const where: Prisma.BusinessWhereInput = {
    status: BusinessStatus.PUBLISHED,
    categoryId: { in: categoryIds },
  };
  if (opts.tagKey) {
    where.tags = { some: { tag: { key: opts.tagKey } } };
  }

  const [items, total] = await Promise.all([
    db.business.findMany({
      where,
      include: {
        translations: { where: { locale: opts.locale } },
        media: { where: { isPrimary: true }, take: 1 },
        category: { include: { translations: { where: { locale: opts.locale } } } },
      },
      // Premium > Featured > Free, luego featured editorial, luego rating, luego fecha
      orderBy: [
        { plan: 'desc' },
        { featured: 'desc' },
        { ratingAvg: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: opts.limit ?? 24,
      skip: opts.offset ?? 0,
    }),
    db.business.count({ where }),
  ]);
  return { items, total };
}

/** Trae un negocio publicado por slug + locale, con todas sus relaciones. */
export async function getBusinessBySlug(locale: Locale, slug: string) {
  const tr = await db.businessTranslation.findUnique({
    where: { locale_slug: { locale, slug } },
    include: {
      business: {
        include: {
          translations: true,
          category: {
            include: {
              translations: true,
              parent: { include: { translations: true } },
            },
          },
          hours: { orderBy: { dayOfWeek: 'asc' } },
          media: { orderBy: { position: 'asc' } },
          tags: { include: { tag: { include: { translations: true } } } },
          reviews: {
            where: { status: 'APPROVED' },
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
  });
  if (!tr || tr.business.status !== BusinessStatus.PUBLISHED) return null;
  return tr;
}

/** Comprueba si un usuario ya tiene review en un negocio. */
export async function userHasReviewFor(userId: string, businessId: string) {
  const r = await db.review.findUnique({
    where: { businessId_userId: { businessId, userId } },
    select: { id: true },
  });
  return !!r;
}

/** Comprueba si un slug histórico debe redirigir. */
export async function findSlugRedirect(locale: Locale, oldSlug: string) {
  return db.businessSlugHistory.findUnique({
    where: { locale_oldSlug: { locale, oldSlug } },
    include: {
      business: { include: { translations: { where: { locale } } } },
    },
  });
}

/** Búsqueda full-text simple sobre translations. */
export async function searchBusinesses(opts: {
  locale: Locale;
  q: string;
  categoryKey?: string;
  limit?: number;
}) {
  const q = opts.q.trim();
  if (!q) return [];
  // Postgres ILIKE para empezar (sin extensiones).
  // Para escala mayor → tsvector + GIN o Meilisearch.
  const items = await db.business.findMany({
    where: {
      status: BusinessStatus.PUBLISHED,
      ...(opts.categoryKey ? { category: { key: opts.categoryKey } } : {}),
      translations: {
        some: {
          locale: opts.locale,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { shortDescription: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
      },
    },
    include: {
      translations: { where: { locale: opts.locale } },
      media: { where: { isPrimary: true }, take: 1 },
      category: { include: { translations: { where: { locale: opts.locale } } } },
    },
    orderBy: [{ featured: 'desc' }, { ratingAvg: 'desc' }],
    take: opts.limit ?? 24,
  });
  return items;
}

/** Datos para mapa global: solo coordenadas + datos mínimos. */
export async function listBusinessesForMap(locale: Locale) {
  return db.business.findMany({
    where: { status: BusinessStatus.PUBLISHED, lat: { not: null }, lng: { not: null } },
    select: {
      id: true,
      lat: true,
      lng: true,
      ratingAvg: true,
      ratingCount: true,
      featured: true,
      translations: { where: { locale }, select: { slug: true, name: true } },
      category: { select: { schemaType: true, key: true } },
    },
  });
}

/** Listado de todas las categorías raíz con conteo de negocios. */
export async function listRootCategories(locale: Locale) {
  return db.category.findMany({
    where: { parentId: null },
    include: {
      translations: { where: { locale } },
      _count: { select: { children: true } },
    },
    orderBy: { order: 'asc' },
  });
}
