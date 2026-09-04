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
import { fulfillCheckoutSession as persistCheckoutSession } from "./payments";
import { sendRetreatConfirmationEmail } from "./sendgridClient";
import { storage } from "./storage";

export async function fulfillCheckoutSession(session: Stripe.Checkout.Session): Promise<void> {
  const created = await persistCheckoutSession(session);
  if (!created) return;
  const email = (session.customer_details?.email || session.customer_email || "")
    .trim()
    .toLowerCase();
  const user = email ? await storage.getUserByEmail(email) : undefined;
  const amountTotal = session.amount_total != null ? (session.amount_total / 100).toFixed(2) : null;

  console.log(
    `Fulfilled Stripe checkout for retreat ${session.metadata?.retreatId ?? "unknown"}`,
  );

  if (email) {
    sendRetreatConfirmationEmail({
      email,
      name: session.metadata?.customerName || session.customer_details?.name || "",
      retreatName: session.metadata?.retreatName || "Grounded Warriors event",
      retreatDate: session.metadata?.retreatDate || "",
      amountPaid: amountTotal,
      paymentType: "full",
      hasAccount: !!user,
    }).catch((err) => {
      console.error("Retreat confirmation email error:", err?.message || err);
    });
  }
}
