import { useFilters } from '../../context/FiltersContext';
import { DATE_RANGE_LABELS } from '../../utils/filterReports';
import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from '../../utils/visual';
import type { DateRangePreset } from '../../types/filters';

const DATE_PRESETS: DateRangePreset[] = ['all', '30d', '90d', '6m', '1y'];

export function FilterBar() {
  const { filters, setDateRange, toggleCategory, clearFilters } = useFilters();
  const hasActiveFilters = filters.dateRange !== 'all' || filters.categories.size > 0;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line bg-surface px-4 py-2 sm:px-6">
      <div className="flex items-center gap-1">
        {DATE_PRESETS.map((preset) => {
          const isActive = filters.dateRange === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => setDateRange(preset)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive ? 'bg-brand-500 text-white' : 'text-ink-secondary hover:bg-surface-sunken'
              }`}
            >
              {DATE_RANGE_LABELS[preset]}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-line" aria-hidden="true" />

      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORY_ORDER.map((category) => {
          const isActive = filters.categories.has(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'border-transparent bg-surface-sunken text-ink-primary'
                  : 'border-line text-ink-secondary hover:border-line-strong'
              }`}
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[category], opacity: isActive ? 1 : 0.45 }}
                aria-hidden="true"
              />
              {CATEGORY_LABELS[category]}
            </button>
          );
        })}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="ml-auto text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
