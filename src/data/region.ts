/**
 * Demo region: Grand County, Colorado, along the CO-9 corridor between
 * Kremmling and Green Mountain Reservoir. Chosen because it's a real
 * wildlife-vehicle collision hotspot — Colorado Parks & Wildlife and CDOT
 * built a series of underpasses and fencing here after tracking mule deer
 * and elk migration collisions, which makes it a credible stand-in for the
 * kind of corridor Crossings is designed to help identify.
 */
export const REGION = {
  name: 'Grand County, Colorado (CO-9 corridor)',
  center: { lat: 39.9853, lng: -106.3908 },
  /** Bounding box used to constrain seed-data generation and map fit. */
  bounds: {
    north: 40.12,
    south: 39.85,
    east: -106.22,
    west: -106.56,
  },
  defaultZoom: 11,
  /** Approximate standard-time offset from UTC (Mountain Time, DST ignored for simplicity). */
  localUtcOffsetHours: -7,
} as const;
