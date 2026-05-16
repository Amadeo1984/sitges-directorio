import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { db } from '@/lib/db';
import type { Locale } from '@/i18n/config';

export default async function DashboardHome({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const user = await requireUser();

  const counts = await db.business.groupBy({
    by: ['status'],
    where: { ownerId: user.id },
    _count: { _all: true },
  });
  const totals = {
    PUBLISHED: 0,
    PENDING_REVIEW: 0,
    DRAFT: 0,
    REJECTED: 0,
    ARCHIVED: 0,
  } as Record<string, number>;
  for (const c of counts) totals[c.status] = c._count._all;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Hola, {user.name ?? 'visitante'} 👋</h1>
        <p className="mt-1 text-gray-600">Este es el resumen de tu actividad en Sitges Directorio.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Publicados" value={totals.PUBLISHED} accent="text-emerald-700" />
        <StatCard label="En revisión" value={totals.PENDING_REVIEW} accent="text-amber-700" />
        <StatCard label="Borradores" value={totals.DRAFT} accent="text-gray-700" />
        <StatCard label="Rechazados" value={totals.REJECTED} accent="text-red-700" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Empezar</h2>
        <p className="mt-1 text-sm text-gray-600">
          Crea tu primer negocio, completa la información y envíalo a revisión.
        </p>
        <Link
          href={`/${locale}/dashboard/negocios/nuevo`}
          className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nuevo negocio
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${accent}`}>{value}</div>
    </div>
  );
}
