/**
 * Ocean Odyssey v1.0.0
 * Designed by Colin Dixon + Grok
 * 2026-07-16 10:32:00 AEST (Melbourne)
 * Website by https://oze.au
 */
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://oceanodyssey.net',
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
