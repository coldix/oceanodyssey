/**
 * Ocean Odyssey v1.1.0
 * Designed by Colin Dixon + Grok · Website by https://oze.au
 *
 * Rehype plugin: wrap local JPEG <img> in <picture> with WebP source.
 */
import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

function isLocalJpeg(src: unknown): src is string {
  if (typeof src !== 'string') return false;
  if (/^https?:\/\//i.test(src) || src.startsWith('//')) return false;
  return /\.jpe?g$/i.test(src);
}

export function rehypePictureWebp() {
  return function transformer(tree: Root) {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'img' || parent == null || typeof index !== 'number') return;
      // already inside picture
      if ((parent as Element).tagName === 'picture') return;

      const src = node.properties?.src;
      if (!isLocalJpeg(src)) return;

      const webp = src.replace(/\.jpe?g$/i, '.webp');
      const picture: Element = {
        type: 'element',
        tagName: 'picture',
        properties: {},
        children: [
          {
            type: 'element',
            tagName: 'source',
            properties: {
              srcSet: webp,
              type: 'image/webp',
            },
            children: [],
          },
          node,
        ],
      };

      (parent as Element).children[index] = picture;
    });
  };
}

export default rehypePictureWebp;
