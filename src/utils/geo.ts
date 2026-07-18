import { REGION } from '../data/region';

const EARTH_RADIUS_M = 6371000;
const originLatRad = (REGION.center.lat * Math.PI) / 180;

/**
 * Equirectangular projection centered on the demo region. Accurate enough
 * for a corridor a few tens of kilometers across (the error from ignoring
 * Earth's curvature is negligible at this scale), and much cheaper than a
 * full haversine call for every pairwise distance during clustering.
 */
export function toLocalMeters(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - REGION.center.lng) * Math.PI * EARTH_RADIUS_M * Math.cos(originLatRad)) / 180;
  const y = ((lat - REGION.center.lat) * Math.PI * EARTH_RADIUS_M) / 180;
  return { x, y };
}

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const pa = toLocalMeters(a.lat, a.lng);
  const pb = toLocalMeters(b.lat, b.lng);
  return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}
