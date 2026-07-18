interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { value: number; name?: string; color?: string }[];
  formatter?: (value: number, name?: string) => string;
}

/** Shared tooltip styling so every Recharts chart on the dashboard matches. */
export function ChartTooltip({ active, label, payload, formatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-xs shadow-md">
      {label && <p className="mb-1 font-medium text-ink-primary">{label}</p>}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-ink-secondary">
          {entry.color && (
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          )}
          <span>{formatter ? formatter(entry.value, entry.name) : entry.value}</span>
        </div>
      ))}
    </div>
  );
}
