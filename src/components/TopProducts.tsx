import type { CSSProperties } from "react";
import type { Product } from "@/lib/dashboard";
import { formatBaht, formatNumber } from "@/lib/format";
import { AppIcon, Card } from "./Card";
import { IconTrophy } from "./icons";

const MEDAL = ["🥇", "🥈", "🥉"];

export function TopProducts({ products }: { products: Product[] }) {
  const max = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <Card
      delay={420}
      icon={
        <AppIcon from="#ffd54d" to="#f59e0b">
          <IconTrophy />
        </AppIcon>
      }
      title="สินค้าขายดี 5 อันดับ"
      subtitle="จัดอันดับตามยอดขาย (บิลที่ชำระแล้ว)"
    >
      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">ยังไม่มีข้อมูลการขาย</p>
      ) : (
        <ol className="space-y-2">
          {products.map((p, i) => (
            <li
              key={p.name}
              className="rise rounded-2xl px-2 py-2 transition hover:bg-wash"
              style={{ "--d": `${480 + i * 70}ms` } as CSSProperties}
              title={`${p.name}: ${formatBaht(p.revenue)} · ${formatNumber(p.unitsSold)} ชิ้น`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-wash-2 text-[15px] font-bold text-ink-2 tabular"
                  aria-label={`อันดับ ${p.rank}`}
                >
                  {MEDAL[i] ?? p.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[14px] font-semibold text-ink">{p.name}</p>
                    <p className="shrink-0 text-[14px] font-semibold text-ink tabular">
                      {formatBaht(p.revenue)}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-wash-2">
                      <div
                        className="h-full rounded-full bg-series"
                        style={{ width: `${(p.revenue / max) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-right text-[11px] text-muted tabular">
                      {p.category} · {formatNumber(p.unitsSold)} ชิ้น
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
