# SETUP — Cài đặt môi trường phát triển (Windows · Linux · macOS)

Hướng dẫn này đưa một máy mới từ “vừa clone repo” đến “chạy được web + API + mobile”.
Tổng quan dự án: xem [README.md](README.md).

---

## 1. Yêu cầu phiên bản

| Công cụ | Phiên bản | Bắt buộc cho |
|---|---|---|
| .NET SDK | **9.0** (9.0.3xx) | Backend |
| Node.js | **22 LTS trở lên** (đã test 24) | Frontend, Mobile |
| npm | 10+ (đi kèm Node) | Frontend, Mobile |
| Docker + Compose | Docker Desktop 4.x / Engine 24+ | SQL Server |
| Git | 2.40+ | Tất cả |
| RAM trống | ≥ 4 GB (SQL Server ~1.2 GB) | — |

Kiểm tra nhanh:

```bash
dotnet --version     # 9.x
node --version       # v22.x / v24.x
npm --version        # 10.x+
docker --version
docker compose version
git --version
```

---

## 2. Cài đặt theo hệ điều hành

### 2.1 macOS (Apple Silicon & Intel)

```bash
# Homebrew (nếu chưa có): https://brew.sh
brew install --cask dotnet-sdk
brew install node git
brew install --cask docker        # Docker Desktop
open -a Docker                    # chờ icon Docker trên menu bar hết nhấp nháy
```

- Apple Silicon: image SQL Server 2022 là `linux/amd64`, Docker sẽ chạy qua Rosetta/emulation.
  Lần đầu khởi động chậm (20–40s), RAM ~1.2 GB — bình thường.
- Nếu muốn nhẹ hơn, có thể đổi image sang `mcr.microsoft.com/azure-sql-edge` (có bản arm64),
  nhưng cần chỉnh `docker-compose.yml` và healthcheck.

### 2.2 Windows 10/11

1. **WSL2** (khuyến nghị, để chạy được `run.sh`):

   ```powershell
   wsl --install          # cài Ubuntu mặc định, sau đó khởi động lại máy
   wsl --set-default-version 2
   ```

2. **Docker Desktop**: cài từ https://www.docker.com/products/docker-desktop/
   → Settings → **Resources → WSL Integration** → bật cho distro Ubuntu.
   Kiểm tra trong WSL: `docker --version`.

3. **.NET 9 SDK**: tải “SDK 9.0.x” cho Windows (x64) tại https://dotnet.microsoft.com/download
   hoặc trong WSL:

   ```bash
   wget https://dot.net/v1/dotnet-install.sh -O dotnet-install.sh
   chmod +x dotnet-install.sh && ./dotnet-install.sh --channel 9.0
   ```

4. **Node.js 22 LTS**: tải từ https://nodejs.org (bản LTS) — cài trên Windows hoặc trong WSL.

5. **Git for Windows** (kèm Git Bash): https://git-scm.com/download/win

> ⚠️ `run.sh` dùng `lsof` và `pgrep` — **Git Bash không có** hai lệnh này.
> Trên Windows hãy chạy script trong **WSL2**, hoặc dùng lệnh thủ công ở mục 5.2.

### 2.3 Linux (Ubuntu/Debian)

```bash
# .NET 9 SDK
sudo apt-get update && sudo apt-get install -y wget apt-transport-https
wget https://packages.microsoft.com/config/ubuntu/24.04/packages-microsoft-prod.deb -O /tmp/ms.deb
sudo dpkg -i /tmp/ms.deb && sudo apt-get update
sudo apt-get install -y dotnet-sdk-9.0

# Node.js 22 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git lsof

# Docker Engine + Compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"     # đăng xuất/đăng nhập lại
sudo systemctl enable --now docker
```

- `lsof` là bắt buộc để `run.sh` kiểm tra cổng.
- Máy ảo/CI cần cấp ≥ 4 GB RAM cho container SQL Server.
- Fedora/Arch: cài tương đương (`dotnet-sdk-9.0`, `nodejs`, `docker`, `lsof`, `procps-ng`).

---

## 3. Clone và cấu hình

```bash
git clone https://github.com/buidi2004/web-technology-and-project-management.git
cd web-technology-and-project-management
```

### 3.1 Backend

Cấu hình dev đã có sẵn trong `backend/src/Ctxh.Api/appsettings.json`:

```json
{
  "Urls": "http://0.0.0.0:5000",
  "ConnectionStrings": {
    "Default": "Server=localhost,1433;Database=Ctxh;User Id=sa;Password=Ctxh@12345;TrustServerCertificate=True;Encrypt=False"
  },
  "Seed": { "Enabled": true }
}
```

Không cần sửa gì để chạy local. Khi cần đổi mà **không sửa file**, dùng biến môi trường
(xem mục 7).

### 3.2 Frontend

Mặc định gọi `http://localhost:5000`. Nếu backend ở địa chỉ khác, tạo `frontend/.env.local`:

```dotenv
VITE_API_URL=http://localhost:5000
```

### 3.3 Mobile

Tạo `mobile/.env`:

```dotenv
# iOS simulator / web
EXPO_PUBLIC_API_URL=http://localhost:5000
# Android emulator: http://10.0.2.2:5000
# Thiết bị thật: http://<IP-LAN-cua-may-tinh>:5000
```

---

## 4. Chạy nhanh bằng `run.sh` (macOS · Linux · WSL)

```bash
chmod +x run.sh        # chỉ cần lần đầu
./run.sh               # SQL Server (Docker) + backend + frontend
```

Script sẽ:

1. Mở Docker Desktop nếu chưa chạy (macOS), chờ daemon sẵn sàng.
2. `docker compose up -d sqlserver` và chờ container `healthy`.
3. `dotnet run` backend → chờ cổng 5000.
4. `npm run dev` frontend → chờ cổng 5173.
5. Log tại `logs/backend.log`, `logs/frontend.log`; `Ctrl+C` để dừng và dọn tiến trình.

Các chế độ khác:

```bash
./run.sh backend      # DB + backend
./run.sh frontend     # chỉ frontend
./run.sh stop         # dừng app + container SQL Server
./run.sh --help
```

Kiểm tra sau khi chạy:

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5000/scalar/v1   # 200
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173            # 200
```

---

## 5. Chạy thủ công

### 5.1 macOS / Linux / WSL

```bash
# 1) Database
docker compose up -d sqlserver
docker inspect --format '{{.State.Health.Status}}' ctxh-sqlserver   # chờ "healthy"

# 2) Backend (terminal 1)
dotnet run --project backend/src/Ctxh.Api --launch-profile http

# 3) Frontend (terminal 2)
cd frontend && npm install && npm run dev
```

### 5.2 Windows (PowerShell) — không dùng WSL

```powershell
# 1) Database (Docker Desktop phải đang chạy)
docker compose up -d sqlserver
docker inspect --format "{{.State.Health.Status}}" ctxh-sqlserver

# 2) Backend (terminal 1)
dotnet run --project backend/src/Ctxh.Api --launch-profile http

# 3) Frontend (terminal 2)
cd frontend
npm install
npm run dev
```

> Nếu cổng 5000 bị chiếm: `Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess`
> rồi `Stop-Process -Id <pid>`.

---

## 6. Mobile (Expo)

```bash
cd mobile
npm install
npm start          # quét QR bằng Expo Go
npm run android    # Android emulator
npm run ios        # iOS simulator (chỉ macOS)
```

- **Android emulator** dùng `10.0.2.2` thay cho `localhost` (đã tự xử lý trong code).
- **Thiết bị thật**: điện thoại và máy tính cùng Wi-Fi; đặt `EXPO_PUBLIC_API_URL=http://<IP-LAN>:5000`
  (macOS: `ipconfig getifaddr en0`, Linux: `hostname -I`, Windows: `ipconfig`).
- Nếu API không truy cập được từ LAN, kiểm tra firewall cho cổng 5000.

---

## 7. Biến môi trường

### Backend (override `appsettings.json`)

| Biến | Ý nghĩa | Ví dụ |
|---|---|---|
| `ASPNETCORE_ENVIRONMENT` | Môi trường | `Development` |
| `ASPNETCORE_URLS` | Địa chỉ lắng nghe | `http://0.0.0.0:5000` |
| `ConnectionStrings__Default` | Chuỗi kết nối SQL Server | `Server=localhost,1433;...` |
| `Jwt__Key` | Khoá ký JWT (bắt buộc đổi ở production) | chuỗi ≥ 32 ký tự |
| `Seed__Enabled` | Bật/tắt seed dữ liệu mẫu | `true` / `false` |
| `Cors__AllowedOrigins__0` | Origin frontend bổ sung | `http://localhost:5173` |

Ví dụ (macOS/Linux/WSL):

```bash
export ConnectionStrings__Default="Server=localhost,1433;Database=Ctxh;User Id=sa;Password=Ctxh@12345;TrustServerCertificate=True;Encrypt=False"
dotnet run --project backend/src/Ctxh.Api
```

PowerShell: `$env:ConnectionStrings__Default = "..."`.

### Frontend

| Biến | Mặc định | Ghi chú |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000` | Đặt trong `frontend/.env.local` |

### Mobile

| Biến | Mặc định | Ghi chú |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | iOS/web: `localhost:5000`; Android: `10.0.2.2:5000` | Đặt trong `mobile/.env` |

---

## 8. Database, migration và seed

- Backend **tự chạy migration** khi khởi động (`InitializeDatabaseAsync`).
- **Seed** chỉ chạy khi bảng `Users` rỗng → tạo `admin`, `GV001`, `SV001` và 1 hoạt động mẫu.
- Database nằm trong volume Docker `ctxh-sqlserver-data` → `docker compose down` **không** mất dữ liệu.

Công cụ EF (đã pin trong `backend/.config/dotnet-tools.json`):

```bash
cd backend
dotnet tool restore

# Tạo migration mới
dotnet ef migrations add <TenMigration> \
  --project src/Ctxh.Infrastructure \
  --startup-project src/Ctxh.Api

# Áp migration thủ công (thường không cần vì app tự áp)
dotnet ef database update \
  --project src/Ctxh.Infrastructure \
  --startup-project src/Ctxh.Api
```

Reset dữ liệu về trạng thái seed:

```bash
docker compose down -v      # ⚠️ xoá toàn bộ dữ liệu
docker compose up -d sqlserver
```

---

## 9. Kiểm thử và build

```bash
# Backend
dotnet build backend/Ctxh.slnx
dotnet test  backend/Ctxh.slnx

# Frontend
cd frontend
npm run lint
npm run build
npm run preview
```

---

## 10. Xử lý sự cố

| Hiện tượng | Nguyên nhân & cách xử lý |
|---|---|
| `Cannot connect to the Docker daemon` | Docker Desktop/Engine chưa chạy. macOS: `open -a Docker`. Linux: `sudo systemctl start docker`. |
| Container `ctxh-sqlserver` mãi `starting` | Máy yếu/emulation. Chờ thêm 30–60s; kiểm tra `docker logs ctxh-sqlserver`. |
| `A network-related or instance-specific error` khi chạy backend | SQL Server chưa healthy. Chờ `docker inspect ... Health.Status = healthy` rồi chạy lại. |
| `Ports are not available: 1433` | Đã có SQL Server khác trên máy. Tắt nó, hoặc đổi port trong `docker-compose.yml` + connection string. |
| `Cổng 5000/5173 đã có tiến trình` | Tiến trình cũ còn sống. `./run.sh stop` (hoặc `lsof -ti:5000 \| xargs kill`). |
| `dotnet: command not found` | Chưa cài .NET 9 SDK hoặc chưa mở terminal mới sau khi cài. |
| `dotnet ef: command not found` | Chạy `cd backend && dotnet tool restore`. |
| `Vite requires Node.js 20.19+ / 22.12+` | Node quá cũ: nâng lên 22 LTS. |
| Frontend báo lỗi CORS | Thêm origin vào `Cors:AllowedOrigins` trong `appsettings.json` rồi khởi động lại backend. |
| Mobile không gọi được API | Dùng IP LAN thay `localhost`; kiểm tra firewall cổng 5000; Android emulator dùng `10.0.2.2`. |
| `run.sh: lsof: command not found` | Linux: `sudo apt install lsof`. Windows: chạy trong WSL2, không dùng Git Bash. |
| Windows: script báo lỗi `pgrep` | Như trên — dùng WSL2 hoặc chạy thủ công mục 5.2. |
| Đăng nhập bằng tài khoản seed thất bại | DB đã có user cũ (seed bị bỏ qua). `docker compose down -v` để seed lại. |
| Apple Silicon chạy SQL Server rất chậm | Image `linux/amd64` phải emulate; cân nhắc `azure-sql-edge` (arm64). |

Xem log:

```bash
docker logs -f ctxh-sqlserver
tail -f logs/backend.log logs/frontend.log     # khi chạy bằng run.sh
```

---

## 11. Checklist sau khi setup

- [ ] `dotnet --version` → 9.x
- [ ] `node --version` → 22+
- [ ] `docker compose version` chạy được
- [ ] `docker inspect --format '{{.State.Health.Status}}' ctxh-sqlserver` → `healthy`
- [ ] `http://localhost:5000/scalar/v1` → 200
- [ ] `http://localhost:5173` mở được trang đăng nhập
- [ ] Đăng nhập `SV001 / Sv@12345` thành công
- [ ] `dotnet test backend/Ctxh.slnx` xanh
