import { useCallback, useMemo, useState } from 'react';
import { SEED_REPORTS } from '../data/seedReports';
import { loadUserReports, saveUserReports } from '../utils/storage';
import type { NewReportInput, Report } from '../types/report';

function makeId(): string {
  return `user-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

/** Merges the seeded demo dataset with locally-persisted user reports. */
export function useReports() {
  const [userReports, setUserReports] = useState<Report[]>(() => loadUserReports());

  const reports = useMemo<Report[]>(
    () => [...SEED_REPORTS, ...userReports],
    [userReports],
  );

  const addReport = useCallback((input: NewReportInput) => {
    const report: Report = {
      ...input,
      id: makeId(),
      timestamp: new Date().toISOString(),
      source: 'user',
    };
    setUserReports((prev) => {
      const next = [...prev, report];
      saveUserReports(next);
      return next;
    });
    return report;
  }, []);

  return { reports, userReports, addReport };
}
