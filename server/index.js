'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const path = require('path');
const fs = require('fs');
const express = require('express');
const { lookupVehicleFull } = require('./vegvesen');
const { lookupFinnAnnonse } = require('./finn');
const { searchInventory, getCarDetail } = require('./finn-api');
const {
  verifyPreviewToken,
  hasValidPreviewAccess,
  setPreviewCookie,
  clearPreviewCookie,
  PREVIEW_TTL_MS
} = require('./preview-access');

const app = express();
const PORT = process.env.PORT || 8080;
const isVercel = !!process.env.VERCEL;
const ROOT = path.join(__dirname, '..');
const CLIENT_DIST = path.join(ROOT, 'client', 'dist');
const apiKey = process.env.VEGVESEN_API_KEY || '';
const ADMIN_API_URL = (process.env.ADMIN_API_URL || 'http://localhost:8090').replace(/\/$/, '');
const INGEST_SECRET = process.env.INGEST_SECRET || '';
const FINN_API_KEY = process.env.FINN_API_KEY || '';
const FINN_ORG_ID = process.env.FINN_ORG_ID || '7640539';
const MAINTENANCE_CACHE_MS = 15000;
const DEFAULT_MAINTENANCE_MESSAGE =
  'Vi jobber med nettsiden og er snart tilbake. Takk for tålmodigheten!';

let maintenanceCache = {
  checkedAt: 0,
  aktiv: false,
  melding: DEFAULT_MAINTENANCE_MESSAGE
};

let maintenanceHtmlTemplate = null;

const FETCH_TIMEOUT_MS = Number(process.env.FETCH_TIMEOUT_MS || 5000);

async function fetchWithTimeout(url, options, timeoutMs) {
  const ms = timeoutMs || FETCH_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getMaintenanceHtml(melding) {
  if (!maintenanceHtmlTemplate) {
    maintenanceHtmlTemplate = fs.readFileSync(
      path.join(__dirname, 'maintenance.html'),
      'utf8'
    );
  }
  return maintenanceHtmlTemplate.replace(
    '{{MELDING}}',
    escapeHtml(melding || DEFAULT_MAINTENANCE_MESSAGE)
  );
}

async function getMaintenanceStatus() {
  const now = Date.now();
  if (now - maintenanceCache.checkedAt < MAINTENANCE_CACHE_MS) {
    return maintenanceCache;
  }

  try {
    const response = await fetchWithTimeout(ADMIN_API_URL + '/api/public/vedlikehold');
    if (response.ok) {
      const data = await response.json();
      maintenanceCache = {
        checkedAt: now,
        aktiv: !!data.aktiv,
        melding: data.melding || DEFAULT_MAINTENANCE_MESSAGE
      };
    } else {
      maintenanceCache.checkedAt = now;
    }
  } catch (_err) {
    maintenanceCache.checkedAt = now;
  }

  return maintenanceCache;
}

async function maintenanceGate(req, res, next) {
  if (req.path === '/api/health') return next();
  if (req.path.startsWith('/api/preview/')) return next();
  if (hasValidPreviewAccess(req)) return next();

  try {
    const status = await getMaintenanceStatus();
    if (!status.aktiv) return next();

    if (req.path.startsWith('/api/')) {
      return res.status(503).json({
        ok: false,
        error: status.melding || DEFAULT_MAINTENANCE_MESSAGE,
        code: 'MAINTENANCE'
      });
    }

    res.status(503);
    res.setHeader('Retry-After', '300');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(getMaintenanceHtml(status.melding));
  } catch (err) {
    next(err);
  }
}

function parseJsonBody(req, res, next) {
  if (!req.headers['content-type'] || !req.headers['content-type'].includes('application/json')) {
    req.body = {};
    return next();
  }

  var data = '';
  req.setEncoding('utf8');
  req.on('data', function (chunk) { data += chunk; });
  req.on('end', function () {
    try {
      req.body = data ? JSON.parse(data) : {};
    } catch (err) {
      return res.status(400).json({ ok: false, error: 'Ugyldig JSON i forespørselen.' });
    }
    next();
  });
  req.on('error', function () {
    res.status(400).json({ ok: false, error: 'Kunne ikke lese forespørselen.' });
  });
}

async function forwardToAdmin(path, body) {
  if (!INGEST_SECRET) {
    console.warn('[admin] INGEST_SECRET ikke satt – innsending logges kun lokalt.');
    console.log('[admin] Payload:', JSON.stringify(body, null, 2));
    return { ok: true, local: true };
  }

  let response;
  try {
    response = await fetchWithTimeout(ADMIN_API_URL + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Ingest-Key': INGEST_SECRET
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    const error = new Error(
      'Kunne ikke nå driftssystemet. Sjekk at admin-serveren kjører på ' + ADMIN_API_URL
    );
    error.status = 503;
    error.code = 'ADMIN_UNREACHABLE';
    throw error;
  }

  let data = {};
  try {
    data = await response.json();
  } catch (_err) {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.error || 'Kunne ikke lagre i driftssystemet.');
    error.status = response.status;
    throw error;
  }

  return data;
}

const SUBJECT_LABELS = {
  kjop: 'Kjøp bil',
  salg: 'Selg bil',
  innbytte: 'Innbytte',
  finansiering: 'Finansiering',
  annet: 'Annet'
};

function requireIngestKey(req, res, next) {
  const key = req.headers['x-ingest-key'] || '';
  if (!INGEST_SECRET || key !== INGEST_SECRET) {
    return res.status(403).json({ ok: false, error: 'Ingen tilgang.' });
  }
  next();
}

app.use(parseJsonBody);

app.get('/api/preview/enter', function (req, res) {
  const token = String(req.query.token || '');
  if (!verifyPreviewToken(token)) {
    res.status(403);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(
      '<!DOCTYPE html><html lang="no"><body style="font-family:sans-serif;padding:2rem;">' +
      '<h1>Kunne ikke starte forhåndsvisning</h1>' +
      '<p>Lenken er ugyldig eller utløpt. Logg inn i CRM og åpne nettsiden på nytt.</p>' +
      '</body></html>'
    );
  }

  setPreviewCookie(res, token);
  res.redirect(302, '/');
});

app.get('/api/preview/exit', function (req, res) {
  clearPreviewCookie(res);
  res.redirect(302, '/');
});

app.get('/api/preview/status', function (req, res) {
  res.json({ preview: hasValidPreviewAccess(req) });
});

app.get('/api/health', async function (_req, res) {
  let adminOk = false;
  let adminError = '';
  let vedlikehold = { aktiv: false, melding: DEFAULT_MAINTENANCE_MESSAGE };

  try {
    const status = await getMaintenanceStatus();
    vedlikehold = { aktiv: status.aktiv, melding: status.melding };
  } catch (_err) {
    // Behold standardverdier hvis admin ikke svarer.
  }

  if (INGEST_SECRET) {
    try {
      const check = await fetchWithTimeout(ADMIN_API_URL, { method: 'GET' });
      adminOk = check.ok || check.status === 401 || check.status === 404;
    } catch (err) {
      adminError = err.message || 'Admin-server svarer ikke';
    }
  } else {
    adminError = 'INGEST_SECRET ikke satt';
  }

  res.json({
    ok: true,
    site: 'ok',
    vegvesen: apiKey ? 'configured' : 'missing',
    finn: FINN_API_KEY ? 'configured' : 'missing',
    finnOrgId: FINN_ORG_ID,
    admin: adminOk ? 'ok' : 'down',
    adminUrl: ADMIN_API_URL,
    adminError: adminOk ? null : adminError,
    vedlikehold
  });
});

app.use(maintenanceGate);

function publicVehicleView(parsed) {
  return {
    regNr: parsed.regNr,
    merke: parsed.merke,
    modell: parsed.modell,
    arsmodell: parsed.arsmodell,
    farge: parsed.farge,
    kjoretoyType: parsed.kjoretoyType,
    kjoretoyGruppe: parsed.kjoretoyGruppe || parsed.kjoretoyType || null,
    drivstoff: parsed.drivstoff,
    girkasse: parsed.girkasse,
    sisteEuKontroll: parsed.sisteEuKontroll,
    nesteEuKontroll: parsed.nesteEuKontroll
  };
}

app.get('/api/kjoretoy', async function (req, res) {
  const regnr = req.query.regnr || req.query.kjennemerke;

  if (!regnr) {
    return res.status(400).json({
      error: 'Registreringsnummer mangler',
      code: 'MISSING_REGNR'
    });
  }

  try {
    const result = await lookupVehicleFull(regnr, apiKey);
    res.json({ ok: true, vehicle: publicVehicleView(result.parsed) });
  } catch (err) {
    const statusMap = {
      MISSING_API_KEY: 503,
      INVALID_REGNR: 400,
      NOT_FOUND: 404,
      FORBIDDEN: 503,
      UPSTREAM_ERROR: 502
    };

    res.status(statusMap[err.code] || 500).json({
      error: err.message,
      code: err.code || 'UNKNOWN'
    });
  }
});

app.get('/api/lager', async function (_req, res) {
  try {
    const response = await fetch(ADMIN_API_URL + '/api/public/lager', {
      headers: { Accept: 'application/json' }
    });
    const data = await response.json().catch(function () { return null; });
    if (!response.ok || !data || !data.ok) {
      return res.status(response.ok ? 502 : response.status).json({
        ok: false,
        error: (data && data.error) || 'Kunne ikke hente lagertall.'
      });
    }
    res.json({
      ok: true,
      antall: data.antall,
      tilSalgs: data.tilSalgs,
      updatedAt: data.updatedAt
    });
  } catch (err) {
    console.error('[lager]', err.message);
    res.status(502).json({ ok: false, error: 'Kunne ikke hente lagertall.' });
  }
});

app.get('/api/biler', async function (req, res) {
  try {
    const data = await searchInventory(FINN_API_KEY, FINN_ORG_ID, {
      q: req.query.q || '',
      make: req.query.make || '',
      model: req.query.model || '',
      fuel: req.query.fuel || req.query.engine_fuel || '',
      sort: req.query.sort || '',
      price_from: req.query.price_from || '',
      price_to: req.query.price_to || '',
      year_from: req.query.year_from || '',
      year_to: req.query.year_to || ''
    });

    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, ...data });
  } catch (err) {
    const statusMap = {
      FINN_NOT_CONFIGURED: 503,
      FINN_AUTH: 503,
      FINN_UPSTREAM: 502
    };

    console.error('[biler]', err.message);
    res.status(statusMap[err.code] || 500).json({
      ok: false,
      error: err.message,
      code: err.code || 'FINN_SEARCH_FAILED'
    });
  }
});

app.get('/api/biler/:id', async function (req, res) {
  try {
    const car = await getCarDetail(FINN_API_KEY, FINN_ORG_ID, req.params.id);
    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, car });
  } catch (err) {
    const statusMap = {
      FINN_NOT_CONFIGURED: 503,
      FINN_AUTH: 503,
      FINN_UPSTREAM: 502,
      FINN_NOT_FOUND: 404,
      MISSING_ID: 400
    };

    console.error('[biler/:id]', err.message);
    res.status(statusMap[err.code] || 500).json({
      ok: false,
      error: err.message,
      code: err.code || 'FINN_DETAIL_FAILED'
    });
  }
});

app.post('/api/biler/refresh', requireIngestKey, async function (_req, res) {
  try {
    const data = await searchInventory(FINN_API_KEY, FINN_ORG_ID, { refresh: true });

    res.set('Cache-Control', 'no-store');
    res.json({ ok: true, ...data });
  } catch (err) {
    const statusMap = {
      FINN_NOT_CONFIGURED: 503,
      FINN_AUTH: 503,
      FINN_UPSTREAM: 502
    };

    console.error('[biler/refresh]', err.message);
    res.status(statusMap[err.code] || 500).json({
      ok: false,
      error: err.message,
      code: err.code || 'FINN_SEARCH_FAILED'
    });
  }
});

app.get('/api/finn/annonse', async function (req, res) {
  const ref = req.query.ref || req.query.id || '';
  if (!String(ref).trim()) {
    return res.status(400).json({
      ok: false,
      error: 'Mangler FINN-kode eller lenke.',
      code: 'MISSING_FINN_REF'
    });
  }

  try {
    const meta = await lookupFinnAnnonse(ref);
    if (!meta.valid) {
      return res.status(404).json({
        ok: false,
        error: 'Fant ingen gyldig FINN-annonse. Sjekk at koden eller lenken er riktig.',
        code: 'FINN_NOT_FOUND'
      });
    }
    res.json({
      ok: true,
      item: { id: meta.id, url: meta.url, title: meta.title }
    });
  } catch (err) {
    console.error('[finn]', err.message);
    res.status(502).json({
      ok: false,
      error: 'Kunne ikke kontrollere FINN-annonsen akkurat nå. Prøv igjen om litt.',
      code: 'FINN_LOOKUP_FAILED'
    });
  }
});

app.post('/api/kontakt', async function (req, res) {
  var body = req.body || {};

  if (!body.navn || !body.epost || !body.emne) {
    return res.status(400).json({
      ok: false,
      error: 'Navn, e-post og emne er påkrevd.'
    });
  }

  try {
    await forwardToAdmin('/api/ingest/henvendelse', {
      navn: body.navn,
      epost: body.epost,
      tlf: body.telefon || body.tlf || '',
      emne: SUBJECT_LABELS[body.emne] || body.emne,
      melding: body.melding || '',
      kilde: 'Nettside',
      bilRef: body.bilRef || ''
    });

    res.json({ ok: true, message: 'Takk! Vi tar kontakt snart.' });
  } catch (err) {
    console.error('[kontakt]', err.message);
    res.status(err.status || 502).json({ ok: false, error: err.message });
  }
});

app.post('/api/selg-bil', async function (req, res) {
  var body = req.body || {};

  if (!body.regnr || !body.navn || !body.epost || !body.mobil) {
    return res.status(400).json({
      ok: false,
      error: 'Registreringsnummer, navn, e-post og mobilnummer er påkrevd.'
    });
  }

  try {
    await forwardToAdmin('/api/ingest/selg-bil/json', body);
    res.json({ ok: true, message: 'Takk! Vi tar kontakt snart.' });
  } catch (err) {
    console.error('[selg-bil]', err.message);
    res.status(err.status || 502).json({ ok: false, error: err.message });
  }
});

app.post('/api/innbytte', async function (req, res) {
  var body = req.body || {};

  if (!body.regnr || !body.navn || !body.epost || !body.mobil) {
    return res.status(400).json({
      ok: false,
      error: 'Registreringsnummer, navn, e-post og mobilnummer er påkrevd.'
    });
  }

  if (!String(body.finnKode || '').trim()) {
    return res.status(400).json({
      ok: false,
      error: 'FINN-kode eller lenke til annonsen er påkrevd.'
    });
  }

  const finnMeta = await lookupFinnAnnonse(body.finnKode);
  if (!finnMeta.valid) {
    return res.status(400).json({
      ok: false,
      error: 'FINN-annonsen er ugyldig. Sjekk koden eller lenken og prøv igjen.',
      code: 'FINN_NOT_FOUND'
    });
  }

  try {
    await forwardToAdmin('/api/ingest/innbytte/json', {
      ...body,
      finnKode: finnMeta.id || String(body.finnKode).trim()
    });
    res.json({ ok: true, message: 'Takk! Vi tar kontakt snart.' });
  } catch (err) {
    console.error('[innbytte]', err.message);
    res.status(err.status || 502).json({ ok: false, error: err.message });
  }
});

const HTML_REDIRECTS = {
  '/index.html': '/',
  '/biler.html': '/biler',
  '/innbytte.html': '/innbytte',
  '/kontakt.html': '/kontakt',
  '/om-oss.html': '/om-oss',
  '/tjenester.html': '/tjenester',
  '/andre-tjenester.html': '/tjenester#andre',
  '/andre-tjenester': '/tjenester#andre',
  '/selg-bil.html': '/selg-bil'
};

Object.entries(HTML_REDIRECTS).forEach(function ([from, to]) {
  app.get(from, function (_req, res) {
    res.redirect(301, to);
  });
});

if (!isVercel && !fs.existsSync(CLIENT_DIST)) {
  app.get('*', function (req, res, next) {
    if (req.path.startsWith('/api')) return next();
    res.status(503).send(
      'React-appen er ikke bygget. Kjør: cd client && npm install && npm run build'
    );
  });
} else if (!isVercel) {
  app.use(express.static(CLIENT_DIST, {
    index: false,
    maxAge: '1h',
    setHeaders: function (res, filePath) {
      if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
    },
  }));
  app.get(/^(?!\/api\/).*/, function (req, res) {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

async function checkAdminOnStartup() {
  if (!INGEST_SECRET || isVercel) return;
  try {
    await fetch(ADMIN_API_URL);
    console.log('Driftssystem: ' + ADMIN_API_URL + ' (tilkoblet)');
  } catch {
    console.warn('');
    console.warn('⚠️  ADVARSEL: Admin-serveren kjører ikke på ' + ADMIN_API_URL);
    console.warn('   Skjema (kontakt/innbytte) vil feile til den er startet:');
    console.warn('   cd ../x-bilsenter-admin && npm start');
    console.warn('');
  }
}

module.exports = app;

function startLocalServer() {
  app.listen(PORT, function () {
    console.log('X Bilsenter server: http://localhost:' + PORT);
    if (fs.existsSync(CLIENT_DIST)) {
      console.log('Frontend: React (client/dist)');
    } else {
      console.log('Frontend: ikke bygget – kjør npm run build');
    }
    if (!apiKey) {
      console.warn('Advarsel: VEGVESEN_API_KEY er ikke satt – kjøretøyoppslag vil ikke fungere.');
    }
    if (!INGEST_SECRET) {
      console.warn('Advarsel: INGEST_SECRET er ikke satt – skjema lagres ikke i driftssystemet.');
    }
    checkAdminOnStartup();
  });
}

if (require.main === module) {
  startLocalServer();
}
