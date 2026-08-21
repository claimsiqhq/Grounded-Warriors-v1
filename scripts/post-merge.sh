#!/usr/bin/env bash
set -euo pipefail

# Keep dependencies in sync after task-agent merges without mutating the lockfile.
pnpm install --frozen-lockfile
pnpm run check