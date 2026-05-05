#!/usr/bin/env bash
# ============================================================================
# Sync server/src/ → api/ (single source of truth)
# ----------------------------------------------------------------------------
# We have two deployment targets:
#   - server/  → standalone Node server (local dev / self-hosted)
#   - api/     → Vercel serverless functions
#
# Both must run the SAME code. This script copies routes, middleware, and lib
# files from server/src/ → api/_*/, rewriting the import paths.
#
# Run this whenever you change anything under server/src/{routes,middleware,lib}/
# Usage: bash scripts/sync-api.sh
# ============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

copy_route() {
    sed -e "s|from '../db.js'|from '../_lib/db.js'|g" \
        -e "s|from '../middleware/|from '../_middleware/|g" \
        -e "s|from '../lib/|from '../_lib/|g" \
        "$1" > "$2"
}

echo "[sync-api] routes..."
for f in admin auth favourites images orders products tags user; do
    copy_route "$ROOT/server/src/routes/$f.ts" "$ROOT/api/_routes/$f.ts"
    echo "  ✓ api/_routes/$f.ts"
done

echo "[sync-api] middleware..."
for f in auth rateLimit security; do
    cp "$ROOT/server/src/middleware/$f.ts" "$ROOT/api/_middleware/$f.ts"
    echo "  ✓ api/_middleware/$f.ts"
done

echo "[sync-api] lib..."
for f in firebase imageValidation; do
    cp "$ROOT/server/src/lib/$f.ts" "$ROOT/api/_lib/$f.ts"
    echo "  ✓ api/_lib/$f.ts"
done

# azureStorage: copy then strip dotenv (Vercel injects env vars directly)
sed -e '/import dotenv from/d' \
    -e '/import { fileURLToPath } from/d' \
    -e '/__filename = fileURLToPath/d' \
    -e '/__dirname = path.dirname/d' \
    -e '/dotenv\.config/d' \
    "$ROOT/server/src/lib/azureStorage.ts" > "$ROOT/api/_lib/azureStorage.ts"
echo "  ✓ api/_lib/azureStorage.ts (dotenv stripped)"

# Note: api/_lib/db.ts is intentionally NOT synced — it has a Vercel-specific
# lazy initialiser (no env.js dependency).

echo "[sync-api] done."
