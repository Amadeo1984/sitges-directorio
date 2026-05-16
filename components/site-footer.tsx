import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function SiteFooter() {
  const t = await getTranslations('footer');
  const tSite = await getTranslations('site');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 sm:flex-row sm:items-center">
        <div className="text-sm text-gray-600">
          © {year} {tSite('name')}. {t('rights')}.
        </div>
        <nav className="flex gap-5 text-sm text-gray-600">
          <Link href="/" className="hover:text-brand-700">{t('privacy')}</Link>
          <Link href="/" className="hover:text-brand-700">{t('terms')}</Link>
          <Link href="/" className="hover:text-brand-700">{t('cookies')}</Link>
        </nav>
      </div>
    </footer>
  );
}
