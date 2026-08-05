'use strict';

/**
 * Overvåker nettside (8080) og admin CRM (8090) og starter dem på nytt ved nedetid.
 * Kjør som bakgrunnstjeneste: npm run services:watch
 */

const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ADMIN_ROOT = path.join(ROOT, '..', 'x-bilsenter-admin');
const LOG_DIR = path.join(ROOT, 'logs');
const LOG_FILE = path.join(LOG_DIR, 'watch-services.log');
const CHECK_MS = Number(process.env.SERVICES_CHECK_MS || 30000);

const SERVICES = [
  {
    key: 'site',
    name: 'Nettside',
    port: 8080,
    healthPath: '/api/health',
    cwd: ROOT,
    command: 'node',
    args: ['server/index.js'],
    env: { NODE_ENV: 'production', PORT: '8080' },
  },
  {
    key: 'admin',
    name: 'Admin CRM',
    port: 8090,
    healthPath: '/api/public/status',
    cwd: path.join(ADMIN_ROOT, 'server'),
    command: 'node',
    args: ['index.js'],
    env: { NODE_ENV: 'production', PORT: '8090' },
  },
];

const children = new Map();
let stopping = false;

function log(message) {
  const line = new Date().toISOString() + ' ' + message;
  console.log(line);
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.appendFileSync(LOG_FILE, line + '\n');
  } catch {
    /* ignore log write errors */
  }
}

function checkHealth(port, healthPath) {
  return new Promise(function (resolve) {
    const req = http.get(
      {
        hostname: '127.0.0.1',
        port,
        path: healthPath,
        timeout: 4000,
      },
      function (res) {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );

    req.on('error', function () {
      resolve(false);
    });

    req.on('timeout', function () {
      req.destroy();
      resolve(false);
    });
  });
}

function loadEnvFile(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  const raw = fs.readFileSync(envPath, 'utf8');
  raw.split('\n').forEach(function (line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  });
  return out;
}

function startService(service) {
  const existing = children.get(service.key);
  if (existing && existing.exitCode === null) {
    return existing;
  }

  const envPath = path.join(service.cwd, '.env');
  const child = spawn(service.command, service.args, {
    cwd: service.cwd,
    env: { ...process.env, ...loadEnvFile(envPath), ...service.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', function (chunk) {
    log('[' + service.name + '] ' + String(chunk).trim());
  });

  child.stderr.on('data', function (chunk) {
    log('[' + service.name + ' ERR] ' + String(chunk).trim());
  });

  child.on('exit', function (code, signal) {
    log(service.name + ' stoppet (code=' + code + ', signal=' + (signal || '') + ')');
    children.delete(service.key);
  });

  children.set(service.key, child);
  log('Startet ' + service.name + ' (pid ' + child.pid + ') på port ' + service.port);
  return child;
}

function stopService(service) {
  const child = children.get(service.key);
  if (!child || child.exitCode !== null) return;
  try {
    child.kill('SIGTERM');
  } catch {
    /* ignore */
  }
}

async function ensureService(service) {
  const healthy = await checkHealth(service.port, service.healthPath);
  if (healthy) return;

  const child = children.get(service.key);
  if (child && child.exitCode === null) {
    log(service.name + ' svarer ikke – restarter …');
    stopService(service);
    await new Promise(function (resolve) { setTimeout(resolve, 1500); });
  } else {
    log(service.name + ': nede – starter …');
  }

  startService(service);
  await new Promise(function (resolve) { setTimeout(resolve, 2500); });

  const ok = await checkHealth(service.port, service.healthPath);
  if (!ok) {
    log('FEIL: ' + service.name + ' svarer fortsatt ikke på port ' + service.port);
  }
}

async function tick() {
  for (const service of SERVICES) {
    if (stopping) return;
    await ensureService(service);
  }
}

function shutdown() {
  if (stopping) return;
  stopping = true;
  log('Stopper watch-services …');
  SERVICES.forEach(stopService);
  setTimeout(function () { process.exit(0); }, 1500);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

log('watch-services startet (sjekker hvert ' + Math.round(CHECK_MS / 1000) + ' s)');
tick();
setInterval(function () {
  tick().catch(function (err) {
    log('watch-services feil: ' + (err && err.message ? err.message : String(err)));
  });
}, CHECK_MS);
