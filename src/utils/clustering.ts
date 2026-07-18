import type { Category, Report } from '../types/report';
import type { Hotspot } from '../types/hotspot';
import { toLocalMeters } from './geo';

/**
 * Hotspot detection: a grid-based density clustering pass, conceptually a
 * simplified grid-accelerated DBSCAN.
 *
 * 1. Project every report to local x/y meters and drop it into a square
 *    grid cell (cell size = CELL_SIZE_METERS, which plays the role of
 *    DBSCAN's `eps` neighborhood radius).
 * 2. Flood-fill 8-connected non-empty cells into components. Two reports
 *    end up in the same zone if you can walk between their cells through a
 *    chain of adjacent occupied cells — this lets an elongated cluster
 *    along a road corridor merge into one zone instead of splintering into
 *    one blob per grid cell.
 * 3. Keep components whose total report count meets MIN_ZONE_SIZE (DBSCAN's
 *    `minPts`, applied to the whole zone rather than per-point).
 * 4. Score each surviving zone and rank them — see scoreHotspot() below.
 */

const CELL_SIZE_METERS = 500;
const MIN_ZONE_SIZE = 4;

/** Priority-score weights: how much incident count, severity, and recency each count. */
const SCORE_WEIGHTS = {
  count: 0.45,
  severity: 0.3,
  recency: 0.25,
};

/** Recency half-life in days: a report this old contributes half the score of a fresh one. */
const RECENCY_HALF_LIFE_DAYS = 180;

interface GridCell {
  cellX: number;
  cellY: number;
  reports: Report[];
}

function cellKey(cellX: number, cellY: number): string {
  return `${cellX}:${cellY}`;
}

function buildGrid(reports: Report[]): Map<string, GridCell> {
  const grid = new Map<string, GridCell>();
  for (const report of reports) {
    const { x, y } = toLocalMeters(report.lat, report.lng);
    const cellX = Math.floor(x / CELL_SIZE_METERS);
    const cellY = Math.floor(y / CELL_SIZE_METERS);
    const key = cellKey(cellX, cellY);
    const existing = grid.get(key);
    if (existing) {
      existing.reports.push(report);
    } else {
      grid.set(key, { cellX, cellY, reports: [report] });
    }
  }
  return grid;
}

const NEIGHBOR_OFFSETS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
];

/** Flood-fills 8-connected occupied cells into connected components. */
function groupConnectedCells(grid: Map<string, GridCell>): Report[][] {
  const visited = new Set<string>();
  const components: Report[][] = [];

  for (const [key, startCell] of grid) {
    if (visited.has(key)) continue;
    visited.add(key);

    const componentReports: Report[] = [...startCell.reports];
    const stack: GridCell[] = [startCell];

    while (stack.length > 0) {
      const cell = stack.pop()!;
      for (const [dx, dy] of NEIGHBOR_OFFSETS) {
        const neighborKey = cellKey(cell.cellX + dx, cell.cellY + dy);
        if (visited.has(neighborKey)) continue;
        const neighbor = grid.get(neighborKey);
        if (!neighbor) continue;
        visited.add(neighborKey);
        componentReports.push(...neighbor.reports);
        stack.push(neighbor);
      }
    }

    components.push(componentReports);
  }

  return components;
}

function dominantCategory(reports: Report[]): Category {
  const counts = new Map<Category, number>();
  for (const report of reports) {
    counts.set(report.category, (counts.get(report.category) ?? 0) + 1);
  }
  let best: Category = reports[0].category;
  let bestCount = 0;
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

function buildZoneGeometry(reports: Report[]): { lat: number; lng: number; radiusMeters: number } {
  const centroidLat = reports.reduce((sum, r) => sum + r.lat, 0) / reports.length;
  const centroidLng = reports.reduce((sum, r) => sum + r.lng, 0) / reports.length;
  const centroid = toLocalMeters(centroidLat, centroidLng);

  let maxDist = 0;
  for (const report of reports) {
    const point = toLocalMeters(report.lat, report.lng);
    const dist = Math.hypot(point.x - centroid.x, point.y - centroid.y);
    if (dist > maxDist) maxDist = dist;
  }

  // Floor and cap keep the drawn circle legible even for a tight or very
  // spread-out cluster.
  const radiusMeters = Math.min(2000, Math.max(150, maxDist * 1.2));
  return { lat: centroidLat, lng: centroidLng, radiusMeters };
}

function recencyScore(mostRecentIso: string): number {
  const daysSince = (Date.now() - new Date(mostRecentIso).getTime()) / (1000 * 60 * 60 * 24);
  return Math.pow(0.5, Math.max(0, daysSince) / RECENCY_HALF_LIFE_DAYS);
}

/**
 * Composite priority score for one zone, on a 0-1 scale:
 *   score = 0.45 * countNorm + 0.30 * severityNorm + 0.25 * recencyScore
 *
 * - countNorm: this zone's incident count, min-max normalized against the
 *   busiest zone in the current result set (so the score reflects relative
 *   priority among the zones actually found, not an arbitrary absolute
 *   scale).
 * - severityNorm: average severity / 3 (severity is already 1-3).
 * - recencyScore: exponential decay from the zone's most recent incident,
 *   halving every RECENCY_HALF_LIFE_DAYS — a burst of old activity matters
 *   less than one still happening.
 */
function scoreZones(zones: Omit<Hotspot, 'score' | 'id'>[]): Hotspot[] {
  const maxCount = Math.max(...zones.map((z) => z.incidentCount), 1);
  const minCount = Math.min(...zones.map((z) => z.incidentCount), maxCount);
  const countRange = maxCount - minCount || 1;

  return zones
    .map((zone, index) => {
      const countNorm = (zone.incidentCount - minCount) / countRange;
      const severityNorm = zone.averageSeverity / 3;
      const recency = recencyScore(zone.mostRecent);
      const score =
        SCORE_WEIGHTS.count * countNorm + SCORE_WEIGHTS.severity * severityNorm + SCORE_WEIGHTS.recency * recency;
      return { ...zone, id: `hotspot-${index}`, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((zone, rank) => ({ ...zone, id: `hotspot-${rank + 1}` }));
}

/** Runs the full clustering + scoring pass and returns zones ranked by priority score. */
export function detectHotspots(reports: Report[]): Hotspot[] {
  if (reports.length === 0) return [];

  const grid = buildGrid(reports);
  const components = groupConnectedCells(grid).filter((component) => component.length >= MIN_ZONE_SIZE);

  const zones = components.map((componentReports) => {
    const geometry = buildZoneGeometry(componentReports);
    const mostRecent = componentReports.reduce(
      (latest, r) => (r.timestamp > latest ? r.timestamp : latest),
      componentReports[0].timestamp,
    );
    const averageSeverity = componentReports.reduce((sum, r) => sum + r.severity, 0) / componentReports.length;

    return {
      ...geometry,
      reports: componentReports,
      incidentCount: componentReports.length,
      dominantCategory: dominantCategory(componentReports),
      averageSeverity,
      mostRecent,
    };
  });

  return scoreZones(zones);
}
