'use client';

import { useState } from 'react';

export function ClaimButton({ businessId, isOwned, isLoggedIn, loginUrl }: {
  businessId: string;
  isOwned: boolean;
  isLoggedIn: boolean;
  loginUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isOwned) return null;
  if (!isLoggedIn) {
    return (
      <a
        href={loginUrl}
        className="inline-block rounded-md border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        ¿Es tu negocio? Reclámalo
      </a>
    );
  }

  if (submitted) {
    return <p className="text-sm text-emerald-700">Solicitud enviada. Te contactaremos por email.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-brand-600 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        Reclamar este negocio
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Cuéntanos brevemente cómo demuestras la propiedad (web, email corporativo, NIF…)"
        rows={3}
        className="block w-full max-w-md rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      {error && <div className="text-sm text-red-700">{error}</div>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            setError(null);
            const r = await fetch(`/api/businesses/${businessId}/claim`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ message }),
            });
            setLoading(false);
            if (r.ok) setSubmitted(true);
            else setError('No se pudo enviar la solicitud.');
          }}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Enviar solicitud
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
