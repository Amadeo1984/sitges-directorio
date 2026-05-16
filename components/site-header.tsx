import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './locale-switcher';
import { Logo } from './logo';
import { getServerSession } from '@/lib/session';

export async function SiteHeader() {
  const t = await getTranslations('nav');
  const tSite = await getTranslations('site');
  const session = await getServerSession();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-brand-700">
          <Logo size={32} />
          <span className="font-display text-lg leading-none">{tSite('name')}</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-gray-700 md:flex">
          <Link href="/buscar" className="hover:text-brand-700">{t('categories')}</Link>
          <Link href="/mapa" className="hover:text-brand-700">{t('map')}</Link>
        </nav>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          {session?.user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              Panel
            </Link>
          ) : (
            <Link
              href="/registro"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              {t('register')}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
