/**
 * Ocean Odyssey v1.0.0
 * Designed by Colin Dixon + Grok
 * 2026-07-16 10:32:00 AEST (Melbourne)
 * Website by https://oze.au
 *
 * Shared SEO / structured-data helpers for search engines and AI crawlers.
 */

export const SITE_NAME = 'Ocean Odyssey';
export const SITE_URL = 'https://oceanodyssey.net';
export const SITE_LANG = 'en-AU';
/** Default Open Graph / Twitter share image (1200×630, best practice). */
export const DEFAULT_OG_IMAGE = '/images/og-default.jpg';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const SITE_KEYWORDS = [
  'Ocean Odyssey',
  'Hinewai',
  'Peter Knight',
  'Jean Hutson-Knight',
  'sailing',
  'yacht cruise',
  'circumnavigation',
  'Roberts Mauritius',
  'cruising log',
  'Melbourne to Mediterranean',
  'Red Sea sailing',
  'Suez Canal yacht',
  'Australian sailors',
].join(', ');

export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['Ocean Odyssey Hinewai', 'Hinewai voyage'],
    url: SITE_URL,
    description:
      'Memorial voyage archive of Peter Knight and Jean Hutson-Knight sailing Hinewai from Melbourne toward the Mediterranean and UK.',
    inLanguage: SITE_LANG,
    publisher: {
      '@type': 'Organization',
      name: 'Ocean Odyssey',
      url: SITE_URL,
    },
    creator: [
      { '@type': 'Person', name: 'Peter Knight' },
      { '@type': 'Person', name: 'Jean Hutson-Knight' },
    ],
    about: {
      '@type': 'Thing',
      name: 'Hinewai sailing voyage',
    },
  };
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ocean Odyssey',
    url: SITE_URL,
    email: 'info@oceanodyssey.net',
    logo: absoluteUrl('/favicon.svg'),
    sameAs: [SITE_URL],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  sequence?: number;
  places?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    image: absoluteUrl(DEFAULT_OG_IMAGE),
    inLanguage: SITE_LANG,
    author: [
      { '@type': 'Person', name: 'Peter Knight' },
      { '@type': 'Person', name: 'Jean Hutson-Knight' },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Ocean Odyssey',
      url: SITE_URL,
    },
    mainEntityOfPage: absoluteUrl(opts.path),
    articleSection: 'Voyage log',
    keywords: [SITE_NAME, 'Hinewai', ...(opts.places || [])].join(', '),
    isPartOf: {
      '@type': 'CreativeWorkSeries',
      name: 'Tales from Hinewai',
      url: absoluteUrl('/voyage/'),
    },
    ...(opts.sequence != null ? { position: opts.sequence } : {}),
  };
}
