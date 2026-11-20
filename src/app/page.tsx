import { getDashboardData } from "@/lib/dashboard";
import { formatDateTime } from "@/lib/format";
import { Card } from "@/components/Card";
import { KpiCards } from "@/components/KpiCards";
import { RecentOrders } from "@/components/RecentOrders";
import { SalesChart } from "@/components/SalesChart";
import { TopProducts } from "@/components/TopProducts";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-muted">SME Business Intelligence</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            ภาพรวมธุรกิจ
          </h1>
        </div>
        <p className="text-sm text-muted">
          อัปเดตล่าสุด <time dateTime={data.generatedAt}>{formatDateTime(data.generatedAt)}</time>
        </p>
      </header>

      {data.ok ? (
        <div className="space-y-4 sm:space-y-6">
          <KpiCards summary={data.summary} />

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="min-w-0 lg:col-span-2">
              <SalesChart daily={data.daily} monthly={data.monthly} />
            </div>
            <TopProducts products={data.topProducts} />
          </div>

          <RecentOrders orders={data.recentOrders} />
        </div>
      ) : (
        <Card title="เชื่อมต่อฐานข้อมูลไม่สำเร็จ">
          <p className="text-sm text-ink-2">
            ไม่สามารถดึงข้อมูลจาก Supabase ได้ ระบบจะลองใหม่อัตโนมัติภายใน 1 นาที
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-wash p-3 text-xs text-ink-2">
            {data.error}
          </pre>
          <p className="mt-3 text-sm text-muted">
            ตรวจสอบ SUPABASE_URL และ SUPABASE_ANON_KEY ใน Environment Variables และตรวจว่ารัน
            supabase/02_views.sql แล้ว
          </p>
        </Card>
      )}

      <footer className="mt-8 text-center text-xs text-muted">
        ข้อมูลจาก Supabase · ยอดขายนับเฉพาะบิลที่ชำระแล้ว · รีเฟรชข้อมูลทุก 1 นาที
      </footer>
    </main>
  );
}
