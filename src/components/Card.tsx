import type { CSSProperties, ReactNode } from "react";

/** Frosted-glass card used by every widget. `delay` staggers the entrance animation. */
export function Card({
  title,
  subtitle,
  icon,
  action,
  children,
  className = "",
  delay = 0,
}: {
  title?: string;
  subtitle?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <section
      className={`glass rise rounded-[28px] p-4 sm:p-6 ${className}`}
      style={{ "--d": `${delay}ms` } as CSSProperties}
    >
      {(title || action) && (
        <header className="relative mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {icon}
            <div className="min-w-0">
              {title && (
                <h2 className="text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
              )}
              {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className="relative">{children}</div>
    </section>
  );
}

/** iOS app-icon style squircle with a gradient fill. */
export function AppIcon({ from, to, children }: { from: string; to: string; children: ReactNode }) {
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_4px_12px_-4px_rgba(0,0,0,0.35)]"
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}
