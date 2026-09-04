---
name: Git reconciliation races
description: Safe handling of merge conflicts when Replit's repository synchronization changes the visible merge state.
---

During conflict resolution, treat the Git state as potentially changing until the merge commit is visible and both branch tips are confirmed as ancestors of `HEAD`.

**Why:** The platform synchronization process can refresh, abort, or finalize a pending merge while commands are running. A conflict may briefly disappear or reappear, and an approved follow-up edit may be committed automatically.

**How to apply:** Never reset, rebase, or force-push in response to this behavior. Re-read `git status`, check `MERGE_HEAD`, verify both branch tips with `git merge-base --is-ancestor`, and confirm a clean tree after the final commit.