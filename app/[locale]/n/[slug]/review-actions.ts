'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireUser, requireAdmin } from '@/lib/session';
import { reviewSchema, replySchema, type ReviewInput } from '@/lib/validations/review';
import { recalcBusinessRating } from '@/lib/reviews';
import { Locale } from '@prisma/client';

interface ActionResult {
  ok: boolean;
  fieldErrors?: Record<string, string[]>;
  formError?: string;
  id?: string;
}

/** Crea una review nueva (estado PENDING; visible al aprobarla un admin). */
export async function submitReview(opts: {
  businessId: string;
  locale: Locale;
  input: ReviewInput;
}): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse(opts.input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }

  // No permitir review del propio owner
  const biz = await db.business.findUnique({
    where: { id: opts.businessId },
    select: { ownerId: true, status: true, translations: { where: { locale: opts.locale }, select: { slug: true } } },
  });
  if (!biz || biz.status !== 'PUBLISHED') {
    return { ok: false, formError: 'Negocio no disponible para reseñas.' };
  }
  if (biz.ownerId === user.id) {
    return { ok: false, formError: 'No puedes dejar una reseña de tu propio negocio.' };
  }

  try {
    await db.review.create({
      data: {
        businessId: opts.businessId,
        userId: user.id,
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        body: parsed.data.body,
        locale: opts.locale,
        status: 'PENDING',
      },
    });
  } catch (e) {
    // unique constraint (user ya tiene review en este business)
    if (e instanceof Error && e.message.includes('Unique constraint')) {
      return { ok: false, formError: 'Ya has dejado una reseña de este negocio.' };
    }
    throw e;
  }
  const slug = biz.translations[0]?.slug;
  if (slug) revalidatePath(`/[locale]/n/[slug]`, 'page');
  return { ok: true };
}

/** Owner del negocio responde a una review aprobada. */
export async function replyToReview(reviewId: string, replyBody: string): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = replySchema.safeParse({ reply: replyBody });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]> };
  }
  const review = await db.review.findUnique({
    where: { id: reviewId },
    select: { id: true, status: true, business: { select: { id: true, ownerId: true } } },
  });
  if (!review) return { ok: false, formError: 'Reseña no encontrada.' };
  if (review.business.ownerId !== user.id && user.role !== 'ADMIN') {
    return { ok: false, formError: 'Solo el propietario del negocio puede responder.' };
  }
  if (review.status !== 'APPROVED') {
    return { ok: false, formError: 'Solo se puede responder a reseñas aprobadas.' };
  }
  await db.review.update({
    where: { id: reviewId },
    data: { reply: parsed.data.reply, replyAt: new Date() },
  });
  revalidatePath(`/[locale]/n/[slug]`, 'page');
  return { ok: true };
}

/** Admin aprueba una review: la hace pública y recalcula rating del negocio. */
export async function approveReview(reviewId: string) {
  await requireAdmin();
  const review = await db.review.update({
    where: { id: reviewId },
    data: { status: 'APPROVED' },
    select: { businessId: true, business: { select: { translations: { select: { slug: true } } } } },
  });
  await recalcBusinessRating(review.businessId);
  revalidatePath(`/[locale]/dashboard/admin/reviews`, 'page');
  revalidatePath(`/[locale]/n/[slug]`, 'page');
  return { ok: true as const };
}

/** Admin rechaza una review: desaparece de la UI pública. */
export async function rejectReview(reviewId: string) {
  await requireAdmin();
  const review = await db.review.update({
    where: { id: reviewId },
    data: { status: 'REJECTED' },
    select: { businessId: true },
  });
  await recalcBusinessRating(review.businessId);
  revalidatePath(`/[locale]/dashboard/admin/reviews`, 'page');
  return { ok: true as const };
}
