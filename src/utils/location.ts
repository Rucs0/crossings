import { REGION } from '../data/region';
import { distanceMeters } from './geo';

const COMPASS_POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

function bearingDegrees(from: { lat: number; lng: number }, to: { lat: number; lng: number }): number {
  const lat1 = (from.lat * Math.PI) / 180;
  const lat2 = (to.lat * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/**
 * There's no geocoding backend, so location is described relative to the
 * region's known reference point rather than resolved to a street address —
 * e.g. "≈3.1 km NNE of Grand County, Colorado (CO-9 corridor)".
 */
export function describeLocation(lat: number, lng: number): string {
  const distanceKm = distanceMeters({ lat, lng }, REGION.center) / 1000;
  if (distanceKm < 0.3) return `At the reference point for ${REGION.name}`;

  const bearing = bearingDegrees(REGION.center, { lat, lng });
  const compass = COMPASS_POINTS[Math.round(bearing / 22.5) % 16];
  return `≈${distanceKm.toFixed(1)} km ${compass} of ${REGION.name}`;
}
