'use client';

import { useState, useTransition } from 'react';
import type { Plan } from '@prisma/client';
import { createCheckout, openPortal } from '@/app/[locale]/dashboard/billing/actions';

export function UpgradeButton({
  businessId,
  plan,
  label,
  variant = 'primary',
  disabled,
}: {
  businessId: string;
  plan: Plan;
  label: string;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending || disabled}
        onClick={() => {
          setErr(null);
          startTransition(async () => {
            const r = await createCheckout({ businessId, plan });
            if (!r.ok) {
              setErr(r.error ?? 'No se pudo iniciar el pago.');
              return;
            }
            if (r.url) window.location.href = r.url;
          });
        }}
        className={`rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
          variant === 'primary'
            ? 'bg-brand-600 text-white hover:bg-brand-700'
            : 'border border-brand-600 text-brand-700 hover:bg-brand-50'
        }`}
      >
        {pending ? 'Conectando…' : label}
      </button>
      {err && <div className="mt-2 text-xs text-red-700">{err}</div>}
    </>
  );
}

export function ManageBillingButton() {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setErr(null);
          startTransition(async () => {
            const r = await openPortal();
            if (!r.ok) {
              setErr(r.error ?? 'No se pudo abrir el portal.');
              return;
            }
            if (r.url) window.location.href = r.url;
          });
        }}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {pending ? 'Abriendo portal…' : 'Gestionar suscripción'}
      </button>
      {err && <div className="mt-2 text-xs text-red-700">{err}</div>}
    </>
  );
}
