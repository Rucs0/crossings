import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_FILTERS } from '../types/filters';
import type { Category } from '../types/report';
import type { DateRangePreset, Filters } from '../types/filters';

interface FiltersContextValue {
  filters: Filters;
  setDateRange: (range: DateRangePreset) => void;
  toggleCategory: (category: Category) => void;
  clearFilters: () => void;
}

const FiltersContext = createContext<FiltersContextValue | null>(null);

/**
 * Shared filter state so the date-range and category filters apply
 * consistently to both the map/hotspot view and the insights dashboard,
 * even though they live on different routes.
 */
export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const value = useMemo<FiltersContextValue>(
    () => ({
      filters,
      setDateRange: (range) => setFilters((prev) => ({ ...prev, dateRange: range })),
      toggleCategory: (category) =>
        setFilters((prev) => {
          const next = new Set(prev.categories);
          if (next.has(category)) next.delete(category);
          else next.add(category);
          return { ...prev, categories: next };
        }),
      clearFilters: () => setFilters(DEFAULT_FILTERS),
    }),
    [filters],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}

export function useFilters(): FiltersContextValue {
  const context = useContext(FiltersContext);
  if (!context) throw new Error('useFilters must be used within a FiltersProvider');
  return context;
}
