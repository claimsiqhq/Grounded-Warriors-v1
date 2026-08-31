import Stripe from 'stripe';

let stripe: Stripe | undefined;

function requireEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function validateStripeConfiguration(): void {
  const secretKey = requireEnvironmentVariable('STRIPE_SECRET_KEY');
  const publishableKey = requireEnvironmentVariable('STRIPE_PUBLISHABLE_KEY');
  requireEnvironmentVariable('STRIPE_WEBHOOK_SECRET');

  const production = process.env.NODE_ENV === 'production';
  const secretPrefix = production ? 'sk_live_' : 'sk_test_';
  const publishablePrefix = production ? 'pk_live_' : 'pk_test_';
  if (!secretKey.startsWith(secretPrefix) || !publishableKey.startsWith(publishablePrefix)) {
    throw new Error(
      `Stripe keys must both be ${production ? 'live' : 'test'} mode in ${process.env.NODE_ENV || 'development'}`,
    );
  }
}

export function getStripeClient(): Stripe {
  if (!stripe) {
    validateStripeConfiguration();
    stripe = new Stripe(requireEnvironmentVariable('STRIPE_SECRET_KEY'));
  }
  return stripe;
}

export function getStripeWebhookSecret(): string {
  return requireEnvironmentVariable('STRIPE_WEBHOOK_SECRET');
}

export function getStripePublishableKey(): string {
  validateStripeConfiguration();
  return requireEnvironmentVariable('STRIPE_PUBLISHABLE_KEY');
}
