---
name: Render deploys must use pnpm
description: Why Render builds broke and how deps are managed in this project
---

The project is pnpm-managed (pnpm-lock.yaml is the only lockfile; packageManager pinned in package.json). Render's build (render.yaml) uses corepack + `pnpm install --frozen-lockfile`.

**Why:** A stale package-lock.json once made `npm install` crash on Render ("Exit handler never called"), and leftover npm-installed dirs in node_modules (a physical @types/pg copy) shadowed pnpm symlinks, producing baffling tsc type mismatches.

**How to apply:** Never run bare `npm install` here; keep pnpm-lock.yaml in sync with package.json (Render uses --frozen-lockfile, so a drifted lockfile fails the deploy). If weird duplicate-type errors appear, check for non-symlink dirs directly under node_modules.
