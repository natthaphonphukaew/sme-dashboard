"use client";

import { useEffect, useState } from "react";
import { formatBaht, formatNumber } from "@/lib/format";

/**
 * Number that counts up once when the page first loads.
 * Server HTML (and reduced-motion users) get the final value directly;
 * later data refreshes just swap the number without re-animating.
 */
export function CountUp({
  value,
  kind = "number",
  duration = 1100,
}: {
  value: number;
  kind?: "number" | "baht";
  duration?: number;
}) {
  const [progress, setProgress] = useState<number | null>(null); // null = not animating

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setProgress(t < 1 ? 1 - Math.pow(1 - t, 4) : null);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  const shown = Math.round(progress === null ? value : value * progress);
  return <>{kind === "baht" ? formatBaht(shown) : formatNumber(shown)}</>;
}
