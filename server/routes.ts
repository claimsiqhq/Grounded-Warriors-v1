import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSubmissionSchema, insertNewsletterSubscriptionSchema, insertDiscussionSchema, insertDiscussionReplySchema, insertRetreatRegistrationSchema, insertCoachingInquirySchema, COACHING_STATUSES, type CoachingStatus } from "@shared/schema";
import { isFlodeskConfigured, upsertFlodeskSubscriber } from "./flodeskClient";
import { fromZodError } from "zod-validation-error";
import { getStripeClient } from "./stripeClient";
import { sendContactFormEmail, sendNewsletterWelcomeEmail, sendCoachingInquiryNotification, sendCoachingInquiryAutoReply } from "./sendgridClient";
import { requireAuth } from "./middlewares/requireAuth";
import { publicFormLimiter } from "./rateLimit";
import { z } from "zod";
import { RETREATS, getRetreat, isValidRetreatId, getRetreatPrice } from "./retreats";
import {
  attachStripeSession,
  failOrder,
  getPublicOrder,
  reserveOrder,
} from "./payments";

async function getUserFromSession(req: Request) {
  return req.dbUser || null;
}

function getDisplayIdentity(req: Request, user: { email: string }) {
  const firstName =
    typeof req.sessionClaims?.firstName === "string"
      ? req.sessionClaims.firstName
      : "";
  const lastName =
    typeof req.sessionClaims?.lastName === "string"
      ? req.sessionClaims.lastName
      : "";
  const email =
    typeof req.sessionClaims?.email === "string"
      ? req.sessionClaims.email
      : user.email;

  return {
    email,
    userName: `${firstName} ${lastName}`.trim() || email || "Member",
  };
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

// Public, indexable routes for the sitemap (keep in sync with client/src/App.tsx).
const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/experience",
  "/retreats",
  "/retreats/marmora",
  "/retreats/first-responders-veterans",
  "/events/mens-dinner",
  "/events/train-breath-plunge",
  "/past-retreats",
  "/faq",
  "/team",
  "/contact",
  "/coaching",
];

function getPublicBaseUrl(req: Request): string {
  return (
    process.env.APP_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
      : `${req.protocol}://${req.get("host")}`)
  ).replace(/\/+$/, "");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/robots.txt", (req, res) => {
    const baseUrl = getPublicBaseUrl(req);
    res.type("text/plain").send(
      [
        "User-agent: *",
        "Allow: /",
        "Disallow: /login",
        "Disallow: /member",
        "Disallow: /admin",
        "Disallow: /registration/success",
        "Disallow: /api/",
        "",
        `Sitemap: ${baseUrl}/sitemap.xml`,
        "",
      ].join("\n"),
    );
  });

  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = getPublicBaseUrl(req);
    const urls = PUBLIC_ROUTES.map(
      (route) => `  <url>\n    <loc>${baseUrl}${route}</loc>\n  </url>`,
    ).join("\n");
    res.type("application/xml").send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    );
  });

  app.get("/api/me", requireAuth, (req, res) => {
    const user = req.dbUser;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    res.json({
      user: {
        id: user.id,
        role: user.role,
      },
    });
  });

  // Contact form submission endpoint
  app.post("/api/contact", publicFormLimiter, async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      // Send email notification to john.shoust@pm.me
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

  // Get all contact submissions (admin only - contains PII)
  app.get("/api/contact", requireAuth, requireAdmin, async (req, res) => {
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
  app.post("/api/newsletter", publicFormLimiter, async (req, res) => {
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

  const checkoutSchema = z.object({
    customerEmail: z.string().email("A valid email is required").max(320),
    customerName: z.string().max(200).optional().default(""),
    retreatId: z.union([z.number(), z.string()]),
    paymentType: z.literal("full"),
  });

  app.post("/api/checkout", publicFormLimiter, async (req, res) => {
    try {
      const parsedBody = checkoutSchema.safeParse(req.body);
      if (!parsedBody.success) {
        return res.status(400).json({ error: fromZodError(parsedBody.error).message });
      }
      const { customerEmail, customerName, retreatId, paymentType } = parsedBody.data;

      // Validate the retreat reference. Pricing is ALWAYS derived from the
      // server-side canonical registry - we never trust a client-supplied
      // amount, which would allow a tampered request to underpay.
      const parsedId =
        typeof retreatId === "number" ? retreatId : parseInt(String(retreatId), 10);
      if (Number.isNaN(parsedId) || !isValidRetreatId(parsedId)) {
        return res.status(400).json({ error: "Invalid retreatId" });
      }

      const retreat = getRetreat(parsedId)!;
      const baseAmount = getRetreatPrice(parsedId, paymentType);
      if (baseAmount === null) {
        return res
          .status(400)
          .json({ error: "This retreat is not available for online payment." });
      }

      const baseCents = Math.round(baseAmount * 100);
      const hstCents = Math.round(baseCents * 0.13);

      const stripe = getStripeClient();
      const baseUrl = getPublicBaseUrl(req);
      const order = await reserveOrder({
        retreatId: parsedId,
        customerEmail: customerEmail.trim().toLowerCase(),
        customerName: customerName.trim(),
        subtotalCents: baseCents,
        taxCents: hstCents,
      });
      if (order.stripeCheckoutSessionId) {
        const existingSession = await stripe.checkout.sessions.retrieve(
          order.stripeCheckoutSessionId,
        );
        if (existingSession.status === "open" && existingSession.url) {
          return res.json({ url: existingSession.url });
        }
        await failOrder(order.publicId);
        return res.status(409).json({
          error: "Your previous checkout expired. Please try again.",
        });
      }

      const lineItems = [
        {
          price_data: {
            currency: 'cad',
            unit_amount: baseCents,
            product_data: {
              name: retreat.name,
              description: 'Full retreat payment',
            },
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: 'cad',
            unit_amount: hstCents,
            product_data: {
              name: 'HST (13%)',
              description: 'Ontario Harmonized Sales Tax',
            },
          },
          quantity: 1,
        },
      ];

      let session;
      try {
        session = await stripe.checkout.sessions.create(
          {
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${baseUrl}/registration/success?order=${order.publicId}`,
            cancel_url: `${baseUrl}/retreats`,
            customer_email: order.customerEmail,
            client_reference_id: order.publicId,
            expires_at: Math.floor(order.holdExpiresAt.getTime() / 1000),
            metadata: {
              orderId: order.publicId,
              customerName: order.customerName,
              retreatId: String(parsedId),
              retreatName: retreat.name,
              retreatDate: retreat.date,
              paymentType,
            },
            payment_intent_data: {
              metadata: {
                orderId: order.publicId,
                retreatId: String(parsedId),
              },
            },
          },
          { idempotencyKey: `checkout-${order.publicId}` },
        );
        await attachStripeSession(order.publicId, session.id);
      } catch (error) {
        if (session?.id) {
          await stripe.checkout.sessions.expire(session.id).catch((expireError) => {
            console.error("Failed to expire orphaned Checkout Session:", expireError);
          });
        }
        await failOrder(order.publicId);
        throw error;
      }

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      const message =
        error?.message === "This offering is sold out." ||
        error?.message === "Online registration is not open for this offering."
          ? error.message
          : "Failed to create checkout session";
      res.status(message.includes("sold out") ? 409 : message.includes("not open") ? 400 : 500)
        .json({ error: message });
    }
  });

  app.get("/api/checkout/order/:publicId", async (req, res) => {
    try {
      const { publicId } = req.params;
      if (!/^[a-f0-9]{32}$/.test(publicId)) {
        return res.status(400).json({ error: "Invalid order id" });
      }
      const order = await getPublicOrder(publicId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      const retreat = getRetreat(order.retreat_id);
      res.setHeader("Cache-Control", "no-store");
      res.json({
        order: {
          id: order.public_id,
          status: order.status,
          amount_total: order.total_cents,
          currency: order.currency,
          retreatName: retreat?.name ?? null,
        },
      });
    } catch (error: any) {
      console.error("Error retrieving checkout order:", error);
      res.status(500).json({ error: "Failed to retrieve order" });
    }
  });

  // ------------------------------------------------------------------
  // Member Portal: Discussions
  //
  // ?retreatId=<n>  -> scoped to that retreat's private container
  // (no param)      -> General Commons (visible to all members)
  // ------------------------------------------------------------------
  app.get("/api/discussions", requireAuth, async (req, res) => {
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

  app.post("/api/discussions", requireAuth, async (req: any, res) => {
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

      const { userName } = getDisplayIdentity(req, user);

      const validatedData = insertDiscussionSchema.parse({
        title: req.body?.title,
        content: req.body?.content,
        retreatId,
        userId: user.id,
        userName,
        userImage: null,
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

  app.get("/api/discussions/:id", requireAuth, async (req, res) => {
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

  app.post("/api/discussions/:id/replies", requireAuth, async (req: any, res) => {
    try {
      const user = await getUserFromSession(req);
      if (!user) return res.status(401).json({ error: "Not authenticated" });

      const discussion = await storage.getDiscussion(parseInt(req.params.id));
      if (!discussion) return res.status(404).json({ error: "Discussion not found" });
      if (discussion.retreatId !== null && !(await userCanAccessRetreat(user, discussion.retreatId))) {
        return res.status(403).json({ error: "You don't have access to this retreat" });
      }

      const { userName } = getDisplayIdentity(req, user);

      const validatedData = insertDiscussionReplySchema.parse({
        ...req.body,
        discussionId: discussion.id,
        userId: user.id,
        userName,
        userImage: null
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
  app.get("/api/retreats", requireAuth, async (_req, res) => {
    res.json({ retreats: RETREATS });
  });

  // List the retreat containers the current user can actually enter
  // (admin -> all; otherwise registered or designated staff).
  app.get("/api/member/my-retreats", requireAuth, async (req, res) => {
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

  app.get("/api/retreats/:id", requireAuth, async (req, res) => {
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
  app.get("/api/admin/retreats/:id/staff", requireAuth, requireAdmin, async (req, res) => {
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
  app.post("/api/admin/retreats/:id/staff", requireAuth, requireAdmin, async (req: any, res) => {
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
  app.delete("/api/admin/retreats/:id/staff/:userId", requireAuth, requireAdmin, async (req, res) => {
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

  // ------------------------------------------------------------------
  // Brown Courage Coaching: 1-on-1 inquiries
  // ------------------------------------------------------------------
  app.post("/api/coaching/inquiries", publicFormLimiter, async (req, res) => {
    try {
      const validated = insertCoachingInquirySchema.parse(req.body);
      const inquiry = await storage.createCoachingInquiry(validated);

      // Best-effort emails — never block the response on failure.
      sendCoachingInquiryNotification(inquiry).catch((err) => {
        console.error("Coaching notification email error:", err?.message || err);
      });
      sendCoachingInquiryAutoReply(inquiry).catch((err) => {
        console.error("Coaching auto-reply email error:", err?.message || err);
      });

      res.status(201).json({ success: true, inquiry });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      console.error("Error creating coaching inquiry:", error);
      res.status(500).json({ error: "Failed to submit application" });
    }
  });

  app.get("/api/admin/coaching/inquiries", requireAuth, requireAdmin, async (_req, res) => {
    try {
      const inquiries = await storage.listCoachingInquiries();
      res.json({ inquiries });
    } catch (error) {
      console.error("Error listing coaching inquiries:", error);
      res.status(500).json({ error: "Failed to list inquiries" });
    }
  });

  app.patch("/api/admin/coaching/inquiries/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (Number.isNaN(id)) return res.status(400).json({ error: "Invalid id" });
      const status = String(req.body?.status || "") as CoachingStatus;
      if (!COACHING_STATUSES.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const updated = await storage.updateCoachingInquiryStatus(id, status);
      if (!updated) return res.status(404).json({ error: "Inquiry not found" });
      res.json({ inquiry: updated });
    } catch (error) {
      console.error("Error updating coaching inquiry:", error);
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  });

  // Member Portal: Registrations
  app.get("/api/member/registrations", requireAuth, async (req: any, res) => {
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
  app.post("/api/member/registrations", requireAuth, requireAdmin, async (req: any, res) => {
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
