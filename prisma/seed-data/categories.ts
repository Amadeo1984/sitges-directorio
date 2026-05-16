import { Locale } from '@prisma/client';

type Trans = {
  name: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
};

type Translations = Record<Locale, Trans>;

export interface CategorySeed {
  key: string;
  schemaType?: string;
  icon?: string;
  order: number;
  t: Translations;
  children?: CategorySeed[];
}

export const CATEGORIES: CategorySeed[] = [
  {
    key: 'restaurants',
    schemaType: 'Restaurant',
    icon: 'utensils',
    order: 1,
    t: {
      es: {
        name: 'Restaurantes',
        slug: 'restaurantes',
        description:
          'Los mejores restaurantes de Sitges: desde alta cocina mediterránea hasta cocina internacional.',
        seoTitle: 'Mejores restaurantes en Sitges — Guía gastronómica',
        seoDescription:
          'Descubre los mejores restaurantes de Sitges por estilo: gourmet, mediterráneos, tapas, italianos, asiáticos y más.',
      },
      ca: {
        name: 'Restaurants',
        slug: 'restaurants',
        description: 'Els millors restaurants de Sitges, des d’alta cuina fins a cuina internacional.',
        seoTitle: 'Millors restaurants a Sitges — Guia gastronòmica',
        seoDescription: 'Descobreix els millors restaurants de Sitges per estil i ambient.',
      },
      en: {
        name: 'Restaurants',
        slug: 'restaurants',
        description: 'The best restaurants in Sitges: from fine Mediterranean cuisine to international flavors.',
        seoTitle: 'Best restaurants in Sitges — Dining guide',
        seoDescription: 'Find the best restaurants in Sitges by style: gourmet, Mediterranean, tapas, Italian, Asian and more.',
      },
      fr: {
        name: 'Restaurants',
        slug: 'restaurants',
        description: 'Les meilleurs restaurants de Sitges : haute cuisine méditerranéenne et saveurs internationales.',
        seoTitle: 'Meilleurs restaurants à Sitges — Guide gastronomique',
        seoDescription: 'Découvrez les meilleurs restaurants de Sitges par style : gastronomique, méditerranéen, tapas, italien, asiatique.',
      },
    },
    children: [
      {
        key: 'restaurants-gourmet',
        order: 1,
        t: {
          es: { name: 'Gourmet', slug: 'gourmet' },
          ca: { name: 'Gourmet', slug: 'gourmet' },
          en: { name: 'Gourmet', slug: 'gourmet' },
          fr: { name: 'Gastronomique', slug: 'gastronomique' },
        },
      },
      {
        key: 'restaurants-mediterranean',
        order: 2,
        t: {
          es: { name: 'Mediterráneos', slug: 'mediterraneos' },
          ca: { name: 'Mediterranis', slug: 'mediterranis' },
          en: { name: 'Mediterranean', slug: 'mediterranean' },
          fr: { name: 'Méditerranéens', slug: 'mediterraneens' },
        },
      },
      {
        key: 'restaurants-tapas',
        order: 3,
        t: {
          es: { name: 'Tapas', slug: 'tapas' },
          ca: { name: 'Tapes', slug: 'tapes' },
          en: { name: 'Tapas', slug: 'tapas' },
          fr: { name: 'Tapas', slug: 'tapas' },
        },
      },
      {
        key: 'restaurants-italian',
        order: 4,
        t: {
          es: { name: 'Italianos', slug: 'italianos' },
          ca: { name: 'Italians', slug: 'italians' },
          en: { name: 'Italian', slug: 'italian' },
          fr: { name: 'Italiens', slug: 'italiens' },
        },
      },
      {
        key: 'restaurants-asian',
        order: 5,
        t: {
          es: { name: 'Asiáticos', slug: 'asiaticos' },
          ca: { name: 'Asiàtics', slug: 'asiatics' },
          en: { name: 'Asian', slug: 'asian' },
          fr: { name: 'Asiatiques', slug: 'asiatiques' },
        },
      },
      {
        key: 'restaurants-seafood',
        order: 6,
        t: {
          es: { name: 'Marisquerías', slug: 'mariscos' },
          ca: { name: 'Marisqueries', slug: 'marisc' },
          en: { name: 'Seafood', slug: 'seafood' },
          fr: { name: 'Fruits de mer', slug: 'fruits-de-mer' },
        },
      },
      {
        key: 'restaurants-vegan',
        order: 7,
        t: {
          es: { name: 'Vegetarianos y veganos', slug: 'vegetarianos-veganos' },
          ca: { name: 'Vegetarians i vegans', slug: 'vegetarians-vegans' },
          en: { name: 'Vegan & vegetarian', slug: 'vegan-vegetarian' },
          fr: { name: 'Végétariens & végans', slug: 'vegetariens-vegans' },
        },
      },
      {
        key: 'restaurants-family',
        order: 8,
        t: {
          es: { name: 'Familiares', slug: 'familiares' },
          ca: { name: 'Familiars', slug: 'familiars' },
          en: { name: 'Family-friendly', slug: 'family-friendly' },
          fr: { name: 'En famille', slug: 'en-famille' },
        },
      },
      {
        key: 'restaurants-budget',
        order: 9,
        t: {
          es: { name: 'Económicos', slug: 'economicos' },
          ca: { name: 'Econòmics', slug: 'economics' },
          en: { name: 'Budget', slug: 'budget' },
          fr: { name: 'Pas chers', slug: 'pas-chers' },
        },
      },
      {
        key: 'restaurants-fast-food',
        order: 10,
        t: {
          es: { name: 'Comida rápida', slug: 'comida-rapida' },
          ca: { name: 'Menjar ràpid', slug: 'menjar-rapid' },
          en: { name: 'Fast food', slug: 'fast-food' },
          fr: { name: 'Restauration rapide', slug: 'restauration-rapide' },
        },
      },
      {
        key: 'restaurants-seaview',
        order: 11,
        t: {
          es: { name: 'Con vistas al mar', slug: 'vistas-al-mar' },
          ca: { name: 'Amb vistes al mar', slug: 'vistes-al-mar' },
          en: { name: 'With sea views', slug: 'sea-views' },
          fr: { name: 'Avec vue sur la mer', slug: 'vue-sur-mer' },
        },
      },
    ],
  },
  {
    key: 'hotels',
    schemaType: 'LodgingBusiness',
    icon: 'bed',
    order: 2,
    t: {
      es: {
        name: 'Hoteles y alojamiento',
        slug: 'hoteles',
        description: 'Hoteles boutique, de lujo, familiares y económicos en Sitges.',
        seoTitle: 'Hoteles en Sitges — Guía de alojamiento',
      },
      ca: {
        name: 'Hotels i allotjament',
        slug: 'hotels',
        description: 'Hotels boutique, de luxe, familiars i econòmics a Sitges.',
        seoTitle: 'Hotels a Sitges — Guia d’allotjament',
      },
      en: {
        name: 'Hotels & lodging',
        slug: 'hotels',
        description: 'Boutique, luxury, family-friendly and budget hotels in Sitges.',
        seoTitle: 'Hotels in Sitges — Lodging guide',
      },
      fr: {
        name: 'Hôtels & hébergement',
        slug: 'hotels',
        description: 'Hôtels boutique, de luxe, familiaux et abordables à Sitges.',
        seoTitle: 'Hôtels à Sitges — Guide d’hébergement',
      },
    },
    children: [
      {
        key: 'hotels-boutique',
        order: 1,
        t: {
          es: { name: 'Boutique', slug: 'boutique' },
          ca: { name: 'Boutique', slug: 'boutique' },
          en: { name: 'Boutique', slug: 'boutique' },
          fr: { name: 'Boutique', slug: 'boutique' },
        },
      },
      {
        key: 'hotels-luxury',
        order: 2,
        t: {
          es: { name: 'De lujo', slug: 'lujo' },
          ca: { name: 'De luxe', slug: 'luxe' },
          en: { name: 'Luxury', slug: 'luxury' },
          fr: { name: 'De luxe', slug: 'luxe' },
        },
      },
      {
        key: 'hotels-budget',
        order: 3,
        t: {
          es: { name: 'Económicos', slug: 'economicos' },
          ca: { name: 'Econòmics', slug: 'economics' },
          en: { name: 'Budget', slug: 'budget' },
          fr: { name: 'Pas chers', slug: 'pas-chers' },
        },
      },
      {
        key: 'hotels-family',
        order: 4,
        t: {
          es: { name: 'Familiares', slug: 'familiares' },
          ca: { name: 'Familiars', slug: 'familiars' },
          en: { name: 'Family', slug: 'family' },
          fr: { name: 'En famille', slug: 'en-famille' },
        },
      },
      {
        key: 'hotels-romantic',
        order: 5,
        t: {
          es: { name: 'Románticos', slug: 'romanticos' },
          ca: { name: 'Romàntics', slug: 'romantics' },
          en: { name: 'Romantic', slug: 'romantic' },
          fr: { name: 'Romantiques', slug: 'romantiques' },
        },
      },
      {
        key: 'hotels-central',
        order: 6,
        t: {
          es: { name: 'Céntricos', slug: 'centricos' },
          ca: { name: 'Cèntrics', slug: 'centrics' },
          en: { name: 'Central', slug: 'central' },
          fr: { name: 'Centre-ville', slug: 'centre-ville' },
        },
      },
      {
        key: 'hotels-spa',
        order: 7,
        t: {
          es: { name: 'Con spa', slug: 'con-spa' },
          ca: { name: 'Amb spa', slug: 'amb-spa' },
          en: { name: 'With spa', slug: 'with-spa' },
          fr: { name: 'Avec spa', slug: 'avec-spa' },
        },
      },
      {
        key: 'hotels-seaview',
        order: 8,
        t: {
          es: { name: 'Con vistas al mar', slug: 'vistas-al-mar' },
          ca: { name: 'Amb vistes al mar', slug: 'vistes-al-mar' },
          en: { name: 'Sea view', slug: 'sea-view' },
          fr: { name: 'Vue sur la mer', slug: 'vue-sur-mer' },
        },
      },
      {
        key: 'hotels-all-inclusive',
        order: 9,
        t: {
          es: { name: 'Todo incluido', slug: 'todo-incluido' },
          ca: { name: 'Tot inclòs', slug: 'tot-inclos' },
          en: { name: 'All-inclusive', slug: 'all-inclusive' },
          fr: { name: 'Tout compris', slug: 'tout-compris' },
        },
      },
    ],
  },
  {
    key: 'nightlife',
    schemaType: 'BarOrPub',
    icon: 'martini',
    order: 3,
    t: {
      es: {
        name: 'Vida nocturna',
        slug: 'vida-nocturna',
        description: 'Bares, cócteles, discotecas y música en vivo en Sitges.',
        seoTitle: 'Vida nocturna en Sitges — Bares y discotecas',
      },
      ca: {
        name: 'Vida nocturna',
        slug: 'vida-nocturna',
        description: 'Bars, còctels, discoteques i música en directe a Sitges.',
        seoTitle: 'Vida nocturna a Sitges — Bars i discoteques',
      },
      en: {
        name: 'Nightlife',
        slug: 'nightlife',
        description: 'Bars, cocktails, clubs and live music in Sitges.',
        seoTitle: 'Nightlife in Sitges — Bars & clubs',
      },
      fr: {
        name: 'Vie nocturne',
        slug: 'vie-nocturne',
        description: 'Bars, cocktails, discothèques et musique live à Sitges.',
        seoTitle: 'Vie nocturne à Sitges — Bars et clubs',
      },
    },
    children: [
      {
        key: 'nightlife-bars',
        order: 1,
        t: {
          es: { name: 'Bares', slug: 'bares' },
          ca: { name: 'Bars', slug: 'bars' },
          en: { name: 'Bars', slug: 'bars' },
          fr: { name: 'Bars', slug: 'bars' },
        },
      },
      {
        key: 'nightlife-cocktails',
        order: 2,
        t: {
          es: { name: 'Bares de cócteles', slug: 'bares-cocteles' },
          ca: { name: 'Bars de còctels', slug: 'bars-coctels' },
          en: { name: 'Cocktail bars', slug: 'cocktail-bars' },
          fr: { name: 'Bars à cocktails', slug: 'bars-cocktails' },
        },
      },
      {
        key: 'nightlife-tapas-bars',
        order: 3,
        t: {
          es: { name: 'Bares de tapas', slug: 'bares-tapas' },
          ca: { name: 'Bars de tapes', slug: 'bars-tapes' },
          en: { name: 'Tapas bars', slug: 'tapas-bars' },
          fr: { name: 'Bars à tapas', slug: 'bars-tapas' },
        },
      },
      {
        key: 'nightlife-pubs',
        order: 4,
        t: {
          es: { name: 'Pubs', slug: 'pubs' },
          ca: { name: 'Pubs', slug: 'pubs' },
          en: { name: 'Pubs', slug: 'pubs' },
          fr: { name: 'Pubs', slug: 'pubs' },
        },
      },
      {
        key: 'nightlife-clubs',
        schemaType: 'NightClub',
        order: 5,
        t: {
          es: { name: 'Discotecas', slug: 'discotecas' },
          ca: { name: 'Discoteques', slug: 'discoteques' },
          en: { name: 'Clubs', slug: 'clubs' },
          fr: { name: 'Discothèques', slug: 'discotheques' },
        },
      },
      {
        key: 'nightlife-live-music',
        order: 6,
        t: {
          es: { name: 'Música en vivo', slug: 'musica-en-vivo' },
          ca: { name: 'Música en directe', slug: 'musica-en-directe' },
          en: { name: 'Live music', slug: 'live-music' },
          fr: { name: 'Musique live', slug: 'musique-live' },
        },
      },
      {
        key: 'nightlife-lgbt',
        order: 7,
        t: {
          es: { name: 'Bares LGBT+', slug: 'lgbt' },
          ca: { name: 'Bars LGBT+', slug: 'lgbt' },
          en: { name: 'LGBT+ bars', slug: 'lgbt' },
          fr: { name: 'Bars LGBT+', slug: 'lgbt' },
        },
      },
      {
        key: 'nightlife-events',
        order: 8,
        t: {
          es: { name: 'Eventos nocturnos', slug: 'eventos-nocturnos' },
          ca: { name: 'Esdeveniments nocturns', slug: 'esdeveniments-nocturns' },
          en: { name: 'Nightly events', slug: 'nightly-events' },
          fr: { name: 'Événements nocturnes', slug: 'evenements-nocturnes' },
        },
      },
    ],
  },
  {
    key: 'beaches',
    schemaType: 'TouristAttraction',
    icon: 'umbrella',
    order: 4,
    t: {
      es: {
        name: 'Playas y calas',
        slug: 'playas',
        description: 'Playas, calas escondidas y zonas de baño en Sitges.',
        seoTitle: 'Playas en Sitges — Guía de playas y calas',
      },
      ca: {
        name: 'Platges i cales',
        slug: 'platges',
        description: 'Platges, cales amagades i zones de bany a Sitges.',
        seoTitle: 'Platges a Sitges — Guia de platges i cales',
      },
      en: {
        name: 'Beaches & coves',
        slug: 'beaches',
        description: 'Beaches, hidden coves and swimming spots in Sitges.',
        seoTitle: 'Beaches in Sitges — Beach & cove guide',
      },
      fr: {
        name: 'Plages & criques',
        slug: 'plages',
        description: 'Plages, criques cachées et coins baignade à Sitges.',
        seoTitle: 'Plages à Sitges — Guide des plages et criques',
      },
    },
    children: [
      {
        key: 'beaches-quiet',
        order: 1,
        t: {
          es: { name: 'Tranquilas', slug: 'tranquilas' },
          ca: { name: 'Tranquil·les', slug: 'tranquilles' },
          en: { name: 'Quiet', slug: 'quiet' },
          fr: { name: 'Tranquilles', slug: 'tranquilles' },
        },
      },
      {
        key: 'beaches-family',
        order: 2,
        t: {
          es: { name: 'Familiares', slug: 'familiares' },
          ca: { name: 'Familiars', slug: 'familiars' },
          en: { name: 'Family', slug: 'family' },
          fr: { name: 'En famille', slug: 'en-famille' },
        },
      },
      {
        key: 'beaches-pet-friendly',
        order: 3,
        t: {
          es: { name: 'Para mascotas', slug: 'mascotas' },
          ca: { name: 'Per a mascotes', slug: 'mascotes' },
          en: { name: 'Pet-friendly', slug: 'pet-friendly' },
          fr: { name: 'Animaux admis', slug: 'animaux-admis' },
        },
      },
      {
        key: 'beaches-accessible',
        order: 4,
        t: {
          es: { name: 'Accesibles', slug: 'accesibles' },
          ca: { name: 'Accessibles', slug: 'accessibles' },
          en: { name: 'Accessible', slug: 'accessible' },
          fr: { name: 'Accessibles', slug: 'accessibles' },
        },
      },
      {
        key: 'beaches-hidden',
        order: 5,
        t: {
          es: { name: 'Calas escondidas', slug: 'calas-escondidas' },
          ca: { name: 'Cales amagades', slug: 'cales-amagades' },
          en: { name: 'Hidden coves', slug: 'hidden-coves' },
          fr: { name: 'Criques cachées', slug: 'criques-cachees' },
        },
      },
      {
        key: 'beaches-snorkel',
        order: 6,
        t: {
          es: { name: 'Para snorkel', slug: 'snorkel' },
          ca: { name: 'Per a snorkel', slug: 'snorkel' },
          en: { name: 'Snorkeling', slug: 'snorkeling' },
          fr: { name: 'Snorkeling', slug: 'snorkeling' },
        },
      },
      {
        key: 'beaches-watersports',
        order: 7,
        t: {
          es: { name: 'Deportes acuáticos', slug: 'deportes-acuaticos' },
          ca: { name: 'Esports aquàtics', slug: 'esports-aquatics' },
          en: { name: 'Water sports', slug: 'water-sports' },
          fr: { name: 'Sports nautiques', slug: 'sports-nautiques' },
        },
      },
    ],
  },
  {
    key: 'nature',
    schemaType: 'TouristAttraction',
    icon: 'tree',
    order: 5,
    t: {
      es: {
        name: 'Ocio y naturaleza',
        slug: 'naturaleza',
        description: 'Excursiones, senderismo, ciclismo y parques en Sitges.',
        seoTitle: 'Ocio y naturaleza en Sitges',
      },
      ca: {
        name: 'Lleure i natura',
        slug: 'natura',
        description: 'Excursions, senderisme, ciclisme i parcs a Sitges.',
        seoTitle: 'Lleure i natura a Sitges',
      },
      en: {
        name: 'Leisure & nature',
        slug: 'leisure-nature',
        description: 'Tours, hiking, cycling and parks in Sitges.',
        seoTitle: 'Leisure & nature in Sitges',
      },
      fr: {
        name: 'Loisirs & nature',
        slug: 'loisirs-nature',
        description: 'Excursions, randonnée, vélo et parcs à Sitges.',
        seoTitle: 'Loisirs & nature à Sitges',
      },
    },
    children: [
      {
        key: 'nature-boat-tours',
        order: 1,
        t: {
          es: { name: 'Excursiones en barco', slug: 'excursiones-barco' },
          ca: { name: 'Excursions en vaixell', slug: 'excursions-vaixell' },
          en: { name: 'Boat tours', slug: 'boat-tours' },
          fr: { name: 'Excursions en bateau', slug: 'excursions-bateau' },
        },
      },
      {
        key: 'nature-hiking',
        order: 2,
        t: {
          es: { name: 'Senderismo', slug: 'senderismo' },
          ca: { name: 'Senderisme', slug: 'senderisme' },
          en: { name: 'Hiking', slug: 'hiking' },
          fr: { name: 'Randonnée', slug: 'randonnee' },
        },
      },
      {
        key: 'nature-cycling',
        order: 3,
        t: {
          es: { name: 'Ciclismo', slug: 'ciclismo' },
          ca: { name: 'Ciclisme', slug: 'ciclisme' },
          en: { name: 'Cycling', slug: 'cycling' },
          fr: { name: 'Cyclisme', slug: 'cyclisme' },
        },
      },
      {
        key: 'nature-parks',
        order: 4,
        t: {
          es: { name: 'Parques y jardines', slug: 'parques-jardines' },
          ca: { name: 'Parcs i jardins', slug: 'parcs-jardins' },
          en: { name: 'Parks & gardens', slug: 'parks-gardens' },
          fr: { name: 'Parcs et jardins', slug: 'parcs-jardins' },
        },
      },
      {
        key: 'nature-watersports-spots',
        order: 5,
        t: {
          es: { name: 'Deportes acuáticos', slug: 'deportes-acuaticos' },
          ca: { name: 'Esports aquàtics', slug: 'esports-aquatics' },
          en: { name: 'Water sports spots', slug: 'water-sports-spots' },
          fr: { name: 'Sports nautiques', slug: 'sports-nautiques' },
        },
      },
    ],
  },
  {
    key: 'services',
    schemaType: 'LocalBusiness',
    icon: 'briefcase',
    order: 6,
    t: {
      es: {
        name: 'Servicios',
        slug: 'servicios',
        description: 'Profesionales locales: salud, belleza, hogar, educación, marketing y seguridad.',
        seoTitle: 'Servicios profesionales en Sitges',
      },
      ca: {
        name: 'Serveis',
        slug: 'serveis',
        description: 'Professionals locals: salut, bellesa, llar, educació, màrqueting i seguretat.',
        seoTitle: 'Serveis professionals a Sitges',
      },
      en: {
        name: 'Services',
        slug: 'services',
        description: 'Local professionals: health, beauty, home, education, marketing and security.',
        seoTitle: 'Local services in Sitges',
      },
      fr: {
        name: 'Services',
        slug: 'services',
        description: 'Professionnels locaux : santé, beauté, maison, éducation, marketing et sécurité.',
        seoTitle: 'Services professionnels à Sitges',
      },
    },
    children: [
      {
        key: 'services-health',
        schemaType: 'MedicalBusiness',
        order: 1,
        t: {
          es: { name: 'Salud', slug: 'salud' },
          ca: { name: 'Salut', slug: 'salut' },
          en: { name: 'Health', slug: 'health' },
          fr: { name: 'Santé', slug: 'sante' },
        },
      },
      {
        key: 'services-beauty',
        schemaType: 'BeautySalon',
        order: 2,
        t: {
          es: { name: 'Belleza', slug: 'belleza' },
          ca: { name: 'Bellesa', slug: 'bellesa' },
          en: { name: 'Beauty', slug: 'beauty' },
          fr: { name: 'Beauté', slug: 'beaute' },
        },
      },
      {
        key: 'services-home',
        schemaType: 'HomeAndConstructionBusiness',
        order: 3,
        t: {
          es: { name: 'Hogar', slug: 'hogar' },
          ca: { name: 'Llar', slug: 'llar' },
          en: { name: 'Home', slug: 'home' },
          fr: { name: 'Maison', slug: 'maison' },
        },
      },
      {
        key: 'services-education',
        schemaType: 'EducationalOrganization',
        order: 4,
        t: {
          es: { name: 'Educación', slug: 'educacion' },
          ca: { name: 'Educació', slug: 'educacio' },
          en: { name: 'Education', slug: 'education' },
          fr: { name: 'Éducation', slug: 'education' },
        },
      },
      {
        key: 'services-marketing',
        order: 5,
        t: {
          es: { name: 'Marketing', slug: 'marketing' },
          ca: { name: 'Màrqueting', slug: 'marqueting' },
          en: { name: 'Marketing', slug: 'marketing' },
          fr: { name: 'Marketing', slug: 'marketing' },
        },
      },
      {
        key: 'services-security',
        order: 6,
        t: {
          es: { name: 'Seguridad', slug: 'seguridad' },
          ca: { name: 'Seguretat', slug: 'seguretat' },
          en: { name: 'Security', slug: 'security' },
          fr: { name: 'Sécurité', slug: 'securite' },
        },
      },
    ],
  },
];
