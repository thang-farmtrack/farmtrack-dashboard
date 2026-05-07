# 🚀 Hướng dẫn Deploy FarmTrack Dashboard lên Railway

## Bước 2: Push lên GitHub

```bash
# Vào thư mục dashboard
cd farmtrack_dashboard

# Khởi tạo git (nếu chưa có)
git init
git add .
git commit -m "feat: FarmTrack web dashboard v1.0"

# Tạo repo mới trên GitHub: farmtrack-dashboard
# Sau đó:
git remote add origin https://github.com/thang-farmtrack/farmtrack-dashboard.git
git branch -M main
git push -u origin main
```

## Bước 3: Deploy Railway

### 3.1 Tạo service mới
1. Vào https://railway.app/project/03371853-fac5-489e-9263-497df615eafc
2. Click **"New Service"** → **"GitHub Repo"**
3. Chọn repo `farmtrack-dashboard`
4. Railway tự detect `Dockerfile` → tự build

### 3.2 Thêm biến môi trường
Vào tab **Variables** của service vừa tạo, thêm:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://farmtrack-api-production-2e37.up.railway.app` |
| `NODE_ENV` | `production` |

### 3.3 Cấu hình Domain
- Vào tab **Settings** → **Networking**
- Click **"Generate Domain"** → sẽ được URL dạng `farmtrack-dashboard-xxx.up.railway.app`

### 3.4 Kiểm tra deploy
Sau ~3 phút build xong, mở URL và:
- [ ] Trang login hiển thị đúng
- [ ] Đăng nhập được (dùng tài khoản admin)
- [ ] Dashboard load KPI
- [ ] Switch VI ↔ JP hoạt động

## Cấu trúc Railway project cuối cùng

```
Railway Project: FarmTrack
├── farmtrack-api       ← Backend (đã có)
└── farmtrack-dashboard ← Frontend (vừa tạo)
```

## Lưu ý CORS
Nếu API báo lỗi CORS, cần thêm vào backend (farmtrack-api):
```
ALLOWED_ORIGINS=https://farmtrack-dashboard-xxx.up.railway.app
```
