import Link from 'next/link';
import { LoginForm } from '@/components/auth/login-form';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { locales, type Locale } from '@/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const l of locales) pathByLocale[l] = `/${l}/login`;
  return buildPageMetadata({
    locale,
    title: 'Acceder — Sitges Directorio',
    pathByLocale,
    noindex: true,
  });
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold text-gray-900">Acceder</h1>
      <p className="mt-2 text-sm text-gray-600">
        Accede a tu panel para gestionar tus negocios.
      </p>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <LoginForm locale={locale} />
      </div>
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link href={`/${locale}/recuperar`} className="text-brand-700 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href={`/${locale}/registro`} className="text-brand-700 hover:underline">
          Crear cuenta
        </Link>
      </div>
    </section>
  );
}
