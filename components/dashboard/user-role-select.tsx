'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@prisma/client';
import { setUserRole } from '@/app/[locale]/dashboard/admin/actions';

const ROLES: UserRole[] = ['OWNER', 'EDITOR', 'ADMIN'];

export function UserRoleSelect({ userId, value }: { userId: string; value: UserRole }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <select
      defaultValue={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as UserRole;
        startTransition(async () => {
          await setUserRole(userId, next);
          router.refresh();
        });
      }}
      className="rounded-md border border-gray-300 px-2 py-1 text-xs"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}
