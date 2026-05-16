import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/session';
import { db } from '@/lib/db';
import { BusinessForm } from '@/components/dashboard/business-form';
import { PhotoManager } from '@/components/dashboard/photo-manager';
import type { Locale } from '@/i18n/config';
import type { BusinessInput } from '@/lib/validations/business';

export default async function EditBusinessPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await requireUser();

  const biz = await db.business.findUnique({
    where: { id },
    include: {
      translations: { where: { locale } },
      hours: true,
      tags: { include: { tag: true } },
      media: { orderBy: { position: 'asc' } },
    },
  });
  if (!biz) notFound();
  if (biz.ownerId !== user.id && user.role !== 'ADMIN') notFound();

  const allCats = await db.category.findMany({
    include: {
      translations: { where: { locale } },
      parent: { include: { translations: { where: { locale } } } },
    },
  });
  const categories = allCats
    .filter((c) => c.parentId)
    .map((c) => ({
      id: c.id,
      label: c.translations[0]?.name ?? c.key,
      parentLabel: c.parent?.translations[0]?.name,
    }))
    .sort((a, b) => (a.parentLabel ?? '').localeCompare(b.parentLabel ?? '') || a.label.localeCompare(b.label));

  const tagRows = await db.tag.findMany({ include: { translations: { where: { locale } } } });
  const tags = tagRows
    .map((t) => ({ key: t.key, label: t.translations[0]?.name ?? t.key }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const tr = biz.translations[0];
  const defaults: BusinessInput = {
    categoryId: biz.categoryId,
    name: tr?.name ?? '',
    shortDescription: tr?.shortDescription ?? '',
    description: tr?.description ?? '',
    phone: biz.phone ?? '',
    email: biz.email ?? '',
    website: biz.website ?? '',
    whatsapp: biz.whatsapp ?? '',
    instagram: biz.instagram ?? '',
    facebook: biz.facebook ?? '',
    address: biz.address ?? '',
    postalCode: biz.postalCode ?? '',
    district: biz.district ?? '',
    lat: biz.lat ? Number(biz.lat) : undefined,
    lng: biz.lng ? Number(biz.lng) : undefined,
    priceRange: biz.priceRange ?? undefined,
    tagKeys: biz.tags.map((t) => t.tag.key),
    hours: biz.hours.map((h) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
    })),
  };

  const photos = biz.media.map((m) => ({
    id: m.id,
    url: m.url,
    isPrimary: m.isPrimary,
    position: m.position,
  }));

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/${locale}/dashboard/negocios`} className="text-sm text-brand-700 hover:underline">
          ← Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">{tr?.name ?? 'Negocio'}</h1>
      </div>
      <BusinessForm
        locale={locale}
        categories={categories}
        tags={tags}
        business={{ id: biz.id, status: biz.status, defaults }}
      />
      <PhotoManager businessId={biz.id} initialPhotos={photos} />
    </div>
  );
}
