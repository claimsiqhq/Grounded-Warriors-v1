CREATE UNIQUE INDEX IF NOT EXISTS "retreat_staff_retreat_user_unique"
  ON "retreat_staff" ("retreat_id", "user_id");
--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN IF NOT EXISTS "is_pinned" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN IF NOT EXISTS "is_locked" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN IF NOT EXISTS "is_hidden" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
--> statement-breakpoint
ALTER TABLE "discussions" ADD COLUMN IF NOT EXISTS "edited_at" timestamp;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "discussions_scope_created_idx"
  ON "discussions" ("retreat_id", "created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "community_profiles" (
  "user_id" varchar PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "display_name" varchar(120) NOT NULL,
  "bio" varchar(600) DEFAULT '' NOT NULL,
  "location" varchar(120) DEFAULT '' NOT NULL,
  "interests" text[] DEFAULT '{}'::text[] NOT NULL,
  "directory_visible" boolean DEFAULT false NOT NULL,
  "buddy_contact" varchar(200) DEFAULT '' NOT NULL,
  "photo_consent" boolean DEFAULT false NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "retreat_hub_settings" (
  "retreat_id" integer PRIMARY KEY NOT NULL,
  "welcome_message" text DEFAULT '' NOT NULL,
  "timezone" varchar(80) DEFAULT 'America/Toronto' NOT NULL,
  "initialized_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hub_announcements" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer,
  "author_id" varchar NOT NULL REFERENCES "users"("id"),
  "title" varchar(160) NOT NULL,
  "body" text NOT NULL,
  "is_pinned" boolean DEFAULT false NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hub_announcements_scope_idx"
  ON "hub_announcements" ("retreat_id", "created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hub_itinerary_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer NOT NULL,
  "title" varchar(160) NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "location" varchar(240) DEFAULT '' NOT NULL,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_by" varchar NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hub_itinerary_retreat_start_idx"
  ON "hub_itinerary_items" ("retreat_id", "starts_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hub_resources" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer,
  "title" varchar(160) NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "category" varchar(60) DEFAULT 'guide' NOT NULL,
  "external_url" text,
  "storage_path" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "created_by" varchar NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "hub_resources_location_check" CHECK ("external_url" IS NOT NULL OR "storage_path" IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hub_resources_scope_idx"
  ON "hub_resources" ("retreat_id", "sort_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hub_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer,
  "title" varchar(160) NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "location" varchar(240) DEFAULT '' NOT NULL,
  "meeting_url" text,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone,
  "created_by" varchar NOT NULL REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hub_events_scope_start_idx"
  ON "hub_events" ("retreat_id", "starts_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hub_checklist_items" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer,
  "title" varchar(160) NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "phase" varchar(32) DEFAULT 'prepare' NOT NULL,
  "due_at" timestamp with time zone,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_by" varchar NOT NULL REFERENCES "users"("id"),
  CONSTRAINT "hub_checklist_phase_check" CHECK ("phase" IN ('prepare', 'during', 'integration'))
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hub_checklist_scope_idx"
  ON "hub_checklist_items" ("retreat_id", "phase", "sort_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hub_checklist_completions" (
  "item_id" integer NOT NULL REFERENCES "hub_checklist_items"("id") ON DELETE CASCADE,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "completed_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "hub_checklist_completions_pk" PRIMARY KEY ("item_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buddy_opt_ins" (
  "retreat_id" integer NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "notes" varchar(400) DEFAULT '' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "buddy_opt_ins_pk" PRIMARY KEY ("retreat_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "buddy_matches" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer NOT NULL,
  "user_one_id" varchar NOT NULL REFERENCES "users"("id"),
  "user_two_id" varchar NOT NULL REFERENCES "users"("id"),
  "created_by" varchar NOT NULL REFERENCES "users"("id"),
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "ended_at" timestamp,
  CONSTRAINT "buddy_matches_distinct_users_check" CHECK ("user_one_id" <> "user_two_id")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "buddy_matches_retreat_active_idx"
  ON "buddy_matches" ("retreat_id", "active");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "buddy_matches_active_user_one_unique"
  ON "buddy_matches" ("retreat_id", "user_one_id") WHERE "active" = true;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "buddy_matches_active_user_two_unique"
  ON "buddy_matches" ("retreat_id", "user_two_id") WHERE "active" = true;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "retreat_photos" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer NOT NULL,
  "uploaded_by" varchar NOT NULL REFERENCES "users"("id"),
  "storage_path" text NOT NULL UNIQUE,
  "caption" varchar(500) DEFAULT '' NOT NULL,
  "content_type" varchar(80) NOT NULL,
  "byte_size" integer NOT NULL,
  "status" varchar(24) DEFAULT 'pending' NOT NULL,
  "moderated_by" varchar REFERENCES "users"("id"),
  "moderated_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "retreat_photos_status_check" CHECK ("status" IN ('pending', 'approved', 'rejected')),
  CONSTRAINT "retreat_photos_size_check" CHECK ("byte_size" > 0 AND "byte_size" <= 10485760)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "retreat_photos_scope_status_idx"
  ON "retreat_photos" ("retreat_id", "status", "created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_milestones" (
  "id" serial PRIMARY KEY NOT NULL,
  "retreat_id" integer,
  "title" varchar(160) NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "days_after" integer NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_by" varchar NOT NULL REFERENCES "users"("id"),
  CONSTRAINT "integration_days_check" CHECK ("days_after" BETWEEN 0 AND 730)
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "integration_milestones_scope_idx"
  ON "integration_milestones" ("retreat_id", "sort_order");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "integration_completions" (
  "milestone_id" integer NOT NULL REFERENCES "integration_milestones"("id") ON DELETE CASCADE,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "completed_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "integration_completions_pk" PRIMARY KEY ("milestone_id", "user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discussion_reactions" (
  "discussion_id" integer NOT NULL REFERENCES "discussions"("id") ON DELETE CASCADE,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "kind" varchar(24) DEFAULT 'support' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "discussion_reactions_pk" PRIMARY KEY ("discussion_id", "user_id", "kind"),
  CONSTRAINT "discussion_reaction_kind_check" CHECK ("kind" IN ('support', 'strength', 'gratitude'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "discussion_reports" (
  "id" serial PRIMARY KEY NOT NULL,
  "discussion_id" integer NOT NULL REFERENCES "discussions"("id") ON DELETE CASCADE,
  "reporter_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "reason" varchar(500) NOT NULL,
  "status" varchar(24) DEFAULT 'open' NOT NULL,
  "resolved_by" varchar REFERENCES "users"("id"),
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "discussion_reports_status_check" CHECK ("status" IN ('open', 'resolved', 'dismissed'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "discussion_reports_unique"
  ON "discussion_reports" ("discussion_id", "reporter_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hub_notifications" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "type" varchar(40) NOT NULL,
  "title" varchar(180) NOT NULL,
  "body" varchar(500) DEFAULT '' NOT NULL,
  "href" text,
  "read_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hub_notifications_user_idx"
  ON "hub_notifications" ("user_id", "read_at", "created_at");
