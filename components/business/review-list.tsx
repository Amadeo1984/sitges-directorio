import { StarRating } from './star-rating';
import { OwnerReplyForm } from './owner-reply-form';

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  createdAt: Date;
  authorName: string | null;
  reply: string | null;
  replyAt: Date | null;
}

interface Props {
  reviews: ReviewItem[];
  ratingAvg: number | null;
  ratingCount: number;
  canReply: boolean; // viewer es owner
  locale: string;
}

function formatDate(d: Date, locale: string) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(d);
}

export function ReviewList({ reviews, ratingAvg, ratingCount, canReply, locale }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-semibold text-gray-900">
          {ratingAvg ? ratingAvg.toFixed(1) : '—'}
        </div>
        <div>
          <StarRating value={Math.round(ratingAvg ?? 0)} size="md" />
          <div className="text-sm text-gray-500">
            {ratingCount === 0
              ? 'Sin reseñas todavía'
              : `${ratingCount} ${ratingCount === 1 ? 'reseña' : 'reseñas'}`}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {reviews.map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-gray-900">{r.authorName ?? 'Usuario'}</div>
                  <div className="text-xs text-gray-500">{formatDate(r.createdAt, locale)}</div>
                </div>
                <StarRating value={r.rating} size="sm" />
              </div>
              {r.title && <h4 className="mt-2 text-sm font-semibold text-gray-900">{r.title}</h4>}
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">{r.body}</p>

              {r.reply && (
                <div className="mt-3 rounded-md border-l-2 border-brand-300 bg-brand-50/40 p-3 text-sm">
                  <div className="flex items-center gap-2 text-xs text-brand-700">
                    <strong>Respuesta del propietario</strong>
                    {r.replyAt && <span className="text-gray-500">· {formatDate(r.replyAt, locale)}</span>}
                  </div>
                  <p className="mt-1 text-gray-800 whitespace-pre-line">{r.reply}</p>
                </div>
              )}

              {canReply && !r.reply && <OwnerReplyForm reviewId={r.id} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
