import type { Category } from './report';

export type DateRangePreset = 'all' | '30d' | '90d' | '6m' | '1y';

export interface Filters {
  dateRange: DateRangePreset;
  /** Empty set means "no category filter applied" (show every category). */
  categories: Set<Category>;
}

export const DEFAULT_FILTERS: Filters = {
  dateRange: 'all',
  categories: new Set(),
};
