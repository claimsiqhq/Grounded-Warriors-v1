import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  communityProfileInputSchema,
  itineraryInputSchema,
  milestoneInputSchema,
} from "../shared/schema";
import {
  createPhotoPath,
  MAX_PHOTO_BYTES,
  PHOTO_CONTENT_TYPES,
} from "../server/supabaseMedia";
import {
  canAccessRetreatFromFacts,
  canManageRetreatFromFacts,
  isValidBuddyPair,
} from "../shared/hubPolicy";

test("community profile input is opt-in and bounded", () => {
  const parsed = communityProfileInputSchema.parse({
    displayName: "John",
    bio: "",
    location: "Ontario",
    interests: ["hiking", "breathwork"],
    directoryVisible: false,
    buddyContact: "",
    photoConsent: false,
  });
  assert.equal(parsed.directoryVisible, false);
  assert.equal(parsed.photoConsent, false);
  assert.throws(() =>
    communityProfileInputSchema.parse({
      ...parsed,
      bio: "x".repeat(601),
    }),
  );
});

test("itinerary and integration inputs reject unreasonable values", () => {
  const itinerary = itineraryInputSchema.parse({
    title: "Arrival circle",
    startsAt: "2026-10-01T18:00:00Z",
  });
  assert.ok(itinerary.startsAt instanceof Date);
  assert.throws(() =>
    milestoneInputSchema.parse({
      title: "Too late",
      daysAfter: 731,
    }),
  );
});

test("private photo paths are randomized and retreat-scoped", () => {
  const first = createPhotoPath(3, "image/webp");
  const second = createPhotoPath(3, "image/webp");
  assert.match(first, /^3\/[0-9a-f-]+\.webp$/);
  assert.notEqual(first, second);
  assert.equal(MAX_PHOTO_BYTES, 10 * 1024 * 1024);
  assert.deepEqual(PHOTO_CONTENT_TYPES, ["image/jpeg", "image/png", "image/webp"]);
});

test("hub migration contains critical privacy and matching constraints", () => {
  const migration = readFileSync(
    new URL("../migrations/0002_retreat_community_hub.sql", import.meta.url),
    "utf8",
  );
  assert.match(migration, /buddy_matches_distinct_users_check/);
  assert.match(migration, /retreat_photos_size_check/);
  assert.match(migration, /retreat-media|retreat_photos/);
  assert.match(migration, /directory_visible/);
});

test("retreat access and management remain separate", () => {
  assert.equal(
    canAccessRetreatFromFacts({
      role: "member",
      hasPaidRegistration: true,
      isAssignedStaff: false,
    }),
    true,
  );
  assert.equal(
    canManageRetreatFromFacts({ role: "member", isAssignedStaff: false }),
    false,
  );
  assert.equal(
    canManageRetreatFromFacts({ role: "member", isAssignedStaff: true }),
    true,
  );
  assert.equal(
    canAccessRetreatFromFacts({
      role: "member",
      hasPaidRegistration: false,
      isAssignedStaff: false,
    }),
    false,
  );
});

test("buddy pairs require distinct opted-in unmatched members", () => {
  assert.equal(
    isValidBuddyPair({
      userOneId: "one",
      userTwoId: "two",
      bothOptedIn: true,
      eitherAlreadyMatched: false,
    }),
    true,
  );
  assert.equal(
    isValidBuddyPair({
      userOneId: "one",
      userTwoId: "one",
      bothOptedIn: true,
      eitherAlreadyMatched: false,
    }),
    false,
  );
  assert.equal(
    isValidBuddyPair({
      userOneId: "one",
      userTwoId: "two",
      bothOptedIn: true,
      eitherAlreadyMatched: true,
    }),
    false,
  );
});
