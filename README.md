# DaSSO Test - Hướng Dẫn Triển Khai Monorepo & Multi-Pipeline CI/CD

Tài liệu này ghi lại toàn bộ quy trình thiết lập, triển khai thực tế trên Cloud (**Railway** và **Vercel**), cấu hình tự động hóa **GitHub Actions CI/CD**, cùng tổng hợp chi tiết các lỗi thực tế (**Fail**) và cách khắc phục thành công (**Pass**) trong quá trình thực hiện.

---

## 🏗️ Kiến Trúc Hệ Thống (Monorepo)

Dự án gồm 3 dịch vụ độc lập trong một kho lưu trữ:

| Dịch vụ | Công nghệ | Nơi triển khai | Nhiệm vụ |
| :--- | :--- | :--- | :--- |
| **`keycloak/`** | Keycloak 26 Container (Docker) | **Railway** | Quản lý định danh SSO, kết nối Supabase PostgreSQL (Session Pooler port 5432). |
| **`server/`** | NestJS Backend Gateway | **Railway** | Bảo vệ Admin API, bọc dữ liệu chuẩn (`TransformInterceptor`, `AllExceptionsFilter`, `ResponseCodes`). |
| **`web/`** | Next.js App Router (Tailwind) | **Vercel** | Giao diện DaSSO Portal, đăng nhập OIDC. |

---

## 📋 Hướng Dẫn Từng Bước Cho Owner (`lannguyen2205`) Thiết Lập Từ Đầu

Khi bắt đầu thiết lập trên tài khoản của Owner, hãy làm theo đúng thứ tự 3 bước sau:

### BƯỚC 1: Triển khai `Keycloak` trên Railway
1. Đăng nhập [railway.app](https://railway.app) bằng tài khoản GitHub `lannguyen2205`.
2. Bấm **New Project** $\rightarrow$ **Deploy from GitHub repo** $\rightarrow$ Chọn repo **`dasso_test`**.
3. Đổi tên service thành **`DaSSO-Keycloak`**.
4. Vào service vừa tạo:
   * **Settings** $\rightarrow$ mục **Branch**: Chọn nhánh **`deploy`**.
   * **Settings** $\rightarrow$ mục **Build**:
     * **Root Directory**: Nhập **`/keycloak`** *(bắt buộc để Railway không quét nhầm thư mục gốc)*.
   * **Variables** $\rightarrow$ Bấm nút **Raw Editor** $\rightarrow$ Dán toàn bộ cấu hình database Supabase:
     ```env
     KC_DB=postgres
     KC_DB_URL=jdbc:postgresql://aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require
     KC_DB_USERNAME=postgres.oohdhoeensdlyexlolgg
     KC_DB_PASSWORD=truongbmt204lmht
     KC_BOOTSTRAP_ADMIN_USERNAME=admin
     KC_BOOTSTRAP_ADMIN_PASSWORD=admin
     KC_PROXY_HEADERS=xforwarded
     KC_HTTP_ENABLED=true
     KC_HOSTNAME_STRICT=false
     ```
   * **Settings** $\rightarrow$ mục **Networking**: Bấm **Generate Domain** $\rightarrow$ Chọn Port **`8080`**.
   * 👉 **Copy lại Domain Keycloak vừa sinh ra** (ví dụ: `https://dasso-keycloak-production.up.railway.app`).

---

### BƯỚC 2: Triển khai `Server` (NestJS) trên Railway
1. Tại cùng Project Railway đó, bấm **New** $\rightarrow$ **GitHub Repo** $\rightarrow$ Chọn tiếp **`dasso_test`**.
2. Đổi tên service thành **`DaSSO-Server`**.
3. Cấu hình service:
   * **Settings** $\rightarrow$ mục **Branch**: Chọn nhánh **`deploy`**.
   * **Settings** $\rightarrow$ mục **Build**:
     * **Root Directory**: Nhập **`/server`**.
   * **Variables** $\rightarrow$ Bấm **Raw Editor** $\rightarrow$ Dán các biến:
     ```env
     PORT=4000
     KEYCLOAK_URL=https://<domain_keycloak_o_buoc_1>
     ```
   * **Settings** $\rightarrow$ mục **Networking**: Bấm **Generate Domain** $\rightarrow$ Chọn Port **`4000`**.
   * 👉 **Copy lại Domain Server vừa sinh ra** (ví dụ: `https://dasso-server-production.up.railway.app`).

---

### BƯỚC 3: Triển khai `Web` (Next.js) trên Vercel
1. Đăng nhập [vercel.com](https://vercel.com) bằng tài khoản GitHub `lannguyen2205`.
2. Bấm **Add New...** $\rightarrow$ **Project** $\rightarrow$ Tìm repo **`dasso_test`** $\rightarrow$ Bấm **Import**.
3. Đặt tên Project là **`dasso-test`**.
4. Cấu hình tại màn hình Import:
   * **Root Directory**: Bấm **Edit** $\rightarrow$ Chọn thư mục **`web`** $\rightarrow$ Bấm *Continue*.
   * **Environment Variables**: Thêm 2 biến:
     * `NEXT_PUBLIC_KEYCLOAK_URL` = `https://<domain_keycloak_o_buoc_1>`
     * `NEXT_PUBLIC_SERVER_URL` = `https://<domain_server_o_buoc_2>`
5. Bấm nút **Deploy**! Trong 1 phút ứng dụng sẽ lên sóng Production.

---

### BƯỚC 4: Kích hoạt GitHub Actions CI/CD Tự Động
Để mỗi khi push code vào nhánh `deploy`, GitHub Actions tự động kiểm tra và deploy lên Vercel:

1. **Lấy Token trên Vercel**:
   * Vào [vercel.com/account/tokens](https://vercel.com/account/tokens).
   * Bấm **Create Token** $\rightarrow$ Đặt tên bất kỳ $\rightarrow$ Copy mã Token.
2. **Cấu hình trên GitHub**:
   * Mở: `https://github.com/lannguyen2205/dasso_test/settings/secrets/actions`
   * Bấm **New repository secret**:
     * Name: **`VERCEL_TOKEN`**
     * Secret: *(Dán mã token vừa tạo ở trên)*

*(Lưu ý: Đối với Railway, vì repo thuộc chính chủ `lannguyen2205` nên tính năng `⚡ Auto deploys when pushed to GitHub` của Railway đã tự động lắng nghe nhánh `deploy` mà không cần token hay thẻ ngân hàng)*.

---

## 🔍 Tổng Hợp Kinh Nghiệm Thực Chiến (Lessons Learned: Pass & Fail)

Phần này ghi lại tất cả các lỗi đã gặp phải và giải pháp xử lý triệt để:

### 1. Keycloak trên Railway:
* ❌ **Lỗi Railpack không nhận diện được dự án:**
  * *Hiện tượng:* `Railpack could not determine how to build the app... Script start.sh not found`.
  * *Nguyên nhân:* Mặc định Railway quét thư mục gốc `./`, không thấy Dockerfile của Keycloak.
  * ✅ *Cách sửa:* Phải vào Service Settings $\rightarrow$ đặt **Root Directory** là `/keycloak`.
* ❌ **Lỗi Tràn Bộ Nhớ (OOM - Out of Memory):**
  * *Hiện tượng:* Log báo `/opt/keycloak/bin/kc.sh: line 169: 76 Killed 'java' ... start-dev`.
  * *Nguyên nhân:* Lệnh `start-dev` mặc định cố build lại Quarkus lúc khởi động, ngốn >600MB RAM vượt ngưỡng miễn phí 512MB của Railway.
  * ✅ *Cách sửa:* Chuyển sang Dockerfile Multi-stage: chạy `RUN /opt/keycloak/bin/kc.sh build` ngay lúc build image, và khi chạy container dùng chế độ `CMD ["start", "--optimized", "--http-enabled=true"]` kèm giới hạn RAM `-Xms128m -Xmx384m`.
* ❌ **Lỗi xung đột Garbage Collector:**
  * *Hiện tượng:* `Multiple garbage collectors selected`.
  * *Nguyên nhân:* `kc.sh` mặc định đã có `-XX:+UseG1GC`, việc nhồi thêm `-XX:+UseSerialGC` khiến JVM bị lỗi.
  * ✅ *Cách sửa:* Chỉ truyền giới hạn Heap trong `JAVA_OPTS_APPEND` mà không ép cờ GC khác.

### 2. NestJS Server trên Railway:
* ❌ **Lỗi Module Resolution khi Build Docker:**
  * *Hiện tượng:* `Cannot find module './app.service'... Relative import paths need explicit file extensions in ECMAScript imports`.
  * *Nguyên nhân:* NestJS CLI phiên bản mới mặc định tạo ESM (`"type": "module"` và `moduleResolution: nodenext`), bắt buộc mọi import tương đối phải có đuôi `.js`.
  * ✅ *Cách sửa:* Chuẩn hóa `tsconfig.json` và `package.json` về chế độ **CommonJS** ổn định của NestJS.

### 3. Next.js Web & Vercel Action CI/CD:
* ❌ **Lỗi thiếu file lock:**
  * *Hiện tượng:* GitHub Actions dừng ở giây thứ 12 tại lệnh `npm ci`.
  * *Nguyên nhân:* Thư mục `web/` chưa có `package-lock.json`.
  * ✅ *Cách sửa:* Tạo và commit đầy đủ file `package-lock.json`.
* ❌ **Lỗi `Project not found` và `The specified scope does not exist`:**
  * *Hiện tượng:* Action cũ `amondnet/vercel-action` đòi `VERCEL_ORG_ID`, nhưng trên tài khoản cá nhân (Hobby) không có Org ID, nếu truyền chuỗi slug sẽ bị crash.
  * ✅ *Cách sửa:* Dùng trực tiếp **Vercel CLI chính hãng** (`npm i -g vercel`), liên kết trực tiếp bằng tên dự án: `vercel link --yes --project dasso-test --token "${{ secrets.VERCEL_TOKEN }}"` $\rightarrow$ Không cần quan tâm Org ID.
* ❌ **Lỗi `The specified Root Directory "web" does not exist`:**
  * *Hiện tượng:* Vercel upload mã nguồn nhưng báo không tìm thấy thư mục `web`.
  * *Nguyên nhân:* Trong workflow có lệnh `cd web` trước khi gọi `vercel deploy`, khiến Vercel nhận được các file con mà không thấy thư mục mẹ `web/`.
  * ✅ *Cách sửa:* Chạy lệnh `vercel deploy` từ thư mục gốc của repository (bỏ lệnh `cd web`).

---

## 🎯 Kiểm Thử Độc Lập Multi-Pipeline (CI/CD Verification)

Hệ thống được thiết kế với 3 file workflow độc lập có bộ lọc đường dẫn (`paths:`):
* Sửa file trong `web/` $\rightarrow$ Chỉ chạy duy nhất `deploy-web.yml` (Vercel).
* Sửa file trong `server/` $\rightarrow$ Chỉ chạy duy nhất `deploy-server.yml` (Railway).
* Sửa file trong `keycloak/` $\rightarrow$ Chỉ chạy duy nhất `deploy-keycloak.yml` (Railway).

Mọi lịch sử chạy và trạng thái tích xanh ✅ được ghi nhận trực quan tại tab **Actions** trên GitHub!
