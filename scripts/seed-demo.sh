#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; set -a; . "$root/.env"; set +a
[[ "${CONFIRM_DEMO_SEED:-}" == 'yes' ]] || { echo 'Set CONFIRM_DEMO_SEED=yes; never use this against production.' >&2; exit 2; }
[[ "${NODE_ENV:-development}" != 'production' ]] || { echo 'Refusing to seed production.' >&2; exit 2; }
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$root/backend/seed.sql"
