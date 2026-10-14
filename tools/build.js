#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { svg, STEPS, BASE, W } = require('./diagram');

const root = path.resolve(__dirname, '..');

// 1. static SVG (system font name only, for resvg)
const plain = svg({ embedFont: false });
fs.writeFileSync(path.join(root, 'visa-click-to-pay.svg'), plain);

// 2. PNG at 2x (optional: needs `npm i` in tools/ for @resvg/resvg-js)
let png = null;
try {
  const { Resvg } = require('@resvg/resvg-js');
  png = new Resvg(plain, {
    fitTo: { mode: 'width', value: W * 2 },
    font: { loadSystemFonts: true, defaultFontFamily: 'Noto Sans' },
  }).render().asPng();
  fs.writeFileSync(path.join(root, 'visa-click-to-pay.png'), png);
} catch (e) {
  console.warn('skipped PNG (run `npm i` in tools/ to enable):', e.message);
}

// 3. interactive single-file HTML (web font stack, grouped ids)
const html = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8')
  .replace('__SVG__', svg({ embedFont: true }).trim())
  .replace('__STEPS__', JSON.stringify(STEPS, null, 0))
  .replace('__BASE__', JSON.stringify(BASE));
fs.writeFileSync(path.join(root, 'visa-click-to-pay.html'), html);

console.log('svg', plain.length, 'png', png ? png.length : 'skipped', 'html', html.length);
