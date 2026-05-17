'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveReview, rejectReview } from '@/app/[locale]/n/[slug]/review-actions';

export function ReviewModerationActions({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await approveReview(reviewId);
            router.refresh();
          });
        }}
        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        Aprobar
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          startTransition(async () => {
            await rejectReview(reviewId);
            router.refresh();
          });
        }}
        className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
      >
        Rechazar
      </button>
    </div>
  );
}
