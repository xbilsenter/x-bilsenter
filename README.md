# X Bilsenter AS – Nettside

Offentlig nettside bygget med **React** (Vite) og **Node.js** API.

## Struktur

```
x-bilsenter/
├── client/          ← React-app (sider, komponenter, styling)
│   ├── src/pages/   ← Forside, Biler, Innbytte, Kontakt, osv.
│   └── public/      ← Bilder og statiske filer
├── server/          ← Express API (Vegvesen, skjema → CRM)
└── package.json
```

Nettsiden er **kun React** — ingen gamle `.html`-sider i rotmappen.

## Kjøring

```bash
npm run install:all
npm run build
npm start
```

Utvikling:

```bash
npm run dev
```

- Nettside (dev): http://localhost:5174
- API: http://localhost:8080

## Miljøvariabler

Kopier `.env.example` til `.env` og fyll inn:

- `VEGVESEN_API_KEY` – kjøretøyoppslag (innbytte)
- `ADMIN_API_URL` – CRM-backend (standard `http://localhost:8090`)
- `INGEST_SECRET` – må matche admin-prosjektet

## GitHub

Etter endringer:

```bash
git add .
git commit -m "Beskriv endringen"
git push
```

CRM/admin ligger i eget repo: **x-bilsenter-admin**.
