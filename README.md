# Sitges Directorio v2

Reemplazo del WordPress actual de [sitges.pro](https://sitges.pro) por un directorio web a medida con área privada para owners y monetización futura.

## Documentación

| Doc | Contenido |
|---|---|
| [01 — Auditoría del WP actual](docs/01-audit-report.md) | Stack detectado, inventario de 40 listicles, diagnóstico SEO, qué reutilizamos |
| [02 — Arquitectura SEO](docs/02-seo-architecture.md) | URLs i18n, taxonomía, schema.org, sitemaps, redirects, Core Web Vitals |
| [03 — Modelo de datos](docs/03-data-model.md) | Schema Prisma completo, decisiones técnicas, plan de migración WP |
| [04 — Estructura del proyecto](docs/04-project-structure.md) | Árbol de carpetas Next.js, dependencias, env vars, roadmap por sprints |

## Decisiones tomadas

- **Stack:** Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + PostgreSQL + Prisma + Better Auth
- **Idiomas:** ES, CA, EN, FR (next-intl)
- **MVP:** Fases 1+2 antes de lanzar (catálogo + área privada + mapa + reviews + i18n + SEO completo)
- **Pagos:** Stripe en Fase 3, post-lanzamiento
- **Despliegue:** Docker en Dokploy propio

## Scrape de auditoría

```
scrape/
├ raw/        # HTML descargado desde Wayback Machine
└ data/       # URLs extraídas y clasificadas
```

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- next-intl v3 (ES / CA / EN / FR)
- Prisma + PostgreSQL 16
- Better Auth (sprint 2)
- MapLibre (sprint 1)
- Despliegue: Docker en Dokploy

## Setup local

```bash
# 1. Postgres
docker compose -f docker/docker-compose.yml up -d

# 2. Variables de entorno
cp .env.example .env

# 3. Dependencias
npm install

# 4. Esquema de BD
npx prisma db push

# 5. Dev server
npm run dev
```

App en `http://localhost:3000` (redirige a `/es`).

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor en producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | Comprobar tipos TS |
| `npm run db:push` | Sincronizar esquema sin migrations (dev) |
| `npm run db:migrate` | Crear migration |
| `npm run db:studio` | Prisma Studio |

## Siguiente paso

Sprint 1: modelos completos (translations, hours, media), seed de categorías, página de categoría/subcategoría, ficha de negocio, búsqueda básica, mapa y JSON-LD. Para la migración real de los ~120 negocios actuales hace falta el export XML del WP (Herramientas → Exportar → Todo el contenido).
