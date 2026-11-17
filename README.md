# DaSSO Test - Hướng Dẫn Triển Khai Monorepo & Multi-Pipeline CI/CD

Tài liệu hướng dẫn thiết lập và triển khai tự động độc lập 3 dịch vụ trong hệ thống DaSSO lên Cloud (**Railway** và **Vercel**), kết nối cơ sở dữ liệu **Supabase**, và cấu hình CI/CD tự động bằng **GitHub Actions**.

---

## 🏗️ Kiến Trúc Hệ Thống (Monorepo)

| Dịch vụ | Công nghệ | Nơi triển khai | Nhiệm vụ |
| :--- | :--- | :--- | :--- |
| **`keycloak/`** | Keycloak 26 Container (Docker) | **Railway** | Quản lý định danh SSO, kết nối Supabase PostgreSQL (Session Pooler port 5432). |
| **`server/`** | NestJS Backend Gateway | **Railway** | Bảo vệ Admin API, bọc dữ liệu chuẩn (`TransformInterceptor`, `AllExceptionsFilter`, `ResponseCodes`). |
| **`web/`** | Next.js App Router (Tailwind) | **Vercel** | Giao diện DaSSO Portal, đăng nhập OIDC. |

---

## 📋 Hướng Dẫn Thiết Lập Từng Bước

### BƯỚC 1: Chuẩn bị Cơ sở dữ liệu trên Supabase
1. Đăng nhập [supabase.com](https://supabase.com) và tạo một Project mới.
2. Vào **Project Settings** $\rightarrow$ **Database** $\rightarrow$ cuộn xuống mục **Connection string** $\rightarrow$ chọn tab **URI** (chọn chế độ **Session Pooler**, port **5432**).
3. Lưu lại các thông tin: Host, Database Name, User, và Password của database để cấu hình cho Keycloak.

---

### BƯỚC 2: Triển khai `Keycloak` trên Railway
1. Đăng nhập [railway.app](https://railway.app) bằng tài khoản GitHub.
2. Bấm **New Project** $\rightarrow$ **Deploy from GitHub repo** $\rightarrow$ Chọn repo **`dasso_test`**.
3. Đổi tên service thành **`DaSSO-Keycloak`**.
4. Vào service vừa tạo để cấu hình:
   * **Settings** $\rightarrow$ mục **Branch**: Chọn nhánh **`deploy`**.
   * **Settings** $\rightarrow$ mục **Build**:
     * **Root Directory**: Nhập **`/keycloak`**
   * **Variables** $\rightarrow$ Bấm nút **Raw Editor** $\rightarrow$ Dán cấu hình kết nối Supabase của bạn:
     ```env
     KC_DB=postgres
     KC_DB_URL=jdbc:postgresql://<YOUR_SUPABASE_HOST>:5432/postgres?sslmode=require
     KC_DB_USERNAME=postgres.<YOUR_PROJECT_REF>
     KC_DB_PASSWORD=<YOUR_SUPABASE_PASSWORD>
     KC_BOOTSTRAP_ADMIN_USERNAME=admin
     KC_BOOTSTRAP_ADMIN_PASSWORD=admin
     KC_PROXY_HEADERS=xforwarded
     KC_HTTP_ENABLED=true
     KC_HOSTNAME_STRICT=false
     ```
   * **Settings** $\rightarrow$ mục **Networking**: Bấm **Generate Domain** $\rightarrow$ Chọn Port **`8080`**.
   * 👉 Copy lại Domain Keycloak vừa sinh ra (ví dụ: `https://dasso-keycloak-production.up.railway.app`).

---

### BƯỚC 3: Triển khai `Server` (NestJS) trên Railway
1. Tại cùng Project Railway đó, bấm **New** $\rightarrow$ **GitHub Repo** $\rightarrow$ Chọn tiếp repo **`dasso_test`**.
2. Đổi tên service thành **`DaSSO-Server`**.
3. Cấu hình service:
   * **Settings** $\rightarrow$ mục **Branch**: Chọn nhánh **`deploy`**.
   * **Settings** $\rightarrow$ mục **Build**:
     * **Root Directory**: Nhập **`/server`**
   * **Variables** $\rightarrow$ Bấm **Raw Editor** $\rightarrow$ Dán các biến:
     ```env
     PORT=4000
     KEYCLOAK_URL=https://<domain_keycloak_o_buoc_2>
     ```
   * **Settings** $\rightarrow$ mục **Networking**: Bấm **Generate Domain** $\rightarrow$ Chọn Port **`4000`**.
   * 👉 Copy lại Domain Server vừa sinh ra (ví dụ: `https://dasso-server-production.up.railway.app`).

---

### BƯỚC 4: Triển khai `Web` (Next.js) trên Vercel
1. Đăng nhập [vercel.com](https://vercel.com) bằng tài khoản GitHub.
2. Bấm **Add New...** $\rightarrow$ **Project** $\rightarrow$ Import repo **`dasso_test`**.
3. Đặt tên Project là **`dasso-test`**.
4. Cấu hình tại màn hình Import:
   * **Root Directory**: Bấm **Edit** $\rightarrow$ Chọn thư mục **`web`** $\rightarrow$ Bấm *Continue*.
   * **Environment Variables**: Thêm 2 biến:
     * `NEXT_PUBLIC_KEYCLOAK_URL` = `https://<domain_keycloak_o_buoc_2>`
     * `NEXT_PUBLIC_SERVER_URL` = `https://<domain_server_o_buoc_3>`
5. Bấm nút **Deploy**.

---

### BƯỚC 5: Kích hoạt GitHub Actions CI/CD Tự Động
Hệ thống sử dụng cơ chế Multi-Pipeline trên nhánh **`deploy`** với bộ lọc thư mục (`paths:`). Để kích hoạt triển khai tự động:

1. **Lấy Token trên Vercel**:
   * Vào [vercel.com/account/tokens](https://vercel.com/account/tokens).
   * Bấm **Create Token** $\rightarrow$ Đặt tên bất kỳ $\rightarrow$ Copy mã Token.
2. **Cấu hình trên GitHub**:
   * Mở: `https://github.com/<owner>/dasso_test/settings/secrets/actions`
   * Bấm **New repository secret**:
     * Name: **`VERCEL_TOKEN`**
     * Secret: *(Dán mã token vừa tạo ở trên)*

*(Lưu ý: Đối với Railway, khi repo được kết nối trực tiếp trên nhánh `deploy`, tính năng `Auto deploys when pushed to GitHub` của Railway sẽ tự động triển khai khi có commit mới mà không cần thêm token)*.

---

## 🎯 Cơ Chế Lọc Đường Dẫn Multi-Pipeline

* Sửa file trong `web/**` $\rightarrow$ Chỉ chạy workflow `deploy-web.yml` (Vercel).
* Sửa file trong `server/**` $\rightarrow$ Chỉ chạy workflow `deploy-server.yml` (Railway).
* Sửa file trong `keycloak/**` $\rightarrow$ Chỉ chạy workflow `deploy-keycloak.yml` (Railway).
