import { CATEGORY_COLORS, CATEGORY_LABELS, CATEGORY_ORDER } from '../../utils/visual';

export function MapLegend() {
  return (
    <div className="pointer-events-auto rounded-lg border border-line bg-surface/95 px-3 py-2.5 text-xs shadow-sm backdrop-blur">
      <p className="mb-1.5 font-semibold text-ink-primary">Category</p>
      <ul className="mb-2.5 grid grid-cols-1 gap-1">
        {CATEGORY_ORDER.map((category) => (
          <li key={category} className="flex items-center gap-1.5 text-ink-secondary">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CATEGORY_COLORS[category] }}
              aria-hidden="true"
            />
            {CATEGORY_LABELS[category]}
          </li>
        ))}
      </ul>
      <p className="mb-1 font-semibold text-ink-primary">Marker size</p>
      <p className="mb-2 text-ink-secondary">Larger = higher severity</p>
      <p className="mb-1 font-semibold text-ink-primary">Fill</p>
      <div className="flex flex-col gap-1 text-ink-secondary">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-[1.5px] border-ink-muted bg-ink-muted" />
          Collision
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-ink-muted bg-transparent" />
          Crossing sighting
        </span>
      </div>
    </div>
  );
}
