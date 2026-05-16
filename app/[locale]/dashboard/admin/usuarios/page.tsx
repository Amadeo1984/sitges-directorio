import { requireAdmin } from '@/lib/session';
import { db } from '@/lib/db';
import { UserRoleSelect } from '@/components/dashboard/user-role-select';

export default async function UsersPage() {
  await requireAdmin();
  const users = await db.user.findMany({
    include: { _count: { select: { businesses: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <p className="mt-1 text-sm text-gray-600">{users.length} usuarios registrados.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre / Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Negocios</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Verif.</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{u.name ?? '—'}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{u._count.businesses}</td>
                <td className="px-4 py-3">
                  {u.emailVerified ? (
                    <span className="text-emerald-700">✓</span>
                  ) : (
                    <span className="text-gray-400">pendiente</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <UserRoleSelect userId={u.id} value={u.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
