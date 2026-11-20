-- =====================================================================
-- Verification queries – run each block separately in Supabase SQL Editor
-- (select the block, then Run) after 01_seed.sql and 02_views.sql.
-- =====================================================================

-- [A] Row counts. Expect: 500 / 37 / 8000 / ~20000
select
  (select count(*) from customers)   as customers,
  (select count(*) from products)    as products,
  (select count(*) from orders)      as orders,
  (select count(*) from order_items) as order_items;

-- [B] KPI cards (1 row). total_orders may be slightly < 8000 because future-dated rows are excluded.
select * from v_dashboard_summary;

-- [C] How many seed orders are in the future right now (excluded by the views)
select count(*) as future_orders, max(ordered_at) as latest from orders where ordered_at > now();

-- [D] Top 5. After the seed fix this should be dominated by popular coffee
--     (e.g. อเมริกาโน่เย็น, ลาเต้เย็น, อเมริกาโน่ร้อน) – NOT มาการอง / สลัดไก่ย่าง.
select * from v_top_products order by rank limit 5;

-- [E] Popularity sanity check: units sold should rise with the seed weight.
select name, units_sold from v_top_products order by units_sold desc;

-- [F] Recent orders: first rows should be within the last few hours (the 40 "now()" orders).
select order_no, status, ordered_at, customer_name, total_amount
from v_recent_orders order by ordered_at desc limit 10;

-- [G] Trend data
select * from v_sales_monthly order by sale_month;
select * from v_sales_daily order by sale_date desc limit 30;

-- [H] Security check – run this block ON ITS OWN.
--     The first select must FAIL with "permission denied for table customers".
--     Then run the second block to confirm the views still work for anon.
set role anon;
select * from customers limit 1;
-- reset role;

-- [H2]
set role anon;
select * from v_dashboard_summary;
reset role;
