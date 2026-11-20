"use client";

import { useState } from "react";
import { CATEGORY_ORDER } from "@/lib/categories";
import type { CategoryTotal } from "@/lib/dashboard";
import { formatBaht, formatNumber } from "@/lib/format";
import { AppIcon, Card } from "./Card";
import { IconPie } from "./icons";

/** Color follows the category (fixed slot), never its rank. */
function colorOf(category: string) {
  const i = CATEGORY_ORDER.indexOf(category);
  return `var(--cat-${i === -1 ? 5 : i + 1})`;
}

export function CategoryDonut({ categories }: { categories: CategoryTotal[] }) {
  const [active, setActive] = useState<string | null>(null);
  const total = categories.reduce((s, c) => s + c.revenue, 0) || 1;

  // donut geometry
  const R = 70;
  const r = 48;
  const C = 2 * Math.PI * ((R + r) / 2);
  const stroke = R - r;
  const gap = 2.5; // px gap between segments (surface shows through)
  const segments = categories.reduce<{ c: CategoryTotal; len: number; start: number }[]>(
    (acc, c) => {
      const prev = acc[acc.length - 1];
      acc.push({ c, len: (c.revenue / total) * C, start: prev ? prev.start + prev.len : 0 });
      return acc;
    },
    [],
  );

  const focus = categories.find((c) => c.category === active);

  return (
    <Card
      delay={360}
      icon={
        <AppIcon from="#ff9f6b" to="#ff5e8a">
          <IconPie />
        </AppIcon>
      }
      title="ยอดขายตามหมวดหมู่"
      subtitle="สัดส่วนยอดขายของแต่ละหมวด (บิลที่ชำระแล้ว)"
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row lg:flex-col">
        <div className="relative h-44 w-44 shrink-0">
          <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label="สัดส่วนยอดขายตามหมวดหมู่">
            {segments.map(({ c, len, start }) => (
                <circle
                  key={c.category}
                  cx="80"
                  cy="80"
                  r={(R + r) / 2}
                  fill="none"
                  stroke={colorOf(c.category)}
                  strokeWidth={active === c.category ? stroke + 6 : stroke}
                  strokeDasharray={`${Math.max(len - gap, 0)} ${C}`}
                  strokeDashoffset={-start}
                  className="cursor-pointer transition-[stroke-width,opacity] duration-300"
                  opacity={active && active !== c.category ? 0.35 : 1}
                  onPointerEnter={() => setActive(c.category)}
                  onPointerLeave={() => setActive(null)}
                >
                  <title>{`${c.category}: ${formatBaht(c.revenue)}`}</title>
                </circle>
            ))}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            <div>
              <p className="text-[11px] text-muted">{focus ? focus.category : "รวมทั้งหมด"}</p>
              <p className="text-[17px] font-bold text-ink tabular">
                {formatBaht(focus ? focus.revenue : total)}
              </p>
              {focus && (
                <p className="text-[11px] text-ink-2 tabular">
                  {((focus.revenue / total) * 100).toFixed(1)}%
                </p>
              )}
            </div>
          </div>
        </div>

        <ul className="w-full space-y-1">
          {categories.map((c) => (
            <li key={c.category}>
              <button
                type="button"
                className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition ${
                  active === c.category ? "bg-wash-2" : "hover:bg-wash"
                }`}
                onPointerEnter={() => setActive(c.category)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(c.category)}
                onBlur={() => setActive(null)}
              >
                <span
                  className="h-3 w-3 shrink-0 rounded-[4px]"
                  style={{ background: colorOf(c.category) }}
                  aria-hidden="true"
                />
                <span className="flex-1 whitespace-nowrap text-[14px] font-medium text-ink">{c.category}</span>
                <span className="text-right">
                  <span className="block text-[13px] font-semibold text-ink tabular">
                    {((c.revenue / total) * 100).toFixed(1)}%
                  </span>
                  <span className="block text-[11px] text-muted tabular">
                    {formatBaht(c.revenue)} · {formatNumber(c.unitsSold)} ชิ้น
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
