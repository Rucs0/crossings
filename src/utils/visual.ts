import type { Category, ReportType, Severity } from '../types/report';

/**
 * Shared visual encoding used by the map, legends, and charts.
 *
 * Category -> color (first four slots of the validated categorical order,
 * "other" as neutral gray since it's a catch-all, not a hue-bearing series —
 * see dataviz skill palette.md). Severity -> marker size, since color alone
 * is not an accessible encoding for a second dimension. Type -> filled vs
 * hollow marker (collision = solid, crossing sighting = hollow ring), which
 * keeps every marker an abstract circle rather than an animal shape.
 */
export const CATEGORY_COLORS: Record<Category, string> = {
  mammal: '#2a78d6',
  bird: '#008300',
  reptile: '#e87ba4',
  amphibian: '#eda100',
  other: '#767570',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  mammal: 'Mammal',
  bird: 'Bird',
  reptile: 'Reptile',
  amphibian: 'Amphibian',
  other: 'Other',
};

export const CATEGORY_ORDER: Category[] = ['mammal', 'bird', 'reptile', 'amphibian', 'other'];

export const TYPE_LABELS: Record<ReportType, string> = {
  crossing: 'Crossing sighting',
  collision: 'Vehicle collision',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  1: 'Minor / near-miss',
  2: 'Injury',
  3: 'Fatality / high hazard',
};

/** Marker radius in pixels, keyed by severity. */
export const SEVERITY_RADIUS: Record<Severity, number> = {
  1: 6,
  2: 9,
  3: 12,
};

export function markerRadius(severity: Severity): number {
  return SEVERITY_RADIUS[severity];
}

/**
 * Severity is ordinal, not categorical, so charts use steps from a single
 * sequential blue ramp rather than distinct categorical hues (dataviz skill:
 * "Sequential = one hue, light -> dark"). Steps stay at or lighter than 600
 * so the darkest step still clears the 2:1 ordinal floor on the light surface.
 */
export const SEVERITY_CHART_COLORS: Record<Severity, string> = {
  1: '#86b6ef',
  2: '#3987e5',
  3: '#184f95',
};

/** Default single-hue color for a one-series magnitude chart (blue, categorical slot 1). */
export const CHART_PRIMARY_COLOR = '#2a78d6';
