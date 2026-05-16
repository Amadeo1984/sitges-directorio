# Modelo de datos — sitges.pro v2

PostgreSQL 16 + Prisma. Diseño orientado a:
- **i18n nativo** (todo el contenido visible es traducible).
- **SEO-friendly** (slugs por idioma, history de slugs para 301 automáticos).
- **Owner-first** (cada negocio tiene dueño, edición y moderación claras).
- **Extensible a pagos** (planes y suscripciones aisladas, fase 3).

## Esquema Prisma (resumen)

```prisma
// ---------- AUTH (Better Auth maneja las tablas core) ----------
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  emailVerified DateTime?
  name          String?
  image         String?
  role          UserRole @default(OWNER)
  createdAt     DateTime @default(now())

  businesses    Business[] @relation("BusinessOwner")
  reviews       Review[]
  // Better Auth: Session, Account, Verification ...
}

enum UserRole { OWNER ADMIN EDITOR }

// ---------- TAXONOMÍA ----------
model Category {
  id        String    @id @default(cuid())
  parentId  String?
  parent    Category? @relation("CategoryTree", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryTree")
  icon      String?           // nombre lucide icon
  order     Int       @default(0)
  schemaType String           // "Restaurant", "LodgingBusiness", ...

  translations CategoryTranslation[]
  businesses   Business[]

  @@index([parentId, order])
}

model CategoryTranslation {
  id          String @id @default(cuid())
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  locale      Locale
  name        String
  slug        String          // por locale
  description String?         // copy SEO debajo del listado
  seoTitle    String?
  seoDescription String?
  @@unique([categoryId, locale])
  @@unique([locale, slug])    // slug único dentro de un idioma
}

enum Locale { es ca en fr }

// ---------- NEGOCIO ----------
model Business {
  id          String         @id @default(cuid())
  ownerId     String
  owner       User           @relation("BusinessOwner", fields: [ownerId], references: [id])
  categoryId  String
  category    Category       @relation(fields: [categoryId], references: [id])
  status      BusinessStatus @default(DRAFT)
  plan        Plan           @default(FREE)
  featured    Boolean        @default(false)
  verified    Boolean        @default(false)

  // contacto
  phone       String?
  email       String?
  website     String?
  whatsapp    String?
  instagram   String?
  facebook    String?
  tiktok      String?

  // ubicación
  address     String?
  postalCode  String?
  district    String?         // barrio/zona dentro de Sitges
  lat         Decimal?        @db.Decimal(9,6)
  lng         Decimal?        @db.Decimal(9,6)

  // operativos
  priceRange  PriceRange?
  capacity    Int?
  amenities   String[]        // ["wifi","parking","terraza",...]
  paymentMethods String[]

  // métricas cacheadas (denormalizadas para performance)
  ratingAvg   Float?
  ratingCount Int             @default(0)
  viewCount   Int             @default(0)

  publishedAt DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  translations BusinessTranslation[]
  hours        OpeningHours[]
  media        Media[]
  reviews      Review[]
  tags         TagOnBusiness[]
  slugHistory  BusinessSlugHistory[]

  @@index([categoryId, status, publishedAt(sort: Desc)])
  @@index([status, featured, publishedAt(sort: Desc)])
  @@index([lat, lng])         // simple bbox; para vecindad geoespacial real, ver PostGIS abajo
}

enum BusinessStatus { DRAFT PENDING_REVIEW PUBLISHED REJECTED ARCHIVED }
enum Plan { FREE FEATURED PREMIUM }
enum PriceRange { CHEAP MID HIGH LUXURY }   // mapea a €, €€, €€€, €€€€

model BusinessTranslation {
  id          String  @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  locale      Locale
  slug        String
  name        String  // permitimos nombre traducido aunque normalmente sea idéntico
  shortDescription String?     // 160 chars, usado en cards
  description Json                // tiptap JSON / lexical
  seoTitle    String?
  seoDescription String?
  @@unique([businessId, locale])
  @@unique([locale, slug])
}

model BusinessSlugHistory {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  locale      Locale
  oldSlug     String
  changedAt   DateTime @default(now())
  @@unique([locale, oldSlug])     // para 301 lookup
}

// ---------- HORARIOS ----------
model OpeningHours {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  dayOfWeek   Int      // 0=domingo..6=sábado
  openTime    String   // "09:30"
  closeTime   String   // "23:00"
  note        String?  // "solo verano", "happy hour 18-20", etc.
  @@index([businessId, dayOfWeek])
}

// ---------- MEDIA ----------
model Media {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  type        MediaType
  key         String   // path en MinIO bucket
  url         String   // CDN URL pública
  alt         String?
  width       Int?
  height      Int?
  position    Int      @default(0)
  isPrimary   Boolean  @default(false)
  createdAt   DateTime @default(now())
  @@index([businessId, position])
}

enum MediaType { IMAGE VIDEO }

// ---------- TAGS ----------
model Tag {
  id           String @id @default(cuid())
  key          String @unique  // 'pet-friendly'
  translations TagTranslation[]
  businesses   TagOnBusiness[]
}

model TagTranslation {
  id     String @id @default(cuid())
  tagId  String
  tag    Tag @relation(fields: [tagId], references: [id], onDelete: Cascade)
  locale Locale
  name   String
  slug   String
  @@unique([tagId, locale])
  @@unique([locale, slug])
}

model TagOnBusiness {
  businessId String
  tagId      String
  business   Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([businessId, tagId])
  @@index([tagId, businessId])
}

// ---------- REVIEWS ----------
model Review {
  id          String   @id @default(cuid())
  businessId  String
  business    Business @relation(fields: [businessId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  rating      Int      // 1..5
  title       String?
  body        String
  locale      Locale
  status      ReviewStatus @default(PENDING)
  createdAt   DateTime @default(now())
  reply       String?  // respuesta del owner
  replyAt     DateTime?
  @@index([businessId, status, createdAt(sort: Desc)])
  @@unique([businessId, userId])     // 1 review por user por negocio
}

enum ReviewStatus { PENDING APPROVED REJECTED FLAGGED }

// ---------- BLOG / GUÍAS ----------
model Post {
  id          String   @id @default(cuid())
  status      PostStatus @default(DRAFT)
  authorId    String
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  translations PostTranslation[]
  @@index([status, publishedAt(sort: Desc)])
}

model PostTranslation {
  id      String @id @default(cuid())
  postId  String
  post    Post @relation(fields: [postId], references: [id], onDelete: Cascade)
  locale  Locale
  slug    String
  title   String
  excerpt String?
  content Json
  cover   String?
  seoTitle String?
  seoDescription String?
  @@unique([postId, locale])
  @@unique([locale, slug])
}

enum PostStatus { DRAFT PUBLISHED ARCHIVED }

// ---------- REDIRECCIONES (migración WP + slug history) ----------
model Redirect {
  id        String   @id @default(cuid())
  fromPath  String   @unique          // "/mejores-restaurantes-gourmet-en-sitges/"
  toPath    String                    // "/es/restaurantes/gourmet"
  code      Int      @default(301)
  hits      Int      @default(0)
  lastHitAt DateTime?
  createdAt DateTime @default(now())
}

// ---------- PAGOS (FASE 3 — placeholder) ----------
model Subscription {
  id            String   @id @default(cuid())
  businessId    String   @unique
  business      Business @relation(fields: [businessId], references: [id])
  plan          Plan
  stripeCustomerId String?
  stripeSubId   String?  @unique
  status        String   // active, past_due, canceled, ...
  currentPeriodEnd DateTime?
  createdAt     DateTime @default(now())
}
```

## Decisiones clave y por qué

### Slugs por idioma con history
- Cada `BusinessTranslation` tiene su propio `slug` único por locale.
- Cambiar el slug NO rompe SEO: el viejo se guarda en `BusinessSlugHistory` y el middleware emite 301 al actual.
- Lookup en runtime: `WHERE locale = ? AND slug = ?` con índice compuesto único.

### Geolocalización
- Inicio: `Decimal lat/lng` con índice (suficiente para bbox queries y mostrar mapa).
- Cuando crezca: migrar a **PostGIS** con `GEOGRAPHY(POINT)` y `GIST` index para "negocios en radio X km" eficiente. Migración trivial con Prisma + raw SQL.

### Hours como filas
- Permite "varios slots por día" (siesta) y queries tipo "abierto ahora" sin parsear JSON.
- Trade-off: ~7-14 filas por negocio. Aceptable.

### Description como JSON (Tiptap)
- Permite formato rico (negritas, listas, links) controlado, sin riesgo de XSS.
- Renderizado server-side a HTML semántico.

### Métricas denormalizadas (`ratingAvg`, `viewCount`)
- Evita JOIN+AGG en cada render de card. Se recalculan en trigger / job al insertar review aprobada.

### Plan + featured separados
- `plan` define lo que paga el owner; `featured` lo activa el admin (puede ser parte del plan o un boost editorial).

### Tabla `Redirect` poblada en seed
- Genera las 40 redirecciones desde una tabla mapping (en seed file) + se rellena automáticamente cuando un slug cambia.
- Servida desde `middleware.ts` con un mapa precargado en build (cero queries en runtime para los 40 fijos).

## Seeds iniciales

1. **Categorías y subcategorías** con sus 4 traducciones (script `seed/categories.ts`).
2. **Tags** transversales con traducciones.
3. **Usuario admin** inicial (email/password configurable por env).
4. **Redirects** del WP antiguo (40 entradas mínimo).
5. **Demo:** 5 negocios por subcategoría con datos plausibles (para QA y demo al cliente).

## Migración desde WP

Cuando tengamos el export XML:
1. Parsear con script Node (`scripts/migrate-wp.ts`).
2. Para cada listicle: extraer H2 (negocios destacados), crear `Business` + `BusinessTranslation` (es).
3. Texto narrativo del listicle → `CategoryTranslation.description` (la "guía" debajo del listado).
4. Imágenes → MinIO + crear `Media`.
5. Owner inicial: usuario admin (los reasignamos cuando los negocios reales reclamen su ficha).
6. Job posterior: para cada negocio, sacar datos enriquecidos de Google Places API (coordenadas, horario, rating GPB) — opcional, requiere API key con cuota.
