/**
 * Ocean Odyssey v1.0.0
 * Designed by Colin Dixon + Grok
 * 2026-07-16 10:32:00 AEST (Melbourne)
 * Website by https://oze.au
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type LogEntry = CollectionEntry<'logs'>;

export async function getAllLogs(): Promise<LogEntry[]> {
  const logs = await getCollection('logs');
  return logs.sort((a, b) => a.data.sequence - b.data.sequence);
}

export async function getLogBySlug(slug: string): Promise<LogEntry | undefined> {
  const logs = await getAllLogs();
  return logs.find((l) => l.data.slug === slug);
}

export function getAdjacent(logs: LogEntry[], current: LogEntry) {
  const idx = logs.findIndex((l) => l.id === current.id);
  return {
    prev: idx > 0 ? logs[idx - 1] : null,
    next: idx < logs.length - 1 ? logs[idx + 1] : null,
  };
}

export const REGIONS = [
  { id: 'australia', label: 'Australia' },
  { id: 'indonesia', label: 'Indonesia' },
  { id: 'borneo', label: 'Borneo' },
  { id: 'se-asia', label: 'Southeast Asia' },
  { id: 'indian-ocean', label: 'Indian Ocean' },
  { id: 'aden', label: 'Aden & Arabia' },
  { id: 'red-sea', label: 'Red Sea' },
  { id: 'med', label: 'Mediterranean' },
  { id: 'atlantic', label: 'Atlantic & UK' },
] as const;
