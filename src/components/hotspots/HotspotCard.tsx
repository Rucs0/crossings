import type { Hotspot } from '../../types/hotspot';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/visual';

interface HotspotCardProps {
  hotspot: Hotspot;
  rank: number;
  isSelected: boolean;
  onSelect: (hotspot: Hotspot) => void;
  onViewReport: (hotspot: Hotspot) => void;
}

function formatRecency(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

export function HotspotCard({ hotspot, rank, isSelected, onSelect, onViewReport }: HotspotCardProps) {
  const color = CATEGORY_COLORS[hotspot.dominantCategory];

  return (
    <div
      className={`rounded-lg border transition-colors ${
        isSelected ? 'border-brand-500 bg-brand-50' : 'border-line bg-surface hover:border-line-strong'
      }`}
    >
      <button type="button" onClick={() => onSelect(hotspot)} className="w-full px-3 pt-2.5 text-left">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-primary">
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {rank}
            </span>
            {CATEGORY_LABELS[hotspot.dominantCategory]} corridor
          </span>
          <span className="text-xs font-medium text-ink-muted">{Math.round(hotspot.score * 100)}</span>
        </div>
        <p className="mt-1 text-xs text-ink-secondary">
          {hotspot.incidentCount} incidents &middot; avg severity {hotspot.averageSeverity.toFixed(1)} &middot; last{' '}
          {formatRecency(hotspot.mostRecent)}
        </p>
      </button>
      <div className="px-3 pb-2 pt-1.5 text-right">
        <button
          type="button"
          onClick={() => onViewReport(hotspot)}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View action report →
        </button>
      </div>
    </div>
  );
}
