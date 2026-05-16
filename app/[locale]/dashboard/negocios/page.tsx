import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { db } from '@/lib/db';
import type { Locale } from '@/i18n/config';

const STATUS_BADGE: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  PENDING_REVIEW: 'bg-amber-100 text-amber-800',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};
const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Borrador',
  PENDING_REVIEW: 'En revisión',
  PUBLISHED: 'Publicado',
  REJECTED: 'Rechazado',
  ARCHIVED: 'Archivado',
};

export default async function MyBusinesses({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const user = await requireUser();

  const items = await db.business.findMany({
    where: { ownerId: user.id },
    include: {
      translations: { where: { locale } },
      category: { include: { translations: { where: { locale } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Mis negocios</h1>
        <Link
          href={`/${locale}/dashboard/negocios/nuevo`}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Nuevo negocio
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-600">Todavía no has dado de alta ningún negocio.</p>
          <Link
            href={`/${locale}/dashboard/negocios/nuevo`}
            className="mt-4 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Crear el primero
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((b) => {
                const tr = b.translations[0];
                return (
                  <tr key={b.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {tr?.name ?? '(sin nombre)'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {b.category.translations[0]?.name}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[b.status]}`}
                      >
                        {STATUS_LABEL[b.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/${locale}/dashboard/negocios/${b.id}`}
                        className="text-brand-700 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
