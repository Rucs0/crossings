import type { Category, Report } from './report';

/** A priority mitigation zone produced by the clustering pass. */
export interface Hotspot {
  id: string;
  /** Centroid of the cluster's reports. */
  lat: number;
  lng: number;
  /** Approximate radius in meters used for the zoom-to and map circle. */
  radiusMeters: number;
  reports: Report[];
  /** Composite priority score — see src/utils/clustering.ts for the formula. */
  score: number;
  incidentCount: number;
  dominantCategory: Category;
  averageSeverity: number;
  /** Most recent report timestamp in the cluster, ISO 8601. */
  mostRecent: string;
}
