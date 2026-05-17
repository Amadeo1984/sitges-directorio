'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { replyToReview } from '@/app/[locale]/n/[slug]/review-actions';

export function OwnerReplyForm({ reviewId }: { reviewId: string }) {
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-medium text-brand-700 hover:underline"
      >
        Responder como propietario
      </button>
    );
  }

  return (
    <form
      className="mt-2 space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const r = await replyToReview(reviewId, reply);
          if (!r.ok) {
            setError(r.formError ?? 'No se pudo enviar la respuesta.');
            return;
          }
          setOpen(false);
          setReply('');
          router.refresh();
        });
      }}
    >
      <textarea
        value={reply}
        required
        rows={3}
        maxLength={1500}
        placeholder="Gracias por tu reseña…"
        onChange={(e) => setReply(e.target.value)}
        className="block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-brand-500 focus:outline-hidden"
      />
      {error && <div className="text-xs text-red-700">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? 'Enviando…' : 'Publicar respuesta'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-gray-300 px-3 py-1 text-xs text-gray-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
