import { useState } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';

interface ReportButtonProps {
  /** True while the map is waiting for the user to click a spot. */
  isPlacing: boolean;
  onStartPlacing: () => void;
  onCancelPlacing: () => void;
  onLocated: (lat: number, lng: number) => void;
}

export function ReportButton({ isPlacing, onStartPlacing, onCancelPlacing, onLocated }: ReportButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { loading, error, locate } = useGeolocation();

  if (isPlacing) {
    return (
      <div className="pointer-events-auto flex items-center gap-2 rounded-lg border border-brand-500 bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700 shadow-sm">
        <span>Click the map to place your report</span>
        <button
          type="button"
          onClick={onCancelPlacing}
          className="rounded-md px-2 py-1 text-brand-700 hover:bg-brand-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="pointer-events-auto relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-full bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-600"
      >
        + Add report
      </button>

      {menuOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 rounded-lg border border-line bg-surface p-2 text-sm shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              locate((lat, lng) => onLocated(lat, lng));
            }}
            disabled={loading}
            className="block w-full rounded-md px-3 py-2 text-left text-ink-primary hover:bg-surface-sunken disabled:opacity-50"
          >
            {loading ? 'Locating…' : 'Use my current location'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onStartPlacing();
            }}
            className="block w-full rounded-md px-3 py-2 text-left text-ink-primary hover:bg-surface-sunken"
          >
            Pick a spot on the map
          </button>
          {error && <p className="px-3 pt-1 text-xs text-ink-muted">{error}</p>}
        </div>
      )}
    </div>
  );
}
