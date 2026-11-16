# DaSSO Test - Monorepo & Multi-Pipeline CI/CD

Repository kiến trúc Monorepo phục vụ kiểm thử và triển khai tự động độc lập 3 dịch vụ:

1. **`web/`**: Ứng dụng Next.js mock client test OIDC login (Deploy tự động lên **Vercel**).
2. **`server/`**: Backend Gateway xây dựng bằng **NestJS** theo chuẩn chung (Bunny Cove rules: transform interceptor, all-exceptions filter, string response codes) để bảo vệ Keycloak Admin API và quản lý database an toàn (Deploy tự động lên **Railway**).
3. **`keycloak/`**: Container Keycloak 26 kết nối cơ sở dữ liệu Supabase PostgreSQL (Deploy tự động lên **Railway**).

---

## 1. Cơ chế CI/CD GitHub Actions (Path-based triggers)

Pipeline được cấu hình để chỉ kích hoạt trên nhánh **`deploy`** khi có file thay đổi ở thư mục tương ứng:

* **`.github/workflows/deploy-web.yml`**: Kích hoạt khi có thay đổi trong `web/**` $\rightarrow$ Build và Deploy lên **Vercel**.
* **`.github/workflows/deploy-server.yml`**: Kích hoạt khi có thay đổi trong `server/**` $\rightarrow$ Deploy service `server` lên **Railway**.
* **`.github/workflows/deploy-keycloak.yml`**: Kích hoạt khi có thay đổi trong `keycloak/**` $\rightarrow$ Deploy service `keycloak` lên **Railway**.

---

## 2. Các GitHub Secrets cần cấu hình

Vào GitHub Repository $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions** $\rightarrow$ Thêm các secrets sau:

### Cho Vercel (`deploy-web.yml`):
* `VERCEL_TOKEN`: Vercel Personal Access Token.
* `VERCEL_ORG_ID`: Team / User ID trên Vercel.
* `VERCEL_PROJECT_ID`: Project ID của ứng dụng `web` trên Vercel.

### Cho Railway (`deploy-server.yml` & `deploy-keycloak.yml`):
* `RAILWAY_TOKEN`: Railway Project Token / API Token.
* `RAILWAY_SERVER_SERVICE_NAME` *(tùy chọn, mặc định: `server`)*.
* `RAILWAY_KEYCLOAK_SERVICE_NAME` *(tùy chọn, mặc định: `keycloak`)*.

---

## 3. Chạy thử nghiệm cục bộ với Docker Compose

```bash
# Khởi động toàn bộ 3 service (Keycloak + Server Gateway + Web + Local Postgres)
docker compose up -d

# Xem log
docker compose logs -f
```

* **Next.js Web Client**: `http://localhost:3000`
* **NestJS Server Gateway**: `http://localhost:4000` (Healthcheck: `http://localhost:4000/health`)
* **Keycloak SSO**: `http://localhost:8080` (Admin: `admin` / `admin`)
