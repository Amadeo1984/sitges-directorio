// Mapeo de las URLs antiguas del WordPress sitges.pro a las nuevas categorías/subcategorías.
// Todas redirigen al locale 'es' (default); el visitante de otra lengua llega ahí
// y el HTML hreflang le permite cambiar.

interface RedirectSeed {
  from: string;
  to: string;
  code?: number;
}

export const REDIRECTS: RedirectSeed[] = [
  // Restaurantes
  { from: '/mejores-restaurantes-gourmet-en-sitges/', to: '/es/restaurantes/gourmet' },
  { from: '/mejores-restaurantes-de-tapas-en-sitges/', to: '/es/restaurantes/tapas' },
  { from: '/mejores-restaurantes-italianos-en-sitges/', to: '/es/restaurantes/italianos' },
  { from: '/mejores-restaurantes-asiaticos-en-sitges/', to: '/es/restaurantes/asiaticos' },
  { from: '/mejores-restaurantes-de-mariscos-en-sitges/', to: '/es/restaurantes/mariscos' },
  { from: '/mejores-restaurantes-vegetarianos-veganos-en-sitges/', to: '/es/restaurantes/vegetarianos-veganos' },
  { from: '/mejores-restaurantes-vegetarianos-veganos/', to: '/es/restaurantes/vegetarianos-veganos' },
  { from: '/mejores-restaurantes-para-familias-en-sitges/', to: '/es/restaurantes/familiares' },
  { from: '/mejores-restaurantes-economicos-en-sitges/', to: '/es/restaurantes/economicos' },
  { from: '/mejores-restaurantes-de-comida-rapida-en-sitges/', to: '/es/restaurantes/comida-rapida' },
  { from: '/mejores-restaurantes-con-vistas-al-mar-en-sitges/', to: '/es/restaurantes/vistas-al-mar' },
  { from: '/mejores-terrazas-en-sitges/', to: '/es/restaurantes?tag=terraza' },

  // Hoteles
  { from: '/mejores-hoteles-boutique-en-sitges/', to: '/es/hoteles/boutique' },
  { from: '/mejores-hoteles-de-lujo-en-sitges/', to: '/es/hoteles/lujo' },
  { from: '/mejores-hoteles-economicos-en-sitges/', to: '/es/hoteles/economicos' },
  { from: '/mejores-hoteles-familiares-en-sitges/', to: '/es/hoteles/familiares' },
  { from: '/mejores-hoteles-romanticos-en-sitges/', to: '/es/hoteles/romanticos' },
  { from: '/mejores-hoteles-centricos-en-sitges/', to: '/es/hoteles/centricos' },
  { from: '/mejores-hoteles-con-spa-en-sitges/', to: '/es/hoteles/con-spa' },
  { from: '/mejores-hoteles-con-vistas-al-mar-en-sitges/', to: '/es/hoteles/vistas-al-mar' },
  { from: '/mejores-hoteles-todo-incluido-en-sitges/', to: '/es/hoteles/todo-incluido' },

  // Vida nocturna
  { from: '/mejores-bares-en-sitges/', to: '/es/vida-nocturna/bares' },
  { from: '/mejores-bares-de-cocteles-en-sitges/', to: '/es/vida-nocturna/bares-cocteles' },
  { from: '/mejores-bares-de-tapas-en-sitges/', to: '/es/vida-nocturna/bares-tapas' },
  { from: '/mejores-pubs-en-sitges/', to: '/es/vida-nocturna/pubs' },
  { from: '/mejores-discotecas-en-sitges/', to: '/es/vida-nocturna/discotecas' },
  { from: '/mejores-clubs-de-musica-en-vivo-en-sitges/', to: '/es/vida-nocturna/musica-en-vivo' },
  { from: '/mejores-bares-gay-en-sitges/', to: '/es/vida-nocturna/lgbt' },
  { from: '/mejores-eventos-nocturnos-en-sitges/', to: '/es/vida-nocturna/eventos-nocturnos' },

  // Playas
  { from: '/mejores-playas-tranquilas-en-sitges/', to: '/es/playas/tranquilas' },
  { from: '/mejores-playas-familiares-en-sitges/', to: '/es/playas/familiares' },
  { from: '/mejores-playas-para-mascotas-en-sitges/', to: '/es/playas/mascotas' },
  { from: '/playas-con-acceso-para-discapacitados-en-sitges/', to: '/es/playas/accesibles' },
  { from: '/mejores-calas-escondidas-en-sitges/', to: '/es/playas/calas-escondidas' },
  { from: '/mejores-playas-para-hacer-snorkel-en-sitges/', to: '/es/playas/snorkel' },
  { from: '/mejores-playas-para-practicar-deportes-acuaticos-en-sitges/', to: '/es/playas/deportes-acuaticos' },

  // Naturaleza
  { from: '/mejores-excursiones-en-barco-en-sitges/', to: '/es/naturaleza/excursiones-barco' },
  { from: '/mejores-rutas-de-senderismo-en-sitges/', to: '/es/naturaleza/senderismo' },
  { from: '/mejores-rutas-de-ciclismo-en-sitges/', to: '/es/naturaleza/ciclismo' },
  { from: '/mejores-parques-y-jardines-en-sitges/', to: '/es/naturaleza/parques-jardines' },
  { from: '/mejores-sitios-para-deportes-acuaticos-en-sitges/', to: '/es/naturaleza/deportes-acuaticos' },
  { from: '/mejores-campos-de-golf-en-sitges/', to: '/es/naturaleza/golf' },
  { from: '/escalada-en-sitges/', to: '/es/naturaleza/escalada' },
  { from: '/parapente-en-sitges/', to: '/es/naturaleza/parapente' },
  { from: '/paseos-a-caballo-en-sitges/', to: '/es/naturaleza/paseos-caballo' },
  { from: '/mejores-mercados-locales-en-sitges/', to: '/es/naturaleza/mercados-locales' },

  // Tiendas
  { from: '/mejores-tiendas-de-arte-en-sitges/', to: '/es/tiendas/arte' },
  { from: '/mejores-tiendas-de-decoracion-en-sitges/', to: '/es/tiendas/decoracion' },
  { from: '/mejores-tiendas-de-deportes-en-sitges/', to: '/es/tiendas/deportes' },
  { from: '/mejores-tiendas-de-electronica-en-sitges/', to: '/es/tiendas/electronica' },
  { from: '/mejores-librerias-en-sitges/', to: '/es/tiendas/librerias' },
  { from: '/tiendas-de-ropa-en-sitges/', to: '/es/tiendas/ropa' },
  { from: '/tiendas-de-alimentacion-gourmet-en-sitges/', to: '/es/tiendas/alimentacion-gourmet' },
  { from: '/tiendas-de-regalos-y-souvenirs-en-sitges/', to: '/es/tiendas/regalos-souvenirs' },

  // Inmobiliaria
  { from: '/compra-de-viviendas-en-sitges/', to: '/es/inmobiliaria/compra' },
  { from: '/pisos-de-alquiler-en-sitges/', to: '/es/inmobiliaria/alquiler' },
];
