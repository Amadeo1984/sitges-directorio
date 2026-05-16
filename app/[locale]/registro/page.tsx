import Link from 'next/link';
import { RegisterForm } from '@/components/auth/register-form';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { locales, type Locale } from '@/i18n/config';
import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const l of locales) pathByLocale[l] = `/${l}/registro`;
  return buildPageMetadata({
    locale,
    title: 'Crear cuenta — Sitges Directorio',
    pathByLocale,
    noindex: true,
  });
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-semibold text-gray-900">Da de alta tu negocio</h1>
      <p className="mt-2 text-sm text-gray-600">
        Crea una cuenta para publicar y gestionar tus negocios en Sitges.
      </p>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <RegisterForm locale={locale} />
      </div>
      <p className="mt-6 text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link href={`/${locale}/login`} className="text-brand-700 hover:underline">
          Entra aquí
        </Link>
      </p>
    </section>
  );
}
