import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { MonthlyCount } from '../../utils/aggregate';
import { CHART_PRIMARY_COLOR } from '../../utils/visual';
import { ChartTooltip } from './ChartTooltip';

interface IncidentsOverTimeChartProps {
  data: MonthlyCount[];
}

export function IncidentsOverTimeChart({ data }: IncidentsOverTimeChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-xs text-ink-muted">No reports match the current filters.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#898781' }}
          axisLine={{ stroke: '#c3c2b7' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: 'rgba(11,11,11,0.04)' }}
          content={<ChartTooltip formatter={(value) => `${value} incidents`} />}
        />
        <Bar dataKey="count" fill={CHART_PRIMARY_COLOR} radius={[3, 3, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
