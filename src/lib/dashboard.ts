import { cacheLife } from "next/cache";
import { CATEGORY_ORDER } from "./categories";
import { getSupabase } from "./supabase";

export type OrderStatus = "paid" | "pending" | "cancelled";

export type Summary = {
  totalRevenue: number;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalCustomers: number;
  activeCustomers30d: number;
  avgOrderValue: number;
};

/** One point on the sales chart. `date` is YYYY-MM-DD (first day of month for monthly). */
export type SalesPoint = { date: string; orders: number; revenue: number };

export type Product = {
  rank: number;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
};

export type CategoryTotal = { category: string; revenue: number; unitsSold: number };

/** weekday 1 = Monday ... 7 = Sunday, hour 0-23 (Thai time) */
export type HeatCell = { weekday: number; hour: number; orders: number; revenue: number };

export type RecentOrder = {
  orderNo: string;
  status: OrderStatus;
  orderedAt: string;
  customerName: string;
  city: string;
  itemCount: number;
  totalAmount: number;
};

/** Last 30 days vs the 30 days before (paid orders). */
export type PeriodCompare = {
  revenue: number;
  orders: number;
  avgOrderValue: number;
  prevRevenue: number;
  prevOrders: number;
  prevAvgOrderValue: number;
};

export type DashboardData =
  | {
      ok: true;
      generatedAt: string;
      summary: Summary;
      period: PeriodCompare;
      /** last 60 days, gaps filled with 0 */
      daily: SalesPoint[];
      monthly: SalesPoint[];
      topProducts: Product[];
      categories: CategoryTotal[];
      heatmap: HeatCell[];
      recentOrders: RecentOrder[];
    }
  | { ok: false; generatedAt: string; error: string };


const DAILY_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function bangkokToday(): string {
  return new Date(Date.now() + BANGKOK_OFFSET_MS).toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  return new Date(Date.parse(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
}

function fillDays(points: SalesPoint[], from: string, to: string): SalesPoint[] {
  const byDate = new Map(points.map((p) => [p.date, p]));
  const out: SalesPoint[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) {
    out.push(byDate.get(d) ?? { date: d, orders: 0, revenue: 0 });
  }
  return out;
}

function comparePeriods(daily: SalesPoint[]): PeriodCompare {
  const sum = (pts: SalesPoint[]) =>
    pts.reduce((a, p) => ({ revenue: a.revenue + p.revenue, orders: a.orders + p.orders }), {
      revenue: 0,
      orders: 0,
    });
  const cur = sum(daily.slice(-30));
  const prev = sum(daily.slice(-60, -30));
  return {
    revenue: cur.revenue,
    orders: cur.orders,
    avgOrderValue: cur.orders ? cur.revenue / cur.orders : 0,
    prevRevenue: prev.revenue,
    prevOrders: prev.orders,
    prevAvgOrderValue: prev.orders ? prev.revenue / prev.orders : 0,
  };
}

function totalsByCategory(products: Product[]): CategoryTotal[] {
  const map = new Map<string, CategoryTotal>();
  for (const p of products) {
    const t = map.get(p.category) ?? { category: p.category, revenue: 0, unitsSold: 0 };
    t.revenue += p.revenue;
    t.unitsSold += p.unitsSold;
    map.set(p.category, t);
  }
  const order = (c: string) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? CATEGORY_ORDER.length : i;
  };
  return [...map.values()].sort((a, b) => order(a.category) - order(b.category));
}

/**
 * Everything the dashboard needs, in one cached call.
 *
 * 'use cache' + cacheLife('minutes'): the result is prerendered into the page
 * and refreshed in the background at most once a minute, so visitors get a fast
 * page and Supabase gets a handful of queries per minute regardless of traffic.
 */
export async function getDashboardData(): Promise<DashboardData> {
  "use cache";
  cacheLife("minutes");

  const generatedAt = new Date().toISOString();

  try {
    const supabase = getSupabase();
    const today = bangkokToday();
    const since = addDays(today, -(DAILY_DAYS - 1));

    const [summaryRes, dailyRes, monthlyRes, productsRes, heatRes, recentRes] = await Promise.all([
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
        .order("rank"),
      supabase.from("v_sales_heatmap").select("weekday, hour, orders, revenue"),
      supabase
        .from("v_recent_orders")
        .select("order_no, status, ordered_at, customer_name, city, item_count, total_amount")
        .order("ordered_at", { ascending: false })
        .limit(30),
    ]);

    const failed = [summaryRes, dailyRes, monthlyRes, productsRes, heatRes, recentRes].find(
      (r) => r.error,
    );
    if (failed?.error) throw new Error(failed.error.message);

    const s = summaryRes.data!;
    const daily = fillDays(
      dailyRes.data!.map((r) => ({
        date: r.sale_date,
        orders: Number(r.orders),
        revenue: Number(r.revenue),
      })),
      since,
      today,
    );
    const products: Product[] = productsRes.data!.map((r) => ({
      rank: Number(r.rank),
      name: r.name,
      category: r.category,
      unitsSold: Number(r.units_sold),
      revenue: Number(r.revenue),
    }));

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
        activeCustomers30d: Number(s.active_customers_30d ?? 0),
        avgOrderValue: Number(s.avg_order_value ?? 0),
      },
      period: comparePeriods(daily),
      daily,
      monthly: monthlyRes.data!.map((r) => ({
        date: r.sale_month,
        orders: Number(r.orders),
        revenue: Number(r.revenue),
      })),
      topProducts: products.slice(0, 5),
      categories: totalsByCategory(products),
      heatmap: heatRes.data!.map((r) => ({
        weekday: Number(r.weekday),
        hour: Number(r.hour),
        orders: Number(r.orders),
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
