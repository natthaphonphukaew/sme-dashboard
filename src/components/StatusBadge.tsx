import type { ReactNode } from "react";
import type { OrderStatus } from "@/lib/dashboard";

const STATUS: Record<OrderStatus, { label: string; color: string; icon: ReactNode }> = {
  paid: {
    label: "ชำระแล้ว",
    color: "var(--good)",
    icon: <path d="M3.5 8.5l3 3 6-7" />,
  },
  pending: {
    label: "รอชำระ",
    color: "var(--warning)",
    icon: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v3.2l2 1.3" />
      </>
    ),
  },
  cancelled: {
    label: "ยกเลิก",
    color: "var(--critical)",
    icon: <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />,
  },
};

/** Status is shown as icon + text label; color is only a secondary cue. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-wash px-2 py-0.5 text-xs font-medium text-ink-2">
      <svg
        viewBox="0 0 16 16"
        width="14"
        height="14"
        fill="none"
        stroke={s.color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {s.icon}
      </svg>
      {s.label}
    </span>
  );
}
