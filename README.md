# SME Business Intelligence Dashboard

Dashboard หน้าเดียวสำหรับเจ้าของร้าน SME แสดงภาพรวมธุรกิจจากฐานข้อมูล Supabase

**Live:** https://sme-dashboard-beige.vercel.app

- ยอดขายรวม, จำนวนคำสั่งซื้อ, จำนวนลูกค้า, ยอดเฉลี่ยต่อบิล
- กราฟแนวโน้มยอดขาย (7 วัน / 30 วัน / 12 เดือน / ทั้งหมด) ดูเป็นกราฟหรือตารางได้
- สินค้าขายดี 5 อันดับ
- คำสั่งซื้อล่าสุด 10 รายการ
- รองรับ Desktop / Mobile และ Dark mode

**Stack:** Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · Recharts · Supabase (PostgreSQL) · Vercel

## โครงสร้างโปรเจกต์

```
supabase/              SQL: ตาราง + ข้อมูลตัวอย่าง, views, query ตรวจสอบ (ดู supabase/README.md)
src/lib/supabase.ts    สร้าง Supabase client (ฝั่งเซิร์ฟเวอร์เท่านั้น)
src/lib/dashboard.ts   getDashboardData(): ดึงข้อมูลทั้งหมดจาก 5 views แบบขนาน + cache 1 นาที
src/lib/format.ts      จัดรูปแบบเงินบาท / วันที่ภาษาไทย
src/app/page.tsx       หน้า Dashboard (Server Component)
src/components/        KpiCards, SalesChart (client), TopProducts, RecentOrders, StatusBadge
```

## การทำงานของระบบ

1. ผู้ใช้เปิด URL → Vercel ส่งหน้า HTML ที่ render ไว้แล้ว (เร็ว)
2. `getDashboardData()` ใช้ `'use cache'` + `cacheLife('minutes')` → ข้อมูลถูก cache และรีเฟรชเบื้องหลังทุก ~1 นาที
3. ตอนรีเฟรช เซิร์ฟเวอร์ query 5 views ใน Supabase พร้อมกัน ด้วย anon key (อ่านได้เฉพาะ views)
4. การคำนวณ (รวมยอด, จัดอันดับ, group by วัน/เดือน) ทำใน PostgreSQL views ไม่ได้ทำในเว็บ
5. กราฟเป็น Client Component เพราะต้องโต้ตอบ (สลับช่วงเวลา, hover)

## เริ่มใช้งานในเครื่อง

1. ตั้งค่าฐานข้อมูลตาม `supabase/README.md`
2. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่า `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
3. รัน

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

## Deploy บน Vercel

1. Push ขึ้น GitHub
2. Vercel → Add New Project → Import repo นี้
3. Environment Variables: ใส่ `SUPABASE_URL` และ `SUPABASE_ANON_KEY`
4. Deploy
