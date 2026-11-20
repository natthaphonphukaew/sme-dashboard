"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesPoint } from "@/lib/dashboard";
import {
  formatBaht,
  formatBahtCompact,
  formatDay,
  formatDayLong,
  formatMonth,
  formatMonthLong,
  formatNumber,
} from "@/lib/format";
import { Card } from "./Card";

type RangeKey = "7d" | "30d" | "12m" | "all";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7 วัน" },
  { key: "30d", label: "30 วัน" },
  { key: "12m", label: "12 เดือน" },
  { key: "all", label: "ทั้งหมด" },
];

export function SalesChart({ daily, monthly }: { daily: SalesPoint[]; monthly: SalesPoint[] }) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [view, setView] = useState<"chart" | "table">("chart");

  const isMonthly = range === "12m" || range === "all";
  const data =
    range === "7d"
      ? daily.slice(-7)
      : range === "30d"
        ? daily
        : range === "12m"
          ? monthly.slice(-12)
          : monthly;

  const tick = isMonthly ? formatMonth : formatDay;
  const longLabel = isMonthly ? formatMonthLong : formatDayLong;
  const total = data.reduce((sum, p) => sum + p.revenue, 0);
  const orders = data.reduce((sum, p) => sum + p.orders, 0);

  return (
    <Card
      title="แนวโน้มยอดขาย"
      subtitle={
        <>
          ยอดขายช่วงนี้{" "}
          <span className="font-semibold text-ink">{formatBaht(total)}</span> ·{" "}
          {formatNumber(orders)} บิล
        </>
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="ช่วงเวลา"
            options={RANGES}
            value={range}
            onChange={(k) => setRange(k as RangeKey)}
          />
          <Segmented
            label="รูปแบบการแสดงผล"
            options={[
              { key: "chart", label: "กราฟ" },
              { key: "table", label: "ตาราง" },
            ]}
            value={view}
            onChange={(k) => setView(k as "chart" | "table")}
          />
        </div>
      }
    >
      {view === "chart" ? (
        <div
          className="h-64 sm:h-72"
          role="img"
          aria-label={`กราฟยอดขาย${isMonthly ? "รายเดือน" : "รายวัน"} ${data.length} จุด รวม ${formatBaht(total)}`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--series)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--series)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis
                dataKey="date"
                tickFormatter={tick}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                axisLine={{ stroke: "var(--line)" }}
                tickLine={false}
                minTickGap={24}
              />
              <YAxis
                tickFormatter={(v: number) => formatBahtCompact(v)}
                tick={{ fill: "var(--muted)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={64}
              />
              <Tooltip
                content={({ active, payload }) => (
                  <ChartTooltip
                    active={active}
                    point={payload?.[0]?.payload as SalesPoint | undefined}
                    longLabel={longLabel}
                  />
                )}
                cursor={{ stroke: "var(--line)", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                name="ยอดขาย"
                stroke="var(--series)"
                strokeWidth={2}
                fill="url(#revenueFill)"
                dot={data.length <= 12 ? { r: 3, fill: "var(--series)", strokeWidth: 0 } : false}
                activeDot={{ r: 5, fill: "var(--series)", stroke: "var(--surface)", strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 font-medium">{isMonthly ? "เดือน" : "วันที่"}</th>
                <th className="py-2 text-right font-medium">บิล</th>
                <th className="py-2 text-right font-medium">ยอดขาย</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-grid">
              {[...data].reverse().map((p) => (
                <tr key={p.date}>
                  <td className="py-2 text-ink-2">{longLabel(p.date)}</td>
                  <td className="tabular py-2 text-right text-ink-2">{formatNumber(p.orders)}</td>
                  <td className="tabular py-2 text-right font-medium text-ink">
                    {formatBaht(p.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {isMonthly && (
        <p className="mt-3 text-xs text-muted">* เดือนปัจจุบันยังไม่ครบเดือน ยอดจึงอาจต่ำกว่าเดือนอื่น</p>
      )}
    </Card>
  );
}

function ChartTooltip({
  active,
  point: p,
  longLabel,
}: {
  active?: boolean;
  point?: SalesPoint;
  longLabel: (d: string) => string;
}) {
  if (!active || !p) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-lg">
      <p className="text-xs text-muted">{longLabel(p.date)}</p>
      <p className="mt-1 flex items-center gap-2 font-semibold text-ink">
        <span className="inline-block h-2 w-2 rounded-full bg-series" aria-hidden="true" />
        {formatBaht(p.revenue)}
      </p>
      <p className="text-xs text-ink-2">{formatNumber(p.orders)} บิล</p>
    </div>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-border bg-wash p-0.5">
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:text-sm ${
              selected ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
