#!/usr/bin/env bash
#
# Idempotent Cloud Agent install for X Bilsenter.
#
# Prepares the public website (x-bilsenter) and, when present, the CRM/admin
# repo (x-bilsenter-admin) plus a local PostgreSQL cluster so the full
# site -> CRM ingest flow works end to end.
#
# This runs once when building the environment snapshot; keep it idempotent.
set -euo pipefail

SITE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ADMIN_ROOT="$(cd "$SITE_ROOT/.." && pwd)/x-bilsenter-admin"
ADMIN_REMOTE="https://github.com/xbilsenter/x-bilsenter-admin.git"

PGDATA="$HOME/.local/pgdata"
PGPORT=5432
PGDB=xbilsenter
PGUSER=ubuntu
DATABASE_URL="postgresql://${PGUSER}@localhost:${PGPORT}/${PGDB}"
INGEST_SECRET="xbilsenter-ingest-dev-key"

log() { printf '\n\033[1;34m==>\033[0m %s\n' "$*"; }

pg_bin() {
  # Resolve the highest installed PostgreSQL bin dir (e.g. /usr/lib/postgresql/16/bin).
  ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1
}

# ---------------------------------------------------------------------------
# 1. System dependency: PostgreSQL (server + client)
# ---------------------------------------------------------------------------
if ! command -v psql >/dev/null 2>&1 && [ -z "$(pg_bin)" ]; then
  log "Installing PostgreSQL"
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq postgresql postgresql-contrib
fi
PGBIN="$(pg_bin)"

# ---------------------------------------------------------------------------
# 2. Public website (x-bilsenter)
# ---------------------------------------------------------------------------
log "Installing website dependencies"
cd "$SITE_ROOT"
npm run install:all

log "Building website client"
npm run build

if [ ! -f "$SITE_ROOT/.env" ]; then
  log "Creating website .env (dev defaults)"
  cat > "$SITE_ROOT/.env" <<EOF
# Local dev environment (Cursor Cloud Agent). Optional external API keys left blank.
PORT=8080
ADMIN_API_URL=http://localhost:8090
INGEST_SECRET=${INGEST_SECRET}
VEGVESEN_API_KEY=
FINN_API_KEY=
FINN_ORG_ID=7640539
FINN_CACHE_TTL_SECONDS=120
TURNSTILE_SECRET=
EOF
fi

# ---------------------------------------------------------------------------
# 3. CRM / admin (x-bilsenter-admin) – optional sibling repo
# ---------------------------------------------------------------------------
if [ ! -d "$ADMIN_ROOT/.git" ]; then
  log "Admin repo not found locally – attempting clone"
  git clone "$ADMIN_REMOTE" "$ADMIN_ROOT" || \
    echo "WARN: could not clone $ADMIN_REMOTE; skipping CRM setup (website still works)."
fi

if [ -d "$ADMIN_ROOT" ]; then
  log "Installing admin (CRM) dependencies"
  cd "$ADMIN_ROOT"
  npm run install:all

  log "Building admin client"
  npm run build

  if [ ! -f "$ADMIN_ROOT/.env" ]; then
    log "Creating admin .env (dev defaults + local PostgreSQL)"
    cat > "$ADMIN_ROOT/.env" <<EOF
# Local dev environment (Cursor Cloud Agent) – local PostgreSQL backend.
PORT=8090
JWT_SECRET=xbilsenter-dev-jwt-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
INGEST_SECRET=${INGEST_SECRET}
USE_SUPABASE=true
DATABASE_URL=${DATABASE_URL}
PUBLIC_SITE_ORIGIN=http://localhost:8080
ADMIN_PUBLIC_URL=http://localhost:8090
EOF
  fi

  # -------------------------------------------------------------------------
  # 4. Local PostgreSQL cluster + schema (the CRM targets PostgreSQL)
  # -------------------------------------------------------------------------
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    log "Initializing PostgreSQL cluster at $PGDATA"
    mkdir -p "$PGDATA"
    "$PGBIN/initdb" -D "$PGDATA" -U "$PGUSER" --auth=trust >/dev/null
  fi

  log "Starting PostgreSQL (temporary, for provisioning)"
  "$PGBIN/pg_ctl" -D "$PGDATA" -o "-p ${PGPORT} -k /tmp" -l /tmp/pg-install.log -w start || true
  "$PGBIN/pg_isready" -h localhost -p "$PGPORT" >/dev/null 2>&1 || sleep 3

  if ! "$PGBIN/psql" -h localhost -p "$PGPORT" -U "$PGUSER" -tAc \
      "SELECT 1 FROM pg_database WHERE datname='${PGDB}'" postgres | grep -q 1; then
    log "Creating database ${PGDB}"
    "$PGBIN/createdb" -h localhost -p "$PGPORT" -U "$PGUSER" "$PGDB"
  fi

  log "Ensuring Supabase-style roles exist"
  "$PGBIN/psql" -h localhost -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres SUPERUSER LOGIN; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon; END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated; END IF;
END $$;
SQL

  log "Applying schema migration (idempotent)"
  "$PGBIN/psql" -h localhost -p "$PGPORT" -U "$PGUSER" -d "$PGDB" -v ON_ERROR_STOP=1 \
    -f "$ADMIN_ROOT/supabase/migrations/000_run_all.sql" >/dev/null

  log "Stopping temporary PostgreSQL (start.sh brings it up on boot)"
  "$PGBIN/pg_ctl" -D "$PGDATA" -m fast -w stop || true
fi

log "Install complete"
