import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const logs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content/logs' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    sequence: z.number(),
    region: z.string(),
    regionLabel: z.string(),
    summary: z.string(),
    places: z.array(z.string()),
    unfinished: z.boolean().default(false),
    hero: z.string().nullable().optional(),
    sourceFile: z.string().optional(),
  }),
});

export const collections = { logs };
