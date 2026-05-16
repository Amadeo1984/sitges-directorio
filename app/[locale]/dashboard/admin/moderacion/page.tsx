import Link from 'next/link';
import { requireAdmin } from '@/lib/session';
import { db } from '@/lib/db';
import { ModerationActions } from '@/components/dashboard/moderation-actions';
import type { Locale } from '@/i18n/config';

export default async function ModerationPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await requireAdmin();

  const items = await db.business.findMany({
    where: { status: 'PENDING_REVIEW' },
    include: {
      owner: { select: { email: true, name: true } },
      translations: { where: { locale } },
      category: { include: { translations: { where: { locale } } } },
    },
    orderBy: { updatedAt: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Moderación</h1>
        <p className="mt-1 text-sm text-gray-600">
          Negocios pendientes de revisión.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          No hay negocios en cola. 🌟
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((b) => {
            const tr = b.translations[0];
            return (
              <li key={b.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{tr?.name ?? '(sin nombre)'}</h2>
                    <div className="mt-0.5 text-sm text-gray-500">
                      {b.category.translations[0]?.name} ·{' '}
                      {b.owner?.email ?? 'sin owner'}
                      {b.address ? ` · ${b.address}` : ''}
                    </div>
                    {tr?.shortDescription && (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">{tr.shortDescription}</p>
                    )}
                    <div className="mt-2 flex gap-3 text-xs">
                      <Link
                        href={`/${locale}/dashboard/negocios/${b.id}`}
                        className="text-brand-700 hover:underline"
                      >
                        Editar
                      </Link>
                    </div>
                  </div>
                  <ModerationActions businessId={b.id} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
