# Despliegue — Dokploy + sitges.pro

Guía paso a paso para llevar este proyecto a producción en tu Dokploy y reemplazar el WordPress actual.

## Prerrequisitos (tu lado)

1. **Backup del WP actual hecho** (wp-content/uploads + dump SQL). Sin esto no hay rollback.
2. **Dokploy operativo** en `51.255.193.236` con Traefik y certificados Let's Encrypt funcionales.
3. **PostgreSQL existente** en tu infra con un usuario+DB nuevo creado para este proyecto. Ejemplo:
   ```sql
   CREATE USER sitges_app WITH PASSWORD 'GENERA_UN_PASSWORD_LARGO_AQUI';
   CREATE DATABASE sitges_directorio OWNER sitges_app;
   GRANT ALL PRIVILEGES ON DATABASE sitges_directorio TO sitges_app;
   ```
4. **MinIO** ya corriendo en tu infra (lo tienes desde antes). Crear bucket `sitges-media` con política de lectura pública:
   ```bash
   mc mb your-minio/sitges-media
   mc anonymous set download your-minio/sitges-media
   ```
5. **TTL DNS de sitges.pro bajado a 300s** *al menos 24 h antes* del cambio (para que la propagación sea rápida).

## Variables de entorno necesarias

Las pondrás en Dokploy → Environment Variables del proyecto:

```bash
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://sitges.pro

# Database (uno solo, sin SSL si la red es interna; con SSL si externa)
DATABASE_URL=postgresql://sitges_app:PASSWORD@postgres-internal:5432/sitges_directorio?schema=public&connection_limit=10&pool_timeout=20

# Better Auth (genera 32+ chars random)
BETTER_AUTH_SECRET=GENERA_32_CHARS_RANDOM
BETTER_AUTH_URL=https://sitges.pro

# Media (MinIO)
S3_ENDPOINT=https://minio.tu-dominio.com
S3_REGION=us-east-1
S3_BUCKET=sitges-media
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_PUBLIC_URL=https://minio.tu-dominio.com   # o https://cdn.sitges.pro si tienes CDN delante

# Email — opcional, sin esto los emails se loguean a stdout
RESEND_API_KEY=
EMAIL_FROM=Sitges Directorio <noreply@sitges.pro>
ADMIN_EMAIL=atusell@gmail.com

# Maps — opcional, usa tiles públicos por defecto
MAPTILER_API_KEY=

# Analytics — opcional
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=sitges.pro

# Stripe — opcional al lanzamiento, lo añades cuando estés listo de monetizar
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_FEATURED_MONTHLY=
STRIPE_PRICE_PREMIUM_MONTHLY=
```

## Pasos en Dokploy

1. **Crear proyecto**: Dokploy → Projects → New → **Application** (Docker source).
2. **Source: GitHub** → conecta el repo `Amadeo1984/sitges-directorio` rama `main`.
3. **Build type: Dockerfile** (el Dockerfile en raíz hace todo).
4. **Build path**: `/` (raíz). **Dockerfile path**: `Dockerfile`.
5. **Environment Variables**: pega el bloque anterior con tus valores reales.
6. **Port**: `3000`.
7. **Domains**:
   - Añade `sitges.pro` (y `www.sitges.pro` si quieres servirlo).
   - Marca "Force HTTPS" y "HTTPS" con Let's Encrypt.
   - Path: `/`.
8. **Health check**: ya está configurado en el Dockerfile (`/api/health`).
9. **Resource limits** (sugerido inicial):
   - Memory: `512Mi`–`1Gi`
   - CPU: `0.5`–`1`
10. **Deploy** → primer build (5-10 min descargando deps y compilando).
11. **Verifica** logs: deberías ver `[entrypoint] Aplicando migraciones…` seguido del log de Next.js.

## Después del primer deploy (importante)

1. **Seed inicial** — la BD está vacía. Conéctate al contenedor:
   ```bash
   docker exec -it <container-id> node node_modules/prisma/build/index.js db seed
   ```
   o conéctate con psql al Postgres y ejecuta el seed externamente. Esto carga las 69 categorías + 10 tags + 56 redirects.

2. **Migrar contenido real del WP** (los 131 negocios):
   - Sube el `sitges-export.xml` al contenedor (vía `docker cp`) o mejor pásalo por env / S3 y descárgalo en el script.
   - Ejecuta: `docker exec -it <container-id> npm run migrate:wp -- /ruta/al/sitges-export.xml`

3. **Crea el usuario admin inicial** registrándote en `/es/registro` y luego desde Prisma Studio (o SQL) pon `role = 'ADMIN'`:
   ```sql
   UPDATE "User" SET role = 'ADMIN' WHERE email = 'atusell@gmail.com';
   ```

## Cambio de DNS sitges.pro

Cuando el deploy responda 200 con datos correctos en la IP de Dokploy:

1. En el panel DNS de tu registrador:
   - **A** record `sitges.pro` → `51.255.193.236` (TTL 300)
   - **A** record `www.sitges.pro` → `51.255.193.236` (TTL 300)
   - (Opcional) **CNAME** `www.sitges.pro` → `sitges.pro`
2. Espera 1-15 min a la propagación.
3. Comprueba: `dig sitges.pro` debe devolver tu IP nueva.
4. Verifica HTTPS: `curl -I https://sitges.pro` → 307 a `/es`.

## Smoke test post-deploy

```bash
# básicos
curl -I https://sitges.pro/                # 307 → /es
curl -I https://sitges.pro/es              # 200
curl -I https://sitges.pro/sitemap.xml     # 200 application/xml
curl -I https://sitges.pro/robots.txt      # 200 text/plain

# redirects WP (esto es crítico para SEO)
curl -I https://sitges.pro/mejores-restaurantes-gourmet-en-sitges/
#   → 301 a /es/restaurantes/gourmet

# health
curl https://sitges.pro/api/health        # {"ok":true,"ts":"..."}

# ficha real
curl -I https://sitges.pro/es/n/casa-raimundo-restaurante-sitges  # 200
```

## En Google Search Console

1. Verifica propiedad `sitges.pro` (dominio, no URL).
2. Submit sitemap: `https://sitges.pro/sitemap.xml`.
3. **Solicita reprocesado** de las 56 URLs viejas en URL inspection → Request indexing. Google las re-rastreará y verá los 301.
4. En Coverage, vigila durante 2-4 semanas la migración de las URLs viejas a las nuevas.

## Plan de rollback (si algo va mal)

1. En tu panel DNS revierte la A record de `sitges.pro` al hosting anterior del WP (anota la IP previa antes del cambio).
2. Restaura el backup del WP en su hosting original si está limpio, o en otro.
3. En 5-15 min la web vuelve a estar como antes.

## Operaciones post-lanzamiento

- **Backups Postgres**: configura un cron diario en tu infra que haga `pg_dump` de `sitges_directorio` y lo guarde fuera del servidor (MinIO con bucket privado o S3).
- **Logs**: Dokploy → Logs del contenedor. Para 7+ días, considera Loki o un drain a tu propio agregador.
- **Métricas básicas**: añadir Plausible self-hosted (ya tienes infra). Setea `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=sitges.pro`.
- **Actualizar contenido**: cuando un owner reclame una ficha y se la asignes desde `/dashboard/admin/sin-owner`, puede editar todo desde su panel.
- **Stripe**: cuando estés listo para monetizar, sigue el bloque "Para activar pagos en producción" del sprint 5.
