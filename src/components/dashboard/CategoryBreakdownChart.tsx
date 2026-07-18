import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryCount } from '../../utils/aggregate';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/visual';
import { ChartTooltip } from './ChartTooltip';

interface CategoryBreakdownChartProps {
  data: CategoryCount[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const chartData = data.map((d) => ({ ...d, label: CATEGORY_LABELS[d.category] }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 16, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#898781' }}
          axisLine={{ stroke: '#c3c2b7' }}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: '#898781' }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip cursor={{ fill: 'rgba(11,11,11,0.04)' }} content={<ChartTooltip formatter={(value) => `${value} incidents`} />} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={40}>
          {chartData.map((entry) => (
            <Cell key={entry.category} fill={CATEGORY_COLORS[entry.category]} />
          ))}
          <LabelList dataKey="count" position="top" style={{ fontSize: 11, fill: '#52514e' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
