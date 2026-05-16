import Link from 'next/link';
import { requireUser } from '@/lib/session';
import { db } from '@/lib/db';
import { BusinessForm } from '@/components/dashboard/business-form';
import type { Locale } from '@/i18n/config';

export default async function NewBusinessPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await requireUser();

  const allCats = await db.category.findMany({
    include: {
      translations: { where: { locale } },
      parent: { include: { translations: { where: { locale } } } },
    },
    orderBy: [{ parentId: 'asc' }, { order: 'asc' }],
  });
  // solo hijas (las raíz son "etiquetas" agrupadoras, los negocios cuelgan de subcategorías)
  const categories = allCats
    .filter((c) => c.parentId)
    .map((c) => ({
      id: c.id,
      label: c.translations[0]?.name ?? c.key,
      parentLabel: c.parent?.translations[0]?.name,
    }))
    .sort((a, b) => (a.parentLabel ?? '').localeCompare(b.parentLabel ?? '') || a.label.localeCompare(b.label));

  const tagRows = await db.tag.findMany({
    include: { translations: { where: { locale } } },
  });
  const tags = tagRows
    .map((t) => ({ key: t.key, label: t.translations[0]?.name ?? t.key }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/${locale}/dashboard/negocios`} className="text-sm text-brand-700 hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Nuevo negocio</h1>
        <p className="mt-1 text-sm text-gray-600">
          Crea un borrador, completa la información y envíalo a revisión cuando esté listo.
        </p>
      </div>
      <BusinessForm locale={locale} categories={categories} tags={tags} />
    </div>
  );
}
