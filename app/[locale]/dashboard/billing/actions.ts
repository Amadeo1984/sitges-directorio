'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { Plan } from '@prisma/client';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { PLANS } from '@/lib/plans';

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

interface ActionResult {
  ok: boolean;
  error?: string;
  url?: string;
}

async function ensureStripeCustomer(user: { id: string; email: string; name?: string | null }) {
  const existing = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });
  if (existing?.stripeCustomerId) return existing.stripeCustomerId;

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.name ?? undefined,
    metadata: { userId: user.id },
  });
  await db.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}

/** Inicia checkout de Stripe para un negocio + plan. Devuelve URL para redirect. */
export async function createCheckout(opts: { businessId: string; plan: Plan }): Promise<ActionResult> {
  const user = await requireUser();
  const plan = PLANS[opts.plan];
  if (!plan || !plan.stripePriceId) {
    return { ok: false, error: 'Plan no disponible. Verifica STRIPE_PRICE_*_MONTHLY en .env.' };
  }
  const biz = await db.business.findUnique({
    where: { id: opts.businessId },
    select: { ownerId: true, translations: { where: { locale: 'es' }, select: { name: true } } },
  });
  if (!biz || biz.ownerId !== user.id) {
    return { ok: false, error: 'No tienes permiso sobre este negocio.' };
  }

  const customerId = await ensureStripeCustomer({
    id: user.id,
    email: user.email,
    name: user.name,
  });

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${appUrl}/es/dashboard/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/es/dashboard/billing?canceled=1`,
      client_reference_id: opts.businessId,
      metadata: { businessId: opts.businessId, plan: opts.plan, userId: user.id },
      subscription_data: {
        metadata: { businessId: opts.businessId, plan: opts.plan, userId: user.id },
      },
    });
    if (!session.url) return { ok: false, error: 'Stripe no devolvió URL de pago.' };
    return { ok: true, url: session.url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error desconocido' };
  }
}

/** Abre el customer portal de Stripe (para gestionar/cancelar). */
export async function openPortal(): Promise<ActionResult> {
  const user = await requireUser();
  const u = await db.user.findUnique({
    where: { id: user.id },
    select: { stripeCustomerId: true },
  });
  if (!u?.stripeCustomerId) return { ok: false, error: 'Aún no tienes suscripciones.' };

  try {
    const stripe = getStripe();
    const portal = await stripe.billingPortal.sessions.create({
      customer: u.stripeCustomerId,
      return_url: `${appUrl}/es/dashboard/billing`,
    });
    return { ok: true, url: portal.url };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Error desconocido' };
  }
}
