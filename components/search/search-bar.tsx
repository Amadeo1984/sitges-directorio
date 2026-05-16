'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function SearchBar({ initialQ = '' }: { initialQ?: string }) {
  const t = useTranslations('search');
  const [q, setQ] = useState(initialQ);
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = q.trim();
        if (trimmed) router.push(`/buscar?q=${encodeURIComponent(trimmed)}`);
      }}
      className="flex w-full max-w-xl items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm focus-within:border-brand-500"
    >
      <span aria-hidden="true" className="text-gray-400">🔍</span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('placeholder')}
        className="w-full bg-transparent text-sm outline-hidden"
        aria-label={t('placeholder')}
      />
      <button
        type="submit"
        className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
      >
        {t('submit')}
      </button>
    </form>
  );
}
