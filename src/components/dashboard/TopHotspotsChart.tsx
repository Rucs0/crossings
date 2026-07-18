import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Hotspot } from '../../types/hotspot';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../utils/visual';
import { ChartTooltip } from './ChartTooltip';

interface TopHotspotsChartProps {
  hotspots: Hotspot[];
  onSelect?: (hotspot: Hotspot) => void;
}

export function TopHotspotsChart({ hotspots, onSelect }: TopHotspotsChartProps) {
  const top5 = hotspots.slice(0, 5).map((hotspot, index) => ({
    id: hotspot.id,
    label: `#${index + 1} ${CATEGORY_LABELS[hotspot.dominantCategory]}`,
    score: Math.round(hotspot.score * 100),
    category: hotspot.dominantCategory,
  }));

  if (top5.length === 0) {
    return <p className="py-8 text-center text-xs text-ink-muted">No priority zones detected yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={top5} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} stroke="#e1e0d9" />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#898781' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={110}
          tick={{ fontSize: 11, fill: '#52514e' }}
          axisLine={{ stroke: '#c3c2b7' }}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: 'rgba(11,11,11,0.04)' }} content={<ChartTooltip formatter={(value) => `Priority score ${value}/100`} />} />
        <Bar dataKey="score" radius={[0, 3, 3, 0]} maxBarSize={20}>
          {top5.map((entry, index) => (
            <Cell
              key={entry.id}
              fill={CATEGORY_COLORS[entry.category]}
              cursor={onSelect ? 'pointer' : undefined}
              onClick={() => onSelect?.(hotspots[index])}
            />
          ))}
          <LabelList dataKey="score" position="right" style={{ fontSize: 11, fill: '#52514e' }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
