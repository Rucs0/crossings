import type { Report } from '../types/report';
import { REGION } from '../data/region';

export type TimeOfDayBucket = 'Dawn' | 'Day' | 'Dusk' | 'Night';

const BUCKETS: { name: TimeOfDayBucket; range: [number, number] }[] = [
  { name: 'Dawn', range: [5, 8] },
  { name: 'Day', range: [9, 16] },
  { name: 'Dusk', range: [17, 20] },
  { name: 'Night', range: [21, 4] },
];

function localHour(timestamp: string): number {
  const utcHour = new Date(timestamp).getUTCHours();
  return (((utcHour + REGION.localUtcOffsetHours) % 24) + 24) % 24;
}

function bucketFor(hour: number): TimeOfDayBucket {
  for (const bucket of BUCKETS) {
    const [start, end] = bucket.range;
    const inRange = end >= start ? hour >= start && hour <= end : hour >= start || hour <= end;
    if (inRange) return bucket.name;
  }
  return 'Day';
}

export interface TimeOfDayPattern {
  dominant: TimeOfDayBucket;
  /** Share of incidents that fall in the dominant bucket, 0-1. */
  share: number;
  counts: Record<TimeOfDayBucket, number>;
}

/** Buckets a zone's reports into dawn/day/dusk/night (approximate local time) and finds the dominant period. */
export function analyzeTimeOfDay(reports: Report[]): TimeOfDayPattern {
  const counts: Record<TimeOfDayBucket, number> = { Dawn: 0, Day: 0, Dusk: 0, Night: 0 };
  for (const report of reports) {
    counts[bucketFor(localHour(report.timestamp))] += 1;
  }

  let dominant: TimeOfDayBucket = 'Day';
  let max = -1;
  for (const bucket of BUCKETS) {
    if (counts[bucket.name] > max) {
      max = counts[bucket.name];
      dominant = bucket.name;
    }
  }

  return { dominant, share: reports.length ? max / reports.length : 0, counts };
}
