<!--
  Ocean Odyssey v1.0.0
  Designed by Colin Dixon + Grok
  2026-07-16 10:32:00 AEST (Melbourne)
  Website by https://oze.au
-->
# Ocean Odyssey

A memorial voyage archive for **Peter Knight** and **Jean Hutson-Knight** aboard *Hinewai* — rebuilt from the classic oceanodyssey.net site as a modern static site.

**Live:** [oceanodyssey.net](https://oceanodyssey.net)  
**Legacy archive:** [oceanodyssey.net/old/](https://oceanodyssey.net/old/)

## Stack

- [Astro](https://astro.build) (static HTML)
- Tailwind CSS v4
- MapLibre GL (route map)
- Content collections for voyage logs (Markdown)
- PHP guestbook API for Hostinger (`public/api/guestbook.php`)

## Development

```bash
npm install
npm run dev          # http://localhost:4321
npm run build        # → dist/
npm run preview
npm run extract:logs # re-extract logs from legacy/*.html
```

## Project layout

```
content/logs/     Voyage chapters (Markdown)
legacy/           Original FrontPage site (source for extraction)
public/images/    Photographs served by the site
public/api/       Hostinger PHP guestbook endpoint
scripts/          Content extraction tools
src/pages/        Routes
src/components/   UI
src/data/         Route GeoJSON, guestbook seed, regions
```

## Deploy to Hostinger

1. Build: `npm run build`
2. Upload **contents of `dist/`** to `public_html/` (site root)
3. Keep the old site in `public_html/old/` (do not overwrite)
4. Ensure `public_html/api/guestbook.php` and `public_html/data/` are writable (guestbook pending file)
5. PHP mail may need Hostinger mail config for guestbook notifications

Optional: use Hostinger Git deployment pointing at this repo and a build command of `npm ci && npm run build` with publish directory `dist`.

## Theme

Light/dark theme pill in the header; preference stored in `localStorage` (`oo-theme`).

## Guestbook

- Form posts to `/api/guestbook.php`
- Pending messages land in `data/guestbook-pending.json`
- Approved messages can be copied into `src/data/guestbook.json` and the site rebuilt
- If PHP is unavailable, the form falls back to a `mailto:` link

## Photos

Most images are original web-sized JPEGs. Open-source upscaling can be applied later; hero images may be improved with Topaz offline and dropped into `public/images/`.

## Credits

Original writing and photography © Peter Knight & Jean Hutson-Knight / Ocean Odyssey.  
Site rebuild for Jean, 2026.
