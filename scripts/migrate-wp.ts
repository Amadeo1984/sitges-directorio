/* eslint-disable no-console */
/**
 * Migrador WP → BD. Lee el XML de WordPress eXtended RSS (WXR)
 * y crea Business reales en BD a partir de los H2 con ":" de cada listicle.
 *
 * Uso:
 *   npm run migrate:wp -- data/wp-import/sitges-export.xml
 *
 * Idempotente: usa upsert con id determinístico (hash del slug WP + nombre).
 * Borra los demos previos (id LIKE 'demo-%') al final.
 */
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import { PrismaClient, BusinessStatus, Locale } from '@prisma/client';
import { slugify } from '../lib/slugs';

const db = new PrismaClient();
const LOCALES: Locale[] = ['es', 'ca', 'en', 'fr'];

// Map: slug WP listicle → categoryKey de nuestra taxonomía
const SLUG_TO_CATEGORY: Record<string, string> = {
  // Restaurantes
  'mejores-restaurantes-gourmet-en-sitges': 'restaurants-gourmet',
  'mejores-restaurantes-de-tapas-en-sitges': 'restaurants-tapas',
  'mejores-restaurantes-italianos-en-sitges': 'restaurants-italian',
  'mejores-restaurantes-asiaticos-en-sitges': 'restaurants-asian',
  'mejores-restaurantes-de-mariscos-en-sitges': 'restaurants-seafood',
  'mejores-restaurantes-vegetarianos-veganos-en-sitges': 'restaurants-vegan',
  'mejores-restaurantes-para-familias-en-sitges': 'restaurants-family',
  'mejores-restaurantes-economicos-en-sitges': 'restaurants-budget',
  'mejores-restaurantes-de-comida-rapida-en-sitges': 'restaurants-fast-food',
  'mejores-restaurantes-con-vistas-al-mar-en-sitges': 'restaurants-seaview',
  'mejores-terrazas-en-sitges': 'restaurants-mediterranean', // sin categoría exacta; va a Mediterráneos con tag terraza

  // Hoteles
  'mejores-hoteles-boutique-en-sitges': 'hotels-boutique',
  'mejores-hoteles-de-lujo-en-sitges': 'hotels-luxury',
  'mejores-hoteles-economicos-en-sitges': 'hotels-budget',
  'mejores-hoteles-familiares-en-sitges': 'hotels-family',
  'mejores-hoteles-romanticos-en-sitges': 'hotels-romantic',
  'mejores-hoteles-centricos-en-sitges': 'hotels-central',
  'mejores-hoteles-con-spa-en-sitges': 'hotels-spa',
  'mejores-hoteles-con-vistas-al-mar-en-sitges': 'hotels-seaview',
  'mejores-hoteles-todo-incluido-en-sitges': 'hotels-all-inclusive',

  // Vida nocturna
  'mejores-bares-en-sitges': 'nightlife-bars',
  'mejores-bares-de-cocteles-en-sitges': 'nightlife-cocktails',
  'mejores-bares-de-tapas-en-sitges': 'nightlife-tapas-bars',
  'mejores-pubs-en-sitges': 'nightlife-pubs',
  'mejores-discotecas-en-sitges': 'nightlife-clubs',
  'mejores-clubs-de-musica-en-vivo-en-sitges': 'nightlife-live-music',
  'mejores-bares-gay-en-sitges': 'nightlife-lgbt',
  'mejores-eventos-nocturnos-en-sitges': 'nightlife-events',

  // Playas
  'mejores-playas-tranquilas-en-sitges': 'beaches-quiet',
  'mejores-playas-familiares-en-sitges': 'beaches-family',
  'mejores-playas-para-mascotas-en-sitges': 'beaches-pet-friendly',
  'playas-con-acceso-para-discapacitados-en-sitges': 'beaches-accessible',
  'mejores-calas-escondidas-en-sitges': 'beaches-hidden',
  'mejores-playas-para-hacer-snorkel-en-sitges': 'beaches-snorkel',
  'mejores-playas-para-practicar-deportes-acuaticos-en-sitges': 'beaches-watersports',

  // Naturaleza
  'mejores-excursiones-en-barco-en-sitges': 'nature-boat-tours',
  'mejores-rutas-de-senderismo-en-sitges': 'nature-hiking',
  'mejores-rutas-de-ciclismo-en-sitges': 'nature-cycling',
  'mejores-parques-y-jardines-en-sitges': 'nature-parks',
  'mejores-sitios-para-deportes-acuaticos-en-sitges': 'nature-watersports-spots',
  'mejores-campos-de-golf-en-sitges': 'nature-golf',
  'escalada-en-sitges': 'nature-climbing',
  'parapente-en-sitges': 'nature-paragliding',
  'paseos-a-caballo-en-sitges': 'nature-horse',
  'mejores-mercados-locales-en-sitges': 'nature-markets',

  // Tiendas
  'mejores-tiendas-de-arte-en-sitges': 'shops-art',
  'mejores-tiendas-de-decoracion-en-sitges': 'shops-decor',
  'mejores-tiendas-de-deportes-en-sitges': 'shops-sports',
  'mejores-tiendas-de-electronica-en-sitges': 'shops-electronics',
  'mejores-librerias-en-sitges': 'shops-bookstores',
  'tiendas-de-ropa-en-sitges': 'shops-clothing',
  'tiendas-de-alimentacion-gourmet-en-sitges': 'shops-gourmet-food',
  'tiendas-de-regalos-y-souvenirs-en-sitges': 'shops-gifts',

  // Inmobiliaria
  'compra-de-viviendas-en-sitges': 'real-estate-buy',
  'pisos-de-alquiler-en-sitges': 'real-estate-rent',
};

interface ExtractedBusiness {
  rawName: string;
  shortDescription?: string;
  description: string;
  sourceSlug: string;
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractListicle(slug: string, content: string): {
  businesses: ExtractedBusiness[];
  seoBlocks: { heading: string; body: string }[];
} {
  const businesses: ExtractedBusiness[] = [];
  const seoBlocks: { heading: string; body: string }[] = [];

  // Match H2 + body following until next H2 or end
  const re = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const heading = stripTags(m[1]);
    const body = stripTags(m[2]);
    if (!heading) continue;

    const colonIdx = heading.indexOf(':');
    if (colonIdx > 0 && colonIdx < heading.length - 1) {
      // Negocio
      const rawName = heading.slice(0, colonIdx).trim();
      const tagline = heading.slice(colonIdx + 1).trim();
      if (rawName.length < 2) continue;
      businesses.push({
        rawName,
        shortDescription: tagline || undefined,
        description: body,
        sourceSlug: slug,
      });
    } else {
      seoBlocks.push({ heading, body });
    }
  }
  return { businesses, seoBlocks };
}

function deterministicId(prefix: string, key: string): string {
  return prefix + '-' + createHash('sha1').update(key).digest('hex').slice(0, 18);
}

async function uniqueSlug(locale: Locale, base: string, excludeBusinessId?: string): Promise<string> {
  let s = base || 'negocio';
  let i = 1;
  for (;;) {
    const existing = await db.businessTranslation.findFirst({
      where: { locale, slug: s, NOT: excludeBusinessId ? { businessId: excludeBusinessId } : undefined },
      select: { id: true },
    });
    if (!existing) return s;
    i += 1;
    s = `${base}-${i}`;
  }
}

async function main() {
  const xmlPath = process.argv[2];
  if (!xmlPath || !fs.existsSync(xmlPath)) {
    console.error('Usage: tsx scripts/migrate-wp.ts <ruta/al/sitges-export.xml>');
    process.exit(1);
  }
  console.log(`📥 Parseando ${xmlPath}…`);
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    cdataPropName: '__cdata',
    parseTagValue: false,
    trimValues: true,
    ignoreDeclaration: true,
  });
  const data = parser.parse(xml);
  const items = data.rss.channel.item as Array<Record<string, unknown>>;

  console.log(`✓ ${items.length} items en el feed`);

  // Filtrar pages publicados con slug conocido
  const pagesToMigrate = items.filter((it) => {
    const pt = (it as { 'wp:post_type'?: { __cdata?: string } | string })['wp:post_type'];
    const ptStr = typeof pt === 'object' && pt !== null ? (pt as { __cdata?: string }).__cdata : pt;
    const status = (it as { 'wp:status'?: { __cdata?: string } | string })['wp:status'];
    const stStr = typeof status === 'object' && status !== null ? (status as { __cdata?: string }).__cdata : status;
    const name = (it as { 'wp:post_name'?: { __cdata?: string } | string })['wp:post_name'];
    const nameStr = typeof name === 'object' && name !== null ? (name as { __cdata?: string }).__cdata : name;
    return ptStr === 'page' && stStr === 'publish' && nameStr && SLUG_TO_CATEGORY[String(nameStr)];
  });

  console.log(`✓ ${pagesToMigrate.length} pages a migrar`);

  // Cargar mapping de categoryKey → id
  const cats = await db.category.findMany({ select: { id: true, key: true } });
  const catIdByKey = new Map(cats.map((c) => [c.key, c.id]));

  // Verificar que todas las categorías mapeadas existen
  const missing: string[] = [];
  for (const slug of Object.keys(SLUG_TO_CATEGORY)) {
    const k = SLUG_TO_CATEGORY[slug];
    if (!catIdByKey.has(k)) missing.push(`${slug} → ${k}`);
  }
  if (missing.length) {
    console.error('❌ Faltan categorías en BD. Ejecuta `npm run db:seed` primero.');
    missing.forEach((m) => console.error('   ', m));
    process.exit(1);
  }

  let createdBiz = 0;
  let updatedCats = 0;
  const seenBusinessKeys = new Set<string>();

  for (const page of pagesToMigrate) {
    const slugRaw = (page as { 'wp:post_name': { __cdata?: string } | string })['wp:post_name'];
    const slug =
      typeof slugRaw === 'object' && slugRaw !== null
        ? (slugRaw as { __cdata?: string }).__cdata ?? ''
        : (slugRaw as string);
    const contentRaw = (page as { 'content:encoded'?: { __cdata?: string } | string })['content:encoded'];
    const content =
      typeof contentRaw === 'object' && contentRaw !== null
        ? (contentRaw as { __cdata?: string }).__cdata ?? ''
        : (contentRaw as string) ?? '';

    const categoryKey = SLUG_TO_CATEGORY[slug];
    const categoryId = catIdByKey.get(categoryKey)!;

    const { businesses, seoBlocks } = extractListicle(slug, content);
    console.log(`  ${slug} → ${categoryKey}: ${businesses.length} negocios, ${seoBlocks.length} bloques SEO`);

    // Actualizar la descripción de la subcategoría con la guía SEO en HTML
    if (seoBlocks.length > 0) {
      const escape = (s: string) =>
        s
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      const guide = seoBlocks
        .map((b) => `<h3>${escape(b.heading)}</h3>\n<p>${escape(b.body)}</p>`)
        .join('\n');
      await db.categoryTranslation.updateMany({
        where: { categoryId, locale: 'es' as Locale },
        data: { description: guide.slice(0, 12000) },
      });
      updatedCats += 1;
    }

    // Migrar negocios
    for (const biz of businesses) {
      const baseSlug = slugify(biz.rawName);
      if (!baseSlug) continue;
      const dedupKey = `${categoryKey}:${baseSlug}`;
      if (seenBusinessKeys.has(dedupKey)) continue;
      seenBusinessKeys.add(dedupKey);

      const businessId = deterministicId('wp', dedupKey);

      // Calcular slugs únicos por locale (usamos el slug base para los 4; corregir colisiones)
      const slugByLocale: Record<Locale, string> = {} as Record<Locale, string>;
      for (const loc of LOCALES) {
        slugByLocale[loc] = await uniqueSlug(loc, baseSlug, businessId);
      }

      await db.business.upsert({
        where: { id: businessId },
        update: {
          categoryId,
        },
        create: {
          id: businessId,
          ownerId: null,
          categoryId,
          status: BusinessStatus.PUBLISHED,
          publishedAt: new Date(),
          translations: {
            create: LOCALES.map((loc) => ({
              locale: loc,
              slug: slugByLocale[loc],
              name: biz.rawName,
              shortDescription: biz.shortDescription?.slice(0, 180) ?? null,
              description: biz.description.slice(0, 4000),
              // por ahora solo en ES; CA/EN/FR quedan iguales hasta traducir
            })),
          },
        },
      });
      createdBiz += 1;
    }
  }

  // Limpiar negocios demo previos
  const demoDeleted = await db.business.deleteMany({ where: { id: { startsWith: 'demo-' } } });

  console.log('\n✅ Resumen:');
  console.log(`  Pages procesados:       ${pagesToMigrate.length}`);
  console.log(`  Negocios migrados:      ${createdBiz}`);
  console.log(`  Categorías actualizadas: ${updatedCats}`);
  console.log(`  Demos borrados:         ${demoDeleted.count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
