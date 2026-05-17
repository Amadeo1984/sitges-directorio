import type { Plan } from '@prisma/client';

export interface PlanDef {
  key: Plan;
  name: string;
  priceLabel: string; // ej: "Gratis", "19€/mes"
  priceMonthly: number; // EUR, 0 = free
  stripePriceId: string | undefined; // env-based; undefined si no se ofrece online
  highlight?: boolean;
  features: string[];
  notIncluded?: string[];
  ctaLabel: string;
}

const stripePriceFeatured = process.env.STRIPE_PRICE_FEATURED_MONTHLY;
const stripePricePremium = process.env.STRIPE_PRICE_PREMIUM_MONTHLY;

export const PLANS: Record<Plan, PlanDef> = {
  FREE: {
    key: 'FREE',
    name: 'Gratis',
    priceLabel: 'Gratis',
    priceMonthly: 0,
    stripePriceId: undefined,
    features: [
      'Ficha pública con foto, contacto y horarios',
      'Visible en categoría y mapa',
      'Recibe reseñas',
      'Responde a tus clientes',
    ],
    notIncluded: ['Sin destacado', 'Sin estadísticas'],
    ctaLabel: 'Empezar gratis',
  },
  FEATURED: {
    key: 'FEATURED',
    name: 'Destacado',
    priceLabel: '19€/mes',
    priceMonthly: 19,
    stripePriceId: stripePriceFeatured,
    highlight: true,
    features: [
      'Todo lo del plan Gratis',
      'Badge "Destacado" en cards y ficha',
      'Aparece arriba en su categoría',
      'Hasta 10 fotos',
      'Estadísticas mensuales básicas',
    ],
    ctaLabel: 'Destacar mi negocio',
  },
  PREMIUM: {
    key: 'PREMIUM',
    name: 'Premium',
    priceLabel: '49€/mes',
    priceMonthly: 49,
    stripePriceId: stripePricePremium,
    features: [
      'Todo lo del plan Destacado',
      'Logo en la home y rotaciones premium',
      'Hasta 30 fotos + galería destacada',
      'Estadísticas avanzadas',
      'Soporte prioritario',
    ],
    ctaLabel: 'Hazte Premium',
  },
};

export const PLAN_ORDER: Record<Plan, number> = { FREE: 0, FEATURED: 1, PREMIUM: 2 };

export function planFromPriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  if (priceId === stripePriceFeatured) return 'FEATURED';
  if (priceId === stripePricePremium) return 'PREMIUM';
  return null;
}
