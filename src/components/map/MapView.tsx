import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import type { MutableRefObject, ReactNode } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import type { LeafletMouseEvent, Map as LeafletMap } from 'leaflet';
import { REGION } from '../../data/region';
import type { Report } from '../../types/report';
import { MarkerLayer } from './MarkerLayer';
import { HeatmapLayer } from './HeatmapLayer';
import { MapLegend } from './MapLegend';
import { LayerToggle, type MapLayerMode } from './LayerToggle';

export interface MapViewHandle {
  flyTo: (lat: number, lng: number, zoom?: number) => void;
}

interface MapViewProps {
  reports: Report[];
  /** When set, clicking the map reports the clicked coordinate (report flow). */
  onMapClick?: (lat: number, lng: number) => void;
  /** Extra overlay content rendered inside the map (e.g. hotspot circles). */
  children?: ReactNode;
}

function MapController({
  mapRef,
  onMapClick,
}: {
  mapRef: MutableRefObject<LeafletMap | null>;
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const map = useMapEvents({
    click(event: LeafletMouseEvent) {
      onMapClick?.(event.latlng.lat, event.latlng.lng);
    },
  });
  mapRef.current = map;
  return null;
}

export const MapView = forwardRef<MapViewHandle, MapViewProps>(function MapView(
  { reports, onMapClick, children },
  ref,
) {
  const [mode, setMode] = useState<MapLayerMode>('markers');
  const mapRef = useRef<LeafletMap | null>(null);

  useImperativeHandle(ref, () => ({
    flyTo: (lat, lng, zoom = 14) => {
      mapRef.current?.flyTo([lat, lng], zoom, { duration: 0.8 });
    },
  }));

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[REGION.center.lat, REGION.center.lng]}
        zoom={REGION.defaultZoom}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController mapRef={mapRef} onMapClick={onMapClick} />
        {mode === 'markers' ? <MarkerLayer reports={reports} /> : <HeatmapLayer reports={reports} />}
        {children}
      </MapContainer>

      <div className="pointer-events-none absolute right-3 top-3 z-[900] flex flex-col items-end gap-2">
        <LayerToggle mode={mode} onChange={setMode} />
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 z-[900]">
        <MapLegend />
      </div>
    </div>
  );
});
