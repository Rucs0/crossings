import { REGION } from './region';
import type { Category, Report, ReportType, Severity } from '../types/report';

/**
 * Deterministic PRNG (mulberry32) so the seeded dataset — and therefore the
 * map and hotspots a judge sees on first load — is identical on every run,
 * rather than reshuffling between page refreshes.
 */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260718);

/** Sum of uniform randoms approximates a bell curve without extra deps. */
function gaussian(sigma: number): number {
  let sum = 0;
  for (let i = 0; i < 6; i++) sum += rng();
  return (sum / 6 - 0.5) * 2 * sigma;
}

function pick<T>(items: readonly T[], weights?: readonly number[]): T {
  if (!weights) return items[Math.floor(rng() * items.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Approximate real hotspots along the CO-9 corridor between Kremmling and
 * Green Mountain Reservoir — migration funnel points, a creek crossing, and
 * a stretch known for deer/elk activity — used as cluster seeds so the
 * generated data has a plausible, non-uniform shape for hotspot detection
 * to find.
 */
const CLUSTER_CENTERS: { lat: number; lng: number; weight: number; sigma: number }[] = [
  { lat: 40.0921, lng: -106.3781, weight: 30, sigma: 0.012 }, // north migration funnel
  { lat: 40.0405, lng: -106.4102, weight: 26, sigma: 0.01 }, // Blue River crossing
  { lat: 39.9762, lng: -106.3894, weight: 34, sigma: 0.009 }, // known collision stretch
  { lat: 39.9198, lng: -106.3559, weight: 22, sigma: 0.013 }, // reservoir shoreline
  { lat: 39.8815, lng: -106.3211, weight: 18, sigma: 0.011 }, // south canyon narrows
  { lat: 40.0088, lng: -106.2961, weight: 14, sigma: 0.014 }, // secondary ranch-road crossing
];

const CATEGORIES: Category[] = ['mammal', 'bird', 'reptile', 'amphibian', 'other'];
const CATEGORY_WEIGHTS = [0.55, 0.2, 0.1, 0.1, 0.05];

const TYPES: ReportType[] = ['crossing', 'collision'];
const TYPE_WEIGHTS = [0.62, 0.38];

const SEVERITIES: Severity[] = [1, 2, 3];

const NOTES: Record<ReportType, string[]> = {
  crossing: [
    'Small group crossing at dusk, slowed traffic.',
    'Regularly seen crossing near the fence gap.',
    'Crossed the road just ahead of my car, no contact.',
    'Herd moving toward the river at sunrise.',
    '',
    '',
  ],
  collision: [
    'Vehicle strike, animal did not survive.',
    'Driver swerved to avoid, minor damage.',
    'Carcass on shoulder, likely overnight collision.',
    'Collision during low-visibility conditions.',
    'Animal injured, left the scene before help arrived.',
    '',
  ],
};

function severityForType(type: ReportType): Severity {
  // Collisions skew toward higher severity than near-miss crossing sightings.
  const weights = type === 'collision' ? [0.15, 0.35, 0.5] : [0.55, 0.35, 0.1];
  return pick(SEVERITIES, weights);
}

/**
 * Local hour-of-day buckets, weighted toward dawn and dusk to mirror real
 * wildlife-vehicle collision patterns (animals are most active and
 * visibility is worst at twilight). This is what makes the "time-of-day
 * pattern" in the action report a genuine signal instead of noise.
 */
const HOUR_BUCKETS: { range: [number, number]; weight: number }[] = [
  { range: [5, 8], weight: 0.34 }, // dawn
  { range: [9, 16], weight: 0.2 }, // daytime
  { range: [17, 20], weight: 0.34 }, // dusk
  { range: [21, 4], weight: 0.12 }, // night (wraps past midnight)
];

function pickLocalHour(): number {
  const bucket = pick(
    HOUR_BUCKETS,
    HOUR_BUCKETS.map((b) => b.weight),
  );
  const [start, end] = bucket.range;
  const span = end >= start ? end - start + 1 : end + 24 - start + 1;
  return (start + Math.floor(rng() * span)) % 24;
}

function randomTimestamp(): string {
  const now = Date.now();
  const eighteenMonthsMs = 1000 * 60 * 60 * 24 * 30 * 18;
  const day = new Date(now - rng() * eighteenMonthsMs);

  const localHour = pickLocalHour();
  const utcHour = (((localHour - REGION.localUtcOffsetHours) % 24) + 24) % 24;
  const minute = Math.floor(rng() * 60);

  const t = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), utcHour, minute);
  return new Date(t).toISOString();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `seed-${idCounter}`;
}

function buildReport(lat: number, lng: number): Report {
  const type = pick(TYPES, TYPE_WEIGHTS);
  return {
    id: nextId(),
    lat: clamp(lat, REGION.bounds.south, REGION.bounds.north),
    lng: clamp(lng, REGION.bounds.west, REGION.bounds.east),
    type,
    category: pick(CATEGORIES, CATEGORY_WEIGHTS),
    severity: severityForType(type),
    timestamp: randomTimestamp(),
    note: pick(NOTES[type]) || undefined,
    source: 'seed',
  };
}

function generateClusteredReports(): Report[] {
  const reports: Report[] = [];
  for (const cluster of CLUSTER_CENTERS) {
    for (let i = 0; i < cluster.weight; i++) {
      reports.push(buildReport(cluster.lat + gaussian(cluster.sigma), cluster.lng + gaussian(cluster.sigma)));
    }
  }
  return reports;
}

function generateNoiseReports(count: number): Report[] {
  const reports: Report[] = [];
  const { north, south, east, west } = REGION.bounds;
  for (let i = 0; i < count; i++) {
    const lat = south + rng() * (north - south);
    const lng = west + rng() * (east - west);
    reports.push(buildReport(lat, lng));
  }
  return reports;
}

/** ~150-250 reports: intentional clusters plus scattered background noise. */
export function generateSeedReports(): Report[] {
  idCounter = 0;
  const clustered = generateClusteredReports();
  const noise = generateNoiseReports(40);
  return [...clustered, ...noise].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

export const SEED_REPORTS: Report[] = generateSeedReports();
