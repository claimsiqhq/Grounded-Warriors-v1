import type { NextFunction, Request, Response } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { retreatRegistrations, users, type User } from "@shared/schema";

type SessionClaims = Record<string, unknown>;

declare global {
  namespace Express {
    interface Request {
      dbUser?: User;
      sessionClaims?: SessionClaims;
    }
  }
}

function claimString(claims: SessionClaims, name: string): string | undefined {
  const value = claims[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isAdminEmail(email: string): boolean {
  return (process.env.STAFF_EMAILS || "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

/**
 * Validates the Clerk session and finds the matching application user.
 *
 * Every Clerk session resolves to the local user through sessionClaims.userId.
 * For migrated accounts this is the preserved legacy ID; for new accounts it
 * is the Clerk-native ID exposed through the configured bridge claim.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const auth = getAuth(req);
    const sessionClaims = (auth.sessionClaims || {}) as SessionClaims;
    const bridgeUserId = claimString(sessionClaims, "userId");
    let email = claimString(sessionClaims, "email")?.toLowerCase();

    if (!auth.userId || !bridgeUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    let [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, bridgeUserId))
      .limit(1);

    if (dbUser && !email) {
      email = dbUser.email.toLowerCase();
    }

    if (!dbUser && !email) {
      const clerkUser = await clerkClient.users.getUser(auth.userId);
      email = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase();
    }

    if (!email) {
      return res.status(401).json({ error: "Unable to resolve member email" });
    }

    if (!dbUser) {
      const [inserted] = await db
        .insert(users)
        .values({
          id: bridgeUserId,
          email,
          // The preserved legacy column is required by the existing table.
          // Clerk owns passwords; this placeholder is only written at JIT
          // provisioning time and is never used for authentication.
          password: "",
          role: isAdminEmail(email) ? "admin" : "member",
        })
        .onConflictDoNothing()
        .returning();

      if (inserted) {
        dbUser = inserted;
      } else {
        [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.id, bridgeUserId))
          .limit(1);
      }
    }

    if (!dbUser) {
      return res.status(401).json({ error: "Unable to load member account" });
    }

    if (isAdminEmail(email) && dbUser.role !== "admin") {
      const [updated] = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, dbUser.id))
        .returning();
      dbUser = updated ?? dbUser;
    }

    // Preserve the original "claim registrations by email on login" behavior
    // for first-time Clerk users without syncing identity data on each request.
    await db
      .update(retreatRegistrations)
      .set({ userId: dbUser.id })
      .where(
        and(
          isNull(retreatRegistrations.userId),
          eq(retreatRegistrations.email, email),
        ),
      );

    req.dbUser = dbUser;
    req.sessionClaims = sessionClaims;
    next();
  } catch (error) {
    console.error("Clerk authentication bridge error:", error);
    res.status(500).json({ error: "Authentication service error" });
  }
}