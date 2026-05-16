'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeLabels, type Locale } from '@/i18n/config';

export function LocaleSwitcher() {
  const t = useTranslations('locale');
  const current = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="relative text-sm">
      <span className="sr-only">{t('switch')}</span>
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => {
          const next = e.target.value as Locale;
          startTransition(() => router.replace(pathname, { locale: next }));
        }}
        className="appearance-none rounded-md border border-gray-300 bg-white py-1.5 pl-2 pr-7 text-gray-700 hover:border-brand-400 focus:border-brand-500 focus:outline-hidden"
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {localeLabels[loc]}
          </option>
        ))}
      </select>
    </label>
  );
}
