import { useMemo } from 'react';
import { detectHotspots } from '../utils/clustering';
import type { Report } from '../types/report';

export function useHotspots(reports: Report[]) {
  return useMemo(() => detectHotspots(reports), [reports]);
}
