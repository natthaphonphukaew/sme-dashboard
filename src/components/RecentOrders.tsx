import type { RecentOrder } from "@/lib/dashboard";
import { formatBaht, formatShortDateTime } from "@/lib/format";
import { Card } from "./Card";
import { StatusBadge } from "./StatusBadge";

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  return (
    <Card title="คำสั่งซื้อล่าสุด" subtitle={`${orders.length} รายการล่าสุด ทุกสถานะ`}>
      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">ยังไม่มีคำสั่งซื้อ</p>
      ) : (
        <>
          {/* Mobile: stacked list */}
          <ul className="divide-y divide-grid md:hidden">
            {orders.map((o) => (
              <li key={o.orderNo} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{o.customerName}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {o.orderNo} · {formatShortDateTime(o.orderedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="tabular text-sm font-semibold text-ink">
                    {formatBaht(o.totalAmount)}
                  </span>
                  <StatusBadge status={o.status} />
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-medium text-muted">
                  <th className="py-2 pr-4 font-medium">เลขที่</th>
                  <th className="py-2 pr-4 font-medium">ลูกค้า</th>
                  <th className="py-2 pr-4 font-medium">จังหวัด</th>
                  <th className="py-2 pr-4 font-medium">เวลา</th>
                  <th className="py-2 pr-4 text-right font-medium">รายการ</th>
                  <th className="py-2 pr-4 font-medium">สถานะ</th>
                  <th className="py-2 text-right font-medium">ยอดรวม</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-grid">
                {orders.map((o) => (
                  <tr key={o.orderNo} className="hover:bg-wash">
                    <td className="tabular py-2.5 pr-4 text-ink-2">{o.orderNo}</td>
                    <td className="py-2.5 pr-4 font-medium text-ink">{o.customerName}</td>
                    <td className="py-2.5 pr-4 text-ink-2">{o.city}</td>
                    <td className="tabular py-2.5 pr-4 whitespace-nowrap text-ink-2">
                      {formatShortDateTime(o.orderedAt)}
                    </td>
                    <td className="tabular py-2.5 pr-4 text-right text-ink-2">{o.itemCount}</td>
                    <td className="py-2.5 pr-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="tabular py-2.5 text-right font-semibold text-ink">
                      {formatBaht(o.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
