import type Stripe from 'stripe';
import { getStripeClient, getStripeWebhookSecret } from './stripeClient';
import { fulfillCheckoutSession } from './fulfillment';
import {
  beginWebhookEvent,
  completeWebhookEvent,
  expireCheckoutSession,
  failWebhookEvent,
  setOrderStatusByPaymentReference,
} from './payments';

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

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      getStripeWebhookSecret(),
    );
    if (process.env.NODE_ENV === 'production' && !event.livemode) {
      throw new Error('Test-mode Stripe event rejected in production');
    }
    if (!(await beginWebhookEvent(event))) return;

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const incoming = event.data.object as Stripe.Checkout.Session;
          const session = await stripe.checkout.sessions.retrieve(incoming.id, {
            expand: ['payment_intent.latest_charge'],
          });
          if (process.env.NODE_ENV === 'production' && !session.livemode) {
            throw new Error('Test-mode Checkout Session rejected in production');
          }
          await fulfillCheckoutSession(session);
          break;
        }
        case 'checkout.session.expired':
          await expireCheckoutSession((event.data.object as Stripe.Checkout.Session).id);
          break;
        case 'charge.refunded': {
          const charge = event.data.object as Stripe.Charge;
          if (charge.amount_refunded >= charge.amount) {
            await setOrderStatusByPaymentReference('refunded', {
              paymentIntentId:
                typeof charge.payment_intent === 'string'
                  ? charge.payment_intent
                  : charge.payment_intent?.id,
              chargeId: charge.id,
            });
          }
          break;
        }
        case 'charge.dispute.created': {
          const dispute = event.data.object as Stripe.Dispute;
          await setOrderStatusByPaymentReference('disputed', {
            chargeId:
              typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id,
          });
          break;
        }
        case 'charge.dispute.closed': {
          const dispute = event.data.object as Stripe.Dispute;
          await setOrderStatusByPaymentReference(
            dispute.status === 'won' ? 'paid' : 'refunded',
            {
              chargeId:
                typeof dispute.charge === 'string' ? dispute.charge : dispute.charge.id,
            },
          );
          break;
        }
      }
      await completeWebhookEvent(event.id);
    } catch (error) {
      await failWebhookEvent(event.id, error);
      throw error;
    }
  }
}
