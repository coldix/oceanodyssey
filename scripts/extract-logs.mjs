#!/usr/bin/env node
/**
 * Extract voyage logs from legacy FrontPage HTML into Markdown content files.
 * Preserves Peter's wording; fixes encoding; rewrites image paths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'node-html-parser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LEGACY = path.join(ROOT, 'legacy');
const OUT = path.join(ROOT, 'content', 'logs');

const LOG_META = [
  { file: 'log9-RBYC-Queenscliffe.html', sequence: 9, slug: 'melbourne-queenscliff', title: 'From Melbourne to Queenscliff', region: 'australia', summary: 'Leaving RBYC and the first short hop toward the open voyage.', places: ['Melbourne', 'Queenscliff'], unfinished: false },
  { file: 'log10-Queenscliffe-sydney.html', sequence: 10, slug: 'queenscliff-sydney', title: 'From Queenscliff to Sydney', region: 'australia', summary: 'Heading north, dodging weather, and getting into the swing of cruising.', places: ['Queenscliff', 'Sydney'], unfinished: false },
  { file: 'log11-Sydney-Cairns.html', sequence: 11, slug: 'sydney-cairns', title: 'From Sydney to Cairns', region: 'australia', summary: 'North to Brisbane, crew changes, Hamilton Island, and collecting Jean in Cairns.', places: ['Sydney', 'Brisbane', 'Hamilton Island', 'Cairns'], unfinished: false },
  { file: 'log12-Carins-ThursdayIs.html', sequence: 12, slug: 'cairns-thursday-island', title: 'From Cairns to the Torres Strait', region: 'australia', summary: 'Up behind the Barrier Reef, living by waypoints.', places: ['Cairns', 'Cape York', 'Thursday Island'], unfinished: false },
  { file: 'log13-ThursIs-Darwin.html', sequence: 13, slug: 'thursday-island-darwin', title: 'From the Torres Strait to Darwin', region: 'australia', summary: 'First long passage across the Top End — and breaking ribs.', places: ['Thursday Island', 'Darwin'], unfinished: false },
  { file: 'log14-Darwin1.html', sequence: 14, slug: 'darwin-1', title: 'Darwin 1', region: 'australia', summary: 'An enforced stay — but life in Darwin is fun.', places: ['Darwin'], unfinished: false },
  { file: 'log15-Darwin2.html', sequence: 15, slug: 'darwin-2', title: 'Darwin 2', region: 'australia', summary: 'Still mending ribs, still enjoying Darwin.', places: ['Darwin'], unfinished: false },
  { file: 'log16-Darwin3.html', sequence: 16, slug: 'darwin-3', title: 'Darwin 3', region: 'australia', summary: 'Cyclone season, build-up, and finally ready to leave.', places: ['Darwin'], unfinished: false },
  { file: 'log17-Darwin-Bali.html', sequence: 17, slug: 'darwin-bali', title: 'From Darwin to Bali', region: 'indonesia', summary: 'Travelling again, first new country, losing a prop blade.', places: ['Darwin', 'Bali', 'Benoa'], unfinished: false },
  { file: 'log18-Bali-Lombok.html', sequence: 18, slug: 'bali-lombok', title: 'From Bali to Lombok', region: 'indonesia', summary: 'New friends, Nusa Lembongan, Teluk Narah, and the Gilis.', places: ['Bali', 'Lombok', 'Nusa Lembongan'], unfinished: false },
  { file: 'log19-Lombok-Kumai.html', sequence: 19, slug: 'lombok-kumai', title: 'From Lombok to Kumai', region: 'indonesia', summary: 'Fish-traps, Bawean, the Kumai River, and orang-utans.', places: ['Lombok', 'Bawean', 'Kumai'], unfinished: false },
  { file: 'log20-Kumai-Kuching.html', sequence: 20, slug: 'kumai-kuching', title: 'From Kumai to Kuching', region: 'borneo', summary: 'Around Borneo: Sarawak, Sabah, Brunei, racing and thunderstorms.', places: ['Kumai', 'Brunei', 'Miri', 'Kuching'], unfinished: false },
  { file: 'log21-Kuching-Singapore.html', sequence: 21, slug: 'kuching-singapore', title: 'From Kuching to Singapore', region: 'se-asia', summary: 'Windy crossing to Tioman, then Singapore — and lightning.', places: ['Kuching', 'Tioman', 'Singapore'], unfinished: false },
  { file: 'log22-Singapore-Langkawi.html', sequence: 22, slug: 'singapore-langkawi', title: 'From Singapore to Langkawi', region: 'se-asia', summary: 'Port Dickson, Penang, weeks on the hard, and on to Langkawi.', places: ['Singapore', 'Penang', 'Langkawi'], unfinished: false },
  { file: 'log23-Thailand.html', sequence: 23, slug: 'thailand-kings-cup', title: 'Thailand and the Kings Cup', region: 'se-asia', summary: 'Racing, parties, islands, Christmas and New Year.', places: ['Phuket', 'Thailand'], unfinished: false },
  { file: 'log24-Phuket-Galle.html', sequence: 24, slug: 'phuket-galle', title: 'The Indian Ocean 1 — Langkawi to Galle', region: 'indian-ocean', summary: 'Westbound passage; an unexpected breakage forces a divert to Sri Lanka.', places: ['Langkawi', 'Galle'], unfinished: false },
  { file: 'log25-Galle.html', sequence: 25, slug: 'galle-sri-lanka', title: 'Galle and Sri Lanka', region: 'indian-ocean', summary: 'Customs, exploring, elephants, and waiting for parts.', places: ['Galle', 'Sri Lanka'], unfinished: false },
  { file: 'log26-Galle-Sulalah.html', sequence: 26, slug: 'galle-salalah', title: 'The Indian Ocean 2 — Galle to Salalah', region: 'indian-ocean', summary: 'The Maldives, whales, and arriving in Arabia.', places: ['Galle', 'Maldives', 'Salalah'], unfinished: false },
  { file: 'log27-Oman-Aden.html', sequence: 27, slug: 'oman-aden', title: 'Pirate Alley — Oman to Aden', region: 'aden', summary: 'Vasco da Gama rally, camels, and the convoy to Aden.', places: ['Salalah', 'Oman', 'Aden'], unfinished: false },
  { file: 'log28-Aden-Rescue.html', sequence: 28, slug: 'aden-red-sea', title: 'From Aden into the Red Sea', region: 'aden', summary: 'Faded glory of Aden, then a mad night rescuing a yacht.', places: ['Aden', 'Eritrea'], unfinished: false },
  { file: 'log29-TheRedSea1.html', sequence: 29, slug: 'red-sea-1', title: 'The Red Sea — Part 1', region: 'red-sea', summary: 'Working north against weather; interesting places and a little video.', places: ['Red Sea', 'Eritrea', 'Sudan'], unfinished: false },
  { file: 'log30-TheRedSea2.html', sequence: 30, slug: 'red-sea-2', title: 'The Red Sea — Part 2', region: 'red-sea', summary: 'Port Ghalib, Hurghada, X-rays, and cruising the Nile.', places: ['Port Ghalib', 'Hurghada', 'Egypt'], unfinished: false },
  { file: 'log31-TheRedSea3.html', sequence: 31, slug: 'red-sea-3', title: 'The Red Sea — Part 3 and the Suez', region: 'red-sea', summary: 'Weather windows, sandstorm, fees, and half way up the Suez Canal.', places: ['Hurghada', 'Suez', 'Ismailia'], unfinished: false },
  { file: 'log32-Ismailia&Cairo.html', sequence: 32, slug: 'ismailia-cairo', title: 'Ismailia & Cairo', region: 'med', summary: 'Corrupt officials, escape, and two wonderful days in Cairo.', places: ['Ismailia', 'Cairo'], unfinished: false },
  { file: 'log33-Ismailia-Turkey.html', sequence: 33, slug: 'ismailia-turkey', title: 'Ismailia to Turkey', region: 'med', summary: 'A win over baksheesh, the last of the Suez, and feet dry in Turkey.', places: ['Ismailia', 'Turkey'], unfinished: false },
  { file: 'log34-Almost a year in Turkey.html', sequence: 34, slug: 'turkey', title: 'Almost a year in Turkey', region: 'med', summary: 'Peter prepared this chapter title — the narrative was never finished on the site.', places: ['Turkey'], unfinished: true },
  { file: 'log35 - From Turkey to Gib.html', sequence: 35, slug: 'turkey-gibraltar', title: 'From Turkey to Gibraltar', region: 'med', summary: 'Across the Mediterranean — chapter never completed on the original site.', places: ['Turkey', 'Gibraltar'], unfinished: true },
  { file: 'log36-From Gib to Ipswich.html', sequence: 36, slug: 'gibraltar-ipswich', title: 'From Gibraltar to Ipswich', region: 'atlantic', summary: 'Bay of Biscay and the UK — chapter never completed on the original site.', places: ['Gibraltar', 'Ipswich'], unfinished: true },
  { file: 'log37-A Longish Stay in Ipswich.html', sequence: 37, slug: 'ipswich', title: 'A Longish Stay in Ipswich', region: 'atlantic', summary: 'Laid up in the UK — chapter never completed on the original site.', places: ['Ipswich'], unfinished: true },
  { file: 'log38-Repowering in Guernsey.html', sequence: 38, slug: 'guernsey', title: 'Repowering in Guernsey', region: 'atlantic', summary: 'Engine work in the Channel Islands — chapter never completed on the original site.', places: ['Guernsey'], unfinished: true },
];

const REGION_LABELS = {
  australia: 'Australia',
  indonesia: 'Indonesia',
  borneo: 'Borneo',
  'se-asia': 'Southeast Asia',
  'indian-ocean': 'Indian Ocean',
  aden: 'Aden & Arabia',
  'red-sea': 'Red Sea',
  med: 'Mediterranean',
  atlantic: 'Atlantic & UK',
};

function fixEncoding(text) {
  return text
    .replace(/\uFFFD/g, "'")
    .replace(/G.day/g, "G'day")
    .replace(/we.re/g, "we're")
    .replace(/it.s /g, "it's ")
    .replace(/don.t/g, "don't")
    .replace(/can.t/g, "can't")
    .replace(/won.t/g, "won't")
    .replace(/I.m /g, "I'm ")
    .replace(/you.re/g, "you're")
    .replace(/they.re/g, "they're")
    .replace(/isn.t/g, "isn't")
    .replace(/didn.t/g, "didn't")
    .replace(/wouldn.t/g, "wouldn't")
    .replace(/couldn.t/g, "couldn't")
    .replace(/haven.t/g, "haven't")
    .replace(/hasn.t/g, "hasn't")
    .replace(/wasn.t/g, "wasn't")
    .replace(/weren.t/g, "weren't")
    .replace(/o.f salt/g, 'of salt')
    .replace(/loose it a bit/g, 'lose it a bit')
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function rewriteImageSrc(src) {
  if (!src) return null;
  let s = src.replace(/\\/g, '/').trim();
  // strip leading ./ 
  s = s.replace(/^\.\//, '');
  // map images/ paths to /images/
  if (s.toLowerCase().startsWith('images/')) {
    s = '/' + s;
  } else if (!s.startsWith('/') && !s.startsWith('http')) {
    s = '/images/' + s.replace(/^\/+/, '');
  }
  // skip null gifs and chrome
  const base = path.basename(s).toLowerCase();
  if (['null.gif', 'dot_black.gif', 'email.gif', 'phone.gif', 'post.gif'].includes(base)) return null;
  if (base.startsWith('button')) return null;
  if (base.startsWith('toppage') || base.startsWith('topofpage')) return null;
  return s;
}

function extractBody(html, unfinished) {
  if (unfinished) {
    return [
      '> This chapter was never finished on the original Ocean Odyssey website.',
      '>',
      "> Peter left the title in place — a note that more of the story existed in life than made it onto these pages.",
      '>',
      '> If you have emails, letters, or photographs from this leg of the voyage, Jean would love to hear from you.',
    ].join('\n');
  }

  const root = parse(html, { comment: false });

  // Remove scripts, styles, forms, ads
  root.querySelectorAll('script, style, noscript, iframe, form').forEach((el) => el.remove());

  // Prefer the main content TD — large rowspan cells
  let main = null;
  const tds = root.querySelectorAll('td');
  let bestScore = 0;
  for (const td of tds) {
    const text = td.text.replace(/\s+/g, ' ').trim();
    // score by text length, prefer cells that aren't pure nav
    if (text.length < 200) continue;
    if (/The Crew|The Route|The Yacht|Guestbook|Contact Us|Home/.test(text) && text.length < 800) continue;
    const score = text.length;
    if (score > bestScore) {
      bestScore = score;
      main = td;
    }
  }

  if (!main) main = root.querySelector('body') || root;

  const parts = [];
  let hero = null;
  const images = [];

  function walk(node) {
    if (node.nodeType === 3) {
      // text node
      return;
    }
    if (!node.tagName) return;

    const tag = node.tagName.toLowerCase();

    if (tag === 'img') {
      const src = rewriteImageSrc(node.getAttribute('src'));
      const alt = (node.getAttribute('alt') || '').trim();
      if (src) {
        images.push({ src, alt });
        if (!hero) hero = src;
        const caption = alt && !/^hinewai/i.test(alt) ? alt : '';
        parts.push(`\n\n![${caption || 'Photograph from the voyage'}](${src})\n\n`);
      }
      return;
    }

    if (tag === 'br') {
      parts.push('\n');
      return;
    }

    if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'li', 'tr'].includes(tag)) {
      // collect direct text content of this block more carefully
      const blockText = getBlockText(node);
      if (blockText) {
        if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
          // skip duplicate titles often centered at top
          if (parts.length < 3 && blockText.length < 80) {
            // skip early headings that restate title
          } else {
            parts.push(`\n\n### ${blockText}\n\n`);
          }
        } else {
          parts.push(`\n\n${blockText}\n\n`);
        }
      }
      // still walk for images nested inside
      for (const child of node.childNodes) {
        if (child.tagName && child.tagName.toLowerCase() === 'img') {
          walk(child);
        } else if (child.tagName && ['table', 'tr', 'td', 'div', 'p', 'font', 'span', 'b', 'i', 'strong', 'em', 'a', 'center'].includes(child.tagName.toLowerCase())) {
          // images deeper
          child.querySelectorAll?.('img')?.forEach((img) => walk(img));
        }
      }
      return;
    }

    // default: descend
    for (const child of node.childNodes || []) {
      walk(child);
    }
  }

  // Simpler approach: convert main HTML to structured text
  const md = htmlToMarkdown(main);
  return { body: fixEncoding(md), hero, images };
}

function getBlockText(node) {
  // Get text without descending into nested block elements for double-counting
  let text = '';
  for (const child of node.childNodes || []) {
    if (child.nodeType === 3) {
      text += child.text;
    } else if (child.tagName) {
      const t = child.tagName.toLowerCase();
      if (['img', 'table', 'tr', 'td', 'div', 'p', 'br', 'h1', 'h2', 'h3'].includes(t)) continue;
      if (t === 'br') text += ' ';
      else text += child.text || '';
    }
  }
  return text.replace(/\s+/g, ' ').trim();
}

function htmlToMarkdown(root) {
  const chunks = [];
  const seenImages = new Set();

  function processNode(node, ctx = {}) {
    if (!node) return;
    if (node.nodeType === 3) {
      const t = node.text.replace(/\s+/g, ' ');
      if (t.trim()) chunks.push(t);
      return;
    }
    if (!node.tagName) return;
    const tag = node.tagName.toLowerCase();

    if (['script', 'style', 'noscript', 'iframe', 'form'].includes(tag)) return;

    if (tag === 'img') {
      const src = rewriteImageSrc(node.getAttribute('src'));
      const alt = (node.getAttribute('alt') || '').replace(/"/g, "'").trim();
      if (src && !seenImages.has(src)) {
        seenImages.add(src);
        chunks.push(`\n\n![${alt || 'Photograph from the voyage'}](${src})\n\n`);
      }
      return;
    }

    if (tag === 'br') {
      chunks.push('\n');
      return;
    }

    if (tag === 'a') {
      const href = node.getAttribute('href') || '';
      const before = chunks.length;
      for (const c of node.childNodes || []) processNode(c);
      // if only text, could wrap as link - skip internal nav links
      if (href && !href.includes('.html') && !href.includes('.htm') && href.startsWith('http')) {
        // leave as plain text for simplicity; URLs in body rare
      }
      return;
    }

    if (['b', 'strong'].includes(tag)) {
      chunks.push('**');
      for (const c of node.childNodes || []) processNode(c);
      chunks.push('**');
      return;
    }

    if (['i', 'em'].includes(tag)) {
      chunks.push('*');
      for (const c of node.childNodes || []) processNode(c);
      chunks.push('*');
      return;
    }

    if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'li', 'tr', 'center'].includes(tag)) {
      chunks.push('\n\n');
      for (const c of node.childNodes || []) processNode(c);
      chunks.push('\n\n');
      return;
    }

    if (tag === 'td' || tag === 'th') {
      for (const c of node.childNodes || []) processNode(c);
      return;
    }

    for (const c of node.childNodes || []) processNode(c);
  }

  processNode(root);

  let md = chunks.join('');
  // cleanup markdown artifacts
  md = md.replace(/\*\*\*\*/g, '');
  md = md.replace(/\n[ \t]+/g, '\n');
  md = md.replace(/[ \t]+\n/g, '\n');
  md = md.replace(/[ \t]{2,}/g, ' ');
  md = md.replace(/\n{3,}/g, '\n\n');
  // drop pure nav lines
  md = md
    .split('\n')
    .filter((line) => {
      const t = line.trim();
      if (/^(The Crew|The Route|The Yacht|The Log|Guestbook|Links|Contact Us|Home)(\s|$)/i.test(t) && t.length < 100) return false;
      if (/^Copyright/i.test(t)) return false;
      if (/All Original Content/i.test(t)) return false;
      if (/Number of visitors/i.test(t)) return false;
      if (/Cruising Yacht Site Ring/i.test(t)) return false;
      if (/htmlgear|bravenet|speedycounter|splashdirectory/i.test(t)) return false;
      if (/Ocean Odyssey Pty Ltd/i.test(t) && t.length < 120) return false;
      if (/^info@oceanodyssey/i.test(t)) return false;
      if (/^Peter & Jean$/i.test(t)) return false;
      if (/Halsey Street|BOX HILL/i.test(t)) return false;
      if (/^\+61/i.test(t)) return false;
      if (/Writing and Photography/i.test(t)) return false;
      if (/Our Direct Marketing Agency/i.test(t)) return false;
      if (/Now Closed/i.test(t)) return false;
      if (/This link yet to be completed/i.test(t)) return false;
      return true;
    })
    .join('\n');

  return md.trim();
}

function yamlEscape(s) {
  if (s == null) return '""';
  const str = String(s);
  if (/[:#\[\]{},&*?|>!%@`]/.test(str) || str.includes("'") || str.includes('"') || str.includes('\n')) {
    return JSON.stringify(str);
  }
  return str;
}

function findHero(images, meta) {
  if (!images.length) return null;
  // prefer L-prefix voyage photos
  const preferred = images.find((i) => /\/L\d/i.test(i.src) || /Log\d/i.test(i.src));
  return (preferred || images[0]).src;
}

fs.mkdirSync(OUT, { recursive: true });

let count = 0;
for (const meta of LOG_META) {
  const srcPath = path.join(LEGACY, meta.file);
  if (!fs.existsSync(srcPath)) {
    console.warn('Missing:', meta.file);
    continue;
  }
  const html = fs.readFileSync(srcPath, 'latin1'); // old site is Windows-ish encoding

  let body;
  let hero = null;
  let images = [];

  if (meta.unfinished) {
    body = [
      '> This chapter was never finished on the original Ocean Odyssey website.',
      '>',
      "> Peter left the title in place — a note that more of the story existed in life than made it onto these pages.",
      '>',
      '> If you have emails, letters, or photographs from this leg of the voyage, Jean would love to hear from you via the [contact page](/contact/).',
    ].join('\n');
  } else {
    const root = parse(html, { comment: false });
    root.querySelectorAll('script, style, noscript, iframe, form').forEach((el) => el.remove());

    let main = null;
    let bestScore = 0;
    for (const td of root.querySelectorAll('td')) {
      const text = td.text.replace(/\s+/g, ' ').trim();
      if (text.length < 400) continue;
      const score = text.length;
      if (score > bestScore) {
        bestScore = score;
        main = td;
      }
    }
    if (!main) main = root.querySelector('body') || root;

    // collect images from main
    for (const img of main.querySelectorAll('img')) {
      const src = rewriteImageSrc(img.getAttribute('src'));
      const alt = (img.getAttribute('alt') || '').trim();
      if (src) images.push({ src, alt });
    }

    body = fixEncoding(htmlToMarkdown(main));
    hero = findHero(images, meta);

    // Strip repeated title lines at start
    const titleVariants = [meta.title, meta.title.replace(/—/g, '-'), meta.title.replace(/–/g, '-')];
    for (const tv of titleVariants) {
      const re = new RegExp(`^\\*\\*?${tv.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\*\\*?\\s*`, 'i');
      body = body.replace(re, '').trim();
    }
  }

  const fm = [
    '---',
    `title: ${yamlEscape(meta.title)}`,
    `slug: ${meta.slug}`,
    `sequence: ${meta.sequence}`,
    `region: ${meta.region}`,
    `regionLabel: ${yamlEscape(REGION_LABELS[meta.region] || meta.region)}`,
    `summary: ${yamlEscape(meta.summary)}`,
    `places: [${meta.places.map((p) => yamlEscape(p)).join(', ')}]`,
    `unfinished: ${meta.unfinished}`,
    hero ? `hero: ${yamlEscape(hero)}` : 'hero: null',
    `sourceFile: ${yamlEscape(meta.file)}`,
    '---',
    '',
    body,
    '',
  ].join('\n');

  const outFile = path.join(OUT, `${String(meta.sequence).padStart(2, '0')}-${meta.slug}.md`);
  fs.writeFileSync(outFile, fm, 'utf8');
  count++;
  console.log(`✓ ${meta.sequence} ${meta.slug} (${body.length} chars, ${images.length} imgs)`);
}

// Write region helpers
fs.writeFileSync(
  path.join(ROOT, 'src', 'data', 'regions.json'),
  JSON.stringify(REGION_LABELS, null, 2)
);

console.log(`\nExtracted ${count} logs → ${OUT}`);
