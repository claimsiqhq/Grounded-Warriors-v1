---
name: Clerk identity bridge
description: Durable rule for mapping Clerk sessions to the preserved local users table.
---

The local application user lookup and just-in-time provisioning must use only the nonempty `sessionClaims.userId` claim. If that bridge claim is missing, reject the request rather than falling back to Clerk's native `auth.userId`.

**Why:** Migrated accounts preserve their original local user IDs in the bridge claim. Falling back to the native Clerk ID can silently create a second local user and lose roles, registrations, staff access, and ownership relationships.

**How to apply:** Keep `auth.userId` limited to proving that Clerk authenticated the request or to Clerk API calls. Use the bridge claim for all local database identity operations.