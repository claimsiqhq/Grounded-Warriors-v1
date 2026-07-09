import type Stripe from 'stripe';
import { getStripeSync } from './stripeClient';
import { fulfillCheckoutSession } from './fulfillment';

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!Buffer.isBuffer(payload)) {
      throw new Error(
        'STRIPE WEBHOOK ERROR: Payload must be a Buffer. ' +
        'Received type: ' + typeof payload + '. ' +
        'This usually means express.json() parsed the body before reaching this handler. ' +
        'FIX: Ensure webhook route is registered BEFORE app.use(express.json()).'
      );
    }

    const sync = await getStripeSync();
    // Verifies the Stripe signature internally and syncs catalog data.
    // If it throws, the payload is untrusted and we must not act on it.
    await sync.processWebhook(payload, signature);

    // Signature verified above — safe to act on the event payload now.
    let event: Stripe.Event;
    try {
      event = JSON.parse(payload.toString('utf8'));
    } catch {
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      try {
        await fulfillCheckoutSession(session);
      } catch (error) {
        console.error('Checkout fulfillment error:', error);
      }
    }
  }
}
