# Drift 24/7 – nettside og CRM

Nettsiden og CRM-et må kjøre kontinuerlig – **uavhengig av Cursor, terminal og innlogging**.

## Anbefalt: PM2 (daemon)

PM2 kjører som bakgrunnsprosess. Når tjenestene er startet med PM2, **stopper de ikke når du lukker terminal eller Cursor**.

Fra `x-bilsenter`:

```bash
npm run services:boot      # bygg + start begge tjenester + pm2 save
npm run services:status    # sjekk at alt kjører
npm run services:restart   # restart etter deploy
npm run services:logs      # se logger
```

### Oppstart ved reboot / innlogging (macOS)

Én gang:

```bash
npm run services:persist
```

Dette bygger, starter PM2, lagrer prosesslisten og installerer en LaunchAgent som kjører `pm2 resurrect` ved innlogging.

Alternativ (PM2 sin egen launchd, krever sudo én gang):

```bash
npx pm2 save
sudo env PATH=$PATH:/usr/local/bin ./node_modules/pm2/bin/pm2 startup launchd -u $(whoami) --hp $HOME
```

| Tjeneste | Port | Health |
|----------|------|--------|
| Nettside | 8080 | `GET /api/health` |
| Admin CRM | 8090 | `GET /api/public/status` |

CRM-panelet serveres fra **8090** i produksjon (ikke Vite på 5173).

## Ikke bruk for drift

| Kommando | Problem |
|----------|---------|
| `npm run dev` | Vite + watch – stopper når terminal lukkes |
| `npm run start:all` | concurrently i terminal – stopper når terminal lukkes |
| `node server/index.js` direkte | Ingen auto-restart, stopper med terminal |

## Rask sjekk

```bash
npm run ensure
```

Starter det som mangler via PM2 (ikke løsrevne node-prosesser).

## Produksjon på VPS

1. `git pull` i begge repo
2. `npm run install:all` i `x-bilsenter-admin` og `x-bilsenter`
3. Sett `.env` med Supabase (`USE_SUPABASE=true`, pooler port **6543**)
4. `npm run services:boot`
5. nginx med TLS foran 8080/8090
6. Overvåk health-endepunktene (UptimeRobot, Better Stack, e.l.)

## Viktig

- Etter kodeendringer: `npm run services:restart` (eller `services:boot` for ny build).
- Begge `.env`-filer må ha samme `INGEST_SECRET`.
