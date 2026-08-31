import { randomUUID } from "node:crypto";
import type Stripe from "stripe";
import { pool } from "./db";
import { getRetreat } from "./retreats";

// Stripe requires expires_at to be at least 30 minutes in the future.
const HOLD_MINUTES = 35;

export interface ReservedOrder {
  publicId: string;
  retreatId: number;
  customerEmail: string;
  customerName: string;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  holdExpiresAt: Date;
}

export async function reserveOrder(input: {
  retreatId: number;
  customerEmail: string;
  customerName: string;
  subtotalCents: number;
  taxCents: number;
}): Promise<ReservedOrder> {
  const retreat = getRetreat(input.retreatId);
  if (!retreat?.onlineSalesOpen || retreat.isPast || retreat.capacity === null) {
    throw new Error("Online registration is not open for this offering.");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1, $2)", [728194, input.retreatId]);
    await client.query(
      `UPDATE purchase_orders
       SET status = 'expired', updated_at = now()
       WHERE retreat_id = $1 AND status = 'pending' AND hold_expires_at <= now()`,
      [input.retreatId],
    );

    const capacityResult = await client.query<{ occupied: string }>(
      `SELECT (
        (SELECT count(*) FROM purchase_orders
         WHERE retreat_id = $1
           AND (status IN ('paid', 'disputed')
             OR (status = 'pending' AND hold_expires_at > now())))
        +
        (SELECT count(*) FROM retreat_registrations
         WHERE retreat_id = $1
           AND purchase_order_id IS NULL
           AND payment_status IN ('paid', 'completed', 'deposit_paid'))
      )::text AS occupied`,
      [input.retreatId],
    );
    if (Number(capacityResult.rows[0]?.occupied ?? 0) >= retreat.capacity) {
      throw new Error("This offering is sold out.");
    }

    const publicId = randomUUID().replaceAll("-", "");
    const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);
    const totalCents = input.subtotalCents + input.taxCents;
    await client.query(
      `INSERT INTO purchase_orders (
        public_id, retreat_id, customer_email, customer_name, status,
        subtotal_cents, tax_cents, total_cents, currency, hold_expires_at
      ) VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, 'cad', $8)`,
      [
        publicId,
        input.retreatId,
        input.customerEmail,
        input.customerName,
        input.subtotalCents,
        input.taxCents,
        totalCents,
        holdExpiresAt,
      ],
    );
    await client.query("COMMIT");
    return {
      publicId,
      retreatId: input.retreatId,
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      subtotalCents: input.subtotalCents,
      taxCents: input.taxCents,
      totalCents,
      currency: "cad",
      holdExpiresAt,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function attachStripeSession(publicId: string, sessionId: string): Promise<void> {
  await pool.query(
    `UPDATE purchase_orders
     SET stripe_checkout_session_id = $2, updated_at = now()
     WHERE public_id = $1 AND status = 'pending'`,
    [publicId, sessionId],
  );
}

export async function failOrder(publicId: string): Promise<void> {
  await pool.query(
    `UPDATE purchase_orders SET status = 'failed', updated_at = now()
     WHERE public_id = $1 AND status = 'pending'`,
    [publicId],
  );
}

function stripeId(value: string | { id: string } | null): string | null {
  return typeof value === "string" ? value : value?.id ?? null;
}

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<boolean> {
  if (session.payment_status !== "paid") return false;
  const publicId = session.metadata?.orderId;
  if (!publicId) throw new Error("Paid Checkout Session is missing orderId metadata");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderResult = await client.query<{
      id: number;
      retreat_id: number;
      customer_email: string;
      customer_name: string;
      status: string;
      total_cents: number;
    }>("SELECT * FROM purchase_orders WHERE public_id = $1 FOR UPDATE", [publicId]);
    const order = orderResult.rows[0];
    if (!order) throw new Error("Checkout order was not found");
    if (order.status === "paid") {
      await client.query("COMMIT");
      return false;
    }
    if (session.amount_total !== order.total_cents || session.currency !== "cad") {
      throw new Error("Stripe amount or currency does not match the reserved order");
    }

    const paymentIntent =
      typeof session.payment_intent === "object" ? session.payment_intent : null;
    const paymentIntentId = stripeId(session.payment_intent);
    const chargeId = stripeId(paymentIntent?.latest_charge ?? null);
    const customerId = stripeId(session.customer);
    await client.query(
      `UPDATE purchase_orders
       SET status = 'paid',
           stripe_checkout_session_id = $2,
           stripe_payment_intent_id = $3,
           stripe_charge_id = $4,
           stripe_customer_id = $5,
           updated_at = now()
       WHERE id = $1`,
      [order.id, session.id, paymentIntentId, chargeId, customerId],
    );

    const retreat = getRetreat(order.retreat_id);
    if (!retreat) throw new Error("Paid order references an unknown retreat");
    const userResult = await client.query<{ id: string }>(
      "SELECT id FROM users WHERE lower(email) = $1 LIMIT 1",
      [order.customer_email.toLowerCase()],
    );
    await client.query(
      `INSERT INTO retreat_registrations (
        user_id, email, retreat_id, retreat_name, retreat_date,
        payment_status, payment_amount, stripe_session_id, purchase_order_id
      ) VALUES ($1, $2, $3, $4, $5, 'paid', $6, $7, $8)
      ON CONFLICT (purchase_order_id) DO NOTHING`,
      [
        userResult.rows[0]?.id ?? null,
        order.customer_email.toLowerCase(),
        retreat.id,
        retreat.name,
        retreat.date,
        (order.total_cents / 100).toFixed(2),
        session.id,
        order.id,
      ],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function expireCheckoutSession(sessionId: string): Promise<void> {
  await pool.query(
    `UPDATE purchase_orders SET status = 'expired', updated_at = now()
     WHERE stripe_checkout_session_id = $1 AND status = 'pending'`,
    [sessionId],
  );
}

export async function setOrderStatusByPaymentReference(
  status: "paid" | "refunded" | "disputed",
  reference: { paymentIntentId?: string | null; chargeId?: string | null },
): Promise<void> {
  const result = await pool.query<{ id: number }>(
    `UPDATE purchase_orders SET status = $1, updated_at = now()
     WHERE ($2::text IS NOT NULL AND stripe_payment_intent_id = $2)
        OR ($3::text IS NOT NULL AND stripe_charge_id = $3)
     RETURNING id`,
    [status, reference.paymentIntentId ?? null, reference.chargeId ?? null],
  );
  if (result.rowCount === 0) return;
  await pool.query(
    `UPDATE retreat_registrations
     SET payment_status = $1
     WHERE purchase_order_id = ANY($2::int[])`,
    [status, result.rows.map((row) => row.id)],
  );
}

export async function getPublicOrder(publicId: string) {
  const result = await pool.query<{
    public_id: string;
    retreat_id: number;
    customer_email: string;
    status: string;
    total_cents: number;
    currency: string;
  }>(
    `SELECT public_id, retreat_id, customer_email, status, total_cents, currency
     FROM purchase_orders WHERE public_id = $1 LIMIT 1`,
    [publicId],
  );
  return result.rows[0];
}

export async function beginWebhookEvent(event: Stripe.Event): Promise<boolean> {
  const result = await pool.query<{ status: string }>(
    `INSERT INTO stripe_webhook_events (event_id, type)
     VALUES ($1, $2)
     ON CONFLICT (event_id) DO UPDATE
       SET attempts = stripe_webhook_events.attempts + 1,
           status = CASE
             WHEN stripe_webhook_events.status = 'processed' THEN 'processed'
             ELSE 'processing'
           END,
           last_error = NULL,
           updated_at = now()
     RETURNING status`,
    [event.id, event.type],
  );
  return result.rows[0]?.status !== "processed";
}

export async function completeWebhookEvent(eventId: string): Promise<void> {
  await pool.query(
    `UPDATE stripe_webhook_events
     SET status = 'processed', processed_at = now(), updated_at = now()
     WHERE event_id = $1`,
    [eventId],
  );
}

export async function failWebhookEvent(eventId: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  await pool.query(
    `UPDATE stripe_webhook_events
     SET status = 'failed', last_error = $2, updated_at = now()
     WHERE event_id = $1`,
    [eventId, message.slice(0, 4000)],
  );
}
