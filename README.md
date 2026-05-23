# FarmTrack Dashboard

Web dashboard cho hệ thống quản lý trang trại gà FarmTrack.

## Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS** — styling
- **Recharts** — biểu đồ
- **Railway** — deployment

## Tính năng
- 🔐 Đăng nhập (JWT)
- 📊 Dashboard KPI (tổng đàn, tỷ lệ sống, trứng, biểu đồ 7 ngày)
- 🐔 Quản lý đàn gà (thêm, xem, lọc)
- 👤 Quản lý người dùng (Admin only)
- 🌐 Đa ngôn ngữ VI / JP

## Chạy local
```bash
npm install
npm run dev
# http://localhost:3000
```

## Deploy Railway
1. Push code lên GitHub repo mới (vd: `farmtrack-dashboard`)
2. Vào Railway → New Project → Deploy from GitHub
3. Chọn repo → Railway tự detect Dockerfile
4. Thêm biến môi trường:
   - `NEXT_PUBLIC_API_URL` = `https://farmtrack-api-production-2e37.up.railway.app`
5. Deploy!

## Cấu trúc
```
app/
  login/        ← trang đăng nhập
  dashboard/    ← KPI + charts
  flocks/       ← quản lý đàn gà
  users/        ← quản lý người dùng
components/
  AppShell.js   ← layout + auth guard
  Sidebar.js    ← thanh menu
lib/
  api.js        ← fetch wrapper → Railway API
  auth.js       ← token helpers
  i18n.js       ← bản dịch VI/JP
```
