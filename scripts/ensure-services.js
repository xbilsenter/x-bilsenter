'use strict';

const { spawnSync } = require('child_process');
const http = require('http');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const SERVICES = [
  { name: 'Nettside', port: 8080, healthPath: '/api/health' },
  { name: 'Admin CRM', port: 8090, healthPath: '/api/public/status' },
];

function checkHealth(port, healthPath) {
  return new Promise(function (resolve) {
    const req = http.get(
      { hostname: '127.0.0.1', port, path: healthPath, timeout: 3000 },
      function (res) {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );
    req.on('error', function () { resolve(false); });
    req.on('timeout', function () { req.destroy(); resolve(false); });
  });
}

function startWithPm2() {
  const result = spawnSync('npx', ['pm2', 'start', 'ecosystem.config.cjs', '--update-env'], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
  return result.status === 0;
}

async function ensureServices() {
  let anyDown = false;

  for (const service of SERVICES) {
    const ok = await checkHealth(service.port, service.healthPath);
    if (ok) {
      console.log(service.name + ': kjører på port ' + service.port);
    } else {
      console.log(service.name + ': nede på port ' + service.port);
      anyDown = true;
    }
  }

  if (!anyDown) {
    return true;
  }

  console.log('Starter tjenester med PM2 (kjører videre etter terminal/Cursor lukkes) …');
  if (!startWithPm2()) {
    console.error('FEIL: Kunne ikke starte PM2-tjenester. Kjør: npm run services:boot');
    return false;
  }

  await new Promise(function (resolve) { setTimeout(resolve, 2500); });

  let allOk = true;
  for (const service of SERVICES) {
    const ok = await checkHealth(service.port, service.healthPath);
    if (!ok) {
      console.error('FEIL: ' + service.name + ' svarer fortsatt ikke på port ' + service.port);
      allOk = false;
    }
  }

  if (allOk) {
    spawnSync('npx', ['pm2', 'save'], { cwd: ROOT, stdio: 'inherit', env: process.env });
  }

  return allOk;
}

ensureServices()
  .then(function (ok) { process.exit(ok ? 0 : 1); })
  .catch(function (err) { console.error(err); process.exit(1); });
