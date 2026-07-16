# Image optimisation

**Updated:** 2026-07-16

## Pipeline

1. **Masters:** JPEG files remain in `public/images/` (and nested folders).
2. **WebP:** Sibling files generated next to each JPEG (`photo.jpg` → `photo.webp`).
3. **Delivery:** `<picture>` with WebP `source` + JPEG `img` fallback.

```bash
npm run optimise:images          # generate missing/outdated WebPs
npm run optimise:images -- --force
npm run build                    # runs optimise then astro build
```

## Code

| Piece | Role |
|-------|------|
| `scripts/optimise-images.mjs` | sharp → WebP quality 80 |
| `src/components/Picture.astro` | Component for Astro pages |
| `src/lib/rehype-picture-webp.ts` | Log Markdown images → `<picture>` |
| `src/lib/images.ts` | Path helpers |

## Notes

- UI chrome (button GIFs, backgrounds) is skipped.
- Do not delete JPEGs; they are fallbacks and masters.
- Regenerating after replacing a JPEG: re-run optimise (mtime-based skip).

## AI-enhanced masters

Full-resolution improved photos live in `public/images/enhanced/*-full.jpg`.

Web delivery files (max ~2000px long edge + WebP) replace the matching paths under `public/images/`.

Drop new improved JPGs in the project root with the **same filename** as the site asset (e.g. `HinewaiCairns.jpg`, `L28-Party1.jpg`), then ask to “make them live” or run a similar sharp pipeline.
