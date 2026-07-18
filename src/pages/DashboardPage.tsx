import { useMemo, useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useHotspots } from '../hooks/useHotspots';
import { useFilters } from '../context/FiltersContext';
import { filterReports } from '../utils/filterReports';
import { aggregateByCategory, aggregateByMonth, aggregateBySeverity } from '../utils/aggregate';
import { ChartCard } from '../components/dashboard/ChartCard';
import { IncidentsOverTimeChart } from '../components/dashboard/IncidentsOverTimeChart';
import { CategoryBreakdownChart } from '../components/dashboard/CategoryBreakdownChart';
import { SeverityBreakdownChart } from '../components/dashboard/SeverityBreakdownChart';
import { TopHotspotsChart } from '../components/dashboard/TopHotspotsChart';
import { ActionReportModal } from '../components/hotspots/ActionReportModal';
import type { Hotspot } from '../types/hotspot';

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface px-4 py-3">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink-primary">{value}</p>
    </div>
  );
}

export function DashboardPage() {
  const { reports } = useReports();
  const { filters } = useFilters();
  const filteredReports = useMemo(() => filterReports(reports, filters), [reports, filters]);
  const hotspots = useHotspots(filteredReports);
  const [reportHotspot, setReportHotspot] = useState<Hotspot | null>(null);

  const monthly = useMemo(() => aggregateByMonth(filteredReports), [filteredReports]);
  const byCategory = useMemo(() => aggregateByCategory(filteredReports), [filteredReports]);
  const bySeverity = useMemo(() => aggregateBySeverity(filteredReports), [filteredReports]);

  const collisionCount = filteredReports.filter((r) => r.type === 'collision').length;
  const avgSeverity = filteredReports.length
    ? (filteredReports.reduce((sum, r) => sum + r.severity, 0) / filteredReports.length).toFixed(1)
    : '0.0';

  const reportRank = reportHotspot ? hotspots.findIndex((h) => h.id === reportHotspot.id) + 1 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="text-xl font-semibold text-ink-primary">Insights</h1>
      <p className="mt-1 text-sm text-ink-secondary">
        Aggregated view of {filteredReports.length} reports matching the current filters.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total reports" value={String(filteredReports.length)} />
        <StatTile label="Vehicle collisions" value={String(collisionCount)} />
        <StatTile label="Average severity" value={avgSeverity} />
        <StatTile label="Priority zones" value={String(hotspots.length)} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Incidents over time" subtitle="Monthly report count">
          <IncidentsOverTimeChart data={monthly} />
        </ChartCard>
        <ChartCard title="Top 5 priority zones" subtitle="Ranked by composite priority score — click a bar for its action report">
          <TopHotspotsChart hotspots={hotspots} onSelect={setReportHotspot} />
        </ChartCard>
        <ChartCard title="By category" subtitle="Which animal groups are most affected">
          <CategoryBreakdownChart data={byCategory} />
        </ChartCard>
        <ChartCard title="By severity" subtitle="Minor near-misses vs. fatalities">
          <SeverityBreakdownChart data={bySeverity} />
        </ChartCard>
      </div>

      <ActionReportModal hotspot={reportHotspot} rank={reportRank} onClose={() => setReportHotspot(null)} />
    </div>
  );
}
