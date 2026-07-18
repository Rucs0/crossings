import type { Report } from '../types/report';

const STORAGE_KEY = 'crossings.userReports.v1';

export function loadUserReports(): Report[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserReports(reports: Report[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // localStorage may be unavailable (private browsing, quota) — the
    // report still renders for this session, it just won't persist.
  }
}
