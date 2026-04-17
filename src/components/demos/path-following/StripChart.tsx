// src/components/demos/path-following/StripChart.tsx
"use client";

interface Props {
  values: number[];
  label: string;
  unit: string;
  yMin?: number;
  yMax?: number;
  threshold?: number;
  color?: string;
}

const WIDTH = 260;
const HEIGHT = 80;

export function StripChart({
  values,
  label,
  unit,
  yMin,
  yMax,
  threshold,
  color = "#3B82F6",
}: Props) {
  if (!values.length) {
    return (
      <div className="rounded border border-border bg-surface p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
          {label}
        </div>
        <div
          className="w-full bg-[#0A0A0A] rounded"
          style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}
        />
      </div>
    );
  }

  const min = yMin ?? Math.min(...values);
  const max = yMax ?? Math.max(...values);
  const span = max - min || 1;

  const path = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * WIDTH;
      const y = HEIGHT - ((v - min) / span) * HEIGHT;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const thresholdY =
    threshold !== undefined
      ? HEIGHT - ((threshold - min) / span) * HEIGHT
      : null;

  return (
    <div className="rounded border border-border bg-surface p-3">
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
        <span>{label}</span>
        <span>
          {values[values.length - 1].toFixed(2)} {unit}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full bg-[#0A0A0A] rounded"
        preserveAspectRatio="none"
      >
        {thresholdY !== null && (
          <line
            x1={0}
            x2={WIDTH}
            y1={thresholdY}
            y2={thresholdY}
            stroke="rgba(239, 68, 68, 0.6)"
            strokeDasharray="3 2"
          />
        )}
        <path d={path} stroke={color} strokeWidth={1.2} fill="none" />
      </svg>
    </div>
  );
}
