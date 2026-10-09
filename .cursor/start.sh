#!/usr/bin/env bash
#
# Per-boot start for X Bilsenter: bring up the local PostgreSQL cluster the CRM
# needs, then return. The website and CRM Node servers run as terminals.
set -euo pipefail

PGDATA="$HOME/.local/pgdata"
PGPORT=5432

pg_bin() {
  ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1
}
PGBIN="$(pg_bin)"

if [ -z "$PGBIN" ]; then
  echo "PostgreSQL not installed; skipping DB start (run .cursor/install.sh)."
  exit 0
fi

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  echo "No PostgreSQL cluster at $PGDATA; skipping (run .cursor/install.sh)."
  exit 0
fi

if "$PGBIN/pg_isready" -h localhost -p "$PGPORT" >/dev/null 2>&1; then
  echo "PostgreSQL already running on port ${PGPORT}."
  exit 0
fi

echo "Starting PostgreSQL on port ${PGPORT} ..."
"$PGBIN/pg_ctl" -D "$PGDATA" -o "-p ${PGPORT} -k /tmp" -l "$HOME/.local/pg.log" -w start

for _ in $(seq 1 30); do
  if "$PGBIN/pg_isready" -h localhost -p "$PGPORT" >/dev/null 2>&1; then
    echo "PostgreSQL is ready."
    exit 0
  fi
  sleep 1
done

echo "ERROR: PostgreSQL did not become ready in time." >&2
exit 1
