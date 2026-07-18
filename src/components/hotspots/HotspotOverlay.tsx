import { Circle, Tooltip } from 'react-leaflet';
import type { Hotspot } from '../../types/hotspot';

interface HotspotOverlayProps {
  hotspots: Hotspot[];
  selectedId: string | null;
}

const ZONE_COLOR = '#0f766e';

export function HotspotOverlay({ hotspots, selectedId }: HotspotOverlayProps) {
  return (
    <>
      {hotspots.map((hotspot, index) => {
        const isSelected = hotspot.id === selectedId;
        return (
          <Circle
            key={hotspot.id}
            center={[hotspot.lat, hotspot.lng]}
            radius={hotspot.radiusMeters}
            pathOptions={{
              color: ZONE_COLOR,
              weight: isSelected ? 3 : 1.5,
              fillColor: ZONE_COLOR,
              fillOpacity: isSelected ? 0.15 : 0.06,
              dashArray: isSelected ? undefined : '5 4',
            }}
          >
            <Tooltip direction="top" opacity={0.95}>
              Priority zone #{index + 1} &middot; {hotspot.incidentCount} incidents
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}
