import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const RETREAT_MEDIA_BUCKET = "retreat-media";
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

let client: SupabaseClient | null = null;

export function isMediaConfigured() {
  return Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function getMediaClient() {
  if (!isMediaConfigured()) {
    throw new Error("Private media storage is not configured");
  }
  if (!client) {
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
  }
  return client;
}

export function createPhotoPath(retreatId: number, contentType: string) {
  const extension =
    contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  return `${retreatId}/${randomUUID()}.${extension}`;
}

export async function createPhotoUpload(path: string) {
  const { data, error } = await getMediaClient()
    .storage.from(RETREAT_MEDIA_BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw error;
  return { path: data.path, token: data.token, signedUrl: data.signedUrl };
}

export async function verifyPhotoObject(path: string, expectedBytes: number) {
  const segments = path.split("/");
  const filename = segments.pop();
  const folder = segments.join("/");
  if (!filename) return false;
  const { data, error } = await getMediaClient()
    .storage.from(RETREAT_MEDIA_BUCKET)
    .list(folder, { search: filename, limit: 10 });
  if (error) throw error;
  const object = data.find((entry) => entry.name === filename);
  return Boolean(
    object &&
      typeof object.metadata?.size === "number" &&
      object.metadata.size === expectedBytes,
  );
}

export async function signPhotoUrl(path: string, expiresInSeconds = 300) {
  const { data, error } = await getMediaClient()
    .storage.from(RETREAT_MEDIA_BUCKET)
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function removeMediaObjects(paths: string[]) {
  if (paths.length === 0 || !isMediaConfigured()) return;
  const { error } = await getMediaClient()
    .storage.from(RETREAT_MEDIA_BUCKET)
    .remove(paths);
  if (error) throw error;
}
