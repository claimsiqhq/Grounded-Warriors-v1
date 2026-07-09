// Post-payment fulfillment for retreat checkouts.
//
// A registration row is what grants a member access to a retreat's private
// container, so it must be created server-side from a *trusted* Stripe
// checkout session (webhook event or a session retrieved with our secret
// key) — never from client-supplied data.
//
// Fulfillment is idempotent: `stripe_session_id` is unique, so the webhook
// and the success-page lookup can both attempt fulfillment safely.

import type Stripe from "stripe";
import { storage } from "./storage";
import { getRetreat } from "./retreats";
import { sendRetreatConfirmationEmail } from "./sendgridClient";

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const retreatId = parseInt(String(session.metadata?.retreatId ?? ""), 10);
  const retreat = Number.isNaN(retreatId) ? undefined : getRetreat(retreatId);
  if (!retreat) {
    // Not a retreat checkout (or an unknown id) — nothing to fulfill.
    return;
  }

  const existing = await storage.getRegistrationByStripeSessionId(session.id);
  if (existing) return;

  const email = (session.customer_details?.email || session.customer_email || "")
    .trim()
    .toLowerCase();
  const amountTotal = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : null;
  const paymentType = session.metadata?.paymentType === "deposit" ? "deposit" : "full";

  // If the payer already has a member account, link the registration now;
  // otherwise it stays unclaimed and is attached by email on register/login.
  const user = email ? await storage.getUserByEmail(email) : undefined;

  try {
    await storage.createRetreatRegistration({
      userId: user?.id ?? null,
      email: email || null,
      retreatId: retreat.id,
      retreatName: retreat.name,
      retreatDate: retreat.date,
      paymentStatus: paymentType === "deposit" ? "deposit_paid" : "paid",
      paymentAmount: amountTotal,
      stripeSessionId: session.id,
    });
  } catch (error: any) {
    // 23505 = unique violation: another fulfillment path won the race.
    if (error?.code === "23505") return;
    throw error;
  }

  console.log(
    `Fulfilled checkout ${session.id}: retreat ${retreat.id} (${retreat.name}) for ${email || "unknown email"}`,
  );

  if (email) {
    sendRetreatConfirmationEmail({
      email,
      name: session.metadata?.customerName || session.customer_details?.name || "",
      retreatName: retreat.name,
      retreatDate: retreat.date,
      amountPaid: amountTotal,
      paymentType,
      hasAccount: !!user,
    }).catch((err) => {
      console.error("Retreat confirmation email error:", err?.message || err);
    });
  }
}
