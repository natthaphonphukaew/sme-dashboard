"use client";

import { useId, useState } from "react";
import { formatBaht, formatDay, formatNumber } from "@/lib/format";

/** Small single-series trend line with a hover readout. */
export function Sparkline({
  points,
  kind = "number",
  label,
}: {
  points: { date: string; value: number }[];
  kind?: "number" | "baht";
  label: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const W = 240;
  const H = 44;
  const pad = 3;
  const max = Math.max(...points.map((p) => p.value), 1);
  const min = Math.min(...points.map((p) => p.value), 0);
  const x = (i: number) => pad + (i / Math.max(points.length - 1, 1)) * (W - pad * 2);
  const y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2);

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
  const area = `${line}L${x(points.length - 1)},${H}L${x(0)},${H}Z`;
  const fmt = (v: number) => (kind === "baht" ? formatBaht(v) : formatNumber(Math.round(v)));
  const h = hover !== null ? points[hover] : null;

  return (
    <div className="relative">
      <div className="mb-1 h-4 text-[11px] text-muted tabular" aria-live="polite">
        {h ? (
          <>
            {formatDay(h.date)} · <span className="font-semibold text-ink">{fmt(h.value)}</span>
          </>
        ) : (
          label
        )}
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-11 w-full touch-none"
        role="img"
        aria-label={label}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const i = Math.round(((e.clientX - r.left) / r.width) * (points.length - 1));
          setHover(Math.min(points.length - 1, Math.max(0, i)));
        }}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`sg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--series)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--series)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#sg-${id})`} />
        <path
          d={line}
          fill="none"
          stroke="var(--series)"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {h && hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={0}
            y2={H}
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {h && hover !== null && (
        <span
          className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-series"
          style={{
            left: `${(x(hover) / W) * 100}%`,
            top: `calc(1.25rem + ${(y(h.value) / H) * 2.75}rem)`,
            borderColor: "var(--seg-thumb)",
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
