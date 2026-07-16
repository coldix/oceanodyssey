/**
 * Ocean Odyssey v1.1.0
 * Designed by Colin Dixon + Grok · Website by https://oze.au
 *
 * Image path helpers — WebP delivery with JPEG masters.
 */

/** True if path looks like a local JPEG under /images */
export function isLocalJpeg(src: string | null | undefined): boolean {
  if (!src) return false;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) return false;
  return /\.jpe?g$/i.test(src);
}

/** Sibling WebP path for a JPEG URL/path */
export function toWebpSrc(src: string): string {
  return src.replace(/\.jpe?g$/i, '.webp');
}

/**
 * Prefer WebP when we know a sibling exists is not knowable at build without fs;
 * components always offer both via <picture>.
 */
export function webpSrcset(src: string): string | null {
  if (!isLocalJpeg(src)) return null;
  return toWebpSrc(src);
}
