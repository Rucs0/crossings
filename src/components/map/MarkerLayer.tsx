import { CircleMarker, Popup } from 'react-leaflet';
import type { Report } from '../../types/report';
import { CATEGORY_COLORS, CATEGORY_LABELS, SEVERITY_LABELS, TYPE_LABELS, markerRadius } from '../../utils/visual';

interface MarkerLayerProps {
  reports: Report[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function MarkerLayer({ reports }: MarkerLayerProps) {
  return (
    <>
      {reports.map((report) => {
        const color = CATEGORY_COLORS[report.category];
        const isCollision = report.type === 'collision';
        return (
          <CircleMarker
            key={report.id}
            center={[report.lat, report.lng]}
            radius={markerRadius(report.severity)}
            pathOptions={{
              color,
              weight: isCollision ? 1.5 : 2.25,
              fillColor: color,
              fillOpacity: isCollision ? 0.85 : 0.18,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-ink-primary">
                  {CATEGORY_LABELS[report.category]} &middot; {TYPE_LABELS[report.type]}
                </p>
                <p className="text-xs text-ink-secondary">{SEVERITY_LABELS[report.severity]}</p>
                <p className="text-xs text-ink-muted">{formatDate(report.timestamp)}</p>
                {report.note && <p className="text-xs text-ink-secondary italic">&ldquo;{report.note}&rdquo;</p>}
                {report.source === 'user' && (
                  <p className="text-[10px] font-medium uppercase tracking-wide text-brand-600">
                    Community-submitted
                  </p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
