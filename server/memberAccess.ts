import type { NextFunction, Request, Response } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "./db";
import { retreatRegistrations, retreatStaff, type User } from "@shared/schema";
import { isValidRetreatId } from "./retreats";

const ACCESS_PAYMENT_STATUSES = ["paid", "completed", "deposit_paid"];

export function getSessionUser(req: Request): User | null {
  return req.dbUser ?? null;
}

export function parseRetreatId(value: unknown): number | null {
  const retreatId =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(retreatId) && isValidRetreatId(retreatId)
    ? retreatId
    : null;
}

export async function userIsRetreatStaff(userId: string, retreatId: number) {
  const [row] = await db
    .select({ id: retreatStaff.id })
    .from(retreatStaff)
    .where(and(eq(retreatStaff.userId, userId), eq(retreatStaff.retreatId, retreatId)))
    .limit(1);
  return Boolean(row);
}

export async function userHasPaidRetreat(userId: string, retreatId?: number) {
  const conditions = [
    eq(retreatRegistrations.userId, userId),
    inArray(retreatRegistrations.paymentStatus, ACCESS_PAYMENT_STATUSES),
  ];
  if (retreatId !== undefined) {
    conditions.push(eq(retreatRegistrations.retreatId, retreatId));
  }
  const [row] = await db
    .select({ id: retreatRegistrations.id })
    .from(retreatRegistrations)
    .where(and(...conditions))
    .limit(1);
  return Boolean(row);
}

export async function userCanAccessRetreat(user: User, retreatId: number) {
  return (
    user.role === "admin" ||
    (await userHasPaidRetreat(user.id, retreatId)) ||
    (await userIsRetreatStaff(user.id, retreatId))
  );
}

export async function userCanManageRetreat(user: User, retreatId: number) {
  return user.role === "admin" || userIsRetreatStaff(user.id, retreatId);
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  if (user.role !== "admin") return res.status(403).json({ error: "Admin only" });
  (req as Request & { currentUser: User }).currentUser = user;
  next();
}
