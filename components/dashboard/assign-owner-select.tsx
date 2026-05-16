'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { assignBusinessOwner } from '@/app/[locale]/dashboard/admin/actions';

interface User {
  id: string;
  email: string;
  name: string | null;
}

export function AssignOwnerSelect({ businessId, users }: { businessId: string; users: User[] }) {
  const router = useRouter();
  const [userId, setUserId] = useState('');
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs"
      >
        <option value="">Selecciona usuario…</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name ? `${u.name} (${u.email})` : u.email}
          </option>
        ))}
      </select>
      <button
        type="button"
        disabled={!userId || pending}
        onClick={() => {
          startTransition(async () => {
            await assignBusinessOwner(businessId, userId);
            router.refresh();
          });
        }}
        className="rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Asignar
      </button>
    </div>
  );
}
