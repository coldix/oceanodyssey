#!/usr/bin/env node
/**
 * Ocean Odyssey v1.1.0
 * Designed by Colin Dixon + Grok · Website by https://oze.au
 * Generate public/images/og-default.jpg at 1200×630.
 * Usage: node scripts/generate-og.mjs
 */
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const W = 1200;
const H = 630;
const OUT = path.join(ROOT, 'public/images/og-default.jpg');
const preferred = path.join(ROOT, 'public/images/og-source/yacht-seascape.jpg');
const fallbacks = [
  preferred,
  path.join(ROOT, 'public/images/background3.jpg'),
  path.join(ROOT, 'public/images/hinewai.jpg'),
];
const src = fallbacks.find((p) => fs.existsSync(p));
if (!src) throw new Error('No source image for OG card');

const bg = await sharp(src)
  .rotate()
  .resize(W, H, { fit: 'cover', position: 'centre' })
  .modulate({ brightness: 0.9, saturation: 1.05 })
  .toBuffer();

const overlay = Buffer.from(`
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#061018" stop-opacity="0.88"/>
      <stop offset="52%" stop-color="#0B1F2A" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#0B1F2A" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#061018" stop-opacity="0"/>
      <stop offset="100%" stop-color="#061018" stop-opacity="0.5"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect width="${W}" height="${H}" fill="url(#bottom)"/>
  <rect x="64" y="168" width="72" height="6" rx="3" fill="#2A8B8B"/>
  <text x="64" y="150" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="6" fill="#5BB8B8">SAILING MEMOIR</text>
  <text x="64" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="700" fill="#F7F4EF">Ocean Odyssey</text>
  <text x="64" y="310" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-style="italic" fill="#E8DCC8">Hinewai — Melbourne to the Mediterranean</text>
  <text x="64" y="380" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="24" fill="#C8D4DC">The voyage of Peter Knight &amp; Jean Hutson-Knight</text>
  <rect x="0" y="${H - 64}" width="${W}" height="64" fill="#061018" fill-opacity="0.62"/>
  <text x="64" y="${H - 28}" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="20" fill="#8FA3B0">oceanodyssey.net</text>
  <text x="${W - 64}" y="${H - 28}" text-anchor="end" font-family="system-ui, -apple-system, Segoe UI, sans-serif" font-size="18" fill="#5BB8B8">A lasting record of the voyage</text>
</svg>
`);

const jpg = await sharp(bg)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .jpeg({ quality: 90, mozjpeg: true })
  .toBuffer();
fs.writeFileSync(OUT, jpg);
const meta = await sharp(OUT).metadata();
console.log(`Wrote ${OUT} (${meta.width}×${meta.height}, ${(jpg.length / 1024).toFixed(1)} KB) from ${path.relative(ROOT, src)}`);
