#!/usr/bin/env node
/**
 * Fetch high-resolution partner logos and export sharp white PNGs
 * for the home page marquee (retina-ready, normalized height).
 */
import { Resvg } from '@resvg/resvg-js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../client/public/assets/partners');
const TMP_DIR = path.join(__dirname, '../.tmp/partner-logos');
const TARGET_HEIGHT = 120;

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(TMP_DIR, { recursive: true });

function curl(url, out) {
  execSync(`curl -sL "${url}" -o "${out}"`, { stdio: 'pipe' });
}

function renderSvg(svg, outPng, width = 900) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    background: 'transparent',
  });
  fs.writeFileSync(outPng, resvg.render().asPng());
}

function extractGjensidigeSvg(js) {
  const start = js.indexOf(',bx=()=>r("svg"');
  if (start < 0) throw new Error('Gjensidige logo not found in JS bundle');
  const slice = js.slice(start, start + 12000);
  const paths = [...slice.matchAll(/d:"([^"]+)"/g)].map((m) => m[1]);
  if (!paths.length) throw new Error('No Gjensidige paths found');
  const pathEls = paths.map((d) => `<path d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 38.5" fill="#ffffff">${pathEls}</svg>`;
}

function extractSantanderSvg(html) {
  const block = html.match(
    /<svg[^>]*viewBox="([^"]+)"[^>]*aria-label="Santander Logo"[^>]*>([\s\S]*?)<\/svg>/,
  );
  if (!block) throw new Error('Santander logo block not found');
  const viewBox = block[1];
  const paths = [...block[2].matchAll(/d="([^"]+)"/g)].map((m) => m[1]);
  if (!paths.length) throw new Error('Santander paths not found');
  const pathEls = paths.map((d) => `<path d="${d}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="#ffffff">${pathEls}</svg>`;
}

const FREMIND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="32 27 581 120" fill="#ffffff">
  <g fill="none" stroke="#ffffff" stroke-width="8">
    <line x1="34.3" x2="104.846844" y1="32.563024" y2="32.563024"/>
    <line x1="35.12226" x2="91.504088" y1="80.105318" y2="80.105318"/>
    <line x1="-10.820058" x2="87.38984" y1="84.219561" y2="84.219561" transform="rotate(90, 38.2849, 84.2196)"/>
  </g>
  <path fill="#ffffff" stroke-width=".57975" d="M145.752 58.979c-10.21 0-20.201 6.854-23.793 16.133l-.157-15.179-.002-.224h-6.907v73.723h7.782V98.038c0-11.791 2.998-31.572 23.077-31.572 2.89 0 5.153.23 7.12.724l.283.07v-7.806l-.187-.035c-2.363-.44-4.831-.44-7.216-.44M170.88 91.357c.1-15.2 10.325-26.21 24.387-26.21 15.08 0 23.29 13.146 23.658 26.21H170.88zm24.387-33.554c-10.228 0-18.904 4.44-25.092 12.84-4.925 6.7-7.22 15.031-7.22 26.218 0 11.088 3.262 20.766 9.433 27.99 6.099 6.954 13.994 10.481 23.466 10.481 8.097 0 15.596-3.04 21.115-8.559 4.522-4.364 7.305-9.583 8.269-15.515l.044-.262h-8.075l-.038.182c-.77 3.876-2.52 7.146-5.503 10.292-3.968 4.11-9.583 6.375-15.812 6.375-7.332 0-13.239-2.586-17.557-7.684-4.619-5.48-7.37-13.341-7.563-21.602h55.97v-.227c0-.877.038-1.659.074-2.415.037-.758.076-1.543.076-2.426 0-9.44-2.952-18.247-8.313-24.797-5.831-7.126-13.88-10.891-23.274-10.891h0zM324.782 57.803c-10.833 0-19.176 5.465-23.558 15.41-2.377-7.168-8.339-15.41-23.183-15.41-9.606 0-17.811 5.162-22.111 13.86l-.813-11.743-.016-.211h-6.89v73.723h7.78V96.568c0-12.182 2.933-21.098 8.72-26.501 3.425-3.265 7.76-4.92 12.885-4.92 11.845 0 17.362 6.4 17.362 20.142v48.143h7.923V91.736c0-8.853 2.965-16.346 8.573-21.666 3.682-3.36 7.777-4.924 12.89-4.924 11.741 0 17.21 6.4 17.21 20.143v48.143h7.783V84.844c0-17.438-8.721-27.041-24.555-27.041M387.105 37.665l-7.782 1.873v20.17h-14.656v7.195h14.656v45.933c0 14.145 6.615 21.622 19.133 21.622 3.964 0 7.73-.804 11.72-1.657l.668-.142v-6.91l-.267.05c-3.606.666-7.465 1.315-11.54 1.315-8.364 0-11.932-4.357-11.932-14.571v-45.64h43.533v66.529h8.22V59.709h-51.753V37.665M499.748 57.803c-10.364 0-20.339 5.951-24.596 14.576l-.83-12.67h-6.893v73.723h7.781V96.568c0-6.054.932-14.697 5.367-21.487 4.18-6.398 10.483-9.64 18.734-9.64 12.565 0 18.674 6.492 18.674 19.848v48.143h7.781V84.844c0-17.185-9.482-27.041-26.018-27.041M434.672 28.547a5.9 5.9 0 0 0-5.894 5.893 5.9 5.9 0 0 0 5.894 5.895 5.9 5.9 0 0 0 5.895-5.895 5.9 5.9 0 0 0-5.895-5.893M592.914 121.901c-4.007 3.85-8.984 5.801-14.793 5.801-5.777 0-10.472-1.658-14.354-5.068-6.188-5.519-9.597-14.775-9.597-26.066 0-10.31 2.89-19.102 8.139-24.751 4.135-4.291 9.212-6.376 15.52-6.376 6.202 0 11.324 1.9 15.23 5.653 6.251 5.846 9.164 13.941 9.164 25.474 0 10.765-3.132 19.29-9.309 25.333zm9.157-94.721v44.113c-4.264-7.988-14.077-13.49-24.243-13.49-8.072 0-14.828 2.585-20.081 7.682-7.309 6.897-11.5 18.281-11.5 31.234 0 13.6 4.294 24.848 12.091 31.673 5.234 4.605 11.841 6.94 19.64 6.94 10.115 0 20.112-5.893 24.154-14.127l.835 12.227h6.886V27.18h-7.782 0z"/>
</svg>`;

const SOURCES = {
  'sparebank1.png': {
    type: 'banner-crop',
    box: [0, 470, 0],
    targetHeight: 240,
  },
  'santander.png': {
    type: 'svg-inline',
    build: async () => {
      const htmlPath = path.join(TMP_DIR, 'santander.html');
      curl('https://www.santanderconsumer.no/', htmlPath);
      return extractSantanderSvg(fs.readFileSync(htmlPath, 'utf8'));
    },
    renderWidth: 700,
  },
  'as-finansiering.png': {
    type: 'svg-url',
    url: 'https://www.financiering.no/wp-content/uploads/2019/10/as_financiering_hvit.svg',
    renderWidth: 900,
  },
  'gjensidige.png': {
    type: 'svg-inline',
    build: async () => {
      const jsPath = path.join(TMP_DIR, 'gjensidige.js');
      curl(
        'https://cdn.gjensidige.no/builders/builders-platform/views-api/20260611.1702-main-ea3eb9b/app.js',
        jsPath,
      );
      return extractGjensidigeSvg(fs.readFileSync(jsPath, 'utf8'));
    },
    renderWidth: 900,
  },
  'if.png': {
    type: 'png',
    url: 'https://www.if.no/if-insurance-company-logo.png',
    white: 'if',
  },
  'nbt.png': {
    type: 'png',
    url: 'https://www.norsk-biltransport.no/img/NBT_LOGO.png',
    white: true,
  },
  'fremtind.png': {
    type: 'svg-inline',
    build: async () => FREMIND_SVG,
    renderWidth: 900,
  },
  'enter-tryg.png': {
    type: 'png',
    url: 'https://www.enter-forsikring.no/themes/trygno/logo.png',
    white: true,
  },
  'auto-concept.png': {
    type: 'png',
    url: 'https://www.autoconcept.no/hubfs/Website%202025/AutoConcept%20Logotyp/ACI%20Logo%20Enradig%201000x160px%20300DPI_Transparent%20bg.png',
    white: true,
  },
  'fragus.png': {
    type: 'svg-url',
    url: 'https://www.fragus.com/media/x4mhba3o/f-fragus_logo_neg1.svg',
    renderWidth: 700,
  },
  'axess.png': {
    type: 'png',
    url: 'https://www.axesslogistics.no/image/getthumbnail/1009?version=3&s=006',
    white: true,
    scale: 1,
    padBottom: 8,
  },
};

const PY_POST = path.join(__dirname, 'postprocess-logo.py');

for (const [filename, cfg] of Object.entries(SOURCES)) {
  const tmpRaw = path.join(TMP_DIR, filename.replace('.png', '-raw.png'));
  const outPath = path.join(OUT_DIR, filename);

  if (cfg.type === 'banner-crop') {
    const banner = path.join(__dirname, '../client/public/assets/samarbeidspartnere.png');
    const [x0, x1, row] = cfg.box;
    const targetH = cfg.targetHeight ?? TARGET_HEIGHT;
    execSync(
      `python3 -c "from PIL import Image; im=Image.open('${banner}').convert('RGBA'); w,h=im.size; rh=h//2; y0=0 if ${row}==0 else rh; y1=rh if ${row}==0 else h; c=im.crop((${x0},y0,${x1},y1)); px=c.load(); cw,ch=c.size
for y in range(ch):
  for x in range(cw):
    r,g,b,a=px[x,y]
    if max(r,g,b)<40: px[x,y]=(0,0,0,0)
    elif max(r,g,b)>200: px[x,y]=(255,255,255,a)
    else: px[x,y]=(255,255,255,min(255,int(max(r,g,b)*1.2)))
b=c.getbbox(); c=c.crop(b) if b else c; c=c.resize((max(1,int(c.width*(${targetH}/c.height))),${targetH}), Image.Resampling.LANCZOS); c.save('${outPath}', optimize=True); print(c.size)"`,
      { stdio: 'inherit' },
    );
    continue;
  }

  if (cfg.type === 'custom') {
    await cfg.build();
    console.log(filename, '{"custom": true}');
    continue;
  }

  if (cfg.type === 'png') {
    curl(cfg.url, tmpRaw);
  } else if (cfg.type === 'svg-url') {
    const svgPath = path.join(TMP_DIR, filename.replace('.png', '.svg'));
    curl(cfg.url, svgPath);
    renderSvg(fs.readFileSync(svgPath, 'utf8'), tmpRaw, cfg.renderWidth ?? 900);
  } else if (cfg.type === 'svg-inline') {
    const svg = await cfg.build();
    renderSvg(svg, tmpRaw, cfg.renderWidth ?? 900);
  }

  const scale = cfg.scale ?? 1;
  const padBottom = cfg.padBottom ?? 0;
  const whiteFlag = cfg.white === false ? '0' : cfg.white === 'if' ? 'if' : cfg.white === 'sb1' ? 'sb1' : '1';
  const result = execSync(
    `python3 "${PY_POST}" "${tmpRaw}" "${outPath}" ${TARGET_HEIGHT} ${scale} ${whiteFlag} ${padBottom}`,
    { encoding: 'utf8' },
  );
  console.log(filename, result.trim());
}

console.log('Done. Logos written to', OUT_DIR);
