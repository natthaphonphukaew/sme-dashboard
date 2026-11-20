"use client";

import type { CSSProperties } from "react";

/** iOS-style segmented control with a sliding thumb. */
export function Segmented<K extends string>({
  label,
  options,
  value,
  onChange,
  size = "md",
}: {
  label: string;
  options: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
  size?: "sm" | "md";
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.key === value),
  );
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="relative grid rounded-[10px] p-[2px]"
      style={
        {
          gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
          background: "var(--seg-track)",
        } as CSSProperties
      }
    >
      <span
        aria-hidden="true"
        className="absolute top-[2px] bottom-[2px] left-[2px] rounded-[8px] shadow-[0_3px_8px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
        style={{
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
          background: "var(--seg-thumb)",
        }}
      />
      {options.map((o) => {
        const selected = o.key === value;
        return (
          <button
            key={o.key}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.key)}
            className={`relative z-10 whitespace-nowrap rounded-[8px] font-medium transition-colors ${
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-[13px]"
            } ${selected ? "text-ink" : "text-ink-2 hover:text-ink"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
