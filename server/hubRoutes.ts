import type { Express, Request, Response } from "express";
import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { z } from "zod";
import { db } from "./db";
import { requireAuth } from "./middlewares/requireAuth";
import {
  getSessionUser,
  parseRetreatId,
  requireAdmin,
  userCanAccessRetreat,
  userCanManageRetreat,
  userHasPaidRetreat,
} from "./memberAccess";
import { getRetreat } from "./retreats";
import {
  announcementInputSchema,
  buddyMatches,
  buddyOptIns,
  checklistItemInputSchema,
  communityProfileInputSchema,
  communityProfiles,
  eventInputSchema,
  hubAnnouncements,
  hubChecklistCompletions,
  hubChecklistItems,
  hubEvents,
  hubItineraryItems,
  hubNotifications,
  hubResources,
  integrationCompletions,
  integrationMilestones,
  itineraryInputSchema,
  milestoneInputSchema,
  resourceInputSchema,
  retreatHubSettings,
  retreatPhotos,
  retreatRegistrations,
  retreatStaff,
  users,
  discussionReports,
  discussionReactions,
  discussions,
} from "@shared/schema";
import {
  createPhotoPath,
  createPhotoUpload,
  isMediaConfigured,
  MAX_PHOTO_BYTES,
  PHOTO_CONTENT_TYPES,
  removeMediaObjects,
  signPhotoUrl,
  verifyPhotoObject,
} from "./supabaseMedia";

const contentTypes = [
  "announcement",
  "itinerary",
  "resource",
  "event",
  "checklist",
  "milestone",
] as const;
type ContentType = (typeof contentTypes)[number];

const idSchema = z.coerce.number().int().positive();
const scopeSchema = z.union([z.literal("global"), z.coerce.number().int().positive()]);

function badRequest(res: Response, message: string) {
  return res.status(400).json({ error: message });
}

async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(communityProfiles)
    .where(eq(communityProfiles.userId, userId))
    .limit(1);
  return profile;
}

async function assertRetreatAccess(req: Request, res: Response) {
  const user = getSessionUser(req);
  const retreatId = parseRetreatId(req.params.retreatId);
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  if (!retreatId) {
    badRequest(res, "Invalid retreat");
    return null;
  }
  if (!(await userCanAccessRetreat(user, retreatId))) {
    res.status(403).json({ error: "You don't have access to this retreat" });
    return null;
  }
  return { user, retreatId };
}

async function assertRetreatManager(req: Request, res: Response) {
  const access = await assertRetreatAccess(req, res);
  if (!access) return null;
  if (!(await userCanManageRetreat(access.user, access.retreatId))) {
    res.status(403).json({ error: "Retreat staff access required" });
    return null;
  }
  return access;
}

async function getAccessibleMemberIds(retreatId: number) {
  const [registrations, staff] = await Promise.all([
    db
      .select({ userId: retreatRegistrations.userId })
      .from(retreatRegistrations)
      .where(
        and(
          eq(retreatRegistrations.retreatId, retreatId),
          inArray(retreatRegistrations.paymentStatus, ["paid", "completed", "deposit_paid"]),
        ),
      ),
    db
      .select({ userId: retreatStaff.userId })
      .from(retreatStaff)
      .where(eq(retreatStaff.retreatId, retreatId)),
  ]);
  return Array.from(
    new Set(
      [...registrations, ...staff]
        .map((row) => row.userId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
}

async function notifyRetreat(
  retreatId: number,
  notification: { type: string; title: string; body?: string; href?: string },
) {
  const userIds = await getAccessibleMemberIds(retreatId);
  if (userIds.length === 0) return;
  await db.insert(hubNotifications).values(
    userIds.map((userId) => ({
      userId,
      type: notification.type,
      title: notification.title,
      body: notification.body ?? "",
      href: notification.href,
    })),
  );
}

async function getBuddyState(userId: string, retreatId: number) {
  const [optIn] = await db
    .select()
    .from(buddyOptIns)
    .where(and(eq(buddyOptIns.userId, userId), eq(buddyOptIns.retreatId, retreatId)))
    .limit(1);
  const [match] = await db
    .select()
    .from(buddyMatches)
    .where(
      and(
        eq(buddyMatches.retreatId, retreatId),
        eq(buddyMatches.active, true),
        or(eq(buddyMatches.userOneId, userId), eq(buddyMatches.userTwoId, userId)),
      ),
    )
    .limit(1);
  if (!match) return { optedIn: Boolean(optIn), notes: optIn?.notes ?? "", match: null };
  const partnerId = match.userOneId === userId ? match.userTwoId : match.userOneId;
  const [partner] = await db
    .select({
      userId: users.id,
      displayName: communityProfiles.displayName,
      buddyContact: communityProfiles.buddyContact,
      location: communityProfiles.location,
    })
    .from(users)
    .leftJoin(communityProfiles, eq(communityProfiles.userId, users.id))
    .where(eq(users.id, partnerId))
    .limit(1);
  return {
    optedIn: Boolean(optIn),
    notes: optIn?.notes ?? "",
    match: partner
      ? {
          id: match.id,
          displayName: partner.displayName || "Retreat member",
          buddyContact: partner.buddyContact || "",
          location: partner.location || "",
        }
      : null,
  };
}

function parseScope(value: string): number | null | undefined {
  const parsed = scopeSchema.safeParse(value);
  if (!parsed.success) return undefined;
  if (parsed.data === "global") return null;
  return parseRetreatId(parsed.data) ?? undefined;
}

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function icsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

async function createContent(
  type: ContentType,
  retreatId: number | null,
  userId: string,
  body: unknown,
) {
  switch (type) {
    case "announcement": {
      const value = announcementInputSchema.parse(body);
      const [record] = await db
        .insert(hubAnnouncements)
        .values({ ...value, retreatId, authorId: userId })
        .returning();
      if (retreatId !== null && record.isPublished) {
        await notifyRetreat(retreatId, {
          type: "announcement",
          title: record.title,
          body: record.body.slice(0, 180),
          href: `/member/retreats/${retreatId}`,
        });
      }
      return record;
    }
    case "itinerary": {
      if (retreatId === null) throw new Error("Itinerary items require a retreat");
      const value = itineraryInputSchema.parse(body);
      const [record] = await db
        .insert(hubItineraryItems)
        .values({ ...value, retreatId, createdBy: userId })
        .returning();
      return record;
    }
    case "resource": {
      const value = resourceInputSchema.parse(body);
      if (!value.externalUrl) throw new Error("A resource link is required");
      const [record] = await db
        .insert(hubResources)
        .values({ ...value, retreatId, createdBy: userId })
        .returning();
      return record;
    }
    case "event": {
      const value = eventInputSchema.parse(body);
      const [record] = await db
        .insert(hubEvents)
        .values({ ...value, retreatId, createdBy: userId })
        .returning();
      return record;
    }
    case "checklist": {
      const value = checklistItemInputSchema.parse(body);
      const [record] = await db
        .insert(hubChecklistItems)
        .values({ ...value, retreatId, createdBy: userId })
        .returning();
      return record;
    }
    case "milestone": {
      const value = milestoneInputSchema.parse(body);
      const [record] = await db
        .insert(integrationMilestones)
        .values({ ...value, retreatId, createdBy: userId })
        .returning();
      return record;
    }
  }
}

async function updateContent(
  type: ContentType,
  id: number,
  body: unknown,
) {
  switch (type) {
    case "announcement": {
      const value = announcementInputSchema.parse(body);
      return (await db.update(hubAnnouncements).set({ ...value, updatedAt: new Date() }).where(eq(hubAnnouncements.id, id)).returning())[0];
    }
    case "itinerary": {
      const value = itineraryInputSchema.parse(body);
      return (await db.update(hubItineraryItems).set(value).where(eq(hubItineraryItems.id, id)).returning())[0];
    }
    case "resource": {
      const value = resourceInputSchema.parse(body);
      if (!value.externalUrl) throw new Error("A resource link is required");
      return (await db.update(hubResources).set(value).where(eq(hubResources.id, id)).returning())[0];
    }
    case "event": {
      const value = eventInputSchema.parse(body);
      return (await db.update(hubEvents).set(value).where(eq(hubEvents.id, id)).returning())[0];
    }
    case "checklist": {
      const value = checklistItemInputSchema.parse(body);
      return (await db.update(hubChecklistItems).set(value).where(eq(hubChecklistItems.id, id)).returning())[0];
    }
    case "milestone": {
      const value = milestoneInputSchema.parse(body);
      return (await db.update(integrationMilestones).set(value).where(eq(integrationMilestones.id, id)).returning())[0];
    }
  }
}

async function getContentScope(type: ContentType, id: number) {
  switch (type) {
    case "announcement":
      return (await db.select({ retreatId: hubAnnouncements.retreatId }).from(hubAnnouncements).where(eq(hubAnnouncements.id, id)).limit(1))[0];
    case "itinerary":
      return (await db.select({ retreatId: hubItineraryItems.retreatId }).from(hubItineraryItems).where(eq(hubItineraryItems.id, id)).limit(1))[0];
    case "resource":
      return (await db.select({ retreatId: hubResources.retreatId }).from(hubResources).where(eq(hubResources.id, id)).limit(1))[0];
    case "event":
      return (await db.select({ retreatId: hubEvents.retreatId }).from(hubEvents).where(eq(hubEvents.id, id)).limit(1))[0];
    case "checklist":
      return (await db.select({ retreatId: hubChecklistItems.retreatId }).from(hubChecklistItems).where(eq(hubChecklistItems.id, id)).limit(1))[0];
    case "milestone":
      return (await db.select({ retreatId: integrationMilestones.retreatId }).from(integrationMilestones).where(eq(integrationMilestones.id, id)).limit(1))[0];
  }
}

async function deleteContent(type: ContentType, id: number) {
  switch (type) {
    case "announcement":
      return db.delete(hubAnnouncements).where(eq(hubAnnouncements.id, id));
    case "itinerary":
      return db.delete(hubItineraryItems).where(eq(hubItineraryItems.id, id));
    case "resource":
      return db.delete(hubResources).where(eq(hubResources.id, id));
    case "event":
      return db.delete(hubEvents).where(eq(hubEvents.id, id));
    case "checklist":
      return db.delete(hubChecklistItems).where(eq(hubChecklistItems.id, id));
    case "milestone":
      return db.delete(integrationMilestones).where(eq(integrationMilestones.id, id));
  }
}

export function registerHubRoutes(app: Express) {
  app.get("/api/hub/profile", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const profile = await getProfile(user.id);
    res.json({
      profile:
        profile ?? {
          displayName: [user.firstName, user.lastName].filter(Boolean).join(" ") || "Retreat member",
          bio: "",
          location: "",
          interests: [],
          directoryVisible: false,
          buddyContact: "",
          photoConsent: false,
        },
    });
  });

  app.put("/api/hub/profile", requireAuth, async (req, res) => {
    try {
      const user = getSessionUser(req)!;
      const value = communityProfileInputSchema.parse(req.body);
      const [profile] = await db
        .insert(communityProfiles)
        .values({ ...value, userId: user.id, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: communityProfiles.userId,
          set: { ...value, updatedAt: new Date() },
        })
        .returning();
      res.json({ profile });
    } catch (error) {
      if (error instanceof z.ZodError) return badRequest(res, error.issues[0]?.message ?? "Invalid profile");
      throw error;
    }
  });

  app.get("/api/hub/notifications", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const notifications = await db
      .select()
      .from(hubNotifications)
      .where(eq(hubNotifications.userId, user.id))
      .orderBy(desc(hubNotifications.createdAt))
      .limit(50);
    res.json({ notifications });
  });

  app.post("/api/hub/notifications/read", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    await db
      .update(hubNotifications)
      .set({ readAt: new Date() })
      .where(and(eq(hubNotifications.userId, user.id), isNull(hubNotifications.readAt)));
    res.json({ success: true });
  });

  app.get("/api/hub/alumni", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    if (user.role !== "admin" && !(await userHasPaidRetreat(user.id))) {
      return res.status(403).json({ error: "Alumni access requires a completed registration" });
    }
    const [announcements, resources, events] = await Promise.all([
      db.select().from(hubAnnouncements).where(and(isNull(hubAnnouncements.retreatId), eq(hubAnnouncements.isPublished, true))).orderBy(desc(hubAnnouncements.createdAt)),
      db.select().from(hubResources).where(and(isNull(hubResources.retreatId), eq(hubResources.isPublished, true))).orderBy(asc(hubResources.sortOrder)),
      db.select().from(hubEvents).where(isNull(hubEvents.retreatId)).orderBy(asc(hubEvents.startsAt)),
    ]);
    res.json({ announcements, resources, events });
  });

  app.get("/api/hub/resources", requireAuth, async (_req, res) => {
    const resources = await db
      .select()
      .from(hubResources)
      .where(and(isNull(hubResources.retreatId), eq(hubResources.isPublished, true)))
      .orderBy(asc(hubResources.sortOrder), asc(hubResources.title));
    res.json({ resources });
  });

  app.get("/api/hub/retreats/:retreatId/overview", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const { user, retreatId } = access;
    const manager = await userCanManageRetreat(user, retreatId);
    const [
      settings,
      announcements,
      itinerary,
      resources,
      events,
      checklist,
      completions,
      milestones,
      milestoneCompletions,
      buddy,
    ] = await Promise.all([
      db.select().from(retreatHubSettings).where(eq(retreatHubSettings.retreatId, retreatId)).limit(1),
      db.select().from(hubAnnouncements).where(and(or(isNull(hubAnnouncements.retreatId), eq(hubAnnouncements.retreatId, retreatId)), manager ? undefined : eq(hubAnnouncements.isPublished, true))).orderBy(desc(hubAnnouncements.isPinned), desc(hubAnnouncements.createdAt)),
      db.select().from(hubItineraryItems).where(eq(hubItineraryItems.retreatId, retreatId)).orderBy(asc(hubItineraryItems.startsAt), asc(hubItineraryItems.sortOrder)),
      db.select().from(hubResources).where(and(or(isNull(hubResources.retreatId), eq(hubResources.retreatId, retreatId)), manager ? undefined : eq(hubResources.isPublished, true))).orderBy(asc(hubResources.sortOrder)),
      db.select().from(hubEvents).where(or(isNull(hubEvents.retreatId), eq(hubEvents.retreatId, retreatId))).orderBy(asc(hubEvents.startsAt)),
      db.select().from(hubChecklistItems).where(and(or(isNull(hubChecklistItems.retreatId), eq(hubChecklistItems.retreatId, retreatId)), eq(hubChecklistItems.isActive, true))).orderBy(asc(hubChecklistItems.sortOrder)),
      db.select().from(hubChecklistCompletions).where(eq(hubChecklistCompletions.userId, user.id)),
      db.select().from(integrationMilestones).where(and(or(isNull(integrationMilestones.retreatId), eq(integrationMilestones.retreatId, retreatId)), eq(integrationMilestones.isActive, true))).orderBy(asc(integrationMilestones.sortOrder)),
      db.select().from(integrationCompletions).where(eq(integrationCompletions.userId, user.id)),
      getBuddyState(user.id, retreatId),
    ]);
    res.json({
      retreat: getRetreat(retreatId),
      settings: settings[0] ?? null,
      announcements,
      itinerary,
      resources,
      events,
      checklist: checklist.map((item) => ({
        ...item,
        completed: completions.some((entry) => entry.itemId === item.id),
      })),
      milestones: milestones.map((item) => ({
        ...item,
        completed: milestoneCompletions.some((entry) => entry.milestoneId === item.id),
      })),
      buddy,
      canManage: manager,
      mediaConfigured: isMediaConfigured(),
    });
  });

  app.get("/api/hub/retreats/:retreatId/directory", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const memberIds = await getAccessibleMemberIds(access.retreatId);
    if (access.user.role === "admin") {
      const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
      memberIds.push(...admins.map((entry) => entry.id));
    }
    const uniqueIds = Array.from(new Set(memberIds));
    if (uniqueIds.length === 0) return res.json({ members: [] });
    const members = await db
      .select({
        userId: communityProfiles.userId,
        displayName: communityProfiles.displayName,
        bio: communityProfiles.bio,
        location: communityProfiles.location,
        interests: communityProfiles.interests,
        imageUrl: users.profileImageUrl,
      })
      .from(communityProfiles)
      .innerJoin(users, eq(users.id, communityProfiles.userId))
      .where(
        and(
          inArray(communityProfiles.userId, uniqueIds),
          eq(communityProfiles.directoryVisible, true),
        ),
      )
      .orderBy(asc(communityProfiles.displayName));
    res.json({ members });
  });

  app.put("/api/hub/retreats/:retreatId/checklist/:itemId", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const itemId = idSchema.safeParse(req.params.itemId);
    const complete = z.object({ completed: z.boolean() }).safeParse(req.body);
    if (!itemId.success || !complete.success) return badRequest(res, "Invalid checklist update");
    const [item] = await db.select().from(hubChecklistItems).where(eq(hubChecklistItems.id, itemId.data)).limit(1);
    if (!item || (item.retreatId !== null && item.retreatId !== access.retreatId)) {
      return res.status(404).json({ error: "Checklist item not found" });
    }
    if (complete.data.completed) {
      await db.insert(hubChecklistCompletions).values({ itemId: item.id, userId: access.user.id }).onConflictDoNothing();
    } else {
      await db.delete(hubChecklistCompletions).where(and(eq(hubChecklistCompletions.itemId, item.id), eq(hubChecklistCompletions.userId, access.user.id)));
    }
    res.json({ completed: complete.data.completed });
  });

  app.put("/api/hub/retreats/:retreatId/milestones/:milestoneId", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const milestoneId = idSchema.safeParse(req.params.milestoneId);
    const complete = z.object({ completed: z.boolean() }).safeParse(req.body);
    if (!milestoneId.success || !complete.success) return badRequest(res, "Invalid milestone update");
    const [item] = await db.select().from(integrationMilestones).where(eq(integrationMilestones.id, milestoneId.data)).limit(1);
    if (!item || (item.retreatId !== null && item.retreatId !== access.retreatId)) {
      return res.status(404).json({ error: "Milestone not found" });
    }
    if (complete.data.completed) {
      await db.insert(integrationCompletions).values({ milestoneId: item.id, userId: access.user.id }).onConflictDoNothing();
    } else {
      await db.delete(integrationCompletions).where(and(eq(integrationCompletions.milestoneId, item.id), eq(integrationCompletions.userId, access.user.id)));
    }
    res.json({ completed: complete.data.completed });
  });

  app.put("/api/hub/retreats/:retreatId/buddy", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const input = z.object({ optedIn: z.boolean(), notes: z.string().trim().max(400).default("") }).safeParse(req.body);
    if (!input.success) return badRequest(res, "Invalid buddy preferences");
    const profile = await getProfile(access.user.id);
    if (input.data.optedIn && (!profile || !profile.buddyContact)) {
      return badRequest(res, "Add private buddy contact details to your profile first");
    }
    if (input.data.optedIn) {
      await db.insert(buddyOptIns).values({ retreatId: access.retreatId, userId: access.user.id, notes: input.data.notes }).onConflictDoUpdate({
        target: [buddyOptIns.retreatId, buddyOptIns.userId],
        set: { notes: input.data.notes },
      });
    } else {
      const activeMatch = await getBuddyState(access.user.id, access.retreatId);
      if (activeMatch.match) return res.status(409).json({ error: "Ask retreat staff to end your active match first" });
      await db.delete(buddyOptIns).where(and(eq(buddyOptIns.retreatId, access.retreatId), eq(buddyOptIns.userId, access.user.id)));
    }
    res.json({ buddy: await getBuddyState(access.user.id, access.retreatId) });
  });

  app.post("/api/hub/retreats/:retreatId/photos/upload-url", requireAuth, async (req, res) => {
    try {
      const access = await assertRetreatAccess(req, res);
      if (!access) return;
      if (!isMediaConfigured()) return res.status(503).json({ error: "Photo sharing is being configured" });
      const input = z.object({
        contentType: z.enum(PHOTO_CONTENT_TYPES),
        byteSize: z.number().int().positive().max(MAX_PHOTO_BYTES),
      }).parse(req.body);
      const profile = await getProfile(access.user.id);
      if (!profile?.photoConsent) return badRequest(res, "Enable photo consent in your profile first");
      const path = createPhotoPath(access.retreatId, input.contentType);
      res.json({ ...(await createPhotoUpload(path)), path });
    } catch (error) {
      if (error instanceof z.ZodError) return badRequest(res, "Unsupported photo type or size");
      throw error;
    }
  });

  app.post("/api/hub/retreats/:retreatId/photos", requireAuth, async (req, res) => {
    try {
      const access = await assertRetreatAccess(req, res);
      if (!access) return;
      const input = z.object({
        path: z.string().max(500),
        caption: z.string().trim().max(500).default(""),
        contentType: z.enum(PHOTO_CONTENT_TYPES),
        byteSize: z.number().int().positive().max(MAX_PHOTO_BYTES),
      }).parse(req.body);
      if (!input.path.startsWith(`${access.retreatId}/`)) return badRequest(res, "Invalid photo path");
      const profile = await getProfile(access.user.id);
      if (!profile?.photoConsent) return badRequest(res, "Enable photo consent in your profile first");
      if (!(await verifyPhotoObject(input.path, input.byteSize))) return badRequest(res, "Uploaded photo could not be verified");
      const [photo] = await db.insert(retreatPhotos).values({
        retreatId: access.retreatId,
        uploadedBy: access.user.id,
        storagePath: input.path,
        caption: input.caption,
        contentType: input.contentType,
        byteSize: input.byteSize,
      }).returning();
      res.status(201).json({ photo });
    } catch (error) {
      if (error instanceof z.ZodError) return badRequest(res, error.issues[0]?.message ?? "Invalid photo");
      throw error;
    }
  });

  app.get("/api/hub/retreats/:retreatId/photos", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const manager = await userCanManageRetreat(access.user, access.retreatId);
    const photos = await db
      .select({
        id: retreatPhotos.id,
        caption: retreatPhotos.caption,
        status: retreatPhotos.status,
        storagePath: retreatPhotos.storagePath,
        uploadedBy: retreatPhotos.uploadedBy,
        createdAt: retreatPhotos.createdAt,
        displayName: communityProfiles.displayName,
      })
      .from(retreatPhotos)
      .leftJoin(communityProfiles, eq(communityProfiles.userId, retreatPhotos.uploadedBy))
      .where(
        and(
          eq(retreatPhotos.retreatId, access.retreatId),
          manager
            ? undefined
            : or(
                eq(retreatPhotos.status, "approved"),
                and(eq(retreatPhotos.status, "pending"), eq(retreatPhotos.uploadedBy, access.user.id)),
              ),
        ),
      )
      .orderBy(desc(retreatPhotos.createdAt));
    const visible = await Promise.all(
      photos.map(async (photo) => ({
        ...photo,
        storagePath: undefined,
        url:
          photo.status === "approved" || manager || photo.uploadedBy === access.user.id
            ? await signPhotoUrl(photo.storagePath)
            : null,
      })),
    );
    res.json({ photos: visible, canManage: manager });
  });

  app.delete("/api/hub/retreats/:retreatId/photos/:photoId", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const photoId = idSchema.safeParse(req.params.photoId);
    if (!photoId.success) return badRequest(res, "Invalid photo");
    const [photo] = await db.select().from(retreatPhotos).where(eq(retreatPhotos.id, photoId.data)).limit(1);
    if (!photo || photo.retreatId !== access.retreatId) return res.status(404).json({ error: "Photo not found" });
    const manager = await userCanManageRetreat(access.user, access.retreatId);
    if (!manager && photo.uploadedBy !== access.user.id) return res.status(403).json({ error: "Not permitted" });
    await removeMediaObjects([photo.storagePath]);
    await db.delete(retreatPhotos).where(eq(retreatPhotos.id, photo.id));
    res.json({ success: true });
  });

  app.get("/api/hub/retreats/:retreatId/events/:eventId.ics", requireAuth, async (req, res) => {
    const access = await assertRetreatAccess(req, res);
    if (!access) return;
    const eventId = idSchema.safeParse(req.params.eventId);
    if (!eventId.success) return badRequest(res, "Invalid event");
    const [event] = await db.select().from(hubEvents).where(eq(hubEvents.id, eventId.data)).limit(1);
    if (!event || (event.retreatId !== null && event.retreatId !== access.retreatId)) return res.status(404).json({ error: "Event not found" });
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Grounded Warriors//Retreat Hub//EN",
      "BEGIN:VEVENT",
      `UID:hub-event-${event.id}@groundedwarriors.com`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(event.startsAt)}`,
      event.endsAt ? `DTEND:${icsDate(event.endsAt)}` : null,
      `SUMMARY:${escapeIcs(event.title)}`,
      event.description ? `DESCRIPTION:${escapeIcs(event.description)}` : null,
      event.location ? `LOCATION:${escapeIcs(event.location)}` : null,
      "END:VEVENT",
      "END:VCALENDAR",
    ].filter(Boolean).join("\r\n");
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="grounded-warriors-event-${event.id}.ics"`);
    res.send(body);
  });

  app.post("/api/hub/retreats/:retreatId/initialize", requireAuth, async (req, res) => {
    const access = await assertRetreatManager(req, res);
    if (!access) return;
    const inserted = await db.transaction(async (tx) => {
      const [settings] = await tx.insert(retreatHubSettings).values({
        retreatId: access.retreatId,
        welcomeMessage: "Welcome to your private retreat container. Prepare together, stay connected, and carry the work home.",
      }).onConflictDoNothing().returning();
      if (!settings) return false;
      await tx.insert(hubChecklistItems).values([
        { retreatId: access.retreatId, title: "Review the packing guide", description: "Confirm you have the essential clothing and equipment.", phase: "prepare", sortOrder: 10, createdBy: access.user.id },
        { retreatId: access.retreatId, title: "Read the arrival instructions", description: "Know your arrival time, route, and meeting point.", phase: "prepare", sortOrder: 20, createdBy: access.user.id },
        { retreatId: access.retreatId, title: "Set a personal intention", description: "Take a quiet moment to name what you want to bring into the experience.", phase: "prepare", sortOrder: 30, createdBy: access.user.id },
      ]);
      await tx.insert(integrationMilestones).values([
        { retreatId: access.retreatId, title: "30-day grounding check-in", description: "Reconnect with one practice and share with the circle if you choose.", daysAfter: 30, sortOrder: 10, createdBy: access.user.id },
        { retreatId: access.retreatId, title: "60-day accountability check-in", description: "Connect with your buddy and notice what has shifted.", daysAfter: 60, sortOrder: 20, createdBy: access.user.id },
        { retreatId: access.retreatId, title: "90-day integration reflection", description: "Mark what you are carrying forward from the retreat.", daysAfter: 90, sortOrder: 30, createdBy: access.user.id },
      ]);
      return true;
    });
    res.json({ initialized: inserted });
  });

  app.get("/api/hub/manage/global", requireAuth, requireAdmin, async (_req, res) => {
    const [announcements, resources, events, checklist, milestones] = await Promise.all([
      db.select().from(hubAnnouncements).where(isNull(hubAnnouncements.retreatId)).orderBy(desc(hubAnnouncements.createdAt)),
      db.select().from(hubResources).where(isNull(hubResources.retreatId)).orderBy(asc(hubResources.sortOrder)),
      db.select().from(hubEvents).where(isNull(hubEvents.retreatId)).orderBy(asc(hubEvents.startsAt)),
      db.select().from(hubChecklistItems).where(isNull(hubChecklistItems.retreatId)).orderBy(asc(hubChecklistItems.sortOrder)),
      db.select().from(integrationMilestones).where(isNull(integrationMilestones.retreatId)).orderBy(asc(integrationMilestones.sortOrder)),
    ]);
    res.json({ announcements, resources, events, checklist, milestones });
  });

  app.post("/api/hub/manage/:scope/:type", requireAuth, async (req, res) => {
    try {
      const user = getSessionUser(req)!;
      const scope = parseScope(req.params.scope);
      const type = z.enum(contentTypes).safeParse(req.params.type);
      if (scope === undefined || !type.success) return badRequest(res, "Invalid content scope or type");
      if (scope === null) {
        if (user.role !== "admin") return res.status(403).json({ error: "Admin only" });
      } else if (!(await userCanManageRetreat(user, scope))) {
        return res.status(403).json({ error: "Retreat staff access required" });
      }
      const record = await createContent(type.data, scope, user.id, req.body);
      res.status(201).json({ record });
    } catch (error) {
      if (error instanceof z.ZodError) return badRequest(res, error.issues[0]?.message ?? "Invalid content");
      if (error instanceof Error && error.message.includes("required")) return badRequest(res, error.message);
      throw error;
    }
  });

  app.put("/api/hub/manage/:scope/:type/:id", requireAuth, async (req, res) => {
    try {
      const user = getSessionUser(req)!;
      const scope = parseScope(req.params.scope);
      const type = z.enum(contentTypes).safeParse(req.params.type);
      const id = idSchema.safeParse(req.params.id);
      if (scope === undefined || !type.success || !id.success) return badRequest(res, "Invalid content request");
      if (scope === null ? user.role !== "admin" : !(await userCanManageRetreat(user, scope))) {
        return res.status(403).json({ error: "Not permitted" });
      }
      const current = await getContentScope(type.data, id.data);
      if (!current || current.retreatId !== scope) return res.status(404).json({ error: "Content not found" });
      const record = await updateContent(type.data, id.data, req.body);
      if (!record) return res.status(404).json({ error: "Content not found" });
      res.json({ record });
    } catch (error) {
      if (error instanceof z.ZodError) return badRequest(res, error.issues[0]?.message ?? "Invalid content");
      if (error instanceof Error && error.message.includes("required")) return badRequest(res, error.message);
      throw error;
    }
  });

  app.delete("/api/hub/manage/:scope/:type/:id", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const scope = parseScope(req.params.scope);
    const type = z.enum(contentTypes).safeParse(req.params.type);
    const id = idSchema.safeParse(req.params.id);
    if (scope === undefined || !type.success || !id.success) return badRequest(res, "Invalid content request");
    if (scope === null ? user.role !== "admin" : !(await userCanManageRetreat(user, scope))) {
      return res.status(403).json({ error: "Not permitted" });
    }
    const current = await getContentScope(type.data, id.data);
    if (!current || current.retreatId !== scope) return res.status(404).json({ error: "Content not found" });
    await deleteContent(type.data, id.data);
    res.json({ success: true });
  });

  app.get("/api/hub/manage/retreats/:retreatId/buddies", requireAuth, async (req, res) => {
    const access = await assertRetreatManager(req, res);
    if (!access) return;
    const pool = await db
      .select({
        userId: buddyOptIns.userId,
        notes: buddyOptIns.notes,
        displayName: communityProfiles.displayName,
        location: communityProfiles.location,
        buddyContact: communityProfiles.buddyContact,
      })
      .from(buddyOptIns)
      .leftJoin(communityProfiles, eq(communityProfiles.userId, buddyOptIns.userId))
      .where(eq(buddyOptIns.retreatId, access.retreatId));
    const matches = await db.select().from(buddyMatches).where(and(eq(buddyMatches.retreatId, access.retreatId), eq(buddyMatches.active, true)));
    res.json({ pool, matches });
  });

  app.post("/api/hub/manage/retreats/:retreatId/buddies/match", requireAuth, async (req, res) => {
    const access = await assertRetreatManager(req, res);
    if (!access) return;
    const input = z.object({ userOneId: z.string().min(1), userTwoId: z.string().min(1) }).safeParse(req.body);
    if (!input.success || input.data.userOneId === input.data.userTwoId) return badRequest(res, "Choose two different members");
    const optIns = await db
      .select({ userId: buddyOptIns.userId })
      .from(buddyOptIns)
      .where(and(eq(buddyOptIns.retreatId, access.retreatId), inArray(buddyOptIns.userId, [input.data.userOneId, input.data.userTwoId])));
    if (optIns.length !== 2) return badRequest(res, "Both members must be opted in");
    try {
      const match = await db.transaction(async (tx) => {
        await tx.execute(sql`select pg_advisory_xact_lock(${900000 + access.retreatId})`);
        const existing = await tx
          .select({ id: buddyMatches.id })
          .from(buddyMatches)
          .where(
            and(
              eq(buddyMatches.retreatId, access.retreatId),
              eq(buddyMatches.active, true),
              or(
                inArray(buddyMatches.userOneId, [input.data.userOneId, input.data.userTwoId]),
                inArray(buddyMatches.userTwoId, [input.data.userOneId, input.data.userTwoId]),
              ),
            ),
          );
        if (existing.length) throw new Error("One of these members already has an active match");
        return (await tx.insert(buddyMatches).values({
          retreatId: access.retreatId,
          userOneId: input.data.userOneId,
          userTwoId: input.data.userTwoId,
          createdBy: access.user.id,
        }).returning())[0];
      });
      await db.insert(hubNotifications).values([
        { userId: input.data.userOneId, type: "buddy_match", title: "Your retreat buddy is ready", href: `/member/retreats/${access.retreatId}` },
        { userId: input.data.userTwoId, type: "buddy_match", title: "Your retreat buddy is ready", href: `/member/retreats/${access.retreatId}` },
      ]);
      res.status(201).json({ match });
    } catch (error) {
      if (error instanceof Error && error.message.includes("active match")) return res.status(409).json({ error: error.message });
      throw error;
    }
  });

  app.delete("/api/hub/manage/retreats/:retreatId/buddies/:matchId", requireAuth, async (req, res) => {
    const access = await assertRetreatManager(req, res);
    if (!access) return;
    const matchId = idSchema.safeParse(req.params.matchId);
    if (!matchId.success) return badRequest(res, "Invalid match");
    await db.update(buddyMatches).set({ active: false, endedAt: new Date() }).where(and(eq(buddyMatches.id, matchId.data), eq(buddyMatches.retreatId, access.retreatId)));
    res.json({ success: true });
  });

  app.put("/api/discussions/:discussionId", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const discussionId = idSchema.safeParse(req.params.discussionId);
    const input = z.object({
      title: z.string().trim().min(3).max(160),
      content: z.string().trim().min(1).max(10000),
    }).safeParse(req.body);
    if (!discussionId.success || !input.success) return badRequest(res, "Invalid discussion update");
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, discussionId.data)).limit(1);
    if (!discussion || discussion.deletedAt) return res.status(404).json({ error: "Discussion not found" });
    const manager = discussion.retreatId === null
      ? user.role === "admin"
      : await userCanManageRetreat(user, discussion.retreatId);
    if (discussion.userId !== user.id && !manager) return res.status(403).json({ error: "Not permitted" });
    const [updated] = await db.update(discussions).set({ ...input.data, editedAt: new Date() }).where(eq(discussions.id, discussion.id)).returning();
    res.json({ discussion: updated });
  });

  app.delete("/api/discussions/:discussionId", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const discussionId = idSchema.safeParse(req.params.discussionId);
    if (!discussionId.success) return badRequest(res, "Invalid discussion");
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, discussionId.data)).limit(1);
    if (!discussion || discussion.deletedAt) return res.status(404).json({ error: "Discussion not found" });
    const manager = discussion.retreatId === null
      ? user.role === "admin"
      : await userCanManageRetreat(user, discussion.retreatId);
    if (discussion.userId !== user.id && !manager) return res.status(403).json({ error: "Not permitted" });
    await db.update(discussions).set({ deletedAt: new Date(), isHidden: true }).where(eq(discussions.id, discussion.id));
    res.json({ success: true });
  });

  app.post("/api/discussions/:discussionId/reactions", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const discussionId = idSchema.safeParse(req.params.discussionId);
    const input = z.object({ kind: z.enum(["support", "strength", "gratitude"]) }).safeParse(req.body);
    if (!discussionId.success || !input.success) return badRequest(res, "Invalid reaction");
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, discussionId.data)).limit(1);
    if (!discussion || discussion.deletedAt || discussion.isHidden) return res.status(404).json({ error: "Discussion not found" });
    if (discussion.retreatId !== null && !(await userCanAccessRetreat(user, discussion.retreatId))) {
      return res.status(403).json({ error: "Not permitted" });
    }
    if (discussion.retreatId === null && user.role !== "admin" && !(await userHasPaidRetreat(user.id))) {
      return res.status(403).json({ error: "Alumni access requires a completed registration" });
    }
    const where = and(
      eq(discussionReactions.discussionId, discussion.id),
      eq(discussionReactions.userId, user.id),
      eq(discussionReactions.kind, input.data.kind),
    );
    const [existing] = await db.select().from(discussionReactions).where(where).limit(1);
    if (existing) {
      await db.delete(discussionReactions).where(where);
    } else {
      await db.insert(discussionReactions).values({
        discussionId: discussion.id,
        userId: user.id,
        kind: input.data.kind,
      });
      if (discussion.userId !== user.id) {
        await db.insert(hubNotifications).values({
          userId: discussion.userId,
          type: "reaction",
          title: "Someone responded to your post",
          href: `/member/discussions/${discussion.id}`,
        });
      }
    }
    const counts = await db
      .select({ kind: discussionReactions.kind, count: sql<number>`count(*)::int` })
      .from(discussionReactions)
      .where(eq(discussionReactions.discussionId, discussion.id))
      .groupBy(discussionReactions.kind);
    res.json({ active: !existing, counts });
  });

  app.post("/api/discussions/:discussionId/reports", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const discussionId = idSchema.safeParse(req.params.discussionId);
    const input = z.object({ reason: z.string().trim().min(5).max(500) }).safeParse(req.body);
    if (!discussionId.success || !input.success) return badRequest(res, "Please provide a brief reason");
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, discussionId.data)).limit(1);
    if (!discussion || discussion.deletedAt) return res.status(404).json({ error: "Discussion not found" });
    if (discussion.retreatId !== null && !(await userCanAccessRetreat(user, discussion.retreatId))) {
      return res.status(403).json({ error: "Not permitted" });
    }
    if (discussion.retreatId === null && user.role !== "admin" && !(await userHasPaidRetreat(user.id))) {
      return res.status(403).json({ error: "Alumni access requires a completed registration" });
    }
    await db.insert(discussionReports).values({
      discussionId: discussion.id,
      reporterId: user.id,
      reason: input.data.reason,
    }).onConflictDoNothing();
    res.status(201).json({ success: true });
  });

  app.put("/api/hub/manage/discussions/:discussionId", requireAuth, async (req, res) => {
    const user = getSessionUser(req)!;
    const discussionId = idSchema.safeParse(req.params.discussionId);
    const input = z.object({
      isPinned: z.boolean().optional(),
      isLocked: z.boolean().optional(),
      isHidden: z.boolean().optional(),
    }).refine((value) => Object.keys(value).length > 0).safeParse(req.body);
    if (!discussionId.success || !input.success) return badRequest(res, "Invalid moderation action");
    const [discussion] = await db.select().from(discussions).where(eq(discussions.id, discussionId.data)).limit(1);
    if (!discussion) return res.status(404).json({ error: "Discussion not found" });
    const manager = discussion.retreatId === null
      ? user.role === "admin"
      : await userCanManageRetreat(user, discussion.retreatId);
    if (!manager) return res.status(403).json({ error: "Not permitted" });
    const [updated] = await db.update(discussions).set(input.data).where(eq(discussions.id, discussion.id)).returning();
    res.json({ discussion: updated });
  });

  app.put("/api/hub/manage/retreats/:retreatId/photos/:photoId", requireAuth, async (req, res) => {
    const access = await assertRetreatManager(req, res);
    if (!access) return;
    const photoId = idSchema.safeParse(req.params.photoId);
    const input = z.object({ status: z.enum(["approved", "rejected"]) }).safeParse(req.body);
    if (!photoId.success || !input.success) return badRequest(res, "Invalid moderation action");
    const [photo] = await db.select().from(retreatPhotos).where(and(eq(retreatPhotos.id, photoId.data), eq(retreatPhotos.retreatId, access.retreatId))).limit(1);
    if (!photo) return res.status(404).json({ error: "Photo not found" });
    if (input.data.status === "rejected") await removeMediaObjects([photo.storagePath]);
    const [updated] = await db.update(retreatPhotos).set({
      status: input.data.status,
      moderatedBy: access.user.id,
      moderatedAt: new Date(),
    }).where(eq(retreatPhotos.id, photo.id)).returning();
    await db.insert(hubNotifications).values({
      userId: photo.uploadedBy,
      type: "photo_moderation",
      title: input.data.status === "approved" ? "Your retreat photo was approved" : "Your retreat photo was not approved",
      href: `/member/retreats/${access.retreatId}`,
    });
    res.json({ photo: updated });
  });

  app.get("/api/hub/manage/reports", requireAuth, requireAdmin, async (_req, res) => {
    const reports = await db
      .select({
        id: discussionReports.id,
        reason: discussionReports.reason,
        status: discussionReports.status,
        createdAt: discussionReports.createdAt,
        discussionId: discussions.id,
        discussionTitle: discussions.title,
        retreatId: discussions.retreatId,
      })
      .from(discussionReports)
      .innerJoin(discussions, eq(discussions.id, discussionReports.discussionId))
      .orderBy(desc(discussionReports.createdAt));
    res.json({ reports });
  });

  app.put("/api/hub/manage/reports/:reportId", requireAuth, requireAdmin, async (req, res) => {
    const user = getSessionUser(req)!;
    const reportId = idSchema.safeParse(req.params.reportId);
    const input = z.object({ status: z.enum(["resolved", "dismissed"]) }).safeParse(req.body);
    if (!reportId.success || !input.success) return badRequest(res, "Invalid report update");
    const [report] = await db.update(discussionReports).set({ status: input.data.status, resolvedBy: user.id }).where(eq(discussionReports.id, reportId.data)).returning();
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json({ report });
  });
}
