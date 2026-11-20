-- =====================================================================
-- SME Dashboard: read-only views + access control
-- Run AFTER 01_seed.sql. Re-runnable.
--
-- Business rules (keep these consistent everywhere):
--   * Revenue   = sum(order_items.quantity * order_items.unit_price) of PAID orders only.
--                 (unit_price on order_items is the price at time of sale, not products.unit_price)
--   * Orders    = all orders regardless of status (breakdown by status is also provided).
--   * Customers = all rows in customers.
--   * Only orders with ordered_at <= now() are counted (seed contains a few future-dated rows).
--   * Dates are grouped in Thailand time (Asia/Bangkok).
--
-- Security model:
--   * RLS is ON for all base tables and anon/authenticated have no grants on them,
--     so the public anon key can NOT read raw rows (e.g. customer email / phone).
--   * The dashboard reads ONLY these views. Views run with the owner's rights
--     (Supabase linter will show "Security Definer View" – this is intentional:
--     the views expose aggregated / non-sensitive columns only).
-- =====================================================================

drop view if exists v_dashboard_summary;
drop view if exists v_sales_daily;
drop view if exists v_sales_monthly;
drop view if exists v_top_products;
drop view if exists v_recent_orders;

-- ---------------------------------------------------------------------
-- 1-3) KPI cards: Total Revenue / Total Orders / Total Customers (1 row)
-- ---------------------------------------------------------------------
create view v_dashboard_summary as
with valid_orders as (
  select id, status
  from orders
  where ordered_at <= now()
),
paid_revenue as (
  select coalesce(sum(oi.quantity * oi.unit_price), 0)::numeric(14,2) as total_revenue
  from order_items oi
  join valid_orders o on o.id = oi.order_id
  where o.status = 'paid'
)
select
  r.total_revenue,
  (select count(*) from valid_orders)                          as total_orders,
  (select count(*) from valid_orders where status = 'paid')      as paid_orders,
  (select count(*) from valid_orders where status = 'pending')   as pending_orders,
  (select count(*) from valid_orders where status = 'cancelled') as cancelled_orders,
  (select count(*) from customers)                             as total_customers,
  round(
    r.total_revenue / nullif((select count(*) from valid_orders where status = 'paid'), 0),
    2
  ) as avg_order_value
from paid_revenue r;

-- ---------------------------------------------------------------------
-- 4) Sales Analytics: daily trend (for 7 / 30 day ranges)
-- ---------------------------------------------------------------------
create view v_sales_daily as
select
  (o.ordered_at at time zone 'Asia/Bangkok')::date          as sale_date,
  count(distinct o.id)                                      as orders,
  sum(oi.quantity)                                          as units_sold,
  sum(oi.quantity * oi.unit_price)::numeric(14,2)           as revenue
from orders o
join order_items oi on oi.order_id = o.id
where o.status = 'paid'
  and o.ordered_at <= now()
group by 1;

-- 4) Sales Analytics: monthly trend (for 12 month / all-time ranges)
create view v_sales_monthly as
select
  date_trunc('month', o.ordered_at at time zone 'Asia/Bangkok')::date as sale_month,
  count(distinct o.id)                                               as orders,
  sum(oi.quantity)                                                   as units_sold,
  sum(oi.quantity * oi.unit_price)::numeric(14,2)                    as revenue
from orders o
join order_items oi on oi.order_id = o.id
where o.status = 'paid'
  and o.ordered_at <= now()
group by 1;

-- ---------------------------------------------------------------------
-- 5) Top Products: every product ranked by revenue (frontend takes top 5)
-- ---------------------------------------------------------------------
create view v_top_products as
select
  rank() over (order by sum(oi.quantity * oi.unit_price) desc) as rank,
  p.id                                                         as product_id,
  p.name,
  p.category,
  sum(oi.quantity)                                             as units_sold,
  count(distinct o.id)                                         as order_count,
  sum(oi.quantity * oi.unit_price)::numeric(14,2)              as revenue
from order_items oi
join orders o   on o.id = oi.order_id
join products p on p.id = oi.product_id
where o.status = 'paid'
  and o.ordered_at <= now()
group by p.id, p.name, p.category;

-- ---------------------------------------------------------------------
-- 6) Recent Orders: newest first, with customer name and order total.
--    LATERAL subquery so ".order(ordered_at desc).limit(10)" can use
--    orders_ordered_at_idx instead of aggregating every order first.
--    Exposes customer name + city only (no email / phone).
-- ---------------------------------------------------------------------
create view v_recent_orders as
select
  o.id,
  o.order_no,
  o.status,
  o.ordered_at,
  c.full_name   as customer_name,
  c.city,
  t.item_count,
  t.total_qty,
  t.total_amount
from orders o
join customers c on c.id = o.customer_id
cross join lateral (
  select
    count(*)                                         as item_count,
    coalesce(sum(oi.quantity), 0)                    as total_qty,
    coalesce(sum(oi.quantity * oi.unit_price), 0)::numeric(14,2) as total_amount
  from order_items oi
  where oi.order_id = o.id
) t
where o.ordered_at <= now();

-- ---------------------------------------------------------------------
-- Access control
-- ---------------------------------------------------------------------
alter table customers   enable row level security;
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- No policies on base tables => anon/authenticated see nothing even if granted.
-- Also revoke the default grants so direct table access fails loudly.
revoke all on table customers, products, orders, order_items from anon, authenticated;

-- Dashboard (anon key) may only SELECT from the views.
grant select on
  v_dashboard_summary,
  v_sales_daily,
  v_sales_monthly,
  v_top_products,
  v_recent_orders
to anon, authenticated;
