import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'site' });
  return {
    title: `${t('name')} — ${t('tagline')}`,
    description: t('tagline'),
  };
}

const VERTICALS = [
  { key: 'restaurants', slug: 'restaurantes', emoji: '🍽️' },
  { key: 'hotels', slug: 'hoteles', emoji: '🏨' },
  { key: 'nightlife', slug: 'vida-nocturna', emoji: '🍸' },
  { key: 'beaches', slug: 'playas', emoji: '🏖️' },
  { key: 'nature', slug: 'naturaleza', emoji: '🌿' },
  { key: 'services', slug: 'servicios', emoji: '🛠️' },
] as const;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tv = await getTranslations('verticals');

  return (
    <>
      <section className="bg-linear-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
          <h1 className="text-4xl font-semibold tracking-tight text-brand-900 sm:text-6xl">
            {t('heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-700 sm:text-xl">
            {t('heroSubtitle')}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="rounded-md bg-brand-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-brand-700"
            >
              {t('ctaExplore')}
            </Link>
            <Link
              href="/"
              className="rounded-md border border-brand-600 px-6 py-3 text-base font-medium text-brand-700 hover:bg-brand-50"
            >
              {t('ctaRegister')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-gray-900">
          {t('verticalsTitle')}
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {VERTICALS.map((v) => (
            <Link
              key={v.key}
              href="/"
              className="group rounded-xl border border-gray-200 bg-white p-6 transition hover:border-brand-300 hover:shadow-md"
            >
              <div className="text-4xl">{v.emoji}</div>
              <div className="mt-4 text-lg font-medium text-gray-900 group-hover:text-brand-700">
                {tv(v.key)}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
