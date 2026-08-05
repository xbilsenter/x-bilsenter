#!/usr/bin/env node
/**
 * Vectorize partner PNG logos to SVG via potrace (preserves current appearance).
 */
import potrace from 'potrace';
import fs from 'fs';
import path from 'path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PARTNERS_DIR = path.join(__dirname, '../client/public/assets/partners');
const TMP_DIR = path.join(__dirname, '../.tmp/partner-logos');
const DEFAULT_TRACE_SCALE = 4;

fs.mkdirSync(TMP_DIR, { recursive: true });

const DUAL_TONE = new Set(['if.png']);

/** Raster-only logos (banner crops) – potrace cannot preserve these cleanly. */
SKIP = new Set(['sparebank1.svg', 'axess.png']);

function traceFile(input, options = {}) {
  return new Promise((resolve, reject) => {
    potrace.trace(
      input,
      {
        turdSize: 4,
        optTolerance: 0.35,
        color: '#ffffff',
        background: 'transparent',
        ...options,
      },
      (err, svg) => (err ? reject(err) : resolve(svg)),
    );
  });
}

function extractPaths(svg) {
  return [...svg.matchAll(/<path[^>]*\/>|<path[^>]*>[\s\S]*?<\/path>/g)].map((m) => m[0]);
}

function buildSvg(width, height, paths, scale) {
  const vbW = width * scale;
  const vbH = height * scale;
  const body = paths.join('\n\t');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${vbW} ${vbH}" fill-rule="evenodd">\n\t${body}\n</svg>\n`;
}

function normalizePathFill(pathEl, fill) {
  return pathEl.replace(/fill="[^"]*"/g, '').replace(/<path /, `<path fill="${fill}" `);
}

async function vectorizeOne(filename) {
  if (SKIP_VECTORIZE.has(filename)) {
    console.log(`${filename} -> skipped (use PNG)`);
    return;
  }

  const pngPath = path.join(PARTNERS_DIR, filename);
  const svgPath = path.join(PARTNERS_DIR, filename.replace('.png', '.svg'));
  const traceScale = DEFAULT_TRACE_SCALE;
  const traceOpts = {};

  const meta = JSON.parse(
    execSync(`python3 -c "from PIL import Image; im=Image.open('${pngPath}'); print(__import__('json').dumps(im.size))"`, {
      encoding: 'utf8',
    }),
  );
  const [width, height] = meta;

  const lightMask = path.join(TMP_DIR, `${filename}-light-bw.png`);
  execSync(
    `python3 "${path.join(__dirname, 'prepare-trace-mask.py')}" "${pngPath}" "${lightMask}" light ${traceScale}`,
    { stdio: 'pipe' },
  );

  const lightSvg = await traceFile(lightMask, traceOpts);
  const paths = extractPaths(lightSvg).map((p) => normalizePathFill(p, '#ffffff'));

  if (DUAL_TONE.has(filename)) {
    const darkMask = path.join(TMP_DIR, `${filename}-dark-bw.png`);
    execSync(
      `python3 "${path.join(__dirname, 'prepare-trace-mask.py')}" "${pngPath}" "${darkMask}" dark ${traceScale}`,
      { stdio: 'pipe' },
    );
    const darkSvg = await traceFile(darkMask, { color: '#111111' });
    paths.push(...extractPaths(darkSvg).map((p) => normalizePathFill(p, '#111111')));
  }

  fs.writeFileSync(svgPath, buildSvg(width, height, paths, traceScale));
  console.log(`${filename} -> ${path.basename(svgPath)} (${paths.length} paths, scale=${traceScale})`);
}

const files = fs.readdirSync(PARTNERS_DIR).filter((f) => f.endsWith('.png') && !f.includes('-test'));
for (const file of files) {
  await vectorizeOne(file);
}

console.log('Done.');
