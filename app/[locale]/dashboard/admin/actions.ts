'use server';

import { revalidatePath } from 'next/cache';
import { BusinessStatus, UserRole } from '@prisma/client';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/session';
import { sendBusinessStatusEmail } from '@/lib/email';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function approveBusiness(id: string) {
  await requireAdmin();
  const biz = await db.business.update({
    where: { id },
    data: { status: BusinessStatus.PUBLISHED, publishedAt: new Date() },
    include: {
      owner: true,
      translations: { where: { locale: 'es' } },
    },
  });
  if (biz.owner?.email) {
    const tr = biz.translations[0];
    await sendBusinessStatusEmail({
      to: biz.owner.email,
      businessName: tr?.name ?? 'tu negocio',
      status: 'PUBLISHED',
      url: tr ? `${appUrl}/es/n/${tr.slug}` : `${appUrl}/es`,
    });
  }
  revalidatePath(`/[locale]/dashboard/admin/moderacion`, 'page');
  return { ok: true as const };
}

export async function rejectBusiness(id: string, reason?: string) {
  await requireAdmin();
  const biz = await db.business.update({
    where: { id },
    data: { status: BusinessStatus.REJECTED },
    include: { owner: true, translations: { where: { locale: 'es' } } },
  });
  if (biz.owner?.email) {
    const tr = biz.translations[0];
    await sendBusinessStatusEmail({
      to: biz.owner.email,
      businessName: tr?.name ?? 'tu negocio',
      status: 'REJECTED',
      url: `${appUrl}/es/dashboard/negocios/${biz.id}`,
      reason,
    });
  }
  revalidatePath(`/[locale]/dashboard/admin/moderacion`, 'page');
  return { ok: true as const };
}

export async function setUserRole(userId: string, role: UserRole) {
  const admin = await requireAdmin();
  if (admin.id === userId && role !== UserRole.ADMIN) {
    return { ok: false as const, error: 'No puedes degradarte a ti mismo' };
  }
  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath(`/[locale]/dashboard/admin/usuarios`, 'page');
  return { ok: true as const };
}

export async function deleteRedirect(id: string) {
  await requireAdmin();
  await db.redirect.delete({ where: { id } });
  revalidatePath(`/[locale]/dashboard/admin/redirects`, 'page');
  return { ok: true as const };
}

export async function upsertRedirect(input: { id?: string; from: string; to: string; code: number }) {
  await requireAdmin();
  if (input.id) {
    await db.redirect.update({
      where: { id: input.id },
      data: { fromPath: input.from, toPath: input.to, code: input.code },
    });
  } else {
    await db.redirect.upsert({
      where: { fromPath: input.from },
      update: { toPath: input.to, code: input.code },
      create: { fromPath: input.from, toPath: input.to, code: input.code },
    });
  }
  revalidatePath(`/[locale]/dashboard/admin/redirects`, 'page');
  return { ok: true as const };
}

export async function assignBusinessOwner(businessId: string, userId: string | null) {
  await requireAdmin();
  await db.business.update({ where: { id: businessId }, data: { ownerId: userId } });
  revalidatePath(`/[locale]/dashboard/admin/usuarios`, 'page');
  return { ok: true as const };
}
