import { 
  type User, 
  type ContactSubmission, type InsertContactSubmission, 
  type NewsletterSubscription, type InsertNewsletterSubscription,
  type Discussion, type InsertDiscussion,
  type DiscussionReply, type InsertDiscussionReply,
  type RetreatRegistration, type InsertRetreatRegistration,
  users, contactSubmissions, newsletterSubscriptions,
  discussions, discussionReplies, retreatRegistrations
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  getContactSubmissions(): Promise<ContactSubmission[]>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  getNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  // Discussions
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
  getDiscussions(): Promise<Discussion[]>;
  getDiscussion(id: number): Promise<Discussion | undefined>;
  // Replies
  createDiscussionReply(reply: InsertDiscussionReply): Promise<DiscussionReply>;
  getRepliesForDiscussion(discussionId: number): Promise<DiscussionReply[]>;
  // Registrations
  createRetreatRegistration(registration: InsertRetreatRegistration): Promise<RetreatRegistration>;
  getUserRegistrations(userId: string): Promise<RetreatRegistration[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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

  async getDiscussions(): Promise<Discussion[]> {
    return await db.select().from(discussions).orderBy(desc(discussions.createdAt));
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
