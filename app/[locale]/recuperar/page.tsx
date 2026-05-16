import Link from 'next/link';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { locales, type Locale } from '@/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const l of locales) pathByLocale[l] = `/${l}/recuperar`;
  return buildPageMetadata({
    locale,
    title: 'Recuperar contraseña — Sitges Directorio',
    pathByLocale,
    noindex: true,
  });
}

export default async function ForgotPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold text-gray-900">Recuperar contraseña</h1>
      <p className="mt-2 text-sm text-gray-600">
        Te enviaremos un enlace para restablecer tu contraseña.
      </p>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <ForgotPasswordForm locale={locale} />
      </div>
      <p className="mt-6 text-sm text-gray-600">
        <Link href={`/${locale}/login`} className="text-brand-700 hover:underline">
          ← Volver al login
        </Link>
      </p>
    </section>
  );
}
