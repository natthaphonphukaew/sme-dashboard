"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
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
  percentChange,
} from "@/lib/format";
import { AppIcon, Card } from "./Card";
import { IconChart } from "./icons";
import { Segmented } from "./Segmented";

type RangeKey = "7d" | "30d" | "12m" | "all";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "7 วัน" },
  { key: "30d", label: "30 วัน" },
  { key: "12m", label: "12 เดือน" },
  { key: "all", label: "ทั้งหมด" },
];

type Row = SalesPoint & { prevRevenue?: number; prevDate?: string };

export function SalesChart({ daily, monthly }: { daily: SalesPoint[]; monthly: SalesPoint[] }) {
  const [range, setRange] = useState<RangeKey>("30d");
  const [view, setView] = useState<"chart" | "table">("chart");
  const [compare, setCompare] = useState(true);

  const isMonthly = range === "12m" || range === "all";
  const days = range === "7d" ? 7 : 30;

  let data: Row[];
  let prevTotal = 0;
  if (isMonthly) {
    data = range === "12m" ? monthly.slice(-12) : monthly;
  } else {
    const cur = daily.slice(-days);
    const prev = daily.slice(-days * 2, -days);
    prevTotal = prev.reduce((s, p) => s + p.revenue, 0);
    data = cur.map((p, i) => ({ ...p, prevRevenue: prev[i]?.revenue, prevDate: prev[i]?.date }));
  }

  const showCompare = compare && !isMonthly;
  const tick = isMonthly ? formatMonth : formatDay;
  const longLabel = isMonthly ? formatMonthLong : formatDayLong;
  const total = data.reduce((sum, p) => sum + p.revenue, 0);
  const orders = data.reduce((sum, p) => sum + p.orders, 0);
  const change = isMonthly ? null : percentChange(total, prevTotal);

  return (
    <Card
      delay={300}
      icon={
        <AppIcon from="#4f8cff" to="#6a5cff">
          <IconChart />
        </AppIcon>
      }
      title="แนวโน้มยอดขาย"
      subtitle={
        <>
          <span className="font-semibold text-ink tabular">{formatBaht(total)}</span> ·{" "}
          {formatNumber(orders)} บิล
          {change !== null && (
            <span className={change >= 0 ? "text-good-ink" : "text-critical-ink"}>
              {" "}
              · {change >= 0 ? "▲ +" : "▼ −"}
              {Math.abs(change).toFixed(1)}% จากช่วงก่อน
            </span>
          )}
        </>
      }
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Segmented label="ช่วงเวลา" options={RANGES} value={range} onChange={setRange} />
          <Segmented
            label="รูปแบบ"
            options={[
              { key: "chart", label: "กราฟ" },
              { key: "table", label: "ตาราง" },
            ]}
            value={view}
            onChange={setView}
          />
        </div>
      }
    >
      {view === "chart" ? (
        <>
          <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-series" aria-hidden="true" />
              {isMonthly ? "ยอดขายรายเดือน" : "ช่วงนี้"}
            </span>
            {!isMonthly && (
              <label className="inline-flex cursor-pointer items-center gap-1.5 select-none">
                <input
                  type="checkbox"
                  checked={compare}
                  onChange={(e) => setCompare(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[var(--series)]"
                />
                <svg width="16" height="2" aria-hidden="true">
                  <line x1="0" y1="1" x2="16" y2="1" stroke="var(--muted)" strokeWidth="2" strokeDasharray="3 3" />
                </svg>
                เทียบ {days} วันก่อนหน้า
              </label>
            )}
          </div>
          <div
            className="h-64 sm:h-80"
            role="img"
            aria-label={`กราฟยอดขาย${isMonthly ? "รายเดือน" : "รายวัน"} รวม ${formatBaht(total)}`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--series)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--series)" stopOpacity={0} />
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
                      row={payload?.[0]?.payload as Row | undefined}
                      longLabel={longLabel}
                      showCompare={showCompare}
                    />
                  )}
                  cursor={{ stroke: "var(--line)", strokeWidth: 1 }}
                />
                {showCompare && (
                  <Line
                    type="monotone"
                    dataKey="prevRevenue"
                    stroke="var(--muted)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--series)"
                  strokeWidth={2.5}
                  fill="url(#revenueFill)"
                  dot={data.length <= 12 ? { r: 3.5, fill: "var(--series)", strokeWidth: 0 } : false}
                  activeDot={{ r: 6, fill: "var(--series)", stroke: "var(--seg-thumb)", strokeWidth: 2 }}
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="scroll-quiet max-h-80 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0" style={{ background: "var(--glass-strong)" }}>
              <tr className="text-left text-xs text-muted">
                <th className="py-2 pl-2 font-medium">{isMonthly ? "เดือน" : "วันที่"}</th>
                <th className="py-2 text-right font-medium">บิล</th>
                <th className="py-2 pr-2 text-right font-medium">ยอดขาย</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((p) => (
                <tr key={p.date} className="border-t border-grid">
                  <td className="py-2 pl-2 text-ink-2">{longLabel(p.date)}</td>
                  <td className="py-2 text-right text-ink-2 tabular">{formatNumber(p.orders)}</td>
                  <td className="py-2 pr-2 text-right font-medium text-ink tabular">
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
  row: p,
  longLabel,
  showCompare,
}: {
  active?: boolean;
  row?: Row;
  longLabel: (d: string) => string;
  showCompare: boolean;
}) {
  if (!active || !p) return null;
  return (
    <div className="glass-strong min-w-44 rounded-2xl px-3.5 py-2.5 text-sm">
      <p className="text-xs text-muted">{longLabel(p.date)}</p>
      <p className="mt-1 flex items-center gap-2 font-semibold text-ink tabular">
        <span className="inline-block h-2 w-2 rounded-full bg-series" aria-hidden="true" />
        {formatBaht(p.revenue)}
        <span className="font-normal text-ink-2">· {formatNumber(p.orders)} บิล</span>
      </p>
      {showCompare && p.prevRevenue !== undefined && p.prevDate && (
        <p className="mt-1 flex items-center gap-2 text-xs text-ink-2 tabular">
          <span className="inline-block h-0.5 w-2 bg-muted" aria-hidden="true" />
          {formatDay(p.prevDate)}: {formatBaht(p.prevRevenue)}
        </p>
      )}
    </div>
  );
}
