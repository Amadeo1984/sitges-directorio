# Arquitectura SEO — nuevo sitges.pro

Objetivo: superar al WP actual en search experience (rich results, indexabilidad, intent coverage) y abrir cabeza en EN/CA/FR para captar el tráfico turístico que la versión actual no monetiza.

## 1. Estructura de URLs (i18n, jerárquica, estable)

### Convenciones
- Locale en el path como prefijo: `/{locale}/...` con `locale ∈ {es, ca, en, fr}`.
- Locale por defecto **sin prefijo en redirecciones canónicas**: la home `sitges.pro/` redirige 302 por `Accept-Language`, pero la canonical siempre lleva locale (`/es/`). Evita contenido duplicado en raíz.
- Slugs traducidos por idioma (mejor SEO local que mantener slug español en todos los idiomas).
- Sin trailing slash en producto (consistencia: configurar al inicio y no cambiar).

### Mapa de rutas

| Tipo | Patrón | Ejemplo |
|---|---|---|
| Home | `/{locale}` | `/es`, `/en` |
| Categoría raíz | `/{locale}/{categoria}` | `/es/restaurantes`, `/en/restaurants` |
| Subcategoría | `/{locale}/{categoria}/{subcategoria}` | `/es/restaurantes/gourmet` |
| Ficha de negocio | `/{locale}/n/{slug}` | `/es/n/villa-marina-sitges` |
| Búsqueda | `/{locale}/buscar?q=...&cat=...` | `/es/buscar?q=terraza&cat=restaurantes` |
| Mapa | `/{locale}/mapa` | `/es/mapa` |
| Tag (transversal) | `/{locale}/etiqueta/{tag}` | `/es/etiqueta/pet-friendly` |
| Eventos (futuro) | `/{locale}/eventos/{slug}` | `/es/eventos/festival-cine-2026` |
| Blog/guías | `/{locale}/blog/{slug}` | `/es/blog/que-hacer-en-sitges-octubre` |
| Área owner | `/{locale}/dashboard/...` | `/es/dashboard/negocios` |
| Auth | `/{locale}/login`, `/{locale}/registro` | |
| Legal | `/{locale}/legal/{slug}` | `/es/legal/privacidad` |

### Slug del negocio
- Generado del nombre + sufijo `-sitges` solo si colisiona.
- Inmutable salvo cambio editorial; si cambia → 301 a la nueva URL desde la antigua (tabla `business_slug_history`).

### Decisión sobre el prefijo `/n/`
Lo añado para evitar colisiones con slugs de categoría (mejor que un slug suelto en raíz como WP actual). Alternativa: `/negocio/` (más descriptivo SEO) o `/sitges/` (palabra-clave local en URL). **Recomendación: `/n/` por brevedad** + canonical correcta + breadcrumb estructurado; SEO no penaliza prefijos cortos.

## 2. Taxonomía de categorías (basada en la auditoría)

Reorganizo los 40 listicles en una taxonomía jerárquica de 2 niveles. Reduce duplicación y permite filtros.

```
Restaurantes
  ├ Gourmet
  ├ Mediterránea / catalana
  ├ Tapas
  ├ Italianos
  ├ Asiáticos
  ├ Mariscos
  ├ Vegetarianos y veganos
  ├ Familiares
  ├ Económicos
  ├ Comida rápida
  └ Con vistas al mar          ← se modela también como TAG

Hoteles y alojamiento
  ├ Boutique
  ├ Lujo
  ├ Económicos
  ├ Familiares
  ├ Románticos
  ├ Céntricos
  ├ Con spa
  ├ Con vistas al mar
  └ Todo incluido

Vida nocturna
  ├ Bares
  ├ Bares de cócteles
  ├ Bares de tapas
  ├ Pubs
  ├ Discotecas
  ├ Clubs de música en vivo
  └ Bares LGBT+

Playas y calas
  ├ Tranquilas
  ├ Familiares
  ├ Para mascotas
  ├ Accesibles
  ├ Calas escondidas
  ├ Para snorkel
  └ Para deportes acuáticos

Ocio y naturaleza
  ├ Excursiones en barco
  ├ Rutas de senderismo
  ├ Rutas de ciclismo
  ├ Parques y jardines
  └ Deportes acuáticos

Servicios (futuro — sectores del meta description actual)
  ├ Salud
  ├ Belleza
  ├ Hogar
  ├ Educación
  ├ Marketing
  └ Seguridad
```

**Tags transversales** (no en URL principal, sí filtrables): `terraza`, `pet-friendly`, `accesible`, `vistas-al-mar`, `lgbt-friendly`, `apertura-tarde`, `parking`, `wifi`, `reserva-online`, `delivery`, `take-away`.

## 3. Datos estructurados (schema.org)

**Esto es la palanca más grande de mejora vs el WP actual.** Cada tipo de página emite su JSON-LD.

### Ficha de negocio (`/{locale}/n/{slug}`)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",        // o "Restaurant", "LodgingBusiness", "BarOrPub"…
  "@id": "https://sitges.pro/es/n/villa-marina-sitges#business",
  "name": "Villa Marina Sitges",
  "image": ["..."],
  "url": "https://sitges.pro/es/n/villa-marina-sitges",
  "telephone": "+34 938 000 000",
  "priceRange": "€€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Passeig de la Ribera, 12",
    "addressLocality": "Sitges",
    "postalCode": "08870",
    "addressRegion": "Barcelona",
    "addressCountry": "ES"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 41.236, "longitude": 1.812 },
  "openingHoursSpecification": [...],
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.6", "reviewCount": 87 },
  "review": [{ "@type": "Review", ... }],
  "menu": "https://...",                     // si aplica
  "servesCuisine": "Mediterránea",           // restaurants
  "starRating": { "@type": "Rating", "ratingValue": 4 }   // hoteles
}
```

Tipos específicos a usar según categoría raíz:
- Restaurantes → `Restaurant`
- Hoteles → `LodgingBusiness` / `Hotel`
- Bares/pubs/discotecas → `BarOrPub` / `NightClub`
- Playas → `TouristAttraction` + `Beach`
- Senderismo → `TouristAttraction`
- Servicios → `LocalBusiness` (subtipo correspondiente)

### Página de categoría (`/{locale}/restaurantes/gourmet`)
```json
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "url": "..." },
    ...
  ]
}
```
+ `BreadcrumbList`.

### Home
- `WebSite` con `SearchAction` (sitelinks searchbox).
- `Organization` con `logo`, `sameAs`.

### Blog/guías
- `Article` con `author`, `datePublished`, `dateModified`, `image`.

### Eventos (futuro)
- `Event` con `location`, `offers`, `performer`.

## 4. Metadatos por página

Cada página renderiza (vía Next.js Metadata API):

```ts
{
  title,                             // <=60 chars
  description,                       // <=155 chars
  alternates: {
    canonical: 'https://sitges.pro/es/n/villa-marina-sitges',
    languages: {
      'es-ES': '/es/n/villa-marina-sitges',
      'ca-ES': '/ca/n/villa-marina-sitges',
      'en':    '/en/b/villa-marina-sitges',
      'fr':    '/fr/e/villa-marina-sitges',
      'x-default': '/es/n/villa-marina-sitges',
    }
  },
  openGraph: { type, title, description, images, locale, alternateLocales },
  twitter: { card: 'summary_large_image', title, description, image },
  robots: { index: status === 'published', follow: true }
}
```

### Reglas hreflang
- Self-referential incluido.
- `x-default` apunta a la URL en español (locale base).
- Si el negocio no tiene traducción en un idioma → no se emite el `hreflang` de ese idioma (no canonical fallback al ES).

## 5. Sitemaps

Sitemap **dividido por tipo** (mejor recrawling selectivo):

```
/sitemap.xml                         (índice)
  /sitemap-locales.xml               (homes + estáticas: 4 locales)
  /sitemap-categorias-es.xml
  /sitemap-categorias-ca.xml
  /sitemap-categorias-en.xml
  /sitemap-categorias-fr.xml
  /sitemap-negocios-es-1.xml         (paginado a 5000 URL/sitemap)
  /sitemap-negocios-ca-1.xml
  ...
  /sitemap-blog-es.xml
  /sitemap-eventos-es.xml
```

Cada URL emite `<xhtml:link rel="alternate" hreflang="..." href="..."/>` para sus traducciones. Tabla `Sitemap` generada server-side desde Prisma, cacheada y servida con `Cache-Control: public, max-age=3600`. Last-modified real (`updatedAt` del negocio).

## 6. Robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/
Disallow: /*?utm_
Disallow: /buscar
Sitemap: https://sitges.pro/sitemap.xml
```

`/buscar` se bloquea para evitar facets infinitos. Las páginas de categoría sí se indexan.

## 7. Migración SEO desde el WP actual

### Redirecciones 301 (críticas)

Cada uno de los 40 slugs antiguos se redirige a su nueva home de categoría/subcategoría:

| URL antigua | URL nueva (301) |
|---|---|
| `/mejores-restaurantes-gourmet-en-sitges/` | `/es/restaurantes/gourmet` |
| `/mejores-restaurantes-de-tapas-en-sitges/` | `/es/restaurantes/tapas` |
| `/mejores-hoteles-boutique-en-sitges/` | `/es/hoteles/boutique` |
| `/mejores-bares-de-cocteles-en-sitges/` | `/es/vida-nocturna/cocteles` |
| `/mejores-playas-familiares-en-sitges/` | `/es/playas/familiares` |
| `/mejores-rutas-de-senderismo-en-sitges/` | `/es/naturaleza/senderismo` |
| ... | ... (matriz completa generada desde tabla `redirects`) |

Tabla `redirects` en BD (`from`, `to`, `code`, `note`) gestionada vía middleware Next.js (`middleware.ts`) leyendo de un mapa estático generado en build (rápido, cero queries en runtime).

### Preservar contenido SEO
Cada listicle se reproduce en la **misma URL nueva** como bloque "Guía" debajo del listado de negocios. Esto preserva el contenido textual que Google ya valora. El texto se traduce a CA/EN/FR.

### Sitemap viejo → nuevo
- Mantener `/sitemap.xml` accesible la primera semana del lanzamiento devolviendo el nuevo (Google ya lo conoce).
- En Search Console: cambio de propiedad / "address change" si es mismo dominio (no aplica, mismo dominio → solo es relanzamiento).

## 8. Performance (Core Web Vitals)

| Vital | Objetivo | Cómo |
|---|---|---|
| LCP | < 2.0s | `next/image` con `priority` en hero, AVIF/WebP, CDN propio (Traefik + servir desde MinIO con cache) |
| INP | < 200ms | Server Components por defecto; client solo para mapa, filtros y carrusel |
| CLS | < 0.05 | Reservar height de imágenes y mapa; fonts con `next/font` |
| TTFB | < 600ms | ISR + cache de páginas categoría (`revalidate: 3600`); ficha de negocio con `revalidate: 86400` + on-demand revalidate en edición |

## 9. Multi-idioma — detalles

Librería: **next-intl** (App Router-first, mejor DX que next-i18next).
- Mensajes UI en `messages/{locale}.json`.
- Contenido (descripciones, copy SEO) en `BusinessTranslation` y `CategoryTranslation` en BD.
- Negociación inicial por `Accept-Language` solo en raíz, después el usuario fija locale.
- Selector de idioma persistente con cookie `NEXT_LOCALE`.
- Traducción automática del owner-input (descripción del negocio) **opcional**: el owner escribe en su idioma, ofrecemos sugerencia traducida (DeepL API) que él aprueba o edita. Evita contenido auto-traducido sin revisión (penalización SEO).

## 10. Indexabilidad y descubrimiento

- **Sin WAF agresivo bloqueando Googlebot.** Si en Dokploy/Traefik configuras Cloudflare/Anubis, whitelist explícito de Googlebot/Bingbot por reverse-DNS.
- **Internal linking denso:** cada ficha de negocio enlaza a su categoría, subcategoría, y a 3 negocios relacionados (mismo barrio / misma subcategoría / mismos tags).
- **Breadcrumbs visibles + schema.**
- **Paginación con `rel="prev/next"`** y URLs canónicas estables (`?page=2`).
- **Indexar solo lo que aporta valor:** páginas con < 3 negocios no se indexan (`noindex`) hasta tener masa crítica.

## 11. Open Graph e imagen social

- Imagen OG generada dinámicamente por página vía `next/og` (1200×630).
  - Ficha negocio: foto + nombre + categoría + rating.
  - Categoría: collage de 4 fotos + nombre.
  - Home: imagen estática de marca.
- `og:locale` correctamente seteado por idioma.

## 12. Analítica y Search Console

- **Plausible self-hosted** en tu infra (alineado con [[reference-infra]]) — sin cookies, sin banner.
- **Search Console** verificado en los 4 locales como propiedades separadas (mejor segmentación) + propiedad de dominio.
- **Tabla `SearchQuery`** que ingiere los datos de GSC vía API semanalmente (cron) → dashboard interno para owners ("estas búsquedas trajeron visitas a tu negocio").
