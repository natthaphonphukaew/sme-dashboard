import type { Summary } from "@/lib/dashboard";
import { formatNumber } from "@/lib/format";
import { AppIcon, Card } from "./Card";
import { IconDonut } from "./icons";
import { StatusBadge } from "./StatusBadge";

/** Share of orders by status: one stacked bar + labelled rows (status never by color alone). */
export function OrderStatus({ summary: s }: { summary: Summary }) {
  const total = s.totalOrders || 1;
  const rows = [
    { key: "paid" as const, value: s.paidOrders, color: "var(--good)", note: "นับเป็นยอดขาย" },
    { key: "pending" as const, value: s.pendingOrders, color: "var(--warning)", note: "รอลูกค้าชำระเงิน" },
    { key: "cancelled" as const, value: s.cancelledOrders, color: "var(--critical)", note: "ไม่นับเป็นยอดขาย" },
  ];

  return (
    <Card
      delay={540}
      icon={
        <AppIcon from="#34d399" to="#059669">
          <IconDonut />
        </AppIcon>
      }
      title="สถานะคำสั่งซื้อ"
      subtitle={`ทั้งหมด ${formatNumber(s.totalOrders)} บิล`}
    >
      <div className="flex h-4 gap-[3px] overflow-hidden rounded-full" role="img" aria-label="สัดส่วนสถานะคำสั่งซื้อ">
        {rows.map((r) => (
          <div
            key={r.key}
            className="h-full first:rounded-l-full last:rounded-r-full"
            style={{ width: `${(r.value / total) * 100}%`, background: r.color }}
            title={`${r.key}: ${formatNumber(r.value)}`}
          />
        ))}
      </div>

      <ul className="mt-4 space-y-2">
        {rows.map((r) => (
          <li key={r.key} className="flex items-center justify-between gap-3 rounded-2xl bg-wash px-3 py-2.5">
            <div>
              <StatusBadge status={r.key} />
              <p className="mt-1 text-[11px] text-muted">{r.note}</p>
            </div>
            <div className="text-right">
              <p className="text-[17px] font-bold text-ink tabular">{((r.value / total) * 100).toFixed(1)}%</p>
              <p className="text-[11px] text-ink-2 tabular">{formatNumber(r.value)} บิล</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
