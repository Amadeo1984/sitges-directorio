import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe, stripeEnabled } from '@/lib/stripe';
import { db } from '@/lib/db';
import { planFromPriceId } from '@/lib/plans';
import { revalidatePath } from 'next/cache';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!stripeEnabled || !stripe || !webhookSecret) {
    return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing_signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (e) {
    return NextResponse.json({ error: 'invalid_signature', detail: String(e) }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscription(sub);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(sub);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }
      default:
        // ignorar otros eventos
        break;
    }
  } catch (e) {
    console.error('[stripe webhook] error:', event.type, e);
    return NextResponse.json({ error: 'handler_error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const businessId = session.metadata?.businessId ?? session.client_reference_id;
  const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  if (!businessId || !subId || !stripe) return;
  const sub = await stripe.subscriptions.retrieve(subId);
  await syncSubscription(sub, businessId);
}

async function syncSubscription(sub: Stripe.Subscription, businessIdOverride?: string) {
  const businessId = businessIdOverride ?? (sub.metadata as Record<string, string>)?.businessId;
  if (!businessId) return;

  const priceId = sub.items.data[0]?.price.id;
  const plan = planFromPriceId(priceId) ?? 'FEATURED';
  // Stripe a veces emite las fechas como timestamps numéricos directamente en current_period_*
  const start = (sub as unknown as { current_period_start?: number }).current_period_start;
  const end = (sub as unknown as { current_period_end?: number }).current_period_end;

  await db.subscription.upsert({
    where: { businessId },
    update: {
      plan,
      status: sub.status,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      stripeSubId: sub.id,
      stripePriceId: priceId ?? null,
      currentPeriodStart: start ? new Date(start * 1000) : null,
      currentPeriodEnd: end ? new Date(end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    create: {
      businessId,
      plan,
      status: sub.status,
      stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
      stripeSubId: sub.id,
      stripePriceId: priceId ?? null,
      currentPeriodStart: start ? new Date(start * 1000) : null,
      currentPeriodEnd: end ? new Date(end * 1000) : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  });

  // Aplica plan al negocio si está activa o trialing
  if (sub.status === 'active' || sub.status === 'trialing') {
    await db.business.update({ where: { id: businessId }, data: { plan, featured: plan !== 'FREE' } });
  } else if (sub.status === 'past_due') {
    // mantener el plan pero marcar (no-op por ahora)
  }

  revalidatePath('/[locale]/dashboard/billing', 'page');
  revalidatePath('/[locale]/n/[slug]', 'page');
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription) {
  const existing = await db.subscription.findUnique({ where: { stripeSubId: sub.id } });
  if (!existing) return;
  await db.subscription.update({
    where: { stripeSubId: sub.id },
    data: { status: 'canceled', cancelAtPeriodEnd: false },
  });
  await db.business.update({
    where: { id: existing.businessId },
    data: { plan: 'FREE', featured: false },
  });
  revalidatePath('/[locale]/dashboard/billing', 'page');
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // marca past_due si tenemos la sub
  const subFieldA = (invoice as unknown as { subscription?: string | Stripe.Subscription | null }).subscription;
  const subId = typeof subFieldA === 'string' ? subFieldA : subFieldA?.id;
  if (!subId) return;
  await db.subscription.updateMany({ where: { stripeSubId: subId }, data: { status: 'past_due' } });
}
