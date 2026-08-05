#!/usr/bin/env node
/** Build sharp SpareBank 1 Finans Østlandet logo from SVG icon + source text. */
import { Resvg } from '@resvg/resvg-js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../client/public/assets/partners/sparebank1.png');
const TMP = path.join(__dirname, '../.tmp/partner-logos');
const TARGET_H = 120;

const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="198 8 68 68">
  <path fill="#ffffff" d="M224.4,11.4c-2.9,0-5.8,0.5-8.4,1.3c11.2-2.4,22.2,2.2,26.2,11.6c4.6,10.9-2,24.1-14.7,29.5c-11.4,4.8-23.9,1.7-29.7-6.8c3.4,11.5,14,19.9,26.6,19.9c15.3,0,27.8-12.4,27.8-27.8S239.7,11.4,224.4,11.4z"/>
  <path fill="#ffffff" d="M227.4,53.8c12.7-5.4,19.3-18.6,14.7-29.5c-4-9.4-15.1-14-26.2-11.6c-11.2,3.6-19.3,14.1-19.3,26.5c0,2.7,0.4,5.3,1.1,7.8C203.5,55.5,216,58.6,227.4,53.8z"/>
  <path fill="#111111" d="M231.5,51.7V23.2c0-0.6-0.5-1-1-1H224c-0.5,0-0.7,0.1-1.1,0.3l-8.3,4.3c-0.5,0.2-0.7,0.5-0.7,1v4.7c0,0.5,0.4,1,1,1h5.3v22.4c2.4-0.3,4.9-1,7.3-2C228.9,53.1,230.2,52.4,231.5,51.7z"/>
</svg>`;

fs.mkdirSync(TMP, { recursive: true });

const iconPng = path.join(TMP, 'sb1-icon.png');
const textPng = path.join(TMP, 'sb1-text.png');
const rawPng = path.join(TMP, 'sb1fo-pos.png');

if (!fs.existsSync(rawPng)) {
  execSync(
    `curl -sL "https://www.sb1fo.no/multimedia/724/SB1FO_rgb_SB1_Finans_Ostlandet_verti_pos.png" -o "${rawPng}"`,
    { stdio: 'inherit' },
  );
}

const resvg = new Resvg(ICON_SVG, {
  fitTo: { mode: 'height', value: 220 },
  background: 'transparent',
});
fs.writeFileSync(iconPng, resvg.render().asPng());

const pyScript = path.join(__dirname, 'compose-sparebank1-logo.py');
execSync(
  `python3 "${pyScript}" "${rawPng}" "${iconPng}" "${OUT}" ${TARGET_H}`,
  { stdio: 'inherit' },
);
console.log('Wrote', OUT);
