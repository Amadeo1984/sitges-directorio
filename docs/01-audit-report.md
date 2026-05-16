# Auditoría del WordPress actual — sitges.pro

Fecha: 2026-05-16
Método: snapshot de Wayback Machine (`web.archive.org/web/20240725082033/`) + búsqueda Google indexada. El sitio en vivo está protegido por un challenge JS tipo Plesk/Imunify WAF que impide el scraping directo sin navegador headless. Los hallazgos reflejan el estado del snapshot de julio 2024, posiblemente ampliado desde entonces.

## Stack técnico actual

| Capa | Valor |
|---|---|
| CMS | WordPress 6.6.1 |
| Tema | **Flatsome** + child theme (`flatsome-child`) |
| Plugin de directorio | **Ninguno** (no hay Listingo / Directorist / GeoDirectory / WP Job Manager) |
| Idiomas | **Solo español** (no hay selector WPML/Polylang) |
| Estructura URL | Slug en raíz, sin categorías en la ruta: `/{slug-articulo}/` |
| API REST | WP REST API expuesta (`/wp-json/wp/v2/...`) y XML-RPC habilitado |
| Schema.org | Solo el básico de WP (`WebPage`, `Article`), **sin `LocalBusiness`** ni `ItemList` |
| Mapas | No detectados |
| Reviews | No detectados |
| Área de cliente | **Inexistente**. No hay registro ni alta de negocios |
| WAF / anti-bot | Sí (challenge JS con cookie `wsidchk`, probablemente Plesk Imunify360) |

## Tipo de contenido real

**No es un directorio**, es una colección de **artículos SEO tipo listicle** ("Mejores X en Sitges") creados manualmente. Cada artículo contiene:

- Un H1 tipo `Mejores {tipo} en Sitges`
- ~3 negocios destacados como H2 (nombre + breve descripción + ocasionalmente teléfono)
- Varios H2 genéricos de soporte SEO ("Alta cocina en Sitges", "Cocina creativa…")
- Texto SEO sin estructura de datos
- 3-4 imágenes propias (mayormente el logo + 1 foto de cabecera)

No hay fichas individuales de negocio. La "alta" se hace editorialmente desde WP-admin.

## Inventario de contenido (40 listicles)

### Restaurantes / Gastronomía (10)
- mejores-restaurantes-asiaticos-en-sitges
- mejores-restaurantes-con-vistas-al-mar-en-sitges
- mejores-restaurantes-de-comida-rapida-en-sitges
- mejores-restaurantes-de-mariscos-en-sitges
- mejores-restaurantes-de-tapas-en-sitges
- mejores-restaurantes-economicos-en-sitges
- mejores-restaurantes-gourmet-en-sitges
- mejores-restaurantes-italianos-en-sitges
- mejores-restaurantes-para-familias-en-sitges
- mejores-restaurantes-vegetarianos-veganos

### Hoteles / Alojamiento (9)
- mejores-hoteles-boutique-en-sitges
- mejores-hoteles-centricos-en-sitges
- mejores-hoteles-con-spa-en-sitges
- mejores-hoteles-con-vistas-al-mar-en-sitges
- mejores-hoteles-de-lujo-en-sitges
- mejores-hoteles-economicos-en-sitges
- mejores-hoteles-familiares-en-sitges
- mejores-hoteles-romanticos-en-sitges
- mejores-hoteles-todo-incluido-en-sitges

### Vida nocturna / Bares (9)
- mejores-bares-de-cocteles-en-sitges
- mejores-bares-de-tapas-en-sitges
- mejores-bares-en-sitges
- mejores-bares-gay-en-sitges
- mejores-clubs-de-musica-en-vivo-en-sitges
- mejores-discotecas-en-sitges
- mejores-eventos-nocturnos-en-sitges
- mejores-excursiones-en-barco-en-sitges
- mejores-pubs-en-sitges

### Playas (7)
- mejores-calas-escondidas-en-sitges
- mejores-playas-familiares-en-sitges
- mejores-playas-para-hacer-snorkel-en-sitges
- mejores-playas-para-mascotas-en-sitges
- mejores-playas-para-practicar-deportes-acuaticos-en-sitges
- mejores-playas-tranquilas-en-sitges
- playas-con-acceso-para-discapacitados-en-sitges

### Actividades / Naturaleza (4)
- mejores-parques-y-jardines-en-sitges
- mejores-rutas-de-ciclismo-en-sitges
- mejores-rutas-de-senderismo-en-sitges
- mejores-sitios-para-deportes-acuaticos-en-sitges

### Otros (1)
- mejores-terrazas-en-sitges

## Diagnóstico SEO del WP actual

**Lo que funciona:**
- Slugs descriptivos en español con keyword de cola larga.
- Cobertura amplia de intents informacionales ("mejores X en Sitges").
- Posicionamiento aparente en SERPs (aparece en `site:sitges.pro` con snippets ricos).

**Lo que no funciona / oportunidades:**
- **Cero datos estructurados de negocio.** Sin `LocalBusiness`, los snippets no muestran ratings, horario, dirección, teléfono. Pérdida masiva de CTR.
- **No hay páginas de ficha de negocio**, así que los negocios no posicionan por su propio nombre desde sitges.pro.
- **Sin i18n.** Sitges es un destino turístico internacional; ausencia de EN/FR/CA deja todo ese tráfico fuera.
- **Sin búsqueda interna ni filtros.** El usuario no puede buscar "restaurante con terraza pet-friendly".
- **Sin mapa.** Los directorios competitivos (TripAdvisor, Google Maps) lo dan por hecho.
- **Sin reviews/ratings propios** → no compite en search experience contra Google Business Profile.
- **Sin sitemap rico ni hreflang.** Para multi-idioma sería crítico.
- **WAF agresivo** dificulta el crawl de Googlebot (potencial pérdida de indexación).

## Qué reutilizamos en el nuevo proyecto

1. Los **40 slugs** y sus URLs se preservan como **páginas de categoría enriquecidas** (ej. `/es/categoria/restaurantes/gourmet`) con redirect 301 desde la URL antigua.
2. Los **negocios mencionados como H2** se extraen y se cargan en la nueva BD como `Business` reales (con su ficha individual posicionable).
3. El **copy SEO** de cada listicle se conserva como "guía" debajo del listado de negocios en la página de categoría. Doble beneficio: SEO + UX.
4. Las **fotos** (las pocas que hay) se migran a MinIO.

## Datos pendientes de obtener

Para completar la migración necesito una de estas vías (lo recordamos del paso anterior):
- Export XML de WP (Herramientas → Exportar → Todo el contenido)
- Credenciales de admin WP
- Backup completo (`wp-content/uploads` + dump SQL)

Sin esto, los nombres exactos de los ~120 negocios mencionados a lo largo de los 40 listicles quedan en aire (estimación: 40 × 3 destacados ≈ 120).
