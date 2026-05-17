import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { db } from '@/lib/db';
import { PLANS, PLAN_ORDER } from '@/lib/plans';
import { stripeEnabled } from '@/lib/stripe';
import { PlanCard } from '@/components/billing/plan-card';
import { UpgradeButton, ManageBillingButton } from '@/components/dashboard/billing-actions';
import type { Plan } from '@prisma/client';
import type { Locale } from '@/i18n/config';

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<{ session_id?: string; canceled?: string }> };

const STATUS_LABEL: Record<string, string> = {
  active: 'Activa',
  trialing: 'Prueba',
  past_due: 'Pago pendiente',
  canceled: 'Cancelada',
  incomplete: 'Incompleta',
  incomplete_expired: 'Expirada',
  unpaid: 'Impagada',
};

export default async function BillingPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const user = await requireUser();

  const businesses = await db.business.findMany({
    where: { ownerId: user.id },
    include: {
      translations: { where: { locale } },
      subscription: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  const hasAnySub = businesses.some((b) => b.subscription);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Suscripciones</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mejora cada negocio individualmente. Sin permanencia, cancela cuando quieras.
        </p>
      </div>

      {sp.session_id && (
        <div className="rounded-md bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ¡Suscripción activada! El cambio puede tardar unos segundos en aplicarse.
        </div>
      )}
      {sp.canceled && (
        <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Has cancelado el proceso de pago. Cuando quieras continuar, pulsa de nuevo.
        </div>
      )}
      {!stripeEnabled && (
        <div className="rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Stripe no está configurado en este entorno (faltan <code>STRIPE_SECRET_KEY</code> y los{' '}
          <code>STRIPE_PRICE_*_MONTHLY</code>). La interfaz funciona pero los pagos están deshabilitados.
        </div>
      )}

      {businesses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          <p>No tienes negocios todavía.</p>
          <Link
            href={`/${locale}/dashboard/negocios/nuevo`}
            className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Crear mi primer negocio
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((b) => {
            const tr = b.translations[0];
            const sub = b.subscription;
            const currentPlan: Plan = b.plan;
            return (
              <div key={b.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{tr?.name ?? '(sin nombre)'}</h2>
                    <div className="mt-0.5 text-xs text-gray-500">
                      Plan actual:{' '}
                      <strong className="text-gray-800">{PLANS[currentPlan].name}</strong>
                      {sub && (
                        <>
                          {' · '}
                          <span>{STATUS_LABEL[sub.status] ?? sub.status}</span>
                          {sub.currentPeriodEnd && (
                            <>
                              {' · Renueva el '}
                              {new Date(sub.currentPeriodEnd).toLocaleDateString(locale)}
                            </>
                          )}
                          {sub.cancelAtPeriodEnd && ' · Se cancela al final del periodo'}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(['FEATURED', 'PREMIUM'] as Plan[]).map((p) => {
                      const isCurrent = currentPlan === p;
                      const planDef = PLANS[p];
                      const offerOnline = stripeEnabled && !!planDef.stripePriceId;
                      return (
                        <UpgradeButton
                          key={p}
                          businessId={b.id}
                          plan={p}
                          label={
                            isCurrent
                              ? `Plan actual: ${planDef.name}`
                              : PLAN_ORDER[p] > PLAN_ORDER[currentPlan]
                              ? `Pasar a ${planDef.name} (${planDef.priceLabel})`
                              : `Cambiar a ${planDef.name}`
                          }
                          variant={planDef.highlight ? 'primary' : 'secondary'}
                          {...(isCurrent || !offerOnline ? { disabled: true } : {})}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasAnySub && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Facturas y pagos</h2>
          <p className="mt-1 text-sm text-gray-600">
            Cambia tu tarjeta, descarga facturas o cancela desde el portal seguro de Stripe.
          </p>
          <div className="mt-3">
            <ManageBillingButton />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-base font-semibold text-gray-900">Comparar planes</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PlanCard plan="FREE" />
          <PlanCard plan="FEATURED" />
          <PlanCard plan="PREMIUM" />
        </div>
      </div>
    </div>
  );
}
