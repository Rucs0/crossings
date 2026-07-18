import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import type { Report } from '../../types/report';

interface HeatmapLayerProps {
  reports: Report[];
}

/**
 * leaflet.heat isn't a react-leaflet component, so it's wired in imperatively:
 * create the heat layer on mount, add it to the map instance from context,
 * and tear it down on unmount / whenever the underlying reports change.
 */
export function HeatmapLayer({ reports }: HeatmapLayerProps) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number, number][] = reports.map((report) => [
      report.lat,
      report.lng,
      // Weight by severity so fatalities/high-hazard incidents dominate the
      // density surface more than minor near-misses.
      report.severity / 3,
    ]);

    const heatLayer = L.heatLayer(points, {
      radius: 26,
      blur: 22,
      maxZoom: 15,
      gradient: { 0.2: '#2ba69a', 0.5: '#eda100', 0.8: '#eb6834', 1: '#d03b3b' },
    });

    heatLayer.addTo(map);
    return () => {
      heatLayer.remove();
    };
  }, [map, reports]);

  return null;
}
