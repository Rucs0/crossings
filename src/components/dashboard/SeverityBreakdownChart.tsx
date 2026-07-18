import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { SeverityCount } from '../../utils/aggregate';
import { SEVERITY_CHART_COLORS, SEVERITY_LABELS } from '../../utils/visual';
import { ChartTooltip } from './ChartTooltip';

interface SeverityBreakdownChartProps {
  data: SeverityCount[];
}

export function SeverityBreakdownChart({ data }: SeverityBreakdownChartProps) {
  const chartData = data.map((d) => ({ ...d, label: SEVERITY_LABELS[d.severity] }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke="#e1e0d9" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          tick={{ fontSize: 11, fill: '#52514e' }}
          axisLine={{ stroke: '#c3c2b7' }}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: 'rgba(11,11,11,0.04)' }} content={<ChartTooltip formatter={(value) => `${value} incidents`} />} />
        <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={20}>
          {chartData.map((entry) => (
            <Cell key={entry.severity} fill={SEVERITY_CHART_COLORS[entry.severity]} />
          ))}
          <LabelList dataKey="count" position="right" style={{ fontSize: 11, fill: '#52514e' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
