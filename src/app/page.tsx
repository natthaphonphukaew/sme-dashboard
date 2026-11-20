import type { CSSProperties } from "react";
import { getDashboardData } from "@/lib/dashboard";
import { formatBaht, formatDayLong, formatNumber } from "@/lib/format";
import { Card } from "@/components/Card";
import { CategoryDonut } from "@/components/CategoryDonut";
import { KpiCards } from "@/components/KpiCards";
import { OrderStatus } from "@/components/OrderStatus";
import { PeakHours } from "@/components/PeakHours";
import { RecentOrders } from "@/components/RecentOrders";
import { SalesChart } from "@/components/SalesChart";
import { TopBar } from "@/components/TopBar";
import { TopProducts } from "@/components/TopProducts";

function greeting(iso: string) {
  const h = (new Date(iso).getUTCHours() + 7) % 24; // Thai time
  if (h < 12) return "สวัสดีตอนเช้า";
  if (h < 17) return "สวัสดีตอนบ่าย";
  return "สวัสดีตอนเย็น";
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const today = data.ok ? data.daily[data.daily.length - 1] : null;

  return (
    <>
      <TopBar generatedAt={data.generatedAt} />

      <main className="mx-auto w-full max-w-[1400px] px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
        {/* Hero */}
        <header className="rise mb-6 sm:mb-8" style={{ "--d": "0ms" } as CSSProperties}>
          <p className="text-[15px] font-medium text-ink-2">{greeting(data.generatedAt)} 👋</p>
          <h1 className="mt-1 bg-clip-text text-[34px] font-bold leading-tight tracking-tight text-transparent sm:text-[44px]"
            style={{ backgroundImage: "linear-gradient(100deg, var(--ink) 30%, var(--series) 70%, #b07bff)" }}
          >
            ภาพรวมธุรกิจ
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px]">
            {today && (
              <span className="glass-strong inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-ink">
                <span className="live-dot inline-block h-2 w-2 rounded-full bg-good" aria-hidden="true" />
                วันนี้ขายได้ <span className="font-bold tabular">{formatBaht(today.revenue)}</span>
                <span className="text-muted">· {formatNumber(today.orders)} บิล</span>
              </span>
            )}
            {today && (
              <span className="glass-strong rounded-full px-3.5 py-1.5 text-ink-2">{formatDayLong(today.date)}</span>
            )}
          </div>
        </header>

        {data.ok ? (
          <div className="space-y-4 sm:space-y-5">
            <KpiCards summary={data.summary} period={data.period} daily={data.daily} />

            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <SalesChart daily={data.daily} monthly={data.monthly} />
              </div>
              <CategoryDonut categories={data.categories} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <PeakHours cells={data.heatmap} />
              </div>
              <TopProducts products={data.topProducts} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3">
              <div className="min-w-0 lg:col-span-2">
                <RecentOrders orders={data.recentOrders} />
              </div>
              <OrderStatus summary={data.summary} />
            </div>
          </div>
        ) : (
          <Card title="เชื่อมต่อฐานข้อมูลไม่สำเร็จ">
            <p className="text-sm text-ink-2">
              ไม่สามารถดึงข้อมูลจาก Supabase ได้ ระบบจะลองใหม่อัตโนมัติภายใน 1 นาที
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-wash p-3 text-xs text-ink-2">{data.error}</pre>
            <p className="mt-3 text-sm text-muted">
              ตรวจสอบ SUPABASE_URL และ SUPABASE_ANON_KEY ใน Environment Variables และตรวจว่ารัน
              supabase/02_views.sql แล้ว
            </p>
          </Card>
        )}

        <footer className="mt-10 text-center text-[12px] text-muted">
          ข้อมูลจาก Supabase · ยอดขายนับเฉพาะบิลที่ชำระแล้ว · รีเฟรชอัตโนมัติทุก 1 นาที
        </footer>
      </main>
    </>
  );
}
