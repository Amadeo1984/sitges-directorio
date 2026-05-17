import { setRequestLocale } from 'next-intl/server';
import { PlanCard } from '@/components/billing/plan-card';
import { buildPageMetadata } from '@/lib/seo/metadata';
import { locales, type Locale } from '@/i18n/config';
import { getServerSession } from '@/lib/session';
import type { Metadata } from 'next';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const pathByLocale: Partial<Record<Locale, string>> = {};
  for (const l of locales) pathByLocale[l] = `/${l}/precios`;
  return buildPageMetadata({
    locale,
    title: 'Precios — Sitges Directorio',
    description:
      'Da de alta tu negocio gratis o destácalo en Sitges con un plan de pago. Sin compromiso, cancela cuando quieras.',
    pathByLocale,
  });
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getServerSession();
  const ctaHref = session?.user ? `/${locale}/dashboard/billing` : `/${locale}/registro?next=/${locale}/dashboard/billing`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-900">Planes para tu negocio</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Empieza gratis y mejora cuando lo necesites. Sin permanencia, cancela en cualquier momento desde tu panel.
        </p>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <PlanCard plan="FREE" ctaHref={ctaHref} />
        <PlanCard plan="FEATURED" ctaHref={ctaHref} />
        <PlanCard plan="PREMIUM" ctaHref={ctaHref} />
      </div>
      <p className="mt-10 text-center text-sm text-gray-500">
        Precios sin IVA. Para facturación a empresas o negocios con múltiples ubicaciones, contáctanos.
      </p>
    </section>
  );
}
