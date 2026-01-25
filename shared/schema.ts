import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
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

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
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

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

// Member portal tables
export const retreatRegistrations = pgTable("retreat_registrations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  retreatName: text("retreat_name").notNull(),
  retreatDate: text("retreat_date").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentAmount: text("payment_amount"),
  stripeSessionId: text("stripe_session_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRetreatRegistrationSchema = createInsertSchema(retreatRegistrations).omit({
  id: true,
  createdAt: true,
});

export type InsertRetreatRegistration = z.infer<typeof insertRetreatRegistrationSchema>;
export type RetreatRegistration = typeof retreatRegistrations.$inferSelect;

// Discussion board
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  userImage: text("user_image"),
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
