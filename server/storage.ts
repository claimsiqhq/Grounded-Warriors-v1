import {
  type User,
  type ContactSubmission, type InsertContactSubmission,
  type NewsletterSubscription, type InsertNewsletterSubscription,
  type Discussion, type InsertDiscussion,
  type DiscussionReply, type InsertDiscussionReply,
  type RetreatRegistration, type InsertRetreatRegistration,
  type RetreatStaff, type InsertRetreatStaff,
  users, contactSubmissions, newsletterSubscriptions,
  discussions, discussionReplies, retreatRegistrations, retreatStaff,
} from "@shared/schema";
import { db } from "./db";
import { and, eq, isNull, sql, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  // Discussions (retreatId === null => General Commons)
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  getDiscussions(retreatId: number | null): Promise<Discussion[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  // Replies
  createDiscussionReply(reply: InsertDiscussionReply): Promise<DiscussionReply>;
  getRepliesForDiscussion(discussionId: number): Promise<DiscussionReply[]>;
  // Registrations
  createRetreatRegistration(registration: InsertRetreatRegistration): Promise<RetreatRegistration>;
  getUserRegistrations(userId: string): Promise<RetreatRegistration[]>;
  userHasRegistrationForRetreat(userId: string, retreatId: number): Promise<boolean>;
  // Retreat staff
  getRetreatStaff(retreatId: number): Promise<RetreatStaff[]>;
  isUserRetreatStaff(userId: string, retreatId: number): Promise<boolean>;
  addRetreatStaff(entry: InsertRetreatStaff): Promise<RetreatStaff>;
  removeRetreatStaff(retreatId: number, userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));
    return user;
  }

  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [contactSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return contactSubmission;
  }

  async getContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions).orderBy(contactSubmissions.createdAt);
  }

  async createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    const [newsletterSubscription] = await db.insert(newsletterSubscriptions).values(subscription).returning();
    return newsletterSubscription;
  }

  async getNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return await db.select().from(newsletterSubscriptions).orderBy(newsletterSubscriptions.createdAt);
  }

  // Discussion methods
  async createDiscussion(discussion: InsertDiscussion): Promise<Discussion> {
    const [newDiscussion] = await db.insert(discussions).values(discussion).returning();
    return newDiscussion;
  }

  async getDiscussions(retreatId: number | null): Promise<Discussion[]> {
    const where =
      retreatId === null
        ? isNull(discussions.retreatId)
        : eq(discussions.retreatId, retreatId);
    return await db
      .select()
      .from(discussions)
      .where(where)
      .orderBy(desc(discussions.createdAt));
  }

  async getDiscussion(id: number): Promise<Discussion | undefined> {
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, id));
    return discussion;
  }

  // Reply methods
  async createDiscussionReply(reply: InsertDiscussionReply): Promise<DiscussionReply> {
    const [newReply] = await db.insert(discussionReplies).values(reply).returning();
    return newReply;
  }

  async getRepliesForDiscussion(discussionId: number): Promise<DiscussionReply[]> {
    return await db.select().from(discussionReplies).where(eq(discussionReplies.discussionId, discussionId)).orderBy(discussionReplies.createdAt);
  }

  // Registration methods
  async createRetreatRegistration(registration: InsertRetreatRegistration): Promise<RetreatRegistration> {
    const [newRegistration] = await db.insert(retreatRegistrations).values(registration).returning();
    return newRegistration;
  }

  async getUserRegistrations(userId: string): Promise<RetreatRegistration[]> {
    return await db.select().from(retreatRegistrations).where(eq(retreatRegistrations.userId, userId)).orderBy(desc(retreatRegistrations.createdAt));
  }

  async userHasRegistrationForRetreat(userId: string, retreatId: number): Promise<boolean> {
    const rows = await db
      .select({ id: retreatRegistrations.id })
      .from(retreatRegistrations)
      .where(
        and(
          eq(retreatRegistrations.userId, userId),
          eq(retreatRegistrations.retreatId, retreatId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  }

  // Retreat staff methods
  async getRetreatStaff(retreatId: number): Promise<RetreatStaff[]> {
    return await db
      .select()
      .from(retreatStaff)
      .where(eq(retreatStaff.retreatId, retreatId))
      .orderBy(desc(retreatStaff.createdAt));
  }

  async isUserRetreatStaff(userId: string, retreatId: number): Promise<boolean> {
    const rows = await db
      .select({ id: retreatStaff.id })
      .from(retreatStaff)
      .where(
        and(
          eq(retreatStaff.userId, userId),
          eq(retreatStaff.retreatId, retreatId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  }

  async addRetreatStaff(entry: InsertRetreatStaff): Promise<RetreatStaff> {
    const [row] = await db.insert(retreatStaff).values(entry).returning();
    return row;
  }

  async removeRetreatStaff(retreatId: number, userId: string): Promise<void> {
    await db
      .delete(retreatStaff)
      .where(
        and(
          eq(retreatStaff.retreatId, retreatId),
          eq(retreatStaff.userId, userId),
        ),
      );
  }

  async listProducts(active = true) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE active = ${active} ORDER BY name`
    );
    return result.rows;
  }

  async listProductsWithPrices(active = true) {
    const result = await db.execute(
      sql`
        SELECT 
          p.id as product_id,
          p.name as product_name,
          p.description as product_description,
          p.active as product_active,
          p.metadata as product_metadata,
          pr.id as price_id,
          pr.unit_amount,
          pr.currency,
          pr.active as price_active
        FROM stripe.products p
        LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
        WHERE p.active = ${active}
        ORDER BY p.name, pr.unit_amount
      `
    );
    return result.rows;
  }

  async getProduct(productId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.products WHERE id = ${productId}`
    );
    return result.rows[0] || null;
  }

  async getPrice(priceId: string) {
    const result = await db.execute(
      sql`SELECT * FROM stripe.prices WHERE id = ${priceId}`
    );
    return result.rows[0] || null;
  }
}

export const storage = new DatabaseStorage();
