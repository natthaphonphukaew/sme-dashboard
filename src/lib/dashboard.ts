import { cacheLife } from "next/cache";
import { getSupabase } from "./supabase";

export type OrderStatus = "paid" | "pending" | "cancelled";

export type Summary = {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
};

/** One point on the sales chart. `date` is YYYY-MM-DD (first day of month for monthly). */
export type SalesPoint = { date: string; orders: number; revenue: number };

export type TopProduct = {
  rank: number;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
};

export type RecentOrder = {
  orderNo: string;
  status: OrderStatus;
  orderedAt: string;
  customerName: string;
  city: string;
  itemCount: number;
  totalAmount: number;
};

export type DashboardData =
  | {
      ok: true;
      generatedAt: string;
      summary: Summary;
      daily: SalesPoint[];
      monthly: SalesPoint[];
      topProducts: TopProduct[];
      recentOrders: RecentOrder[];
    }
  | { ok: false; generatedAt: string; error: string };

const DAILY_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

/** Today's date in Thailand as YYYY-MM-DD. */
function bangkokToday(): string {
  return new Date(Date.now() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  return new Date(Date.parse(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Days with no paid orders are missing from the view; fill them with 0 so the chart has no gaps. */
function fillDays(points: SalesPoint[], from: string, to: string): SalesPoint[] {
  const byDate = new Map(points.map((p) => [p.date, p]));
  const out: SalesPoint[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    out.push(byDate.get(d) ?? { date: d, orders: 0, revenue: 0 });
  }
  return out;
}

/**
 * Everything the dashboard needs, in one cached call.
 *
 * 'use cache' + cacheLife('minutes'): the result is prerendered into the page
 * and refreshed in the background at most once a minute, so visitors get a fast
 * page and Supabase gets at most ~5 queries per minute regardless of traffic.
 */
export async function getDashboardData(): Promise<DashboardData> {
  "use cache";
  cacheLife("minutes");

  const generatedAt = new Date().toISOString();

  try {
    const supabase = getSupabase();
    const today = bangkokToday();
    const since = addDays(today, -(DAILY_DAYS - 1));

    const [summaryRes, dailyRes, monthlyRes, topRes, recentRes] = await Promise.all([
      supabase.from("v_dashboard_summary").select("*").single(),
      supabase
        .from("v_sales_daily")
        .select("sale_date, orders, revenue")
        .gte("sale_date", since)
        .order("sale_date"),
      supabase.from("v_sales_monthly").select("sale_month, orders, revenue").order("sale_month"),
      supabase
        .from("v_top_products")
        .select("rank, name, category, units_sold, revenue")
        .order("rank")
        .limit(5),
      supabase
        .from("v_recent_orders")
        .select("order_no, status, ordered_at, customer_name, city, item_count, total_amount")
        .order("ordered_at", { ascending: false })
        .limit(10),
    ]);

    const failed = [summaryRes, dailyRes, monthlyRes, topRes, recentRes].find((r) => r.error);
    if (failed?.error) throw new Error(failed.error.message);

    const s = summaryRes.data!;
    return {
      ok: true,
      generatedAt,
      summary: {
        totalRevenue: Number(s.total_revenue),
        totalOrders: Number(s.total_orders),
        paidOrders: Number(s.paid_orders),
        pendingOrders: Number(s.pending_orders),
        cancelledOrders: Number(s.cancelled_orders),
        totalCustomers: Number(s.total_customers),
        avgOrderValue: Number(s.avg_order_value ?? 0),
      },
      daily: fillDays(
        dailyRes.data!.map((r) => ({
          date: r.sale_date,
          orders: Number(r.orders),
          revenue: Number(r.revenue),
        })),
        since,
        today,
      ),
      monthly: monthlyRes.data!.map((r) => ({
        date: r.sale_month,
        orders: Number(r.orders),
        revenue: Number(r.revenue),
      })),
      topProducts: topRes.data!.map((r) => ({
        rank: Number(r.rank),
        name: r.name,
        category: r.category,
        unitsSold: Number(r.units_sold),
        revenue: Number(r.revenue),
      })),
      recentOrders: recentRes.data!.map((r) => ({
        orderNo: r.order_no,
        status: r.status as OrderStatus,
        orderedAt: r.ordered_at,
        customerName: r.customer_name,
        city: r.city,
        itemCount: Number(r.item_count),
        totalAmount: Number(r.total_amount),
      })),
    };
  } catch (e) {
    return {
      ok: false,
      generatedAt,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
