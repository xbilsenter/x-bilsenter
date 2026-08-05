#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

mkdir -p logs

echo "==> Stopper gamle prosesser på port 8080 og 8090 …"
for port in 8080 8090; do
  pids=$(lsof -ti:"$port" 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "    Port $port: stopper pid $pids"
    kill -TERM $pids 2>/dev/null || true
  fi
done
sleep 2

echo "==> Bygger klienter (produksjon) …"
npm run build --prefix ../x-bilsenter-admin/client
npm run build --prefix client

echo "==> Starter tjenester med PM2 …"
npx pm2 start ecosystem.config.cjs --update-env

echo "==> Lagrer PM2-prosessliste …"
npx pm2 save

echo ""
echo "For automatisk oppstart ved maskinrestart, kjør kommandoen som vises under:"
npx pm2 startup

echo ""
echo "Status:"
npx pm2 status
