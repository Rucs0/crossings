import type { Category, Report, Severity } from '../types/report';
import { CATEGORY_ORDER } from './visual';

export interface MonthlyCount {
  month: string;
  label: string;
  count: number;
}

/** Buckets reports into calendar months and fills gaps so the line/bar chart has no holes. */
export function aggregateByMonth(reports: Report[]): MonthlyCount[] {
  if (reports.length === 0) return [];

  const counts = new Map<string, number>();
  for (const report of reports) {
    const date = new Date(report.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const sortedKeys = [...counts.keys()].sort();
  const [firstYear, firstMonth] = sortedKeys[0].split('-').map(Number);
  const [lastYear, lastMonth] = sortedKeys[sortedKeys.length - 1].split('-').map(Number);

  const result: MonthlyCount[] = [];
  let year = firstYear;
  let month = firstMonth;
  while (year < lastYear || (year === lastYear && month <= lastMonth)) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const label = new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
    result.push({ month: key, label, count: counts.get(key) ?? 0 });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return result;
}

export interface CategoryCount {
  category: Category;
  count: number;
}

export function aggregateByCategory(reports: Report[]): CategoryCount[] {
  const counts = new Map<Category, number>();
  for (const report of reports) counts.set(report.category, (counts.get(report.category) ?? 0) + 1);
  return CATEGORY_ORDER.map((category) => ({ category, count: counts.get(category) ?? 0 }));
}

export interface SeverityCount {
  severity: Severity;
  count: number;
}

export function aggregateBySeverity(reports: Report[]): SeverityCount[] {
  const counts = new Map<Severity, number>();
  for (const report of reports) counts.set(report.severity, (counts.get(report.severity) ?? 0) + 1);
  return [1, 2, 3].map((severity) => ({ severity: severity as Severity, count: counts.get(severity as Severity) ?? 0 }));
}
