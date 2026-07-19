# X Bilsenter AS – Nettside

Offentlig nettside med React-frontend og Node.js API.

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

## Prosjekter

| Mappe | Beskrivelse |
|-------|-------------|
| `client/` | React (Vite) |
| `server/` | Express API + Vegvesen-proxy |

CRM/admin ligger i eget repo: **x-bilsenter-admin**.
