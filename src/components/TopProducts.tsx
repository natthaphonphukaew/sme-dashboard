import type { TopProduct } from "@/lib/dashboard";
import { formatBaht, formatNumber } from "@/lib/format";
import { Card } from "./Card";

export function TopProducts({ products }: { products: TopProduct[] }) {
  const max = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <Card title="สินค้าขายดี 5 อันดับ" subtitle="จัดอันดับตามยอดขาย (บิลที่ชำระแล้ว)">
      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">ยังไม่มีข้อมูลการขาย</p>
      ) : (
        <ol className="space-y-4">
          {products.map((p) => (
            <li
              key={p.name}
              title={`${p.name}: ${formatBaht(p.revenue)} · ${formatNumber(p.unitsSold)} ชิ้น`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2">
                  <span className="tabular w-4 shrink-0 text-sm font-semibold text-muted">
                    {p.rank}
                  </span>
                  <span className="truncate text-sm font-medium text-ink">{p.name}</span>
                  <span className="hidden shrink-0 text-xs text-muted sm:inline">{p.category}</span>
                </div>
                <span className="tabular shrink-0 text-sm font-semibold text-ink">
                  {formatBaht(p.revenue)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3 pl-6">
                <div className="h-2 flex-1 rounded-full bg-wash">
                  <div
                    className="h-2 rounded-full bg-series"
                    style={{ width: `${(p.revenue / max) * 100}%` }}
                  />
                </div>
                <span className="tabular w-16 shrink-0 text-right text-xs text-muted">
                  {formatNumber(p.unitsSold)} ชิ้น
                </span>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
