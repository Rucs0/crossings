/** A single wildlife road-crossing or vehicle-collision report. */

export type ReportType = 'crossing' | 'collision';

export type Category = 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'other';

/** 1 = minor/near-miss, 2 = injury, 3 = fatality or high-traffic hazard. */
export type Severity = 1 | 2 | 3;

export interface Report {
  id: string;
  lat: number;
  lng: number;
  type: ReportType;
  category: Category;
  severity: Severity;
  /** ISO 8601 timestamp. */
  timestamp: string;
  note?: string;
  /** Distinguishes bundled sample data from reports the user submitted. */
  source: 'seed' | 'user';
}

export type NewReportInput = Omit<Report, 'id' | 'timestamp' | 'source'>;
