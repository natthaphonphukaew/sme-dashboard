import type { ReactNode } from "react";
import type { Summary } from "@/lib/dashboard";
import { formatBaht, formatNumber } from "@/lib/format";

function Kpi({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <p className="text-sm font-medium text-ink-2">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{value}</p>
      <p className="mt-1.5 text-sm text-muted">{note}</p>
    </div>
  );
}

export function KpiCards({ summary }: { summary: Summary }) {
  const s = summary;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <Kpi
        label="ยอดขายรวม"
        value={formatBaht(s.totalRevenue)}
        note={`จาก ${formatNumber(s.paidOrders)} บิลที่ชำระแล้ว`}
      />
      <Kpi
        label="คำสั่งซื้อทั้งหมด"
        value={formatNumber(s.totalOrders)}
        note={
          <>
            ชำระแล้ว {formatNumber(s.paidOrders)} · รอชำระ {formatNumber(s.pendingOrders)} · ยกเลิก{" "}
            {formatNumber(s.cancelledOrders)}
          </>
        }
      />
      <Kpi
        label="ลูกค้าทั้งหมด"
        value={formatNumber(s.totalCustomers)}
        note="ลูกค้าที่ลงทะเบียนในระบบ"
      />
      <Kpi
        label="ยอดเฉลี่ยต่อบิล"
        value={formatBaht(s.avgOrderValue)}
        note="ยอดขายรวม ÷ บิลที่ชำระแล้ว"
      />
    </div>
  );
}
