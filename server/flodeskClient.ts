// Flodesk integration for syncing newsletter subscribers.
//
// Required env vars:
//   FLODESK_API_KEY        - API key from Flodesk (Workspace > Integrations > API)
// Optional env vars:
//   FLODESK_SEGMENT_IDS    - Comma-separated list of segment IDs to add new
//                            subscribers to.
//   FLODESK_USER_AGENT     - Identifying string Flodesk requires (defaults to
//                            "Grounded Warriors (groundedwarriors.com)").
//
// All calls are best-effort: failures are logged but do not throw, so a
// Flodesk outage never blocks a signup from being saved in our own DB.

const FLODESK_BASE_URL = "https://api.flodesk.com/v1";

function getAuthHeader(apiKey: string): string {
  return "Basic " + Buffer.from(`${apiKey}:`).toString("base64");
}

function getUserAgent(): string {
  return process.env.FLODESK_USER_AGENT || "Grounded Warriors (groundedwarriors.com)";
}

export function isFlodeskConfigured(): boolean {
  return Boolean(process.env.FLODESK_API_KEY);
}

export interface FlodeskSubscriberInput {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
}

/**
 * Create or update a subscriber in Flodesk and optionally add them to the
 * configured segment(s). Best-effort: returns false on failure but never
 * throws.
 */
export async function upsertFlodeskSubscriber(
  input: FlodeskSubscriberInput,
): Promise<boolean> {
  const apiKey = process.env.FLODESK_API_KEY;
  if (!apiKey) {
    return false;
  }

  const headers = {
    Authorization: getAuthHeader(apiKey),
    "Content-Type": "application/json",
    "User-Agent": getUserAgent(),
  };

  try {
    const subscriberRes = await fetch(`${FLODESK_BASE_URL}/subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        email: input.email,
        first_name: input.firstName ?? undefined,
        last_name: input.lastName ?? undefined,
      }),
    });

    if (!subscriberRes.ok) {
      const text = await subscriberRes.text().catch(() => "");
      console.error(
        `Flodesk upsert failed (${subscriberRes.status}): ${text}`,
      );
      return false;
    }

    const segmentIds = (process.env.FLODESK_SEGMENT_IDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (segmentIds.length > 0) {
      const segmentRes = await fetch(
        `${FLODESK_BASE_URL}/subscribers/${encodeURIComponent(input.email)}/segments`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ segment_ids: segmentIds }),
        },
      );

      if (!segmentRes.ok) {
        const text = await segmentRes.text().catch(() => "");
        console.error(
          `Flodesk add-to-segment failed (${segmentRes.status}): ${text}`,
        );
        return false;
      }
    }

    return true;
  } catch (err: any) {
    console.error("Flodesk request error:", err?.message || err);
    return false;
  }
}
