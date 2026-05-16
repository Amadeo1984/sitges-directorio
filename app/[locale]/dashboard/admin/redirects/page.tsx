import { requireAdmin } from '@/lib/session';
import { db } from '@/lib/db';
import { RedirectRow } from '@/components/dashboard/redirect-row';

export default async function RedirectsPage() {
  await requireAdmin();
  const redirects = await db.redirect.findMany({
    orderBy: { fromPath: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Redirects 301</h1>
        <p className="mt-1 text-sm text-gray-600">
          Mapeo de URLs antiguas a nuevas. Los cambios solo afectan a nuevas peticiones (no recompila el middleware).
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-3">
        <div className="mb-2 text-sm font-medium text-gray-700">Nuevo</div>
        <RedirectRow />
      </div>

      <div className="space-y-2">
        {redirects.map((r) => (
          <RedirectRow key={r.id} redirect={r} />
        ))}
      </div>
    </div>
  );
}
