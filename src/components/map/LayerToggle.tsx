export type MapLayerMode = 'markers' | 'heatmap';

interface LayerToggleProps {
  mode: MapLayerMode;
  onChange: (mode: MapLayerMode) => void;
}

const OPTIONS: { value: MapLayerMode; label: string }[] = [
  { value: 'markers', label: 'Markers' },
  { value: 'heatmap', label: 'Heatmap' },
];

export function LayerToggle({ mode, onChange }: LayerToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Map layer"
      className="pointer-events-auto flex rounded-lg border border-line bg-surface/95 p-0.5 text-xs font-medium shadow-sm backdrop-blur"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1.5 transition-colors ${
              isActive ? 'bg-brand-500 text-white' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
