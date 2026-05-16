'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { approveBusiness, rejectBusiness } from '@/app/[locale]/dashboard/admin/actions';

export function ModerationActions({ businessId }: { businessId: string }) {
  const router = useRouter();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();

  function doApprove() {
    startTransition(async () => {
      await approveBusiness(businessId);
      router.refresh();
    });
  }
  function doReject() {
    startTransition(async () => {
      await rejectBusiness(businessId, reason || undefined);
      setShowReject(false);
      setReason('');
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={doApprove}
          disabled={pending}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Aprobar
        </button>
        <button
          type="button"
          onClick={() => setShowReject((s) => !s)}
          disabled={pending}
          className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Rechazar
        </button>
      </div>
      {showReject && (
        <div className="flex w-full max-w-md flex-col gap-2">
          <input
            type="text"
            placeholder="Motivo (se envía por email)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="rounded-md border border-gray-300 px-2 py-1 text-xs"
          />
          <button
            type="button"
            onClick={doReject}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            Confirmar rechazo
          </button>
        </div>
      )}
    </div>
  );
}
