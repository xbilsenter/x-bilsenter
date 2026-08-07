// Vercel serverer klientbygget statisk fra CDN, så vanlige sidevisninger går
// aldri gjennom Express. Vedlikeholdssjekken må derfor ligge i en middleware
// som kjører foran all ruting.

export const config = {
  matcher: '/((?!api/|assets/|vedlikehold\\.html|favicon|robots\\.txt|sitemap\\.xml).*)'
};

const PREVIEW_COOKIE = 'xb_site_preview';
const CACHE_TTL_MS = 15000;
const CANONICAL_HOST = 'xbilsenter.no';
const DEFAULT_MELDING =
  'Vi jobber med nettsiden og er snart tilbake. Takk for tålmodigheten!';

let cache = { checkedAt: 0, aktiv: false, melding: DEFAULT_MELDING };

function base64url(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hasPreviewAccess(request) {
  const secret = process.env.INGEST_SECRET || '';
  if (!secret) return false;

  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${PREVIEW_COOKIE}=([^;]+)`));
  if (!match) return false;

  const parts = decodeURIComponent(match[1]).split(':');
  if (parts.length !== 3) return false;

  const exp = Number(parts[0]);
  const uid = parts[1];
  const sig = parts[2];
  if (!Number.isFinite(exp) || !uid || !sig || Date.now() > exp) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(`${exp}:${uid}`));

  return safeEqual(base64url(mac), sig);
}

async function getStatus() {
  const now = Date.now();
  if (now - cache.checkedAt < CACHE_TTL_MS) return cache;

  const adminUrl = (process.env.ADMIN_API_URL || '').replace(/\/$/, '');
  if (!adminUrl) {
    cache = { checkedAt: now, aktiv: false, melding: DEFAULT_MELDING };
    return cache;
  }

  try {
    const response = await fetch(`${adminUrl}/api/public/vedlikehold`, {
      signal: AbortSignal.timeout(3000)
    });
    if (response.ok) {
      const data = await response.json();
      cache = {
        checkedAt: now,
        aktiv: !!data.aktiv,
        melding: data.melding || DEFAULT_MELDING
      };
      return cache;
    }
  } catch (_err) {
    // Admin nede skal ikke stenge nettsiden.
  }

  cache = { checkedAt: now, aktiv: false, melding: DEFAULT_MELDING };
  return cache;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function redirectToCanonicalHost(request) {
  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  if (!host.endsWith('.vercel.app')) return null;

  url.protocol = 'https:';
  url.hostname = CANONICAL_HOST;
  return Response.redirect(url.toString(), 308);
}

export default async function middleware(request) {
  const canonicalRedirect = redirectToCanonicalHost(request);
  if (canonicalRedirect) return canonicalRedirect;
  const status = await getStatus();
  if (!status.aktiv) return undefined;
  if (await hasPreviewAccess(request)) return undefined;

  const url = new URL(request.url);
  let html = '';

  try {
    const page = await fetch(new URL('/vedlikehold.html', url.origin), {
      signal: AbortSignal.timeout(3000)
    });
    if (page.ok) html = await page.text();
  } catch (_err) {
    // Faller tilbake til enkel tekst under.
  }

  html = html
    ? html.replace('{{MELDING}}', escapeHtml(status.melding))
    : `<!DOCTYPE html><html lang="nb"><head><meta charset="utf-8"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="icon" href="/assets/favicon-32x32.png" sizes="32x32" type="image/png"><title>X Bilsenter AS – Bilhandel gjort trygt og enkelt.</title></head><body><h1>Vi er snart tilbake</h1><p>${escapeHtml(status.melding)}</p></body></html>`;

  return new Response(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '300',
      'Cache-Control': 'no-store'
    }
  });
}
