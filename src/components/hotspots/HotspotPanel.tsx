import { useState } from 'react';
import type { Hotspot } from '../../types/hotspot';
import { HotspotCard } from './HotspotCard';

interface HotspotPanelProps {
  hotspots: Hotspot[];
  selectedId: string | null;
  onSelect: (hotspot: Hotspot) => void;
  onViewReport: (hotspot: Hotspot) => void;
}

export function HotspotPanel({ hotspots, selectedId, onSelect, onViewReport }: HotspotPanelProps) {
  // Collapsed by default on narrow screens so the panel's header row doesn't
  // overlap the layer toggle in the opposite corner; open by default on
  // desktop where there's room for both.
  const [isOpen, setIsOpen] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 640px)').matches,
  );

  return (
    <div
      className={`pointer-events-auto flex max-h-full flex-col rounded-lg border border-line bg-surface/95 shadow-sm backdrop-blur transition-[width] sm:w-72 ${
        isOpen ? 'w-52' : 'w-36'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center justify-between px-3 py-2.5 text-left"
      >
        <span className="text-sm font-semibold text-ink-primary">
          <span className="sm:hidden">Zones ({hotspots.length})</span>
          <span className="hidden sm:inline">Priority zones ({hotspots.length})</span>
        </span>
        <span className={`text-ink-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true">
          &#9662;
        </span>
      </button>

      {isOpen && (
        <div className="flex-1 space-y-1.5 overflow-y-auto border-t border-line px-2 py-2">
          {hotspots.length === 0 ? (
            <p className="px-1 py-2 text-xs text-ink-muted">
              Not enough clustered reports yet to identify a priority zone.
            </p>
          ) : (
            hotspots.map((hotspot, index) => (
              <HotspotCard
                key={hotspot.id}
                hotspot={hotspot}
                rank={index + 1}
                isSelected={hotspot.id === selectedId}
                onSelect={onSelect}
                onViewReport={onViewReport}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
