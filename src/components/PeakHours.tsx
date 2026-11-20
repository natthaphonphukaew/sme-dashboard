"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { HeatCell } from "@/lib/dashboard";
import { formatBaht, formatNumber } from "@/lib/format";
import { AppIcon, Card } from "./Card";
import { IconClock } from "./icons";
import { Segmented } from "./Segmented";

const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];
const DAYS_SHORT = ["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."];
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const hh = (h: number) => `${String(h).padStart(2, "0")}:00`;

type Metric = "orders" | "revenue";

/** Weekday x hour heatmap – one hue, light (few) to dark (many). */
export function PeakHours({ cells }: { cells: HeatCell[] }) {
  const [metric, setMetric] = useState<Metric>("orders");
  const [hover, setHover] = useState<HeatCell | null>(null);

  const { grid, max, best, bestDay, bestHour } = useMemo(() => {
    const grid = new Map<string, HeatCell>();
    const byDay = new Map<number, number>();
    const byHour = new Map<number, number>();
    let max = 0;
    let best: HeatCell | null = null;
    for (const c of cells) {
      grid.set(`${c.weekday}-${c.hour}`, c);
      const v = c[metric];
      max = Math.max(max, v);
      if (!best || v > best[metric]) best = c;
      byDay.set(c.weekday, (byDay.get(c.weekday) ?? 0) + v);
      byHour.set(c.hour, (byHour.get(c.hour) ?? 0) + v);
    }
    const top = (m: Map<number, number>) => [...m.entries()].sort((a, b) => b[1] - a[1])[0];
    return { grid, max, best, bestDay: top(byDay), bestHour: top(byHour) };
  }, [cells, metric]);

  const fmt = (v: number) => (metric === "orders" ? `${formatNumber(v)} บิล` : formatBaht(v));
  const fill = (v: number) =>
    v <= 0
      ? "var(--heat-empty)"
      : `color-mix(in oklab, var(--series) ${Math.round(14 + 86 * (v / (max || 1)))}%, var(--heat-empty))`;

  return (
    <Card
      delay={480}
      icon={
        <AppIcon from="#38bdf8" to="#2563eb">
          <IconClock />
        </AppIcon>
      }
      title="ช่วงเวลาขายดี"
      subtitle="บิลที่ชำระแล้ว แยกตามวันและชั่วโมง (เวลาไทย)"
      action={
        <Segmented
          label="ตัวชี้วัด"
          size="sm"
          options={[
            { key: "orders", label: "จำนวนบิล" },
            { key: "revenue", label: "ยอดขาย" },
          ]}
          value={metric}
          onChange={setMetric}
        />
      }
    >
      {/* insights */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Insight label="ช่องเวลาที่ขายดีที่สุด" value={best ? `${DAYS[best.weekday - 1]} ${hh(best.hour)}` : "-"} note={best ? fmt(best[metric]) : ""} />
        <Insight label="วันที่ขายดีที่สุด" value={bestDay ? `วัน${DAYS[bestDay[0] - 1]}` : "-"} note={bestDay ? fmt(bestDay[1]) : ""} />
        <Insight label="ชั่วโมงที่ขายดีที่สุด" value={bestHour ? `${hh(bestHour[0])}–${hh((bestHour[0] + 1) % 24)}` : "-"} note={bestHour ? fmt(bestHour[1]) : ""} />
      </div>

      <div className="scroll-quiet overflow-x-auto pb-1">
        <div className="min-w-[560px]">
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: "28px repeat(24, minmax(0, 1fr))" }}>
            {DAYS_SHORT.map((d, di) => (
              <Row key={d} label={d}>
                {HOURS.map((h) => {
                  const c = grid.get(`${di + 1}-${h}`);
                  const v = c ? c[metric] : 0;
                  return (
                    <div
                      key={h}
                      className={`aspect-square rounded-[5px] transition-transform duration-150 ${
                        hover && c && hover === c ? "scale-125 ring-2 ring-[var(--seg-thumb)]" : ""
                      }`}
                      style={{ background: fill(v) }}
                      onPointerEnter={() => setHover(c ?? { weekday: di + 1, hour: h, orders: 0, revenue: 0 })}
                      onPointerLeave={() => setHover(null)}
                      title={`${DAYS[di]} ${hh(h)}: ${fmt(v)}`}
                    />
                  );
                })}
              </Row>
            ))}
            {/* hour axis */}
            <span />
            {HOURS.map((h) => (
              <span key={h} className="text-center text-[10px] text-muted tabular">
                {h % 3 === 0 ? h : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted">
        <span className="h-5 tabular" aria-live="polite">
          {hover ? (
            <>
              วัน{DAYS[hover.weekday - 1]} {hh(hover.hour)} ·{" "}
              <span className="font-semibold text-ink">{fmt(hover[metric])}</span>
            </>
          ) : (
            "ชี้ที่ช่องเพื่อดูรายละเอียด"
          )}
        </span>
        <span className="flex items-center gap-1.5">
          น้อย
          {[0.15, 0.35, 0.55, 0.75, 1].map((t) => (
            <span key={t} className="h-3 w-3 rounded-[3px]" style={{ background: fill(t * (max || 1)) }} />
          ))}
          มาก
        </span>
      </div>
    </Card>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span className="self-center text-[11px] text-muted">{label}</span>
      {children}
    </>
  );
}

function Insight({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl bg-wash px-3 py-2.5">
      <p className="text-[11px] text-muted">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold text-ink">{value}</p>
      <p className="text-[11px] text-ink-2 tabular">{note}</p>
    </div>
  );
}
