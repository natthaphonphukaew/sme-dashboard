# Supabase – ฐานข้อมูลของ SME Dashboard

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `01_seed.sql` | สร้างตาราง + ข้อมูลตัวอย่าง (คัดลอกจาก `../mock_data.sql` แล้วแก้บั๊กการสุ่มสินค้า) |
| `02_views.sql` | สร้าง view สำหรับ Dashboard + ตั้งค่าสิทธิ์ (RLS) |
| `03_checks.sql` | query สำหรับตรวจว่าทุกอย่างถูกต้อง |

## ขั้นตอนติดตั้ง

1. สมัคร / เข้าสู่ระบบ https://supabase.com → **New project** (Region แนะนำ *Southeast Asia (Singapore)*)
2. เข้า **SQL Editor** → New query → วางเนื้อหา `01_seed.sql` ทั้งไฟล์ → **Run** (ใช้เวลาไม่กี่วินาที)
3. New query → วาง `02_views.sql` → **Run**
4. เปิด `03_checks.sql` แล้วรันทีละบล็อก ตรวจผลตามคอมเมนต์ในไฟล์
5. ไปที่ **Project Settings → API / API Keys** จดค่า 2 ตัวไว้ใส่ใน `.env.local` (และใน Vercel):
   - `Project URL` → `SUPABASE_URL`
   - `anon` หรือ `publishable` key → `SUPABASE_ANON_KEY`
   - ห้ามใช้ `service_role` / `secret` key เด็ดขาด

> ถ้ารัน `01_seed.sql` ซ้ำ ต้องรัน `02_views.sql` ซ้ำด้วย เพราะ `drop table ... cascade` ลบ view ไปด้วย

## โครงสร้างฐานข้อมูล

```
customers 1 ──< orders 1 ──< order_items >── 1 products
```

| ตาราง | คีย์สำคัญ | หมายเหตุ |
|---|---|---|
| `customers` | `id` (uuid) | ชื่อ, email (unique), เบอร์, จังหวัด |
| `products` | `id` (uuid) | ชื่อ (unique), หมวดหมู่, ราคาปัจจุบัน |
| `orders` | `id`, `order_no` (unique), `customer_id` → customers | `status` = paid / pending / cancelled |
| `order_items` | `order_id` → orders, `product_id` → products | `quantity`, `unit_price` = **ราคา ณ ตอนขาย** |

ทำไมเก็บ `unit_price` ซ้ำใน `order_items`: ถ้าวันหน้าร้านขึ้นราคาสินค้าใน `products` ยอดขายย้อนหลังจะได้ไม่เปลี่ยนตาม

## View ที่ Dashboard ใช้

| View | ใช้กับ | คำนวณอะไร |
|---|---|---|
| `v_dashboard_summary` | การ์ด KPI 1–3 | ยอดขายรวม (paid), จำนวนออเดอร์ทั้งหมด + แยกตามสถานะ, จำนวนลูกค้า, ยอดเฉลี่ยต่อบิล |
| `v_sales_daily` | กราฟ 7 / 30 วัน | ยอดขาย paid รายวัน (เวลาไทย) |
| `v_sales_monthly` | กราฟ 12 เดือน | ยอดขาย paid รายเดือน |
| `v_top_products` | Top 5 | จัดอันดับสินค้าตามยอดขาย (หน้าเว็บเอา 5 อันดับแรก) |
| `v_recent_orders` | ออเดอร์ล่าสุด | ออเดอร์ + ชื่อลูกค้า + ยอดรวมบิล เรียงจากใหม่สุด |

**กฎทางธุรกิจ**
- ยอดขาย = `quantity × unit_price` ของออเดอร์ที่ **paid** เท่านั้น (pending ยังไม่ได้เงิน, cancelled ยกเลิก)
- นับเฉพาะออเดอร์ที่ `ordered_at <= now()` (ข้อมูล seed มีบางแถวลงวันที่ในอนาคต)

## ความปลอดภัย

- anon key ถูกฝังในหน้าเว็บ ใครก็เห็นได้ จึงล็อกตารางจริงทั้ง 4 ตาราง (เปิด RLS + revoke สิทธิ์) ทำให้ดึง email/เบอร์ลูกค้าตรงๆ ไม่ได้
- หน้าเว็บอ่านได้เฉพาะ view ซึ่งมีแค่ตัวเลขสรุป ชื่อลูกค้า และจังหวัด
- Supabase จะเตือน *Security Definer View* เพราะ view รันด้วยสิทธิ์เจ้าของ ซึ่งตั้งใจไว้แบบนี้ เพื่อให้ view อ่านตารางที่ถูกล็อกได้ แต่เปิดเผยเฉพาะคอลัมน์ที่ปลอดภัย

## บั๊กที่แก้ใน seed

ในต้นฉบับ การสุ่มสินค้าแบบถ่วงน้ำหนักเขียนเป็น `order by -ln(u) / weight desc` ซึ่งทำให้สินค้าที่ weight **ต่ำ** ถูกเลือกบ่อยกว่า เลยได้ผลกลับด้าน ได้แก้เป็น `ln(u) / weight desc` (วิธี Efraimidis–Spirakis) สินค้ายอดนิยมอย่างอเมริกาโน่เย็นจึงขายได้มากที่สุดตามที่ตั้งใจ
