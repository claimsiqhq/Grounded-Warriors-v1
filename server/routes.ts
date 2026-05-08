import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema, insertNewsletterSubscriptionSchema, insertDiscussionSchema, insertDiscussionReplySchema, insertRetreatRegistrationSchema } from "@shared/schema";
import { isFlodeskConfigured, upsertFlodeskSubscriber } from "./flodeskClient";
import { fromZodError } from "zod-validation-error";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sendContactFormEmail, sendNewsletterWelcomeEmail } from "./sendgridClient";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./auth";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { eq } from "drizzle-orm";
import { RETREATS, getRetreat, isValidRetreatId } from "./retreats";

async function getUserFromSession(req: Request) {
  if (!req.session.userId) return null;
  const [user] = await db.select().from(users).where(eq(users.id, req.session.userId));
  return user || null;
}

// Returns true if the user is allowed inside a specific retreat container.
async function userCanAccessRetreat(user: { id: string; role: string }, retreatId: number) {
  if (user.role === "admin") return true;
  if (await storage.userHasRegistrationForRetreat(user.id, retreatId)) return true;
  if (await storage.isUserRetreatStaff(user.id, retreatId)) return true;
  return false;
}

// Express middleware: only admins may pass.
async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getUserFromSession(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  (req as any).currentUser = user;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication BEFORE other routes
  setupAuth(app);
  await registerAuthRoutes(app);
  // Contact form submission endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      // Send email notification to bcoones@gmail.com
      try {
        await sendContactFormEmail({
          name: validatedData.name,
          email: validatedData.email,
          message: validatedData.message
        });
        console.log("Contact form email sent successfully");
      } catch (emailError) {
        console.error("Failed to send contact form email:", emailError);
        // Continue even if email fails - form submission is saved to database
      }
      
      res.status(201).json({ success: true, submission });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          error: validationError.message 
        });
      }
      console.error("Error creating contact submission:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to submit contact form" 
      });
    }
  });

  // Get all contact submissions (optional - for admin use)
  app.get("/api/contact", async (req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json({ success: true, submissions });
    } catch (error) {
      console.error("Error fetching contact submissions:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to fetch submissions" 
      });
    }
  });

  // Newsletter subscription endpoint
  app.post("/api/newsletter", async (req, res) => {
    try {
      const validatedData = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.createNewsletterSubscription(validatedData);

      // Best-effort sync to Flodesk (won't block the response on failure).
      if (isFlodeskConfigured()) {
        upsertFlodeskSubscriber({ email: validatedData.email }).catch((err) => {
          console.error("Flodesk sync error:", err);
        });
      }

      // Best-effort welcome email via SendGrid. Never blocks the response.
      sendNewsletterWelcomeEmail({ email: validatedData.email }).catch((err) => {
        console.error("Newsletter welcome email error:", err?.message || err);
      });

      res.status(201).json({ success: true, subscription });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          success: false, 
          error: validationError.message 
        });
      }
      if (error.code === "23505") {
        return res.status(400).json({ 
          success: false, 
          error: "This email is already subscribed" 
        });
      }
      console.error("Error creating newsletter subscription:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to subscribe to newsletter" 
      });
    }
  });

  app.get("/api/stripe/publishable-key", async (req, res) => {
    try {
      const key = await getStripePublishableKey();
      res.json({ publishableKey: key });
    } catch (error) {
      console.error("Error getting Stripe publishable key:", error);
      res.status(500).json({ error: "Failed to get Stripe configuration" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const rows = await storage.listProductsWithPrices();
      
      const productsMap = new Map();
      for (const row of rows as any[]) {
        if (!productsMap.has(row.product_id)) {
          productsMap.set(row.product_id, {
            id: row.product_id,
            name: row.product_name,
            description: row.product_description,
            active: row.product_active,
            metadata: row.product_metadata,
            prices: []
          });
        }
        if (row.price_id) {
          productsMap.get(row.product_id).prices.push({
            id: row.price_id,
            unit_amount: row.unit_amount,
            currency: row.currency,
            active: row.price_active,
          });
        }
      }

      res.json({ data: Array.from(productsMap.values()) });
    } catch (error) {
      console.error("Error listing products:", error);
      res.status(500).json({ error: "Failed to list products" });
    }
  });

  app.post("/api/checkout", async (req, res) => {
    try {
      const { priceId, customerEmail, customerName, retreatName, amount, paymentType } = req.body;

      const stripe = await getUncachableStripeClient();
      const baseUrl =
        process.env.APP_URL ||
        process.env.RENDER_EXTERNAL_URL ||
        (process.env.REPLIT_DOMAINS
          ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
          : `${req.protocol}://${req.get('host')}`);

      let lineItems;
      
      if (priceId && priceId !== "price_placeholder") {
        lineItems = [{ price: priceId, quantity: 1 }];
      } else if (amount) {
        lineItems = [{
          price_data: {
            currency: 'cad',
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: retreatName || 'Retreat Registration',
              description: paymentType === 'deposit' 
                ? 'Deposit to reserve your spot' 
                : 'Full retreat payment',
            },
          },
          quantity: 1,
        }];
      } else {
        return res.status(400).json({ error: "Price ID or amount is required" });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${baseUrl}/registration/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/retreats`,
        customer_email: customerEmail,
        metadata: {
          customerName: customerName || '',
          retreatName: retreatName || '',
          paymentType: paymentType || '',
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  app.get("/api/checkout/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      res.json({ session });
    } catch (error: any) {
      console.error("Error retrieving checkout session:", error);
      res.status(500).json({ error: error.message || "Failed to retrieve session" });
    }
  });

  // ------------------------------------------------------------------
  // Member Portal: Discussions
  //
  // ?retreatId=<n>  -> scoped to that retreat's private container
  // (no param)      -> General Commons (visible to all members)
  // ------------------------------------------------------------------
  app.get("/api/discussions", isAuthenticated, async (req, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      let retreatId: number | null = null;
      if (typeof req.query.retreatId === "string" && req.query.retreatId.length > 0) {
        const parsed = parseInt(req.query.retreatId, 10);
        if (Number.isNaN(parsed) || !isValidRetreatId(parsed)) {
          return res.status(400).json({ error: "Invalid retreatId" });
        }
        if (!(await userCanAccessRetreat(user, parsed))) {
          return res.status(403).json({ error: "You don't have access to this retreat" });
        }
        retreatId = parsed;
      }

      const discussions = await storage.getDiscussions(retreatId);
      res.json({ discussions });
    } catch (error) {
      console.error("Error fetching discussions:", error);
      res.status(500).json({ error: "Failed to fetch discussions" });
    }
  });

  app.post("/api/discussions", isAuthenticated, async (req: any, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const rawRetreatId = req.body?.retreatId;
      let retreatId: number | null = null;
      if (rawRetreatId !== undefined && rawRetreatId !== null && rawRetreatId !== "") {
        const parsed = typeof rawRetreatId === "number" ? rawRetreatId : parseInt(String(rawRetreatId), 10);
        if (Number.isNaN(parsed) || !isValidRetreatId(parsed)) {
          return res.status(400).json({ error: "Invalid retreatId" });
        }
        if (!(await userCanAccessRetreat(user, parsed))) {
          return res.status(403).json({ error: "You don't have access to this retreat" });
        }
        retreatId = parsed;
      }

      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Member';

      const validatedData = insertDiscussionSchema.parse({
        title: req.body?.title,
        content: req.body?.content,
        retreatId,
        userId: user.id,
        userName,
        userImage: user.profileImageUrl,
      });
      const discussion = await storage.createDiscussion(validatedData);
      res.status(201).json({ discussion });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating discussion:", error);
      res.status(500).json({ error: "Failed to create discussion" });
    }
  });

  app.get("/api/discussions/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const discussion = await storage.getDiscussion(parseInt(req.params.id));
      if (!discussion) {
        return res.status(404).json({ error: "Discussion not found" });
      }
      // Gate scoped discussions behind retreat access.
      if (discussion.retreatId !== null && !(await userCanAccessRetreat(user, discussion.retreatId))) {
        return res.status(403).json({ error: "You don't have access to this retreat" });
      }
      const replies = await storage.getRepliesForDiscussion(discussion.id);
      const retreat = discussion.retreatId !== null ? getRetreat(discussion.retreatId) : null;
      res.json({ discussion, replies, retreat });
    } catch (error) {
      console.error("Error fetching discussion:", error);
      res.status(500).json({ error: "Failed to fetch discussion" });
    }
  });

  app.post("/api/discussions/:id/replies", isAuthenticated, async (req: any, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const discussion = await storage.getDiscussion(parseInt(req.params.id));
      if (!discussion) return res.status(404).json({ error: "Discussion not found" });
      if (discussion.retreatId !== null && !(await userCanAccessRetreat(user, discussion.retreatId))) {
        return res.status(403).json({ error: "You don't have access to this retreat" });
      }

      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Member';

      const validatedData = insertDiscussionReplySchema.parse({
        ...req.body,
        discussionId: discussion.id,
        userId: user.id,
        userName,
        userImage: user.profileImageUrl
      });
      const reply = await storage.createDiscussionReply(validatedData);
      res.status(201).json({ reply });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating reply:", error);
      res.status(500).json({ error: "Failed to create reply" });
    }
  });

  // ------------------------------------------------------------------
  // Retreat containers: list + access check + admin staff management
  // ------------------------------------------------------------------
  app.get("/api/retreats", isAuthenticated, async (_req, res) => {
    res.json({ retreats: RETREATS });
  });

  // List the retreat containers the current user can actually enter
  // (admin -> all; otherwise registered or designated staff).
  app.get("/api/member/my-retreats", isAuthenticated, async (req, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const accessible = await Promise.all(
        RETREATS.map(async (r) => {
          const isStaff = await storage.isUserRetreatStaff(user.id, r.id);
          const isAttendee = await storage.userHasRegistrationForRetreat(user.id, r.id);
          const canAccess = user.role === "admin" || isStaff || isAttendee;
          return canAccess ? { ...r, isStaff, isAttendee } : null;
        }),
      );
      res.json({ retreats: accessible.filter(Boolean) });
    } catch (error) {
      console.error("Error listing my retreats:", error);
      res.status(500).json({ error: "Failed to list retreats" });
    }
  });

  app.get("/api/retreats/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const id = parseInt(req.params.id, 10);
      const retreat = getRetreat(id);
      if (!retreat) return res.status(404).json({ error: "Retreat not found" });

      const canAccess = await userCanAccessRetreat(user, id);
      const isStaff = await storage.isUserRetreatStaff(user.id, id);
      res.json({
        retreat,
        canAccess,
        isStaff,
        isAdmin: user.role === "admin",
      });
    } catch (error) {
      console.error("Error fetching retreat:", error);
      res.status(500).json({ error: "Failed to fetch retreat" });
    }
  });

  // Admin: list staff for a retreat (with user info hydrated)
  app.get("/api/admin/retreats/:id/staff", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!isValidRetreatId(id)) return res.status(404).json({ error: "Retreat not found" });
      const rows = await storage.getRetreatStaff(id);
      const hydrated = await Promise.all(
        rows.map(async (row) => {
          const u = await storage.getUser(row.userId);
          return {
            ...row,
            user: u
              ? { id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName }
              : null,
          };
        }),
      );
      res.json({ staff: hydrated });
    } catch (error) {
      console.error("Error fetching staff:", error);
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  // Admin: designate a member as staff for a retreat (by email).
  app.post("/api/admin/retreats/:id/staff", requireAdmin, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!isValidRetreatId(id)) return res.status(404).json({ error: "Retreat not found" });

      const email = String(req.body?.email || "").trim().toLowerCase();
      if (!email) return res.status(400).json({ error: "Email is required" });

      const target = await storage.getUserByEmail(email);
      if (!target) return res.status(404).json({ error: "No member with that email" });

      if (await storage.isUserRetreatStaff(target.id, id)) {
        return res.status(400).json({ error: "Already staff for this retreat" });
      }

      const entry = await storage.addRetreatStaff({
        retreatId: id,
        userId: target.id,
        addedBy: req.currentUser.id,
      });
      res.status(201).json({ staff: entry });
    } catch (error) {
      console.error("Error adding staff:", error);
      res.status(500).json({ error: "Failed to add staff" });
    }
  });

  // Admin: remove a staff designation.
  app.delete("/api/admin/retreats/:id/staff/:userId", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (!isValidRetreatId(id)) return res.status(404).json({ error: "Retreat not found" });
      await storage.removeRetreatStaff(id, req.params.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing staff:", error);
      res.status(500).json({ error: "Failed to remove staff" });
    }
  });

  // Member Portal: Registrations
  app.get("/api/member/registrations", isAuthenticated, async (req: any, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });
      
      const registrations = await storage.getUserRegistrations(user.id);
      res.json({ registrations });
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ error: "Failed to fetch registrations" });
    }
  });

  // Admin-only: manually attach a member to a retreat (e.g. to backfill
  // attendance for past retreats so they get container access). Public
  // self-registration is intentionally disabled here because granting a
  // registration also grants access to that retreat's private container.
  // Real paid registrations are created server-side by the Stripe flow.
  app.post("/api/member/registrations", requireAdmin, async (req: any, res) => {
    try {
      const adminUser = req.currentUser;

      const rawRetreatId = req.body?.retreatId;
      let retreatId: number | null = null;
      if (rawRetreatId !== undefined && rawRetreatId !== null && rawRetreatId !== "") {
        const parsed = typeof rawRetreatId === "number" ? rawRetreatId : parseInt(String(rawRetreatId), 10);
        if (Number.isNaN(parsed) || !isValidRetreatId(parsed)) {
          return res.status(400).json({ error: "Invalid retreatId" });
        }
        retreatId = parsed;
      }

      // Admin can register any member by user id; falls back to themselves.
      const targetUserId = req.body?.userId || adminUser.id;

      const validatedData = insertRetreatRegistrationSchema.parse({
        ...req.body,
        retreatId,
        userId: targetUserId,
      });
      const registration = await storage.createRetreatRegistration(validatedData);
      res.status(201).json({ registration });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating registration:", error);
      res.status(500).json({ error: "Failed to create registration" });
    }
  });

  return httpServer;
}
