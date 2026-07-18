import { AnimatePresence, motion } from 'framer-motion';
import type { Hotspot } from '../../types/hotspot';
import { CATEGORY_LABELS } from '../../utils/visual';
import { describeLocation } from '../../utils/location';
import { analyzeTimeOfDay } from '../../utils/timeOfDay';
import { generateRecommendation } from '../../utils/recommendation';
import { buildReportText, downloadTextFile } from '../../utils/reportExport';

interface ActionReportModalProps {
  hotspot: Hotspot | null;
  rank: number;
  onClose: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ActionReportModal({ hotspot, rank, onClose }: ActionReportModalProps) {
  return (
    <AnimatePresence>
      {hotspot && (
        <motion.div
          className="fixed inset-0 z-[1200] flex items-end justify-center bg-ink-primary/40 p-0 sm:items-center sm:p-4 print:static print:bg-transparent print:p-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-xl bg-surface shadow-xl sm:rounded-xl print:max-h-none print:overflow-visible print:shadow-none"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3 print:hidden">
              <h2 className="text-sm font-semibold text-ink-primary">Action report</h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadTextFile(`crossings-zone-${rank}-report.txt`, buildReportText(hotspot, rank))}
                  className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-primary hover:bg-surface-sunken"
                >
                  Download .txt
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600"
                >
                  Print
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-1 text-ink-muted hover:bg-surface-sunken hover:text-ink-primary"
                >
                  ✕
                </button>
              </div>
            </div>

            <ReportBody hotspot={hotspot} rank={rank} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ReportBody({ hotspot, rank }: { hotspot: Hotspot; rank: number }) {
  const timePattern = analyzeTimeOfDay(hotspot.reports);
  const recommendations = generateRecommendation(hotspot, timePattern);
  const collisionCount = hotspot.reports.filter((r) => r.type === 'collision').length;

  return (
    <div className="printable-report px-6 py-5 text-sm text-ink-secondary">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Crossings &middot; Priority Mitigation Zone Report</p>
      <h1 className="mt-1 text-lg font-semibold text-ink-primary">Priority Zone #{rank}</h1>
      <p className="mt-0.5 text-xs text-ink-muted">{describeLocation(hotspot.lat, hotspot.lng)}</p>
      <p className="text-xs text-ink-muted">
        {hotspot.lat.toFixed(5)}, {hotspot.lng.toFixed(5)} &middot; Generated {formatDate(new Date().toISOString())}
      </p>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-lg border border-line bg-surface-plane p-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-ink-muted">Priority score</dt>
          <dd className="text-base font-semibold text-ink-primary">{Math.round(hotspot.score * 100)}/100</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Total incidents</dt>
          <dd className="text-base font-semibold text-ink-primary">{hotspot.incidentCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Confirmed collisions</dt>
          <dd className="text-base font-semibold text-ink-primary">{collisionCount}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Dominant category</dt>
          <dd className="text-base font-semibold text-ink-primary">{CATEGORY_LABELS[hotspot.dominantCategory]}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Average severity</dt>
          <dd className="text-base font-semibold text-ink-primary">{hotspot.averageSeverity.toFixed(1)} / 3</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-muted">Time-of-day pattern</dt>
          <dd className="text-base font-semibold text-ink-primary">
            {timePattern.dominant} ({Math.round(timePattern.share * 100)}%)
          </dd>
        </div>
      </dl>

      <h2 className="mt-5 text-sm font-semibold text-ink-primary">Recommendation</h2>
      <ol className="mt-2 list-decimal space-y-2 pl-5">
        {recommendations.map((rec, i) => (
          <li key={i}>{rec}</li>
        ))}
      </ol>

      <p className="mt-5 border-t border-line pt-3 text-xs text-ink-muted">
        Generated from crowdsourced, unverified citizen reports. Intended to help prioritize sites for a field
        survey, not to replace one — see the Methodology page for how zones are detected and scored.
      </p>
    </div>
  );
}
