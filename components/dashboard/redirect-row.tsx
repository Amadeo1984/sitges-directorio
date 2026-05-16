'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { upsertRedirect, deleteRedirect } from '@/app/[locale]/dashboard/admin/actions';

interface Props {
  redirect?: { id: string; fromPath: string; toPath: string; code: number; hits: number };
}

export function RedirectRow({ redirect }: Props) {
  const router = useRouter();
  const [from, setFrom] = useState(redirect?.fromPath ?? '');
  const [to, setTo] = useState(redirect?.toPath ?? '');
  const [code, setCode] = useState<number>(redirect?.code ?? 301);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function save() {
    if (!from || !to) return;
    startTransition(async () => {
      await upsertRedirect({ id: redirect?.id, from, to, code });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1500);
    });
  }
  function del() {
    if (!redirect?.id) return;
    if (!confirm('¿Eliminar redirect?')) return;
    startTransition(async () => {
      await deleteRedirect(redirect.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-gray-200 bg-white p-2 text-sm">
      <input
        type="text"
        placeholder="/ruta-antigua"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 font-mono text-xs"
      />
      <span className="text-gray-400">→</span>
      <input
        type="text"
        placeholder="/es/nueva"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-gray-300 px-2 py-1 font-mono text-xs"
      />
      <select
        value={code}
        onChange={(e) => setCode(Number(e.target.value))}
        className="rounded-md border border-gray-300 px-1 py-1 text-xs"
      >
        <option value={301}>301</option>
        <option value={302}>302</option>
        <option value={307}>307</option>
        <option value={308}>308</option>
      </select>
      <span className="text-xs text-gray-500">{redirect ? `${redirect.hits} hits` : ''}</span>
      <button
        type="button"
        disabled={pending}
        onClick={save}
        className="rounded-md bg-brand-600 px-2 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {saved ? '✓' : 'Guardar'}
      </button>
      {redirect && (
        <button
          type="button"
          disabled={pending}
          onClick={del}
          className="text-xs text-red-600 hover:underline disabled:opacity-50"
        >
          Eliminar
        </button>
      )}
    </div>
  );
}
