import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { db } from '@/lib/db';
import { ReviewModerationActions } from '@/components/dashboard/review-moderation-actions';
import { StarRating } from '@/components/business/star-rating';
import type { Locale } from '@/i18n/config';

export default async function ReviewsModerationPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await requireAdmin();

  const items = await db.review.findMany({
    where: { status: 'PENDING' },
    include: {
      user: { select: { name: true, email: true } },
      business: {
        select: {
          translations: { where: { locale }, select: { slug: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Reseñas pendientes</h1>
        <p className="mt-1 text-sm text-gray-600">Aprueba o rechaza las reseñas enviadas por usuarios.</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          Cola vacía. 🌟
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => {
            const bt = r.business.translations[0];
            return (
              <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <StarRating value={r.rating} size="sm" />
                      <span className="text-sm font-medium text-gray-900">{r.user.name ?? r.user.email}</span>
                      <span className="text-xs text-gray-500">{r.user.email}</span>
                    </div>
                    {r.title && <h3 className="mt-2 text-sm font-semibold text-gray-900">{r.title}</h3>}
                    <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{r.body}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      Sobre:{' '}
                      <Link
                        href={`/${locale}/n/${bt?.slug ?? ''}`}
                        className="text-brand-700 hover:underline"
                      >
                        {bt?.name ?? '(negocio sin slug en este idioma)'}
                      </Link>
                    </div>
                  </div>
                  <ReviewModerationActions reviewId={r.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
