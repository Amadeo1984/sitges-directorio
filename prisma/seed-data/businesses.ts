import { Locale, PriceRange } from '@prisma/client';

interface Hour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  note?: string;
}

interface BusinessSeed {
  key: string;
  categoryKey: string;
  phone?: string;
  website?: string;
  address?: string;
  district?: string;
  lat: number;
  lng: number;
  priceRange?: PriceRange;
  amenities?: string[];
  paymentMethods?: string[];
  ratingAvg?: number;
  ratingCount?: number;
  featured?: boolean;
  tags?: string[];
  hours?: Hour[];
  t: Record<
    Locale,
    {
      slug: string;
      name: string;
      shortDescription?: string;
      description?: string;
      seoTitle?: string;
      seoDescription?: string;
    }
  >;
}

const dailyHours = (open: string, close: string): Hour[] =>
  [0, 1, 2, 3, 4, 5, 6].map((d) => ({ dayOfWeek: d, openTime: open, closeTime: close }));

export const BUSINESSES: BusinessSeed[] = [
  // ===== Restaurantes =====
  {
    key: 'demo-villa-marina',
    categoryKey: 'restaurants-gourmet',
    phone: '+34 938 941 530',
    address: 'Passeig de la Ribera, 12',
    district: 'Centro',
    lat: 41.2362,
    lng: 1.8138,
    priceRange: PriceRange.HIGH,
    amenities: ['terraza', 'wifi', 'reserva-online'],
    paymentMethods: ['Visa', 'Mastercard', 'Amex', 'Efectivo'],
    ratingAvg: 4.6,
    ratingCount: 312,
    featured: true,
    tags: ['terraza', 'vistas-mar', 'reserva-online'],
    hours: dailyHours('13:00', '23:30'),
    t: {
      es: {
        slug: 'villa-marina-sitges',
        name: 'Villa Marina',
        shortDescription: 'Cocina mediterránea de autor frente al paseo marítimo.',
        description:
          'Restaurante elegante con terraza al paseo. Carta de pescados y mariscos del día, arroces y propuestas de temporada. Ideal para cenas con vistas.',
      },
      ca: {
        slug: 'villa-marina-sitges',
        name: 'Villa Marina',
        shortDescription: "Cuina mediterrània d'autor davant del passeig marítim.",
        description:
          'Restaurant elegant amb terrassa al passeig. Carta de peixos i marisc del dia, arrossos i propostes de temporada.',
      },
      en: {
        slug: 'villa-marina-sitges',
        name: 'Villa Marina',
        shortDescription: 'Signature Mediterranean cuisine on the seafront.',
        description:
          'Elegant restaurant with seafront terrace. Daily fresh fish and seafood, rice dishes and seasonal menus.',
      },
      fr: {
        slug: 'villa-marina-sitges',
        name: 'Villa Marina',
        shortDescription: "Cuisine méditerranéenne d'auteur face à la mer.",
        description:
          'Restaurant élégant avec terrasse sur le front de mer. Poissons et fruits de mer du jour, riz et menus saisonniers.',
      },
    },
  },
  {
    key: 'demo-bon-estar',
    categoryKey: 'restaurants-mediterranean',
    phone: '+34 938 110 245',
    address: "Carrer Bonaire, 24",
    district: 'Casco antiguo',
    lat: 41.2356,
    lng: 1.8112,
    priceRange: PriceRange.MID,
    amenities: ['terraza', 'wifi'],
    ratingAvg: 4.4,
    ratingCount: 186,
    tags: ['terraza'],
    hours: dailyHours('13:00', '23:00'),
    t: {
      es: {
        slug: 'sitges-bon-estar',
        name: 'Sitges Bon Estar',
        shortDescription: 'Cocina mediterránea con productos frescos y de proximidad.',
      },
      ca: {
        slug: 'sitges-bon-estar',
        name: 'Sitges Bon Estar',
        shortDescription: 'Cuina mediterrània amb productes frescos i de proximitat.',
      },
      en: {
        slug: 'sitges-bon-estar',
        name: 'Sitges Bon Estar',
        shortDescription: 'Mediterranean cuisine with fresh, local ingredients.',
      },
      fr: {
        slug: 'sitges-bon-estar',
        name: 'Sitges Bon Estar',
        shortDescription: 'Cuisine méditerranéenne avec produits frais et locaux.',
      },
    },
  },
  {
    key: 'demo-casa-raimundo',
    categoryKey: 'restaurants-mediterranean',
    phone: '+34 938 940 200',
    address: 'Carrer Sant Pere, 14',
    district: 'Casco antiguo',
    lat: 41.2378,
    lng: 1.8101,
    priceRange: PriceRange.MID,
    amenities: ['wifi'],
    ratingAvg: 4.5,
    ratingCount: 224,
    hours: dailyHours('13:00', '16:00'),
    t: {
      es: {
        slug: 'casa-raimundo',
        name: 'Casa Raimundo',
        shortDescription: 'Tradición y autenticidad española en pleno casco antiguo.',
      },
      ca: { slug: 'casa-raimundo', name: 'Casa Raimundo', shortDescription: 'Tradició i autenticitat al casc antic.' },
      en: { slug: 'casa-raimundo', name: 'Casa Raimundo', shortDescription: 'Spanish tradition in the old town.' },
      fr: { slug: 'casa-raimundo', name: 'Casa Raimundo', shortDescription: 'Tradition espagnole au cœur de la vieille ville.' },
    },
  },
  {
    key: 'demo-tapas-major',
    categoryKey: 'restaurants-tapas',
    address: 'Carrer Major, 17',
    district: 'Centro',
    lat: 41.2369,
    lng: 1.8118,
    priceRange: PriceRange.MID,
    amenities: ['terraza', 'wifi'],
    ratingAvg: 4.3,
    ratingCount: 410,
    tags: ['terraza'],
    hours: dailyHours('12:00', '23:30'),
    t: {
      es: { slug: 'tapas-major-17', name: 'Tapas Major 17', shortDescription: 'Tapas tradicionales y de autor en la calle Major.' },
      ca: { slug: 'tapes-major-17', name: 'Tapes Major 17', shortDescription: 'Tapes tradicionals i d\'autor al carrer Major.' },
      en: { slug: 'tapas-major-17', name: 'Tapas Major 17', shortDescription: 'Classic and creative tapas on Carrer Major.' },
      fr: { slug: 'tapas-major-17', name: 'Tapas Major 17', shortDescription: 'Tapas classiques et créatives rue Major.' },
    },
  },
  {
    key: 'demo-il-vesuvio',
    categoryKey: 'restaurants-italian',
    address: 'Passeig de la Ribera, 35',
    district: 'Paseo',
    lat: 41.2358,
    lng: 1.8145,
    priceRange: PriceRange.MID,
    amenities: ['terraza'],
    ratingAvg: 4.2,
    ratingCount: 198,
    tags: ['terraza', 'vistas-mar'],
    hours: dailyHours('12:30', '23:30'),
    t: {
      es: { slug: 'il-vesuvio', name: 'Il Vesuvio', shortDescription: 'Pizzas al horno de leña y pastas frescas.' },
      ca: { slug: 'il-vesuvio', name: 'Il Vesuvio', shortDescription: 'Pizzes al forn de llenya i pastes fresques.' },
      en: { slug: 'il-vesuvio', name: 'Il Vesuvio', shortDescription: 'Wood-fired pizzas and fresh pastas.' },
      fr: { slug: 'il-vesuvio', name: 'Il Vesuvio', shortDescription: 'Pizzas au feu de bois et pâtes fraîches.' },
    },
  },
  {
    key: 'demo-sakana',
    categoryKey: 'restaurants-asian',
    address: 'Carrer Espalter, 8',
    district: 'Centro',
    lat: 41.2372,
    lng: 1.8128,
    priceRange: PriceRange.MID,
    amenities: ['wifi'],
    ratingAvg: 4.4,
    ratingCount: 156,
    hours: dailyHours('13:00', '23:00'),
    t: {
      es: { slug: 'sakana-sitges', name: 'Sakana', shortDescription: 'Sushi y cocina japonesa contemporánea.' },
      ca: { slug: 'sakana-sitges', name: 'Sakana', shortDescription: 'Sushi i cuina japonesa contemporània.' },
      en: { slug: 'sakana-sitges', name: 'Sakana', shortDescription: 'Sushi and contemporary Japanese cuisine.' },
      fr: { slug: 'sakana-sitges', name: 'Sakana', shortDescription: 'Sushi et cuisine japonaise contemporaine.' },
    },
  },
  {
    key: 'demo-la-llonja',
    categoryKey: 'restaurants-seafood',
    address: 'Passeig Marítim, 22',
    district: 'Paseo',
    lat: 41.2351,
    lng: 1.8155,
    priceRange: PriceRange.HIGH,
    amenities: ['terraza', 'reserva-online'],
    ratingAvg: 4.5,
    ratingCount: 287,
    tags: ['terraza', 'vistas-mar'],
    featured: true,
    hours: dailyHours('13:00', '23:30'),
    t: {
      es: { slug: 'la-llonja', name: 'La Llonja', shortDescription: 'Mariscos y pescado fresco del Mediterráneo.' },
      ca: { slug: 'la-llonja', name: 'La Llonja', shortDescription: 'Marisc i peix fresc del Mediterrani.' },
      en: { slug: 'la-llonja', name: 'La Llonja', shortDescription: 'Mediterranean seafood and fresh fish.' },
      fr: { slug: 'la-llonja', name: 'La Llonja', shortDescription: 'Fruits de mer et poisson frais de la Méditerranée.' },
    },
  },
  {
    key: 'demo-verde-sitges',
    categoryKey: 'restaurants-vegan',
    address: 'Carrer Parellades, 18',
    district: 'Centro',
    lat: 41.2371,
    lng: 1.8120,
    priceRange: PriceRange.MID,
    amenities: ['wifi'],
    ratingAvg: 4.6,
    ratingCount: 142,
    tags: ['take-away', 'delivery'],
    hours: dailyHours('12:00', '22:00'),
    t: {
      es: { slug: 'verde-sitges', name: 'Verde Sitges', shortDescription: 'Cocina vegana creativa con producto local.' },
      ca: { slug: 'verde-sitges', name: 'Verde Sitges', shortDescription: 'Cuina vegana creativa amb producte local.' },
      en: { slug: 'verde-sitges', name: 'Verde Sitges', shortDescription: 'Creative vegan cuisine with local produce.' },
      fr: { slug: 'verde-sitges', name: 'Verde Sitges', shortDescription: 'Cuisine végane créative avec produits locaux.' },
    },
  },

  // ===== Hoteles =====
  {
    key: 'demo-divino-hotel',
    categoryKey: 'hotels-boutique',
    phone: '+34 938 940 100',
    address: 'Carrer de Jesús, 13',
    district: 'Casco antiguo',
    lat: 41.2375,
    lng: 1.8108,
    priceRange: PriceRange.HIGH,
    amenities: ['wifi', 'parking', 'reserva-online'],
    ratingAvg: 4.7,
    ratingCount: 254,
    featured: true,
    tags: ['reserva-online', 'parking'],
    t: {
      es: {
        slug: 'divino-hotel-sitges',
        name: 'Divino Hotel Sitges',
        shortDescription: 'Hotel boutique con encanto en el casco antiguo.',
      },
      ca: { slug: 'divino-hotel-sitges', name: 'Divino Hotel Sitges', shortDescription: 'Hotel boutique amb encant al casc antic.' },
      en: { slug: 'divino-hotel-sitges', name: 'Divino Hotel Sitges', shortDescription: 'Charming boutique hotel in the old town.' },
      fr: { slug: 'divino-hotel-sitges', name: 'Divino Hotel Sitges', shortDescription: 'Hôtel boutique de charme dans la vieille ville.' },
    },
  },
  {
    key: 'demo-urh-sitges',
    categoryKey: 'hotels-all-inclusive',
    phone: '+34 938 944 100',
    address: 'Av. Sofía, 12',
    district: 'Aiguadolç',
    lat: 41.2299,
    lng: 1.8228,
    priceRange: PriceRange.HIGH,
    amenities: ['wifi', 'parking', 'spa'],
    ratingAvg: 4.3,
    ratingCount: 612,
    tags: ['vistas-mar', 'parking'],
    t: {
      es: { slug: 'urh-sitges-playa', name: 'URH Sitges Playa', shortDescription: 'Hotel frente al mar con todo incluido.' },
      ca: { slug: 'urh-sitges-playa', name: 'URH Sitges Playa', shortDescription: "Hotel davant del mar amb tot inclòs." },
      en: { slug: 'urh-sitges-playa', name: 'URH Sitges Playa', shortDescription: 'Beachfront all-inclusive hotel.' },
      fr: { slug: 'urh-sitges-playa', name: 'URH Sitges Playa', shortDescription: 'Hôtel en bord de mer tout compris.' },
    },
  },
  {
    key: 'demo-port-sitges-hotel',
    categoryKey: 'hotels-seaview',
    phone: '+34 938 947 100',
    address: 'Port d\'Aiguadolç, s/n',
    district: 'Aiguadolç',
    lat: 41.2289,
    lng: 1.8265,
    priceRange: PriceRange.HIGH,
    amenities: ['wifi', 'parking', 'pool'],
    ratingAvg: 4.4,
    ratingCount: 487,
    tags: ['vistas-mar', 'parking', 'reserva-online'],
    t: {
      es: { slug: 'port-sitges-hotel', name: 'Port Sitges Hotel', shortDescription: 'Habitaciones con vista al puerto deportivo.' },
      ca: { slug: 'port-sitges-hotel', name: 'Port Sitges Hotel', shortDescription: 'Habitacions amb vista al port esportiu.' },
      en: { slug: 'port-sitges-hotel', name: 'Port Sitges Hotel', shortDescription: 'Rooms overlooking the marina.' },
      fr: { slug: 'port-sitges-hotel', name: 'Port Sitges Hotel', shortDescription: 'Chambres avec vue sur le port de plaisance.' },
    },
  },
  {
    key: 'demo-melia-sitges',
    categoryKey: 'hotels-luxury',
    phone: '+34 938 110 811',
    address: 'Carrer de Joan Salvat Papasseit, 38',
    district: 'Aiguadolç',
    lat: 41.2305,
    lng: 1.8240,
    priceRange: PriceRange.LUXURY,
    amenities: ['wifi', 'parking', 'pool', 'spa', 'gym'],
    ratingAvg: 4.5,
    ratingCount: 1240,
    featured: true,
    tags: ['vistas-mar', 'parking', 'reserva-online'],
    t: {
      es: { slug: 'gran-hotel-mar', name: 'Gran Hotel Mar', shortDescription: 'Hotel 5★ con vistas al Mediterráneo y spa.' },
      ca: { slug: 'gran-hotel-mar', name: 'Gran Hotel Mar', shortDescription: 'Hotel 5★ amb vistes al Mediterrani i spa.' },
      en: { slug: 'gran-hotel-mar', name: 'Gran Hotel Mar', shortDescription: '5★ hotel with Mediterranean views and spa.' },
      fr: { slug: 'gran-hotel-mar', name: 'Gran Hotel Mar', shortDescription: 'Hôtel 5★ avec vue sur la Méditerranée et spa.' },
    },
  },

  // ===== Vida nocturna =====
  {
    key: 'demo-pacific-bar',
    categoryKey: 'nightlife-cocktails',
    address: 'Carrer Primer de Maig, 5',
    district: 'Centro',
    lat: 41.2367,
    lng: 1.8123,
    priceRange: PriceRange.MID,
    amenities: ['terraza'],
    ratingAvg: 4.4,
    ratingCount: 178,
    tags: ['terraza', 'lgbt-friendly'],
    hours: [
      { dayOfWeek: 4, openTime: '20:00', closeTime: '02:30' },
      { dayOfWeek: 5, openTime: '20:00', closeTime: '03:00' },
      { dayOfWeek: 6, openTime: '20:00', closeTime: '03:00' },
    ],
    t: {
      es: { slug: 'pacific-bar', name: 'Pacific Bar', shortDescription: 'Cócteles de autor en el centro.' },
      ca: { slug: 'pacific-bar', name: 'Pacific Bar', shortDescription: "Còctels d'autor al centre." },
      en: { slug: 'pacific-bar', name: 'Pacific Bar', shortDescription: 'Signature cocktails in the centre.' },
      fr: { slug: 'pacific-bar', name: 'Pacific Bar', shortDescription: "Cocktails d'auteur au centre." },
    },
  },
  {
    key: 'demo-pacha-sitges',
    categoryKey: 'nightlife-clubs',
    address: 'Passeig de la Ribera, 38',
    district: 'Paseo',
    lat: 41.2354,
    lng: 1.8150,
    priceRange: PriceRange.HIGH,
    ratingAvg: 4.0,
    ratingCount: 320,
    tags: ['lgbt-friendly'],
    hours: [
      { dayOfWeek: 5, openTime: '00:00', closeTime: '06:00' },
      { dayOfWeek: 6, openTime: '00:00', closeTime: '06:00' },
    ],
    t: {
      es: { slug: 'club-marina', name: 'Club Marina', shortDescription: 'Discoteca de referencia en Sitges.' },
      ca: { slug: 'club-marina', name: 'Club Marina', shortDescription: 'Discoteca de referència a Sitges.' },
      en: { slug: 'club-marina', name: 'Club Marina', shortDescription: 'Iconic Sitges nightclub.' },
      fr: { slug: 'club-marina', name: 'Club Marina', shortDescription: 'Discothèque emblématique de Sitges.' },
    },
  },
  {
    key: 'demo-parrots-pub',
    categoryKey: 'nightlife-lgbt',
    address: "Plaça Indústria, 2",
    district: 'Centro',
    lat: 41.2375,
    lng: 1.8124,
    priceRange: PriceRange.MID,
    amenities: ['terraza'],
    ratingAvg: 4.5,
    ratingCount: 412,
    tags: ['terraza', 'lgbt-friendly'],
    featured: true,
    t: {
      es: { slug: 'parrots-pub', name: 'Parrot\'s Pub', shortDescription: 'Bar LGBT+ icónico con terraza.' },
      ca: { slug: 'parrots-pub', name: "Parrot's Pub", shortDescription: 'Bar LGBT+ icònic amb terrassa.' },
      en: { slug: 'parrots-pub', name: "Parrot's Pub", shortDescription: 'Iconic LGBT+ bar with terrace.' },
      fr: { slug: 'parrots-pub', name: "Parrot's Pub", shortDescription: 'Bar LGBT+ emblématique avec terrasse.' },
    },
  },

  // ===== Playas =====
  {
    key: 'demo-playa-san-sebastian',
    categoryKey: 'beaches-family',
    address: "Platja Sant Sebastià",
    district: 'San Sebastián',
    lat: 41.2360,
    lng: 1.8175,
    amenities: ['accesible', 'duchas', 'socorrista'],
    ratingAvg: 4.5,
    ratingCount: 980,
    tags: ['accesible'],
    t: {
      es: { slug: 'playa-san-sebastian', name: 'Playa San Sebastián', shortDescription: 'Playa familiar en el casco antiguo, con paseo y servicios.' },
      ca: { slug: 'platja-sant-sebastia', name: 'Platja Sant Sebastià', shortDescription: 'Platja familiar al casc antic, amb passeig i serveis.' },
      en: { slug: 'sant-sebastia-beach', name: 'Sant Sebastià Beach', shortDescription: 'Family beach in the old town, with promenade and services.' },
      fr: { slug: 'plage-sant-sebastia', name: 'Plage Sant Sebastià', shortDescription: 'Plage familiale dans la vieille ville, avec promenade et services.' },
    },
  },
  {
    key: 'demo-playa-balmins',
    categoryKey: 'beaches-quiet',
    address: 'Platja dels Balmins',
    district: 'Balmins',
    lat: 41.2335,
    lng: 1.8220,
    ratingAvg: 4.6,
    ratingCount: 620,
    tags: ['lgbt-friendly'],
    t: {
      es: { slug: 'playa-balmins', name: 'Playa de los Balmins', shortDescription: 'Cala tranquila y nudista entre el centro y el puerto.' },
      ca: { slug: 'platja-balmins', name: 'Platja dels Balmins', shortDescription: 'Cala tranquil·la i nudista entre el centre i el port.' },
      en: { slug: 'balmins-beach', name: 'Balmins Beach', shortDescription: 'Quiet, clothing-optional cove between centre and marina.' },
      fr: { slug: 'plage-balmins', name: 'Plage Balmins', shortDescription: 'Crique tranquille et naturiste entre le centre et le port.' },
    },
  },

  // ===== Naturaleza =====
  {
    key: 'demo-garraf-hiking',
    categoryKey: 'nature-hiking',
    address: 'Parc Natural del Garraf',
    district: 'Garraf',
    lat: 41.2700,
    lng: 1.8400,
    ratingAvg: 4.7,
    ratingCount: 432,
    t: {
      es: { slug: 'ruta-garraf', name: 'Ruta Parc del Garraf', shortDescription: 'Sendero por el parque natural con vistas al Mediterráneo.' },
      ca: { slug: 'ruta-garraf', name: 'Ruta Parc del Garraf', shortDescription: 'Sender pel parc natural amb vistes al Mediterrani.' },
      en: { slug: 'garraf-hike', name: 'Garraf Park Hike', shortDescription: 'Trail through the natural park with Mediterranean views.' },
      fr: { slug: 'rando-garraf', name: 'Randonnée Garraf', shortDescription: 'Sentier dans le parc naturel avec vue sur la Méditerranée.' },
    },
  },
  {
    key: 'demo-sitges-by-boat',
    categoryKey: 'nature-boat-tours',
    address: 'Port d\'Aiguadolç',
    district: 'Aiguadolç',
    lat: 41.2293,
    lng: 1.8270,
    priceRange: PriceRange.MID,
    ratingAvg: 4.6,
    ratingCount: 245,
    tags: ['reserva-online'],
    t: {
      es: { slug: 'sitges-by-boat', name: 'Sitges by Boat', shortDescription: 'Excursiones en velero con avistamiento de delfines.' },
      ca: { slug: 'sitges-by-boat', name: 'Sitges by Boat', shortDescription: 'Excursions en veler amb avistament de dofins.' },
      en: { slug: 'sitges-by-boat', name: 'Sitges by Boat', shortDescription: 'Sailing tours with dolphin watching.' },
      fr: { slug: 'sitges-by-boat', name: 'Sitges by Boat', shortDescription: 'Excursions en voilier avec observation des dauphins.' },
    },
  },
];
