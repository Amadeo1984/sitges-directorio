import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/session';
import { setRequestLocale } from 'next-intl/server';
import { SignOutButton } from '@/components/dashboard/sign-out-button';
import { Logo } from '@/components/logo';
import type { Locale } from '@/i18n/config';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const session = await getServerSession();
  if (!session?.user) redirect(`/${locale}/login`);

  const isAdmin = session.user.role === 'ADMIN';

  return (
    <div className="min-h-[calc(100vh-4rem-4rem)] bg-gray-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-4 flex items-center gap-2">
              <Logo size={28} />
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-500">Panel</div>
                <div className="text-sm font-medium text-gray-900 truncate" title={session.user.email}>
                  {session.user.name ?? session.user.email}
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-1 text-sm">
              <Link href={`/${locale}/dashboard`} className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100">
                Inicio
              </Link>
              <Link
                href={`/${locale}/dashboard/negocios`}
                className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
              >
                Mis negocios
              </Link>
              <Link
                href={`/${locale}/dashboard/billing`}
                className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100"
              >
                Suscripciones
              </Link>
              {isAdmin && (
                <div className="mt-4">
                  <div className="px-3 py-1 text-xs uppercase tracking-wide text-gray-400">Admin</div>
                  <Link
                    href={`/${locale}/dashboard/admin/moderacion`}
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 block"
                  >
                    Moderación negocios
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/admin/reviews`}
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 block"
                  >
                    Reseñas pendientes
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/admin/usuarios`}
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 block"
                  >
                    Usuarios
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/admin/redirects`}
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 block"
                  >
                    Redirects
                  </Link>
                  <Link
                    href={`/${locale}/dashboard/admin/sin-owner`}
                    className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 block"
                  >
                    Sin owner
                  </Link>
                </div>
              )}
              <div className="mt-4 border-t border-gray-200 pt-3">
                <SignOutButton locale={locale} className="rounded-md px-3 py-2 text-left text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full" />
              </div>
            </nav>
          </div>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  );
}
