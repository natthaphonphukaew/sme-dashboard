import type { CSSProperties, ReactNode } from "react";
import type { PeriodCompare, SalesPoint, Summary } from "@/lib/dashboard";
import { formatBaht, formatNumber, percentChange } from "@/lib/format";
import { AppIcon } from "./Card";
import { CountUp } from "./CountUp";
import { IconArrowDown, IconArrowUp, IconBag, IconBaht, IconReceipt, IconUsers } from "./icons";
import { Sparkline } from "./Sparkline";

/** "▲ 12.3%" chip – direction is carried by arrow + sign + color together. */
function Delta({ current, previous }: { current: number; previous: number }) {
  const pct = percentChange(current, previous);
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-semibold tabular ${
        up ? "text-good-ink" : "text-critical-ink"
      }`}
      style={{ background: up ? "rgba(12,163,12,0.12)" : "rgba(208,59,59,0.12)" }}
      title="เทียบ 30 วันล่าสุดกับ 30 วันก่อนหน้า"
    >
      {up ? <IconArrowUp width={13} height={13} /> : <IconArrowDown width={13} height={13} />}
      {up ? "+" : "−"}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

function Kpi({
  icon,
  label,
  value,
  delta,
  sub,
  children,
  delay,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  delta?: ReactNode;
  sub: ReactNode;
  children?: ReactNode;
  delay: number;
}) {
  return (
    <div
      className="glass glass-hover rise flex flex-col rounded-[28px] p-4 sm:p-5"
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {icon}
          <p className="text-[13px] font-medium text-ink-2">{label}</p>
        </div>
        {delta}
      </div>
      <p className="relative mt-3 text-[28px] font-bold leading-none tracking-tight text-ink tabular sm:text-[32px]">
        {value}
      </p>
      <p className="relative mt-2 text-[12px] text-muted">{sub}</p>
      {children && <div className="relative mt-auto pt-3">{children}</div>}
    </div>
  );
}

export function KpiCards({
  summary: s,
  period: p,
  daily,
}: {
  summary: Summary;
  period: PeriodCompare;
  daily: SalesPoint[];
}) {
  const last30 = daily.slice(-30);
  const activePct = s.totalCustomers ? (s.activeCustomers30d / s.totalCustomers) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <Kpi
        delay={60}
        icon={
          <AppIcon from="#4f8cff" to="#2a5bd7">
            <IconBaht />
          </AppIcon>
        }
        label="ยอดขายรวม"
        value={<CountUp value={s.totalRevenue} kind="baht" />}
        delta={<Delta current={p.revenue} previous={p.prevRevenue} />}
        sub={
          <>
            30 วันล่าสุด <span className="font-semibold text-ink-2">{formatBaht(p.revenue)}</span>
          </>
        }
      >
        <Sparkline
          label="ยอดขายรายวัน 30 วัน"
          kind="baht"
          points={last30.map((d) => ({ date: d.date, value: d.revenue }))}
        />
      </Kpi>

      <Kpi
        delay={120}
        icon={
          <AppIcon from="#ffb24d" to="#f2711c">
            <IconBag />
          </AppIcon>
        }
        label="คำสั่งซื้อทั้งหมด"
        value={<CountUp value={s.totalOrders} />}
        delta={<Delta current={p.orders} previous={p.prevOrders} />}
        sub={
          <>
            30 วันล่าสุด <span className="font-semibold text-ink-2">{formatNumber(p.orders)}</span> บิลที่ชำระแล้ว
          </>
        }
      >
        <Sparkline
          label="บิลที่ชำระแล้วรายวัน 30 วัน"
          points={last30.map((d) => ({ date: d.date, value: d.orders }))}
        />
      </Kpi>

      <Kpi
        delay={180}
        icon={
          <AppIcon from="#3fd8a4" to="#119a6e">
            <IconUsers />
          </AppIcon>
        }
        label="ลูกค้าทั้งหมด"
        value={<CountUp value={s.totalCustomers} />}
        sub={
          <>
            ซื้อใน 30 วันล่าสุด{" "}
            <span className="font-semibold text-ink-2">{formatNumber(s.activeCustomers30d)}</span> คน
          </>
        }
      >
        <div>
          <div className="mb-1.5 flex justify-between text-[11px] text-muted">
            <span>ลูกค้า Active (30 วัน)</span>
            <span className="font-semibold text-ink tabular">{activePct.toFixed(0)}%</span>
          </div>
          <div
            className="h-2.5 overflow-hidden rounded-full bg-wash-2"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(activePct)}
            aria-label="สัดส่วนลูกค้าที่ซื้อใน 30 วัน"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${activePct}%`,
                background: "linear-gradient(90deg, #3fd8a4, var(--series))",
              }}
            />
          </div>
          <p className="mt-2 text-[11px] text-muted">
            {formatNumber(s.totalCustomers - s.activeCustomers30d)} คน ยังไม่กลับมาซื้อ
          </p>
        </div>
      </Kpi>

      <Kpi
        delay={240}
        icon={
          <AppIcon from="#c084fc" to="#7c3aed">
            <IconReceipt />
          </AppIcon>
        }
        label="ยอดเฉลี่ยต่อบิล"
        value={<CountUp value={s.avgOrderValue} kind="baht" />}
        delta={<Delta current={p.avgOrderValue} previous={p.prevAvgOrderValue} />}
        sub={
          <>
            30 วันล่าสุด{" "}
            <span className="font-semibold text-ink-2">{formatBaht(p.avgOrderValue)}</span> / บิล
          </>
        }
      >
        <Sparkline
          label="ยอดเฉลี่ยต่อบิลรายวัน 30 วัน"
          kind="baht"
          points={last30.map((d) => ({ date: d.date, value: d.orders ? d.revenue / d.orders : 0 }))}
        />
      </Kpi>
    </div>
  );
}
