import type { Hotspot } from '../types/hotspot';
import type { TimeOfDayPattern } from './timeOfDay';

/**
 * Rule-based, plain-language mitigation recommendation for a priority zone.
 * This intentionally stays simple and legible rather than a black-box
 * model — a local authority reading the exported report should be able to
 * see exactly which numbers triggered which suggestion. Documented in full
 * on the Methodology page.
 */
export function generateRecommendation(hotspot: Hotspot, timePattern: TimeOfDayPattern): string[] {
  const recommendations: string[] = [];
  const collisionRatio = hotspot.reports.filter((r) => r.type === 'collision').length / hotspot.reports.length;

  // Primary infrastructure recommendation, scaled to how serious and how
  // busy the zone is.
  if (hotspot.incidentCount >= 20 && hotspot.averageSeverity >= 2.2) {
    recommendations.push(
      'Evaluate this corridor for a dedicated wildlife crossing structure (underpass or overpass) with directional fencing — incident volume and severity here are consistent with sites where structures have measurably reduced collisions elsewhere.',
    );
  } else if (hotspot.incidentCount >= 12) {
    recommendations.push(
      'Retrofit an existing culvert or drainage structure as a wildlife underpass where feasible, paired with short fencing runs to funnel animals toward it.',
    );
  } else {
    recommendations.push('Install static wildlife-crossing warning signage at this location.');
  }

  // Time-of-day pattern, when it's strong enough to be actionable.
  if ((timePattern.dominant === 'Dawn' || timePattern.dominant === 'Dusk') && timePattern.share >= 0.4) {
    recommendations.push(
      `Add dynamic or lighted warning signage active during ${timePattern.dominant.toLowerCase()} hours — ${Math.round(
        timePattern.share * 100,
      )}% of reports in this zone occurred then, when animal activity is highest and visibility is lowest.`,
    );
  } else if (timePattern.dominant === 'Night' && timePattern.share >= 0.35) {
    recommendations.push('Consider a reduced night-time speed limit and reflective road delineators.');
  }

  // Severity escalation.
  if (hotspot.averageSeverity >= 2.5) {
    recommendations.push(
      'Flag for near-term funding priority: average severity here is high, indicating a disproportionate share of fatalities or severe-injury incidents.',
    );
  }

  // Confirmed-collision rate vs. sightings-only.
  if (collisionRatio >= 0.6) {
    recommendations.push(
      `${Math.round(collisionRatio * 100)}% of reports here are confirmed vehicle collisions rather than sightings, suggesting existing signage or speed limits are not an adequate deterrent on their own.`,
    );
  }

  return recommendations;
}
