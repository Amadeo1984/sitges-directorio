import 'server-only';
import { db } from './db';

/**
 * Recalcula ratingAvg y ratingCount de un Business desde sus reviews APROBADAS
 * y los persiste denormalizados (lecturas en cards/cabeceras sin JOIN).
 * Devuelve el snapshot final.
 */
export async function recalcBusinessRating(businessId: string) {
  const agg = await db.review.aggregate({
    where: { businessId, status: 'APPROVED' },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const ratingAvg = agg._avg.rating ?? null;
  const ratingCount = agg._count._all;

  await db.business.update({
    where: { id: businessId },
    data: { ratingAvg, ratingCount },
  });

  return { ratingAvg, ratingCount };
}
