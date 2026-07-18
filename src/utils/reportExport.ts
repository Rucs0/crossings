import type { Hotspot } from '../types/hotspot';
import { CATEGORY_LABELS } from './visual';
import { describeLocation } from './location';
import { analyzeTimeOfDay } from './timeOfDay';
import { generateRecommendation } from './recommendation';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function buildReportText(hotspot: Hotspot, rank: number): string {
  const timePattern = analyzeTimeOfDay(hotspot.reports);
  const recommendations = generateRecommendation(hotspot, timePattern);
  const collisionCount = hotspot.reports.filter((r) => r.type === 'collision').length;

  const lines = [
    'CROSSINGS — PRIORITY MITIGATION ZONE REPORT',
    '='.repeat(44),
    '',
    `Zone: Priority #${rank}`,
    `Location: ${describeLocation(hotspot.lat, hotspot.lng)}`,
    `Coordinates: ${hotspot.lat.toFixed(5)}, ${hotspot.lng.toFixed(5)}`,
    `Report generated: ${formatDate(new Date().toISOString())}`,
    '',
    'SUMMARY',
    '-'.repeat(44),
    `Priority score: ${Math.round(hotspot.score * 100)} / 100`,
    `Total incidents: ${hotspot.incidentCount} (${collisionCount} confirmed collisions, ${
      hotspot.incidentCount - collisionCount
    } crossing sightings)`,
    `Dominant category: ${CATEGORY_LABELS[hotspot.dominantCategory]}`,
    `Average severity: ${hotspot.averageSeverity.toFixed(1)} / 3`,
    `Most recent incident: ${formatDate(hotspot.mostRecent)}`,
    `Time-of-day pattern: ${timePattern.dominant} (${Math.round(timePattern.share * 100)}% of incidents)`,
    '',
    'RECOMMENDATION',
    '-'.repeat(44),
    ...recommendations.map((rec, i) => `${i + 1}. ${rec}`),
    '',
    'DATA NOTES',
    '-'.repeat(44),
    'This report is generated from crowdsourced, unverified citizen reports.',
    'It is intended to help prioritize sites for a field survey, not to replace one.',
    'See the Methodology page for how zones are detected and scored.',
  ];

  return lines.join('\n');
}

export function downloadTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
