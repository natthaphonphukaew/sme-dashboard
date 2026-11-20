"use client";

import { useMemo, useState } from "react";
import type { OrderStatus, RecentOrder } from "@/lib/dashboard";
import { formatBaht, formatShortDateTime } from "@/lib/format";
import { AppIcon, Card } from "./Card";
import { IconList, IconSearch } from "./icons";
import { STATUS_LABEL, StatusBadge } from "./StatusBadge";

type Filter = "all" | OrderStatus;

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: orders.length, paid: 0, pending: 0, cancelled: 0 };
    for (const o of orders) c[o.status]++;
    return c;
  }, [orders]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === "all" || o.status === filter) &&
        (!term ||
          o.customerName.toLowerCase().includes(term) ||
          o.orderNo.toLowerCase().includes(term) ||
          o.city.toLowerCase().includes(term)),
    );
  }, [orders, filter, q]);

  const chips: { key: Filter; label: string }[] = [
    { key: "all", label: "ทั้งหมด" },
    { key: "paid", label: STATUS_LABEL.paid },
    { key: "pending", label: STATUS_LABEL.pending },
    { key: "cancelled", label: STATUS_LABEL.cancelled },
  ];

  return (
    <Card
      delay={600}
      icon={
        <AppIcon from="#94a3b8" to="#475569">
          <IconList />
        </AppIcon>
      }
      title="คำสั่งซื้อล่าสุด"
      subtitle={`${orders.length} รายการล่าสุด · กรองหรือค้นหาได้`}
      action={
        <label className="flex h-9 w-full items-center gap-2 rounded-[10px] px-3 sm:w-64" style={{ background: "var(--seg-track)" }}>
          <IconSearch width={16} height={16} className="shrink-0 text-muted" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาลูกค้า, เลขที่, จังหวัด"
            className="w-full bg-transparent text-[14px] text-ink outline-none placeholder:text-muted"
            aria-label="ค้นหาคำสั่งซื้อ"
          />
        </label>
      }
    >
      <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="กรองตามสถานะ">
        {chips.map((c) => {
          const on = filter === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={on}
              onClick={() => setFilter(c.key)}
              className={`rounded-full px-3 py-1 text-[13px] font-medium transition ${
                on ? "bg-ink text-page" : "bg-wash text-ink-2 hover:bg-wash-2 hover:text-ink"
              }`}
            >
              {c.label} <span className="tabular opacity-70">{counts[c.key]}</span>
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข</p>
      ) : (
        <div className="scroll-quiet max-h-[460px] overflow-y-auto">
          {/* Mobile: stacked list */}
          <ul className="space-y-1.5 md:hidden">
            {shown.map((o) => (
              <li key={o.orderNo} className="flex items-start justify-between gap-3 rounded-2xl bg-wash px-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-ink">{o.customerName}</p>
                  <p className="mt-0.5 text-[11px] text-muted tabular">
                    {o.orderNo} · {formatShortDateTime(o.orderedAt)} · {o.city}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-[14px] font-bold text-ink tabular">{formatBaht(o.totalAmount)}</span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <table className="hidden w-full text-[14px] md:table">
            <thead className="sticky top-0 z-10" style={{ background: "var(--glass-strong)" }}>
              <tr className="text-left text-[12px] text-muted">
                <th className="rounded-l-xl py-2 pl-3 font-medium">เลขที่</th>
                <th className="py-2 font-medium">ลูกค้า</th>
                <th className="py-2 font-medium">จังหวัด</th>
                <th className="py-2 font-medium">เวลา</th>
                <th className="py-2 text-right font-medium">รายการ</th>
                <th className="py-2 pl-6 font-medium">สถานะ</th>
                <th className="rounded-r-xl py-2 pr-3 text-right font-medium">ยอดรวม</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((o) => (
                <tr key={o.orderNo} className="group">
                  <td className="rounded-l-xl py-2.5 pl-3 text-ink-2 tabular group-hover:bg-wash">{o.orderNo}</td>
                  <td className="py-2.5 font-semibold text-ink group-hover:bg-wash">{o.customerName}</td>
                  <td className="py-2.5 text-ink-2 group-hover:bg-wash">{o.city}</td>
                  <td className="whitespace-nowrap py-2.5 text-ink-2 tabular group-hover:bg-wash">
                    {formatShortDateTime(o.orderedAt)}
                  </td>
                  <td className="py-2.5 text-right text-ink-2 tabular group-hover:bg-wash">{o.itemCount}</td>
                  <td className="py-2.5 pl-6 group-hover:bg-wash">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="rounded-r-xl py-2.5 pr-3 text-right font-bold text-ink tabular group-hover:bg-wash">
                    {formatBaht(o.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
