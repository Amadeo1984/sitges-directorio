'use client';

import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/auth-client';

export function SignOutButton({ locale, className }: { locale: string; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await signOut();
        router.push(`/${locale}/login`);
        router.refresh();
      }}
      className={className ?? 'text-sm text-gray-600 hover:text-gray-900'}
    >
      Cerrar sesión
    </button>
  );
}
