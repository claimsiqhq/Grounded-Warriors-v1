import { pgTable, text, serial, timestamp, integer, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models (users and sessions tables)
export * from "./models/auth";

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions, {
  name: z.string().min(2, "Name is required").max(200),
  email: z.string().email("Valid email is required").max(320),
  message: z.string().min(10, "Message is too short").max(5000),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions, {
  email: z.string().email("Valid email is required").max(320),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

// Member portal tables
export const retreatRegistrations = pgTable("retreat_registrations", {
  id: serial("id").primaryKey(),
  // Nullable: paid registrations may arrive before the customer creates a
  // member account. They are claimed by email on register/login.
  userId: text("user_id"),
  // Customer email captured at checkout, used to claim the registration.
  email: text("email"),
  // Canonical retreat ID (see server/retreats.ts). Nullable for legacy rows.
  retreatId: integer("retreat_id"),
  retreatName: text("retreat_name").notNull(),
  retreatDate: text("retreat_date").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentAmount: text("payment_amount"),
  // Unique so webhook + success-page fulfillment can't double-register.
  stripeSessionId: text("stripe_session_id").unique(),
  purchaseOrderId: integer("purchase_order_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Per-retreat staff designations. Admins assign trusted members as staff
// for a specific retreat container, granting them access alongside attendees.
export const retreatStaff = pgTable("retreat_staff", {
  id: serial("id").primaryKey(),
  retreatId: integer("retreat_id").notNull(),
  userId: text("user_id").notNull(),
  addedBy: text("added_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRetreatStaffSchema = createInsertSchema(retreatStaff).omit({
  id: true,
  createdAt: true,
});

export type InsertRetreatStaff = z.infer<typeof insertRetreatStaffSchema>;
export type RetreatStaff = typeof retreatStaff.$inferSelect;

export const insertRetreatRegistrationSchema = createInsertSchema(retreatRegistrations).omit({
  id: true,
  createdAt: true,
});

export type InsertRetreatRegistration = z.infer<typeof insertRetreatRegistrationSchema>;
export type RetreatRegistration = typeof retreatRegistrations.$inferSelect;

// Durable payment state and seat holds. A pending order consumes capacity
// until holdExpiresAt; paid orders consume capacity until refunded.
export const purchaseOrders = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  publicId: varchar("public_id", { length: 64 }).notNull().unique(),
  retreatId: integer("retreat_id").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull().default(""),
  status: varchar("status", { length: 32 }).notNull().default("pending"),
  subtotalCents: integer("subtotal_cents").notNull(),
  taxCents: integer("tax_cents").notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("cad"),
  stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  stripeCustomerId: text("stripe_customer_id"),
  holdExpiresAt: timestamp("hold_expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

// Stripe retries events, so every event is durably recorded and processed
// idempotently. Failed events remain retryable and retain their last error.
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  eventId: varchar("event_id", { length: 255 }).primaryKey(),
  type: varchar("type", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("processing"),
  attempts: integer("attempts").notNull().default(1),
  lastError: text("last_error"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Discussion board.
// retreatId = null  -> General Commons (visible to all logged-in members).
// retreatId = N     -> Scoped to retreat container; only accessible by
//                       attendees, designated staff, or admins.
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userImage: text("user_image"),
  retreatId: integer("retreat_id"),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  createdAt: true,
});

export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussions.$inferSelect;

// Discussion replies
export const discussionReplies = pgTable("discussion_replies", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userImage: text("user_image"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDiscussionReplySchema = createInsertSchema(discussionReplies).omit({
  id: true,
  createdAt: true,
});

export type InsertDiscussionReply = z.infer<typeof insertDiscussionReplySchema>;
export type DiscussionReply = typeof discussionReplies.$inferSelect;

// Brown Courage Coaching: 1-on-1 application inquiries
export const coachingInquiries = pgTable("coaching_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  preferredCoach: text("preferred_coach").notNull(),
  workingOn: text("working_on").notNull(),
  ninetyDayWin: text("ninety_day_win").notNull(),
  scheduleNotes: text("schedule_notes"),
  budgetComfort: text("budget_comfort"),
  referralSource: text("referral_source"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCoachingInquirySchema = createInsertSchema(coachingInquiries, {
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional().nullable(),
  preferredCoach: z.enum(["john", "brian", "no_preference"], {
    errorMap: () => ({ message: "Pick a preferred coach" }),
  }),
  workingOn: z.string().min(10, "Tell us a bit more about what you're working on"),
  ninetyDayWin: z.string().min(10, "Tell us what a 90-day win looks like"),
  scheduleNotes: z.string().optional().nullable(),
  budgetComfort: z.string().optional().nullable(),
  referralSource: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  status: true,
});

export type InsertCoachingInquiry = z.infer<typeof insertCoachingInquirySchema>;
export type CoachingInquiry = typeof coachingInquiries.$inferSelect;

export const COACHING_STATUSES = ["new", "contacted", "closed"] as const;
export type CoachingStatus = (typeof COACHING_STATUSES)[number];
