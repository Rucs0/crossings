import type { Report } from '../types/report';
import type { DateRangePreset, Filters } from '../types/filters';

const PRESET_DAYS: Record<Exclude<DateRangePreset, 'all'>, number> = {
  '30d': 30,
  '90d': 90,
  '6m': 182,
  '1y': 365,
};

export const DATE_RANGE_LABELS: Record<DateRangePreset, string> = {
  all: 'All time',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '6m': 'Last 6 months',
  '1y': 'Last year',
};

export function filterReports(reports: Report[], filters: Filters): Report[] {
  let result = reports;

  if (filters.dateRange !== 'all') {
    const cutoff = Date.now() - PRESET_DAYS[filters.dateRange] * 24 * 60 * 60 * 1000;
    result = result.filter((report) => new Date(report.timestamp).getTime() >= cutoff);
  }

  if (filters.categories.size > 0) {
    result = result.filter((report) => filters.categories.has(report.category));
  }

  return result;
}
