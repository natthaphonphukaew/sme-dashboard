import type { ReactNode } from "react";
import type { OrderStatus } from "@/lib/dashboard";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  paid: "ชำระแล้ว",
  pending: "รอชำระ",
  cancelled: "ยกเลิก",
};

const STATUS: Record<OrderStatus, { color: string; bg: string; icon: ReactNode }> = {
  paid: {
    color: "var(--good)",
    bg: "rgba(12,163,12,0.12)",
    icon: <path d="M3.5 8.5l3 3 6-7" />,
  },
  pending: {
    color: "var(--warning)",
    bg: "rgba(250,178,25,0.16)",
    icon: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <path d="M8 5v3.2l2 1.3" />
      </>
    ),
  },
  cancelled: {
    color: "var(--critical)",
    bg: "rgba(208,59,59,0.12)",
    icon: <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />,
  },
};

/** Status is shown as icon + text label; color is only a secondary cue. */
export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = STATUS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium text-ink"
      style={{ background: s.bg }}
    >
      <svg
        viewBox="0 0 16 16"
        width="13"
        height="13"
        fill="none"
        stroke={s.color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {s.icon}
      </svg>
      {STATUS_LABEL[status]}
    </span>
  );
}
