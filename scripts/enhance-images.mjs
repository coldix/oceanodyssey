#!/usr/bin/env node
/**
 * Placeholder for open-source image enhancement pipeline.
 * For now, lists candidate images (small JPEGs) for Topaz / Real-ESRGAN.
 *
 * Usage: node scripts/enhance-images.mjs
 * Later: integrate sharp resize + Real-ESRGAN CLI when models available.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG = path.join(ROOT, 'public', 'images');

const candidates = [];

function walk(dir, rel = '') {
  for (const name of fs.readdirSync(dir)) {
    if (name.startsWith('.') || name === '_vti_cnf') continue;
    const full = path.join(dir, name);
    const r = rel ? `${rel}/${name}` : name;
    if (fs.statSync(full).isDirectory()) walk(full, r);
    else if (/\.jpe?g$/i.test(name)) {
      const lower = name.toLowerCase();
      if (lower.startsWith('button') || lower.startsWith('toppage')) continue;
      try {
        const out = execSync(`sips -g pixelWidth -g pixelHeight "${full}"`, {
          encoding: 'utf8',
        });
        const w = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1] || 0);
        const h = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1] || 0);
        if (w && w < 900) candidates.push({ path: r, w, h, px: w * h });
      } catch {
        /* skip */
      }
    }
  }
}

walk(IMG);
candidates.sort((a, b) => a.px - b.px);

console.log(`Found ${candidates.length} images under 900px wide.\n`);
console.log('Priority candidates for Topaz / upscale (smallest first, top 40):\n');
for (const c of candidates.slice(0, 40)) {
  console.log(`  ${c.w}×${c.h}  ${c.path}`);
}

const listPath = path.join(ROOT, 'scripts', 'upscale-candidates.txt');
fs.writeFileSync(
  listPath,
  candidates.map((c) => `${c.w}x${c.h}\t${c.path}`).join('\n') + '\n'
);
console.log(`\nFull list written to ${listPath}`);
