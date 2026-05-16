import { requireAdmin } from '@/lib/session';
import { db } from '@/lib/db';
import { AssignOwnerSelect } from '@/components/dashboard/assign-owner-select';
import type { Locale } from '@/i18n/config';

export default async function NoOwnerPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await requireAdmin();

  const [items, users] = await Promise.all([
    db.business.findMany({
      where: { ownerId: null },
      include: {
        translations: { where: { locale } },
        category: { include: { translations: { where: { locale } } } },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    db.user.findMany({
      where: { role: { in: ['OWNER', 'ADMIN', 'EDITOR'] } },
      select: { id: true, name: true, email: true },
      orderBy: { email: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Negocios sin propietario</h1>
        <p className="mt-1 text-sm text-gray-600">
          Importados desde la web antigua o creados sin owner. Asigna un usuario para que pueda gestionarlos.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-gray-600">
          Todos los negocios tienen propietario. 🎉
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((b) => {
            const tr = b.translations[0];
            return (
              <li key={b.id} className="rounded-2xl border border-gray-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">{tr?.name}</h2>
                    <div className="text-xs text-gray-500">
                      {b.category.translations[0]?.name} · {b.status}
                    </div>
                  </div>
                  <AssignOwnerSelect businessId={b.id} users={users} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
