'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const NODE_MODULES = path.join(ROOT, 'node_modules');
const installed = new Set();

function fetchJson(url) {
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      let body = '';
      res.on('data', function (chunk) { body += chunk; });
      res.on('end', function () {
        try {
          resolve(JSON.parse(body));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function downloadTarball(name, url, destDir) {
  return new Promise(function (resolve, reject) {
    https.get(url, function (res) {
      const chunks = [];
      res.on('data', function (chunk) { chunks.push(chunk); });
      res.on('end', function () {
        fs.mkdirSync(destDir, { recursive: true });
        const buffer = Buffer.concat(chunks);
        const tmpFile = path.join(destDir, 'package.tgz');
        fs.writeFileSync(tmpFile, buffer);

        require('child_process').execSync('tar -xzf package.tgz', { cwd: destDir, stdio: 'pipe' });
        fs.rmSync(tmpFile);

        const extracted = path.join(destDir, 'package');
        const target = path.join(NODE_MODULES, name);
        if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.renameSync(extracted, target);
        fs.rmSync(destDir, { recursive: true, force: true });
        resolve(target);
      });
    }).on('error', reject);
  });
}

async function installPackage(name, versionRange) {
  const key = name + '@' + versionRange;
  if (installed.has(key)) return;

  const meta = await fetchJson('https://registry.npmjs.org/' + encodeURIComponent(name));
  const version = meta['dist-tags']?.latest || Object.keys(meta.versions).pop();
  const resolved = meta.versions[version];
  if (!resolved) {
    throw new Error('Could not resolve ' + name);
  }

  installed.add(name + '@' + resolved.version);
  const targetDir = path.join(NODE_MODULES, '.tmp-' + name);
  console.log('Installing ' + name + '@' + resolved.version);
  await downloadTarball(name, resolved.dist.tarball, targetDir);

  const pkgJsonPath = path.join(NODE_MODULES, name, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    const deps = Object.assign({}, pkg.dependencies || {}, pkg.optionalDependencies || {});
    for (const [depName, depRange] of Object.entries(deps)) {
      await installPackage(depName, depRange);
    }
  }
}

async function main() {
  fs.mkdirSync(NODE_MODULES, { recursive: true });
  const rootPkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  for (const [name, range] of Object.entries(rootPkg.dependencies || {})) {
    await installPackage(name, range);
  }
  console.log('Dependencies installed.');
}

main().catch(function (err) {
  console.error(err);
  process.exit(1);
});
