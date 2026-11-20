"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { formatTime } from "@/lib/format";
import { IconMoon, IconRefresh, IconSun } from "./icons";

const AUTO_REFRESH_MS = 60_000;

/**
 * Sticky glass navigation bar:
 * - live indicator + last-updated time
 * - manual refresh, plus auto refresh every 60 s and when the tab regains focus
 * - light / dark toggle (saved in localStorage)
 */
export function TopBar({ generatedAt }: { generatedAt: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const refresh = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, AUTO_REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  return (
    <div className="sticky top-0 z-30 px-3 pt-3 sm:px-6">
      <nav className="glass-strong mx-auto flex max-w-[1400px] items-center justify-between gap-3 rounded-[22px] px-3 py-2.5 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            style={{ background: "linear-gradient(145deg,#5b8cff,#b07bff 55%,#ff7eb3)" }}
            aria-hidden="true"
          >
            S
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[15px] font-semibold text-ink">SME Dashboard</p>
            <p className="flex items-center gap-1.5 text-[11px] text-muted">
              <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-good" aria-hidden="true" />
              <span>
                Live · อัปเดต <time dateTime={generatedAt}>{formatTime(generatedAt)}</time> น.
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={refresh}
            disabled={pending}
            className="grid h-9 w-9 place-items-center rounded-full text-ink-2 transition hover:bg-wash hover:text-ink disabled:opacity-60"
            aria-label="รีเฟรชข้อมูล"
            title="รีเฟรชข้อมูล"
          >
            <IconRefresh className={pending ? "spin" : ""} />
          </button>
          <ThemeToggle />
        </div>
      </nav>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    const read = () => {
      const t = document.documentElement.dataset.theme;
      setDark(t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    };
    read();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode – ignore */
    }
    setDark(!dark);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid h-9 w-9 place-items-center rounded-full text-ink-2 transition hover:bg-wash hover:text-ink"
      aria-label={dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
      title={dark ? "โหมดสว่าง" : "โหมดมืด"}
    >
      {dark ? <IconSun /> : <IconMoon />}
    </button>
  );
}
