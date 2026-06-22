import Stripe from 'stripe';

// Stripe is initialised only when a secret key is present, so the rest of the
// app works fine before the key is added. Use test keys (sk_test_…) first.
const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = secretKey ? new Stripe(secretKey) : null;

export function isStripeConfigured(): boolean {
  return !!secretKey;
}
