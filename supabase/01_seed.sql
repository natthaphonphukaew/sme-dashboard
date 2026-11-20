-- Raw seed only. Re-runnable. Expect roughly 500 / 37 / 8000 / ~20000 rows.
-- Copied from ../mock_data.sql with one fix (see "FIX" in order_items insert).
-- Note: historical orders span 2025-05-01 + 0..569 days, so a few land slightly after "today";
-- the dashboard views in 02_views.sql filter with ordered_at <= now() to ignore them.
-- After running this file, run 02_views.sql (dropping tables with cascade also drops the views).
drop view if exists v_sales_monthly;
drop view if exists v_recent_orders;
drop view if exists v_top_products;
drop view if exists v_sales_daily;
drop view if exists v_dashboard_summary;
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists products cascade;
drop table if exists customers cascade;

create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text not null,
  city text not null,
  created_at timestamptz not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text not null,
  unit_price numeric(10,2) not null check (unit_price > 0)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer_id uuid not null references customers(id),
  status text not null check (status in ('paid', 'pending', 'cancelled')),
  ordered_at timestamptz not null
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price > 0),
  unique (order_id, product_id)
);

insert into products (name, category, unit_price) values
  ('อเมริกาโน่ร้อน', 'กาแฟ', 55),
  ('อเมริกาโน่เย็น', 'กาแฟ', 60),
  ('ลาเต้ร้อน', 'กาแฟ', 70),
  ('ลาเต้เย็น', 'กาแฟ', 75),
  ('คาปูชิโน่', 'กาแฟ', 70),
  ('มอคค่า', 'กาแฟ', 80),
  ('เอสเปรสโซ', 'กาแฟ', 45),
  ('อเมริกาโน่ส้ม', 'กาแฟ', 75),
  ('คาราเมลมัคคิอาโต', 'กาแฟ', 85),
  ('เฟลตไวท์', 'กาแฟ', 80),
  ('ชาไทย', 'ชา', 50),
  ('ชาเขียวนม', 'ชา', 55),
  ('ชามะนาว', 'ชา', 45),
  ('ชาดำเย็น', 'ชา', 40),
  ('มัทฉะลาเต้', 'ชา', 85),
  ('ชาพีช', 'ชา', 65),
  ('โกโก้', 'เครื่องดื่ม', 60),
  ('นมสด', 'เครื่องดื่ม', 40),
  ('น้ำส้มคั้น', 'เครื่องดื่ม', 45),
  ('น้ำผึ้งมะนาว', 'เครื่องดื่ม', 50),
  ('สมูทตี้มะม่วง', 'เครื่องดื่ม', 75),
  ('โซดาลิ้นจี่', 'เครื่องดื่ม', 55),
  ('ครัวซองต์เนย', 'เบเกอรี่', 65),
  ('ครัวซองต์อัลมอนด์', 'เบเกอรี่', 75),
  ('เค้กช็อกโกแลต', 'เบเกอรี่', 95),
  ('ชีสเค้ก', 'เบเกอรี่', 110),
  ('คุกกี้ช็อกชิป', 'เบเกอรี่', 40),
  ('บราวนี่', 'เบเกอรี่', 70),
  ('มาการอง', 'เบเกอรี่', 45),
  ('บันเนยสด', 'เบเกอรี่', 35),
  ('เค้กกล้วยหอม', 'เบเกอรี่', 85),
  ('มัฟฟินบลูเบอร์รี่', 'เบเกอรี่', 55),
  ('แซนด์วิชไก่', 'อาหาร', 89),
  ('แซนด์วิชทูน่า', 'อาหาร', 89),
  ('โทสต์หน้าแฮม', 'อาหาร', 79),
  ('ข้าวผัดอเมริกัน', 'อาหาร', 95),
  ('สลัดไก่ย่าง', 'อาหาร', 120);

insert into customers (full_name, email, phone, city, created_at)
select
  first_name || ' ' || last_name,
  'customer' || lpad(n::text, 4, '0') || '@mail.test',
  (array['06','08','09'])[1 + (n % 3)] || lpad((10000000 + n * 97)::text, 8, '0'),
  (array['กรุงเทพมหานคร','นนทบุรี','ปทุมธานี','เชียงใหม่','ชลบุรี','ขอนแก่น','ภูเก็ต','สงขลา','นครราชสีมา','พิษณุโลก'])[1 + (n % 10)],
  timestamptz '2025-04-01 09:00+07' + ((n % 25) || ' days')::interval
from (
  select
    row_number() over () as n,
    (array[
      'สมชาย','สมหญิง','วิชัย','สุดา','ประเสริฐ','มานี','ชัยวัฒน์','พิมพ์ใจ','อนันต์','กมลา',
      'ธนา','ศิริพร','ภาณุ','นภา','เกียรติ','อรุณ','ปิยะ','วรรณา','สุรชัย','ชนิดา',
      'กิตติ','มาลี','วรพล','ขวัญใจ','อดิศร'
    ])[f + 1] as first_name,
    (array[
      'ใจดี','รุ่งเรือง','ศรีสุข','ทองคำ','บุญมา','วงศ์สุวรรณ','พงษ์ไทย','แสงจันทร์','ชัยชนะ','มั่งมี',
      'ตั้งตรง','แก้วใส','อินทร','โพธิ์งาม','หาญกล้า','เจริญผล','สุนทร','วัฒนา','ประดิษฐ์','อุดม'
    ])[l + 1] as last_name
  from generate_series(0, 24) as f
  cross join generate_series(0, 19) as l
) people;

insert into orders (order_no, customer_id, status, ordered_at)
select
  'ORD-' || lpad(g.i::text, 6, '0'),
  c.id,
  case mod(mod(hashtext('st' || g.i::text)::bigint, 20) + 20, 20)
    when 0 then 'cancelled'
    when 1 then 'cancelled'
    when 2 then 'pending'
    when 3 then 'pending'
    else 'paid'
  end,
  case
    when g.i <= 40 then now() - (g.i * interval '15 minutes')
    else timestamptz '2025-05-01 08:00+07'
      + (mod(mod(hashtext('day' || g.i::text)::bigint, 570) + 570, 570) || ' days')::interval
      + ((7 + mod(mod(hashtext('hr' || g.i::text)::bigint, 14) + 14, 14)) || ' hours')::interval
      + (mod(mod(hashtext('min' || g.i::text)::bigint, 60) + 60, 60) || ' minutes')::interval
  end
from generate_series(1, 8000) as g(i)
join (
  select id, row_number() over (order by email) - 1 as n
  from customers
) c
  on c.n = case
    when mod(mod(hashtext('cu' || g.i::text)::bigint, 10) + 10, 10) < 6
      then mod(mod(hashtext('c1' || g.i::text)::bigint, 150) + 150, 150)
    else 150 + mod(mod(hashtext('c2' || g.i::text)::bigint, 350) + 350, 350)
  end;

insert into order_items (order_id, product_id, quantity, unit_price)
select o.id, picked.id, picked.qty, picked.unit_price
from orders o
cross join lateral (
  select
    p.id,
    p.unit_price,
    1 + mod(mod(hashtext(o.order_no || p.name)::bigint, 3) + 3, 3) as qty
  from products p
  join (values
    ('อเมริกาโน่ร้อน', 14),
    ('อเมริกาโน่เย็น', 16),
    ('ลาเต้ร้อน', 10),
    ('ลาเต้เย็น', 12),
    ('คาปูชิโน่', 7),
    ('มอคค่า', 6),
    ('เอสเปรสโซ', 3),
    ('อเมริกาโน่ส้ม', 4),
    ('คาราเมลมัคคิอาโต', 5),
    ('เฟลตไวท์', 4),
    ('ชาไทย', 11),
    ('ชาเขียวนม', 8),
    ('ชามะนาว', 6),
    ('ชาดำเย็น', 3),
    ('มัทฉะลาเต้', 7),
    ('ชาพีช', 4),
    ('โกโก้', 6),
    ('นมสด', 3),
    ('น้ำส้มคั้น', 4),
    ('น้ำผึ้งมะนาว', 3),
    ('สมูทตี้มะม่วง', 4),
    ('โซดาลิ้นจี่', 3),
    ('ครัวซองต์เนย', 9),
    ('ครัวซองต์อัลมอนด์', 5),
    ('เค้กช็อกโกแลต', 7),
    ('ชีสเค้ก', 5),
    ('คุกกี้ช็อกชิป', 4),
    ('บราวนี่', 5),
    ('มาการอง', 2),
    ('บันเนยสด', 4),
    ('เค้กกล้วยหอม', 3),
    ('มัฟฟินบลูเบอร์รี่', 3),
    ('แซนด์วิชไก่', 6),
    ('แซนด์วิชทูน่า', 3),
    ('โทสต์หน้าแฮม', 4),
    ('ข้าวผัดอเมริกัน', 3),
    ('สลัดไก่ย่าง', 2)
  ) as w(name, weight) on w.name = p.name
  -- FIX: weighted random sampling (Efraimidis–Spirakis): key = ln(u) / weight, keep the LARGEST keys.
  -- Original was "-ln(u) / weight desc", which favoured LOW-weight products (inverted popularity).
  order by ln(
    0.000001
    + mod(mod(hashtext(o.order_no || p.name)::bigint, 1000000) + 1000000, 1000000)::numeric / 1000000
  ) / w.weight desc
  limit 1 + mod(mod(hashtext(o.order_no)::bigint, 4) + 4, 4)
) picked;

create index orders_ordered_at_idx on orders (ordered_at desc);
create index orders_customer_id_idx on orders (customer_id);
create index orders_status_idx on orders (status);
create index order_items_order_id_idx on order_items (order_id);
create index order_items_product_id_idx on order_items (product_id);