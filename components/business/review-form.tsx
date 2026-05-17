'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { StarRating } from './star-rating';
import { submitReview } from '@/app/[locale]/n/[slug]/review-actions';
import type { Locale } from '@prisma/client';

export function ReviewForm({
  businessId,
  locale,
  isLoggedIn,
  loginUrl,
  ownAlready,
  isOwner,
}: {
  businessId: string;
  locale: Locale;
  isLoggedIn: boolean;
  loginUrl: string;
  ownAlready: boolean;
  isOwner: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <p className="text-gray-700">¿Has visitado este negocio? Comparte tu opinión.</p>
        <a
          href={loginUrl}
          className="mt-2 inline-block rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Accede para dejar una reseña
        </a>
      </div>
    );
  }

  if (isOwner) {
    return (
      <p className="text-sm text-gray-500">No puedes dejar una reseña en tu propio negocio.</p>
    );
  }

  if (ownAlready) {
    return (
      <p className="text-sm text-gray-600">Ya has dejado una reseña de este negocio. ¡Gracias!</p>
    );
  }

  if (success) {
    return (
      <div className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        Gracias por tu reseña. Será visible cuando el equipo la apruebe.
      </div>
    );
  }

  return (
    <form
      className="rounded-lg border border-gray-200 bg-white p-4 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (rating < 1) {
          setError('Selecciona una puntuación');
          return;
        }
        startTransition(async () => {
          const result = await submitReview({
            businessId,
            locale,
            input: { rating, title, body },
          });
          if (!result.ok) {
            setError(result.formError ?? Object.values(result.fieldErrors ?? {})[0]?.[0] ?? 'Error');
            return;
          }
          setSuccess(true);
          setRating(0);
          setTitle('');
          setBody('');
          router.refresh();
        });
      }}
    >
      <h3 className="text-base font-semibold text-gray-900">Tu reseña</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700">Puntuación</label>
        <StarRating value={rating} onChange={setRating} size="lg" ariaLabel="Puntuación" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Título <span className="text-xs text-gray-500">(opcional)</span>
        </label>
        <input
          value={title}
          maxLength={120}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-brand-500 focus:outline-hidden"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tu opinión</label>
        <textarea
          value={body}
          required
          rows={4}
          maxLength={2000}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-xs focus:border-brand-500 focus:outline-hidden"
        />
      </div>
      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? 'Enviando…' : 'Enviar reseña'}
      </button>
    </form>
  );
}
