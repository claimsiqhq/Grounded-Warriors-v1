import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

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
export const retreatStaff = pgTable(
  "retreat_staff",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id").notNull(),
    userId: text("user_id").notNull(),
    addedBy: text("added_by").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("retreat_staff_retreat_user_unique").on(table.retreatId, table.userId),
  ],
);

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
export const discussions = pgTable(
  "discussions",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    userName: text("user_name").notNull(),
    userImage: text("user_image"),
    retreatId: integer("retreat_id"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    isPinned: boolean("is_pinned").notNull().default(false),
    isLocked: boolean("is_locked").notNull().default(false),
    isHidden: boolean("is_hidden").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    editedAt: timestamp("edited_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("discussions_scope_created_idx").on(table.retreatId, table.createdAt),
  ],
);

export const insertDiscussionSchema = createInsertSchema(discussions, {
  title: z.string().trim().min(3).max(160),
  content: z.string().trim().min(1).max(10000),
}).omit({
  id: true,
  isPinned: true,
  isLocked: true,
  isHidden: true,
  deletedAt: true,
  editedAt: true,
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

export const insertDiscussionReplySchema = createInsertSchema(discussionReplies, {
  content: z.string().trim().min(1).max(5000),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertDiscussionReply = z.infer<typeof insertDiscussionReplySchema>;
export type DiscussionReply = typeof discussionReplies.$inferSelect;

// Retreat community hub. Retreat IDs reference the permanent registry in
// server/retreats.ts; member IDs reference the Clerk-linked local user row.
export const communityProfiles = pgTable("community_profiles", {
  userId: varchar("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  displayName: varchar("display_name", { length: 120 }).notNull(),
  bio: varchar("bio", { length: 600 }).notNull().default(""),
  location: varchar("location", { length: 120 }).notNull().default(""),
  interests: text("interests").array().notNull().default([]),
  directoryVisible: boolean("directory_visible").notNull().default(false),
  buddyContact: varchar("buddy_contact", { length: 200 }).notNull().default(""),
  photoConsent: boolean("photo_consent").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityProfileInputSchema = createInsertSchema(communityProfiles, {
  displayName: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(600).default(""),
  location: z.string().trim().max(120).default(""),
  interests: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  buddyContact: z.string().trim().max(200).default(""),
}).omit({ userId: true, updatedAt: true });

export const retreatHubSettings = pgTable("retreat_hub_settings", {
  retreatId: integer("retreat_id").primaryKey(),
  welcomeMessage: text("welcome_message").notNull().default(""),
  timezone: varchar("timezone", { length: 80 }).notNull().default("America/Toronto"),
  initializedAt: timestamp("initialized_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const hubAnnouncements = pgTable(
  "hub_announcements",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id"),
    authorId: varchar("author_id").notNull().references(() => users.id),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    isPinned: boolean("is_pinned").notNull().default(false),
    isPublished: boolean("is_published").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("hub_announcements_scope_idx").on(table.retreatId, table.createdAt)],
);

export const announcementInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(10000),
  isPinned: z.boolean().default(false),
  isPublished: z.boolean().default(true),
});

export const hubItineraryItems = pgTable(
  "hub_itinerary_items",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    location: varchar("location", { length: 240 }).notNull().default(""),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: varchar("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("hub_itinerary_retreat_start_idx").on(table.retreatId, table.startsAt)],
);

export const itineraryInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).default(""),
  location: z.string().trim().max(240).default(""),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000).default(0),
});

export const hubResources = pgTable(
  "hub_resources",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id"),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    category: varchar("category", { length: 60 }).notNull().default("guide"),
    externalUrl: text("external_url"),
    storagePath: text("storage_path"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    createdBy: varchar("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("hub_resources_scope_idx").on(table.retreatId, table.sortOrder)],
);

export const resourceInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).default(""),
  category: z.string().trim().min(2).max(60).default("guide"),
  externalUrl: z.string().url().max(2000).nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  isPublished: z.boolean().default(true),
});

export const hubEvents = pgTable(
  "hub_events",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id"),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    location: varchar("location", { length: 240 }).notNull().default(""),
    meetingUrl: text("meeting_url"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    createdBy: varchar("created_by").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("hub_events_scope_start_idx").on(table.retreatId, table.startsAt)],
);

export const eventInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).default(""),
  location: z.string().trim().max(240).default(""),
  meetingUrl: z.string().url().max(2000).nullable().optional(),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date().nullable().optional(),
});

export const hubChecklistItems = pgTable(
  "hub_checklist_items",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id"),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    phase: varchar("phase", { length: 32 }).notNull().default("prepare"),
    dueAt: timestamp("due_at", { withTimezone: true }),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: varchar("created_by").notNull().references(() => users.id),
  },
  (table) => [index("hub_checklist_scope_idx").on(table.retreatId, table.phase, table.sortOrder)],
);

export const checklistItemInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).default(""),
  phase: z.enum(["prepare", "during", "integration"]).default("prepare"),
  dueAt: z.coerce.date().nullable().optional(),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export const hubChecklistCompletions = pgTable(
  "hub_checklist_completions",
  {
    itemId: integer("item_id").notNull().references(() => hubChecklistItems.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.itemId, table.userId] })],
);

export const buddyOptIns = pgTable(
  "buddy_opt_ins",
  {
    retreatId: integer("retreat_id").notNull(),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    notes: varchar("notes", { length: 400 }).notNull().default(""),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.retreatId, table.userId] })],
);

export const buddyMatches = pgTable(
  "buddy_matches",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id").notNull(),
    userOneId: varchar("user_one_id").notNull().references(() => users.id),
    userTwoId: varchar("user_two_id").notNull().references(() => users.id),
    createdBy: varchar("created_by").notNull().references(() => users.id),
    active: boolean("active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
  },
  (table) => [
    index("buddy_matches_retreat_active_idx").on(table.retreatId, table.active),
  ],
);

export const retreatPhotos = pgTable(
  "retreat_photos",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id").notNull(),
    uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
    storagePath: text("storage_path").notNull().unique(),
    caption: varchar("caption", { length: 500 }).notNull().default(""),
    contentType: varchar("content_type", { length: 80 }).notNull(),
    byteSize: integer("byte_size").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    moderatedBy: varchar("moderated_by").references(() => users.id),
    moderatedAt: timestamp("moderated_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("retreat_photos_scope_status_idx").on(table.retreatId, table.status, table.createdAt)],
);

export const integrationMilestones = pgTable(
  "integration_milestones",
  {
    id: serial("id").primaryKey(),
    retreatId: integer("retreat_id"),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description").notNull().default(""),
    daysAfter: integer("days_after").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdBy: varchar("created_by").notNull().references(() => users.id),
  },
  (table) => [index("integration_milestones_scope_idx").on(table.retreatId, table.sortOrder)],
);

export const milestoneInputSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).default(""),
  daysAfter: z.number().int().min(0).max(730),
  sortOrder: z.number().int().min(0).max(10000).default(0),
  isActive: z.boolean().default(true),
});

export const integrationCompletions = pgTable(
  "integration_completions",
  {
    milestoneId: integer("milestone_id").notNull().references(() => integrationMilestones.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.milestoneId, table.userId] })],
);

export const discussionReactions = pgTable(
  "discussion_reactions",
  {
    discussionId: integer("discussion_id").notNull().references(() => discussions.id, { onDelete: "cascade" }),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    kind: varchar("kind", { length: 24 }).notNull().default("support"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.discussionId, table.userId, table.kind] })],
);

export const discussionReports = pgTable(
  "discussion_reports",
  {
    id: serial("id").primaryKey(),
    discussionId: integer("discussion_id").notNull().references(() => discussions.id, { onDelete: "cascade" }),
    reporterId: varchar("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 500 }).notNull(),
    status: varchar("status", { length: 24 }).notNull().default("open"),
    resolvedBy: varchar("resolved_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("discussion_reports_unique").on(table.discussionId, table.reporterId)],
);

export const hubNotifications = pgTable(
  "hub_notifications",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 40 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    body: varchar("body", { length: 500 }).notNull().default(""),
    href: text("href"),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("hub_notifications_user_idx").on(table.userId, table.readAt, table.createdAt)],
);

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
