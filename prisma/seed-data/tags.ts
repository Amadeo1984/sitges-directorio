import { Locale } from '@prisma/client';

interface TagSeed {
  key: string;
  t: Record<Locale, { name: string; slug: string }>;
}

export const TAGS: TagSeed[] = [
  {
    key: 'terraza',
    t: {
      es: { name: 'Terraza', slug: 'terraza' },
      ca: { name: 'Terrassa', slug: 'terrassa' },
      en: { name: 'Terrace', slug: 'terrace' },
      fr: { name: 'Terrasse', slug: 'terrasse' },
    },
  },
  {
    key: 'pet-friendly',
    t: {
      es: { name: 'Pet friendly', slug: 'pet-friendly' },
      ca: { name: 'Admet mascotes', slug: 'admet-mascotes' },
      en: { name: 'Pet-friendly', slug: 'pet-friendly' },
      fr: { name: 'Animaux admis', slug: 'animaux-admis' },
    },
  },
  {
    key: 'accesible',
    t: {
      es: { name: 'Accesible', slug: 'accesible' },
      ca: { name: 'Accessible', slug: 'accessible' },
      en: { name: 'Accessible', slug: 'accessible' },
      fr: { name: 'Accessible', slug: 'accessible' },
    },
  },
  {
    key: 'vistas-mar',
    t: {
      es: { name: 'Vistas al mar', slug: 'vistas-mar' },
      ca: { name: 'Vistes al mar', slug: 'vistes-mar' },
      en: { name: 'Sea views', slug: 'sea-views' },
      fr: { name: 'Vue sur la mer', slug: 'vue-mer' },
    },
  },
  {
    key: 'lgbt-friendly',
    t: {
      es: { name: 'LGBT friendly', slug: 'lgbt-friendly' },
      ca: { name: 'LGBT friendly', slug: 'lgbt-friendly' },
      en: { name: 'LGBT friendly', slug: 'lgbt-friendly' },
      fr: { name: 'LGBT friendly', slug: 'lgbt-friendly' },
    },
  },
  {
    key: 'reserva-online',
    t: {
      es: { name: 'Reserva online', slug: 'reserva-online' },
      ca: { name: 'Reserva online', slug: 'reserva-online' },
      en: { name: 'Online booking', slug: 'online-booking' },
      fr: { name: 'Réservation en ligne', slug: 'reservation-en-ligne' },
    },
  },
  {
    key: 'parking',
    t: {
      es: { name: 'Parking', slug: 'parking' },
      ca: { name: 'Aparcament', slug: 'aparcament' },
      en: { name: 'Parking', slug: 'parking' },
      fr: { name: 'Parking', slug: 'parking' },
    },
  },
  {
    key: 'wifi',
    t: {
      es: { name: 'WiFi gratuito', slug: 'wifi' },
      ca: { name: 'WiFi gratuït', slug: 'wifi' },
      en: { name: 'Free WiFi', slug: 'wifi' },
      fr: { name: 'WiFi gratuit', slug: 'wifi' },
    },
  },
  {
    key: 'delivery',
    t: {
      es: { name: 'Entrega a domicilio', slug: 'delivery' },
      ca: { name: 'Lliurament a domicili', slug: 'lliurament' },
      en: { name: 'Delivery', slug: 'delivery' },
      fr: { name: 'Livraison', slug: 'livraison' },
    },
  },
  {
    key: 'take-away',
    t: {
      es: { name: 'Para llevar', slug: 'take-away' },
      ca: { name: 'Per emportar', slug: 'per-emportar' },
      en: { name: 'Take away', slug: 'take-away' },
      fr: { name: 'À emporter', slug: 'a-emporter' },
    },
  },
];
