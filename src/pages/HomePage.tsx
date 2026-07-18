import { lazy, Suspense, useMemo, useRef, useState } from 'react';
import { CircleMarker } from 'react-leaflet';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useHotspots';
import { useFilters } from '../context/FiltersContext';
import { useLazyMount } from '../hooks/useLazyMount';
import { filterReports } from '../utils/filterReports';
import { MapView, type MapViewHandle } from '../components/map/MapView';
import { ReportButton } from '../components/report/ReportButton';
import { HotspotPanel } from '../components/hotspots/HotspotPanel';
import { HotspotOverlay } from '../components/hotspots/HotspotOverlay';
import type { NewReportInput } from '../types/report';
import type { Hotspot } from '../types/hotspot';

// Framer Motion isn't needed until a modal actually opens, so both modals —
// and the animation library they pull in — are kept out of the initial map
// bundle and fetched on first use instead.
const ReportModal = lazy(() => import('../components/report/ReportModal').then((m) => ({ default: m.ReportModal })));
const ActionReportModal = lazy(() =>
  import('../components/hotspots/ActionReportModal').then((m) => ({ default: m.ActionReportModal })),
);

export function HomePage() {
  const { reports, addReport } = useReports();
  const { filters } = useFilters();
  const filteredReports = useMemo(() => filterReports(reports, filters), [reports, filters]);
  const hotspots = useHotspots(filteredReports);

  const [isPlacing, setIsPlacing] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [reportHotspot, setReportHotspot] = useState<Hotspot | null>(null);
  const mapRef = useRef<MapViewHandle>(null);

  function handleMapClick(lat: number, lng: number) {
    if (!isPlacing) return;
    setIsPlacing(false);
    setPendingLocation({ lat, lng });
  }

  function handleSubmit(input: NewReportInput) {
    addReport(input);
    setPendingLocation(null);
  }

  function handleSelectHotspot(hotspot: Hotspot) {
    setSelectedHotspotId(hotspot.id);
    mapRef.current?.flyTo(hotspot.lat, hotspot.lng, 14);
  }

  function handleGeolocated(lat: number, lng: number) {
    setPendingLocation({ lat, lng });
    // Without this the map (centered on the demo region) never shows where
    // the pin landed if the user's real GPS position is outside it — which
    // it will be for anyone not physically in Grand County, CO.
    mapRef.current?.flyTo(lat, lng, 14);
  }

  const reportRank = reportHotspot ? hotspots.findIndex((h) => h.id === reportHotspot.id) + 1 : 0;
  const shouldMountReportModal = useLazyMount(pendingLocation !== null);
  const shouldMountActionReport = useLazyMount(reportHotspot !== null);

  return (
    <div className="relative h-full">
      <MapView ref={mapRef} reports={filteredReports} onMapClick={handleMapClick}>
        <HotspotOverlay hotspots={hotspots} selectedId={selectedHotspotId} />
        {pendingLocation && (
          <CircleMarker
            center={[pendingLocation.lat, pendingLocation.lng]}
            radius={10}
            pathOptions={{ color: '#0f766e', weight: 2, fillColor: '#0f766e', fillOpacity: 0.35, dashArray: '4 3' }}
          />
        )}
      </MapView>

      <div className="pointer-events-none absolute left-3 top-3 bottom-20 z-[900] sm:bottom-3">
        <HotspotPanel
          hotspots={hotspots}
          selectedId={selectedHotspotId}
          onSelect={handleSelectHotspot}
          onViewReport={setReportHotspot}
        />
      </div>

      <div className="pointer-events-none absolute bottom-4 right-3 z-[900] sm:bottom-3">
        <ReportButton
          isPlacing={isPlacing}
          onStartPlacing={() => setIsPlacing(true)}
          onCancelPlacing={() => setIsPlacing(false)}
          onLocated={handleGeolocated}
        />
      </div>

      <Suspense fallback={null}>
        {shouldMountReportModal && (
          <ReportModal location={pendingLocation} onSubmit={handleSubmit} onClose={() => setPendingLocation(null)} />
        )}
        {shouldMountActionReport && (
          <ActionReportModal hotspot={reportHotspot} rank={reportRank} onClose={() => setReportHotspot(null)} />
        )}
      </Suspense>
    </div>
  );
}
