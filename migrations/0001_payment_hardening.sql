CREATE TABLE IF NOT EXISTS "purchase_orders" (
  "id" serial PRIMARY KEY NOT NULL,
  "public_id" varchar(64) NOT NULL,
  "retreat_id" integer NOT NULL,
  "customer_email" text NOT NULL,
  "customer_name" text DEFAULT '' NOT NULL,
  "status" varchar(32) DEFAULT 'pending' NOT NULL,
  "subtotal_cents" integer NOT NULL,
  "tax_cents" integer NOT NULL,
  "total_cents" integer NOT NULL,
  "currency" varchar(3) DEFAULT 'cad' NOT NULL,
  "stripe_checkout_session_id" text,
  "stripe_payment_intent_id" text,
  "stripe_charge_id" text,
  "stripe_customer_id" text,
  "hold_expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "purchase_orders_public_id_unique" UNIQUE("public_id"),
  CONSTRAINT "purchase_orders_stripe_checkout_session_id_unique" UNIQUE("stripe_checkout_session_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_orders_capacity_idx"
  ON "purchase_orders" ("retreat_id", "status", "hold_expires_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_orders_payment_intent_idx"
  ON "purchase_orders" ("stripe_payment_intent_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "purchase_orders_charge_idx"
  ON "purchase_orders" ("stripe_charge_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stripe_webhook_events" (
  "event_id" varchar(255) PRIMARY KEY NOT NULL,
  "type" varchar(255) NOT NULL,
  "status" varchar(32) DEFAULT 'processing' NOT NULL,
  "attempts" integer DEFAULT 1 NOT NULL,
  "last_error" text,
  "processed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "retreat_registrations"
  ADD COLUMN IF NOT EXISTS "purchase_order_id" integer;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "retreat_registrations_purchase_order_id_unique"
  ON "retreat_registrations" ("purchase_order_id");
