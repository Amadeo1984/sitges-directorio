import 'server-only';
import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;

export const stripeEnabled = !!apiKey;

export const stripe = apiKey
  ? new Stripe(apiKey, { apiVersion: '2026-04-22.dahlia', typescript: true })
  : null;

export class StripeNotConfiguredError extends Error {
  constructor() {
    super('Stripe no está configurado. Define STRIPE_SECRET_KEY en .env');
    this.name = 'StripeNotConfiguredError';
  }
}

/** Helper que asegura que stripe está activo o lanza error explícito. */
export function getStripe(): Stripe {
  if (!stripe) throw new StripeNotConfiguredError();
  return stripe;
}
