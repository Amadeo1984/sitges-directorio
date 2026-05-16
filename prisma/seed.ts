/* eslint-disable no-console */
import { PrismaClient, Locale, BusinessStatus } from '@prisma/client';
import { CATEGORIES } from './seed-data/categories';
import { TAGS } from './seed-data/tags';
import { BUSINESSES } from './seed-data/businesses';
import { REDIRECTS } from './seed-data/redirects';

const db = new PrismaClient();
const LOCALES: Locale[] = ['es', 'ca', 'en', 'fr'];

async function seedCategories() {
  const keyToId = new Map<string, string>();

  // Pase 1: raíces
  for (const cat of CATEGORIES) {
    const created = await db.category.upsert({
      where: { key: cat.key },
      update: { schemaType: cat.schemaType ?? 'LocalBusiness', icon: cat.icon, order: cat.order },
      create: {
        key: cat.key,
        schemaType: cat.schemaType ?? 'LocalBusiness',
        icon: cat.icon,
        order: cat.order,
        translations: {
          create: LOCALES.map((loc) => {
            const t = cat.t[loc];
            return {
              locale: loc,
              name: t.name,
              slug: t.slug,
              description: t.description ?? null,
              seoTitle: t.seoTitle ?? null,
              seoDescription: t.seoDescription ?? null,
            };
          }),
        },
      },
    });
    keyToId.set(cat.key, created.id);
  }

  // Pase 2: hijos
  for (const cat of CATEGORIES) {
    if (!cat.children) continue;
    for (let i = 0; i < cat.children.length; i++) {
      const child = cat.children[i];
      const parentId = keyToId.get(cat.key)!;
      const created = await db.category.upsert({
        where: { key: child.key },
        update: {
          parentId,
          schemaType: child.schemaType ?? cat.schemaType ?? 'LocalBusiness',
          order: i,
        },
        create: {
          key: child.key,
          parentId,
          schemaType: child.schemaType ?? cat.schemaType ?? 'LocalBusiness',
          order: i,
          translations: {
            create: LOCALES.map((loc) => {
              const t = child.t[loc];
              return {
                locale: loc,
                name: t.name,
                slug: t.slug,
                description: t.description ?? null,
                seoTitle: t.seoTitle ?? null,
                seoDescription: t.seoDescription ?? null,
              };
            }),
          },
        },
      });
      keyToId.set(child.key, created.id);
    }
  }

  console.log(`✓ Categorías: ${keyToId.size}`);
  return keyToId;
}

async function seedTags() {
  for (const tag of TAGS) {
    await db.tag.upsert({
      where: { key: tag.key },
      update: {},
      create: {
        key: tag.key,
        translations: {
          create: LOCALES.map((loc) => ({
            locale: loc,
            name: tag.t[loc].name,
            slug: tag.t[loc].slug,
          })),
        },
      },
    });
  }
  console.log(`✓ Tags: ${TAGS.length}`);
}

async function seedBusinesses(catKeyToId: Map<string, string>) {
  let count = 0;
  for (const biz of BUSINESSES) {
    const categoryId = catKeyToId.get(biz.categoryKey);
    if (!categoryId) {
      console.warn(`⚠ categoría no encontrada: ${biz.categoryKey} (negocio ${biz.key})`);
      continue;
    }
    const created = await db.business.upsert({
      where: { id: biz.key },
      update: {},
      create: {
        id: biz.key,
        categoryId,
        status: BusinessStatus.PUBLISHED,
        publishedAt: new Date(),
        phone: biz.phone,
        website: biz.website,
        address: biz.address,
        district: biz.district,
        lat: biz.lat,
        lng: biz.lng,
        priceRange: biz.priceRange,
        amenities: biz.amenities ?? [],
        paymentMethods: biz.paymentMethods ?? [],
        ratingAvg: biz.ratingAvg,
        ratingCount: biz.ratingCount ?? 0,
        featured: biz.featured ?? false,
        translations: {
          create: LOCALES.map((loc) => {
            const t = biz.t[loc];
            return {
              locale: loc,
              slug: t.slug,
              name: t.name,
              shortDescription: t.shortDescription ?? null,
              description: t.description ?? null,
              seoTitle: t.seoTitle ?? null,
              seoDescription: t.seoDescription ?? null,
            };
          }),
        },
        hours: biz.hours
          ? {
              create: biz.hours.map((h) => ({
                dayOfWeek: h.dayOfWeek,
                openTime: h.openTime,
                closeTime: h.closeTime,
                note: h.note,
              })),
            }
          : undefined,
      },
    });
    count++;
    if (biz.tags?.length) {
      for (const tagKey of biz.tags) {
        const tag = await db.tag.findUnique({ where: { key: tagKey } });
        if (tag) {
          await db.tagOnBusiness.upsert({
            where: { businessId_tagId: { businessId: created.id, tagId: tag.id } },
            update: {},
            create: { businessId: created.id, tagId: tag.id },
          });
        }
      }
    }
  }
  console.log(`✓ Negocios demo: ${count}`);
}

async function seedRedirects() {
  for (const r of REDIRECTS) {
    await db.redirect.upsert({
      where: { fromPath: r.from },
      update: { toPath: r.to, code: r.code ?? 301 },
      create: { fromPath: r.from, toPath: r.to, code: r.code ?? 301 },
    });
  }
  console.log(`✓ Redirects: ${REDIRECTS.length}`);
}

async function main() {
  console.log('Seeding sitges-directorio...');
  const catKeyToId = await seedCategories();
  await seedTags();
  await seedBusinesses(catKeyToId);
  await seedRedirects();
  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
