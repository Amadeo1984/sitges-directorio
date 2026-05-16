'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { BusinessStatus, Locale, type Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { businessSchema, type BusinessInput } from '@/lib/validations/business';
import { slugify } from '@/lib/slugs';
import { sendBusinessStatusEmail } from '@/lib/email';

const LOCALES: Locale[] = ['es', 'ca', 'en', 'fr'];

async function uniqueSlug(locale: Locale, base: string, excludeBusinessId?: string) {
  let slug = base || 'negocio';
  let i = 1;
  while (true) {
    const existing = await db.businessTranslation.findFirst({
      where: { locale, slug, NOT: excludeBusinessId ? { businessId: excludeBusinessId } : undefined },
      select: { id: true },
    });
    if (!existing) return slug;
    i += 1;
    slug = `${base}-${i}`;
  }
}

interface ActionResult {
  ok: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
  id?: string;
}

export async function createBusiness(input: BusinessInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const d = parsed.data;
  const base = slugify(d.name);

  // Generar slug por locale (se podrá editar después por idioma)
  const slugByLocale: Record<Locale, string> = {} as Record<Locale, string>;
  for (const loc of LOCALES) slugByLocale[loc] = await uniqueSlug(loc, base);

  const biz = await db.business.create({
    data: {
      ownerId: user.id,
      categoryId: d.categoryId,
      status: BusinessStatus.DRAFT,
      phone: d.phone || null,
      email: d.email || null,
      website: d.website || null,
      whatsapp: d.whatsapp || null,
      instagram: d.instagram || null,
      facebook: d.facebook || null,
      address: d.address || null,
      postalCode: d.postalCode || null,
      district: d.district || null,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      priceRange: d.priceRange ?? null,
      translations: {
        create: LOCALES.map((loc) => ({
          locale: loc,
          slug: slugByLocale[loc],
          name: d.name,
          shortDescription: d.shortDescription || null,
          description: d.description || null,
        })),
      },
      hours: d.hours.length
        ? {
            create: d.hours.map((h) => ({
              dayOfWeek: h.dayOfWeek,
              openTime: h.openTime,
              closeTime: h.closeTime,
            })),
          }
        : undefined,
      tags: d.tagKeys?.length
        ? {
            create: await tagsConnect(d.tagKeys),
          }
        : undefined,
    },
  });

  revalidatePath(`/[locale]/dashboard/negocios`, 'page');
  return { ok: true, id: biz.id };
}

export async function updateBusiness(id: string, input: BusinessInput): Promise<ActionResult> {
  const user = await requireUser();
  const biz = await db.business.findUnique({ where: { id }, select: { ownerId: true } });
  if (!biz || (biz.ownerId !== user.id && user.role !== 'ADMIN')) {
    return { ok: false, formError: 'No tienes permiso para editar este negocio.' };
  }
  const parsed = businessSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const d = parsed.data;

  // Datos base
  await db.business.update({
    where: { id },
    data: {
      categoryId: d.categoryId,
      phone: d.phone || null,
      email: d.email || null,
      website: d.website || null,
      whatsapp: d.whatsapp || null,
      instagram: d.instagram || null,
      facebook: d.facebook || null,
      address: d.address || null,
      postalCode: d.postalCode || null,
      district: d.district || null,
      lat: d.lat ?? null,
      lng: d.lng ?? null,
      priceRange: d.priceRange ?? null,
    },
  });

  // Traducciones por idioma actual (locale del editor)
  for (const loc of LOCALES) {
    await db.businessTranslation.upsert({
      where: { businessId_locale: { businessId: id, locale: loc } },
      update: {
        name: d.name,
        shortDescription: d.shortDescription || null,
        description: d.description || null,
      },
      create: {
        businessId: id,
        locale: loc,
        slug: await uniqueSlug(loc, slugify(d.name), id),
        name: d.name,
        shortDescription: d.shortDescription || null,
        description: d.description || null,
      },
    });
  }

  // Horarios: borrar y recrear (simplest)
  await db.openingHours.deleteMany({ where: { businessId: id } });
  if (d.hours.length) {
    await db.openingHours.createMany({
      data: d.hours.map((h) => ({
        businessId: id,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
      })),
    });
  }

  // Tags: reset
  await db.tagOnBusiness.deleteMany({ where: { businessId: id } });
  if (d.tagKeys?.length) {
    const tagRows = await db.tag.findMany({ where: { key: { in: d.tagKeys } }, select: { id: true } });
    if (tagRows.length) {
      await db.tagOnBusiness.createMany({
        data: tagRows.map((t) => ({ businessId: id, tagId: t.id })),
        skipDuplicates: true,
      });
    }
  }

  revalidatePath(`/[locale]/dashboard/negocios`, 'page');
  revalidatePath(`/[locale]/n/[slug]`, 'page');
  return { ok: true, id };
}

async function tagsConnect(tagKeys: string[]) {
  const tags = await db.tag.findMany({ where: { key: { in: tagKeys } }, select: { id: true } });
  return tags.map((t) => ({ tagId: t.id }));
}

export async function submitForReview(id: string) {
  const user = await requireUser();
  const biz = await db.business.findUnique({
    where: { id },
    select: {
      ownerId: true,
      status: true,
      translations: { where: { locale: 'es' }, select: { name: true, shortDescription: true } },
      address: true,
      categoryId: true,
    },
  });
  if (!biz || (biz.ownerId !== user.id && user.role !== 'ADMIN')) {
    return { ok: false as const, formError: 'Sin permiso' };
  }
  const tr = biz.translations[0];
  if (!tr?.name || !biz.address || !biz.categoryId) {
    return {
      ok: false as const,
      formError: 'Faltan campos obligatorios: nombre, dirección y categoría.',
    };
  }
  await db.business.update({
    where: { id },
    data: { status: BusinessStatus.PENDING_REVIEW },
  });
  revalidatePath(`/[locale]/dashboard/negocios`, 'page');
  return { ok: true as const };
}

export async function archiveBusiness(id: string) {
  const user = await requireUser();
  const biz = await db.business.findUnique({ where: { id }, select: { ownerId: true } });
  if (!biz || (biz.ownerId !== user.id && user.role !== 'ADMIN')) return { ok: false as const };
  await db.business.update({
    where: { id },
    data: { status: BusinessStatus.ARCHIVED, publishedAt: null },
  });
  revalidatePath(`/[locale]/dashboard/negocios`, 'page');
  return { ok: true as const };
}
