#!/usr/bin/env node
/**
 * Ocean Odyssey v1.1.0
 * Designed by Colin Dixon + Grok · Website by https://oze.au
 *
 * Generate WebP siblings for content JPEGs under public/images.
 * Keeps original JPEGs as masters. Skips chrome/UI assets.
 *
 * Usage:
 *   node scripts/optimise-images.mjs
 *   node scripts/optimise-images.mjs --force   # rebuild all webps
 *   node scripts/optimise-images.mjs --dry-run
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_ROOT = path.join(ROOT, 'public', 'images');
const QUALITY = 80;
const FORCE = process.argv.includes('--force');
const DRY = process.argv.includes('--dry-run');

const SKIP_DIRS = new Set(['_vti_cnf', 'pages', 'thumbnails', 'og-source']);
const SKIP_PREFIXES = ['button', 'toppage', 'topofpage'];
const SKIP_NAMES = new Set([
  'null.gif',
  'dot_black.gif',
  'email.gif',
  'phone.gif',
  'post.gif',
  'background.jpg',
  'background3.jpg',
  'backgroundold.jpg',
]);

function shouldSkip(filePath, name) {
  const lower = name.toLowerCase();
  if (SKIP_NAMES.has(lower)) return true;
  if (SKIP_PREFIXES.some((p) => lower.startsWith(p))) return true;
  if (!/\.jpe?g$/i.test(name)) return true;
  // keep og-default.jpg → also make webp (useful)
  return false;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name.startsWith('.')) continue;
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name)) continue;
      walk(path.join(dir, ent.name), out);
    } else {
      out.push(path.join(dir, ent.name));
    }
  }
  return out;
}

const files = walk(IMG_ROOT).filter((f) => {
  const name = path.basename(f);
  return !shouldSkip(f, name);
});

let converted = 0;
let skipped = 0;
let failed = 0;
let savedBytes = 0;
let origBytes = 0;

console.log(`Found ${files.length} JPEGs under public/images`);
if (DRY) console.log('DRY RUN — no files written\n');

for (const file of files) {
  const webpPath = file.replace(/\.jpe?g$/i, '.webp');
  const stat = fs.statSync(file);
  origBytes += stat.size;

  if (!FORCE && fs.existsSync(webpPath)) {
    const wstat = fs.statSync(webpPath);
    if (wstat.mtimeMs >= stat.mtimeMs) {
      skipped++;
      savedBytes += Math.max(0, stat.size - wstat.size);
      continue;
    }
  }

  try {
    if (DRY) {
      converted++;
      continue;
    }
    const buf = await sharp(file)
      .rotate()
      .webp({ quality: QUALITY, effort: 4 })
      .toBuffer();
    fs.writeFileSync(webpPath, buf);
    converted++;
    savedBytes += Math.max(0, stat.size - buf.length);
    if (converted % 50 === 0) {
      process.stdout.write(`  … ${converted} converted\n`);
    }
  } catch (err) {
    failed++;
    console.error('FAIL', path.relative(ROOT, file), err.message);
  }
}

console.log('\nDone.');
console.log(`  converted: ${converted}`);
console.log(`  skipped (up to date): ${skipped}`);
console.log(`  failed: ${failed}`);
if (!DRY) {
  console.log(`  JPEG input (processed set): ${(origBytes / 1e6).toFixed(2)} MB`);
  console.log(`  approx bytes saved vs JPEG: ${(savedBytes / 1e6).toFixed(2)} MB`);
}
console.log(`  quality: ${QUALITY}`);
console.log(`  masters kept as .jpg — delivery via <picture> WebP + JPEG fallback`);
