# Estructura del proyecto Next.js

Monorepo simple con pnpm workspaces. Puede aplanarse a single-package si prefieres no usar monorepo todavía — pero deja la puerta abierta a separar `db` y `ui` cuando crezca.

## Árbol de carpetas

```
sitges-directorio/
├ apps/
│  └ web/                          # Next.js 15 (App Router)
│     ├ app/
│     │  ├ [locale]/
│     │  │  ├ layout.tsx           # provee next-intl, fonts, header/footer
│     │  │  ├ page.tsx             # home por locale
│     │  │  ├ buscar/
│     │  │  │  └ page.tsx          # SSR con searchParams
│     │  │  ├ mapa/
│     │  │  │  └ page.tsx
│     │  │  ├ [categoria]/
│     │  │  │  ├ page.tsx          # listado de subcategorías + top negocios
│     │  │  │  └ [subcategoria]/
│     │  │  │     └ page.tsx       # listado de negocios + guía SEO + filtros
│     │  │  ├ n/
│     │  │  │  └ [slug]/
│     │  │  │     ├ page.tsx       # ficha de negocio (Server Component)
│     │  │  │     └ opengraph-image.tsx
│     │  │  ├ etiqueta/
│     │  │  │  └ [tag]/page.tsx
│     │  │  ├ blog/
│     │  │  │  ├ page.tsx
│     │  │  │  └ [slug]/page.tsx
│     │  │  ├ legal/[slug]/page.tsx
│     │  │  ├ login/page.tsx
│     │  │  ├ registro/page.tsx
│     │  │  └ dashboard/
│     │  │     ├ layout.tsx        # auth gate
│     │  │     ├ page.tsx          # overview
│     │  │     ├ negocios/
│     │  │     │  ├ page.tsx
│     │  │     │  ├ nuevo/page.tsx
│     │  │     │  └ [id]/
│     │  │     │     ├ page.tsx    # editor
│     │  │     │     ├ fotos/page.tsx
│     │  │     │     ├ horarios/page.tsx
│     │  │     │     └ reviews/page.tsx
│     │  │     ├ perfil/page.tsx
│     │  │     └ admin/            # solo role=ADMIN
│     │  │        ├ moderacion/page.tsx
│     │  │        ├ usuarios/page.tsx
│     │  │        └ redirects/page.tsx
│     │  ├ api/
│     │  │  ├ auth/                # Better Auth handlers
│     │  │  ├ revalidate/route.ts  # on-demand revalidate
│     │  │  └ upload/route.ts      # presigned URL para MinIO
│     │  ├ sitemap.xml/route.ts    # índice
│     │  ├ sitemap-[type]-[locale].xml/route.ts
│     │  ├ robots.txt/route.ts
│     │  └ not-found.tsx
│     ├ components/
│     │  ├ ui/                     # shadcn primitives
│     │  ├ business/
│     │  │  ├ business-card.tsx
│     │  │  ├ business-hero.tsx
│     │  │  ├ business-hours.tsx
│     │  │  └ business-gallery.tsx
│     │  ├ map/
│     │  │  └ map-view.tsx         # MapLibre, client component
│     │  ├ search/
│     │  │  ├ search-bar.tsx
│     │  │  └ filters.tsx
│     │  └ seo/
│     │     ├ json-ld.tsx          # helper para schema.org
│     │     └ breadcrumbs.tsx
│     ├ lib/
│     │  ├ auth.ts                 # Better Auth config
│     │  ├ db.ts                   # PrismaClient singleton
│     │  ├ i18n/
│     │  │  ├ config.ts            # locales, default, etc.
│     │  │  └ request.ts           # next-intl getRequestConfig
│     │  ├ seo/
│     │  │  ├ metadata.ts          # builders para Metadata
│     │  │  ├ schema.ts            # generadores JSON-LD por tipo
│     │  │  └ sitemap.ts
│     │  ├ slugs.ts                # generación + lookup en history
│     │  ├ media.ts                # MinIO client + presigned URLs
│     │  └ search.ts               # full-text + filtros
│     ├ messages/
│     │  ├ es.json
│     │  ├ ca.json
│     │  ├ en.json
│     │  └ fr.json
│     ├ middleware.ts              # next-intl + redirects (tabla precargada)
│     ├ next.config.mjs
│     ├ tailwind.config.ts
│     ├ tsconfig.json
│     ├ Dockerfile
│     └ package.json
├ packages/
│  ├ db/                           # Prisma schema + cliente
│  │  ├ prisma/
│  │  │  ├ schema.prisma
│  │  │  ├ migrations/
│  │  │  └ seed.ts
│  │  ├ src/
│  │  │  ├ index.ts                # export PrismaClient
│  │  │  └ types.ts                # re-exports
│  │  └ package.json
│  └ config/
│     ├ tsconfig.base.json
│     └ eslint.config.mjs
├ docker/
│  ├ docker-compose.yml            # postgres + minio + meilisearch (opcional) para dev
│  └ Dockerfile.web                # multi-stage build de la app
├ scripts/
│  ├ migrate-wp.ts                 # parser del XML de WP
│  └ enrich-google-places.ts       # opcional
├ docs/                            # (los 4 docs de arquitectura, ya creados)
├ .github/workflows/
│  ├ ci.yml                        # typecheck + lint + test
│  └ deploy.yml                    # build + push + dokploy webhook
├ .env.example
├ pnpm-workspace.yaml
└ README.md
```

## Dependencias principales

```json
{
  "dependencies": {
    "next": "^15.x",
    "react": "^19.x",
    "next-intl": "^3.x",
    "@prisma/client": "^5.x",
    "better-auth": "^1.x",
    "@tanstack/react-query": "^5.x",
    "tailwindcss": "^4.x",
    "@radix-ui/react-*": "*",
    "lucide-react": "^0.x",
    "zod": "^3.x",
    "maplibre-gl": "^4.x",
    "@tiptap/react": "^2.x",
    "@aws-sdk/client-s3": "^3.x",
    "stripe": "^17.x",
    "resend": "^4.x"
  },
  "devDependencies": {
    "typescript": "^5.x",
    "prisma": "^5.x",
    "@playwright/test": "^1.x",
    "vitest": "^2.x",
    "eslint": "^9.x",
    "prettier": "^3.x"
  }
}
```

## Variables de entorno (`.env.example`)

```bash
# App
NEXT_PUBLIC_APP_URL=https://sitges.pro
NODE_ENV=development

# DB
DATABASE_URL=postgresql://user:pass@localhost:5432/sitges
DIRECT_URL=postgresql://user:pass@localhost:5432/sitges

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Media (MinIO)
S3_ENDPOINT=https://minio.tu-dominio.com
S3_REGION=us-east-1
S3_BUCKET=sitges-media
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_PUBLIC_URL=https://cdn.sitges.pro

# Email
RESEND_API_KEY=

# Maps
MAPTILER_API_KEY=

# Analytics
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=sitges.pro

# Stripe (Fase 3)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Opcional: enriquecimiento
GOOGLE_PLACES_API_KEY=
DEEPL_API_KEY=
```

## Roadmap de implementación (orden propuesto)

### Sprint 0 — Bootstrap (2-3 días)
1. Scaffold Next.js + Tailwind + shadcn + ESLint + Prettier.
2. Setup Prisma con schema base + Postgres en docker-compose.
3. Setup next-intl con los 4 locales y mensajes mínimos.
4. Header + Footer + selector de idioma.
5. CI: typecheck + lint + build en GitHub Actions.
6. Deploy básico en Dokploy con dominio de staging.

### Sprint 1 — Catálogo público (1 semana)
1. Models: Category, Business, BusinessTranslation, OpeningHours, Media, Tag (+ migrations).
2. Seed de categorías y demo de negocios.
3. Página home con secciones por categoría.
4. Página categoría/subcategoría con listado + paginación.
5. Ficha de negocio con todos los bloques (hero, info, horarios, mapa, galería).
6. Búsqueda básica (Postgres full-text + filtros por categoría/tag).
7. Mapa global (`/mapa`) con MapLibre.
8. JSON-LD en todas las páginas + Metadata API + sitemap dinámico + robots.txt.
9. Redirecciones 301 de las 40 URLs WP.

### Sprint 2 — Área privada del owner (1 semana)
1. Better Auth (email + Google) con verificación.
2. Layout dashboard + protección de rutas.
3. CRUD de negocio (form con react-hook-form + zod).
4. Upload de fotos a MinIO (presigned URLs).
5. Editor de horarios.
6. Editor rico de descripción (Tiptap) por idioma.
7. Flujo de moderación: `DRAFT` → `PENDING_REVIEW` → `PUBLISHED`.
8. Notificación email al owner cuando se aprueba/rechaza.

### Sprint 3 — Reviews, panel admin, pulido SEO (1 semana)
1. Reviews públicas + reply del owner + moderación admin.
2. Aggregate rating + AggregateRating schema.
3. Panel admin: moderación de negocios y reviews, gestión de usuarios, edición de redirects.
4. OG images dinámicas con `next/og`.
5. Performance pass (Lighthouse > 95 en todas).
6. Search Console alta y sitemap submission.

### Sprint 4 — Lanzamiento (3-5 días)
1. Traducción profesional de UI + demo de copy a CA/EN/FR (al menos categorías + 10 negocios).
2. Migración del XML de WP cuando lo tengamos.
3. Pre-flight: redirects activos, sitemap correcto, robots.txt, analítica.
4. Switch DNS sitges.pro → nuevo entorno.
5. Monitor de 404s y rendimiento durante primera semana.

### Fase 3 (post-lanzamiento) — Monetización
- Planes Stripe (Free / Featured 19€/mes / Premium 49€/mes).
- Self-service de upgrade desde el dashboard.
- Boost de posición en listados según plan.
- Estadísticas de visualizaciones/clicks para owners.

## Despliegue en Dokploy

- 1 contenedor Next.js (`Dockerfile.web`, multi-stage, output `standalone`).
- 1 contenedor Postgres 16 (volumen persistente).
- 1 contenedor Plausible (opcional, ya tienes infra).
- MinIO existente reutilizado.
- Traefik labels para SSL y dominio.
- Health check en `/api/health` (endpoint trivial que pingea DB).
