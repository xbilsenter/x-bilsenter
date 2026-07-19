'use strict';

require('dotenv').config();

const path = require('path');
const fs = require('fs');
const express = require('express');
const { lookupVehicleFull } = require('./vegvesen');

const app = express();
const PORT = process.env.PORT || 8080;
const ROOT = path.join(__dirname, '..');
const CLIENT_DIST = path.join(ROOT, 'client', 'dist');
const apiKey = process.env.VEGVESEN_API_KEY || '';
const ADMIN_API_URL = (process.env.ADMIN_API_URL || 'http://localhost:8090').replace(/\/$/, '');
const INGEST_SECRET = process.env.INGEST_SECRET || '';

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
    response = await fetch(ADMIN_API_URL + path, {
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

app.use(parseJsonBody);

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

app.post('/api/innbytte', async function (req, res) {
  var body = req.body || {};

  if (!body.regnr || !body.navn || !body.epost || !body.mobil) {
    return res.status(400).json({
      ok: false,
      error: 'Registreringsnummer, navn, e-post og mobilnummer er påkrevd.'
    });
  }

  try {
    await forwardToAdmin('/api/ingest/innbytte/json', body);
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
  '/selg-bil.html': '/selg-bil'
};

Object.entries(HTML_REDIRECTS).forEach(function ([from, to]) {
  app.get(from, function (_req, res) {
    res.redirect(301, to);
  });
});

if (!fs.existsSync(CLIENT_DIST)) {
  app.get('*', function (req, res, next) {
    if (req.path.startsWith('/api')) return next();
    res.status(503).send(
      'React-appen er ikke bygget. Kjør: cd client && npm install && npm run build'
    );
  });
} else {
  app.use(express.static(CLIENT_DIST, { index: false }));
  app.get('*', function (req, res, next) {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, function () {
  console.log('X Bilsenter server: http://localhost:' + PORT);
  if (fs.existsSync(CLIENT_DIST)) {
    console.log('Frontend: React (client/dist)');
  } else {
    console.log('Frontend: statisk HTML (kjør npm run build for React)');
  }
  if (!apiKey) {
    console.warn('Advarsel: VEGVESEN_API_KEY er ikke satt – kjøretøyoppslag vil ikke fungere.');
  }
  if (!INGEST_SECRET) {
    console.warn('Advarsel: INGEST_SECRET er ikke satt – skjema lagres ikke i driftssystemet.');
  } else {
    console.log('Driftssystem: ' + ADMIN_API_URL);
  }
});
