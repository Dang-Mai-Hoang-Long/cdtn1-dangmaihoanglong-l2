# Thông tin dự án

Sinh viên: Đặng Mai Hoàng Long - 2374802013303 - Track SE
Học phần: Chuyên đề Tốt nghiệp 1, HK1 2026-2027
Luồng nghiệp vụ: L2 – Tiếp nhận và phân loại yêu cầu bảo hành

## 1. Mục tiêu

Mô tả: Nhân viên tiếp nhận tra cứu khách hàng và thiết bị, ghi nhận mô tả lỗi, phân loại nhóm sự cố, xác định mức ưu tiên, xem hạn cam kết và tạo phiếu ở trạng thái ban đầu. Bản hiện tại mở rộng nút Chi tiết để xem/sửa thông tin tiếp nhận và đóng phiếu ở mọi trạng thái trừ Đã đóng; không có chức năng phân công kỹ thuật viên.

## 2. Yêu cầu môi trường

- Node.js `20.19.0` trở lên trong nhánh 20, hoặc `22.12.0` trở lên trong nhánh 22 trở đi. Vite 8 không hỗ trợ Node 21 hoặc các bản Node 22 cũ hơn `22.12.0`. (Phiên bản chạy kiểm thử là Node `v24.22.0`)
- PostgreSQL 16 trở lên (Phiên bản chạy kiểm thử là PostgreSQL 18)
- Biến kết nối PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` trong `.env`; có thể dùng `DATABASE_URL` thay thế nhóm biến này.
- API mặc định chạy ở cổng `3001` (`API_PORT`, hoặc `PORT` nếu không khai báo `API_PORT`); Vite mặc định chạy ở cổng `5173` (`VITE_PORT`).
- `.env.example` chứa giá trị mẫu. Hãy thay `DB_PASSWORD` bằng mật khẩu PostgreSQL trên máy trước khi chạy.
- Có thể chạy bằng Docker Desktop và Docker Compose v2 thay cho việc cài Node.js/PostgreSQL trực tiếp.
- Không đưa thông tin kết nối thật hoặc khóa bí mật vào Git.

## 3. Hướng dẫn chạy

Sau khi clone dự án, mở terminal tại thư mục gốc của dự án. Kiểm tra Node.js và npm bằng `node --version` và `npm --version`; Node.js phải thuộc một trong các dải phiên bản nêu ở mục 2.

1. Tạo `.env` từ mẫu trong PowerShell: `Copy-Item .env.example .env` (macOS/Linux: `cp .env.example .env`), rồi thay `DB_PASSWORD` bằng mật khẩu PostgreSQL của máy.

2. Mở pgAdmin, kết nối tới máy chủ PostgreSQL, nhấp phải **Databases** → **Create** → **Database...**. Nhập `mekong_mobile_l2` vào **Database**, chọn tài khoản PostgreSQL của bạn ở **Owner**, rồi nhấn **Save**. Nếu đặt tên database hoặc tài khoản khác, cập nhật `DB_NAME` hoặc `DB_USER` tương ứng trong `.env`.

3. Tại thư mục gốc dự án mở Terminal, cài thư viện bằng lệnh `npm install` (hoặc `npm ci` để cài sạch theo `package-lock.json`). Chỉ chạy một trong hai lệnh.

4. Tạo cấu trúc bảng và nạp dữ liệu mẫu: `npm run db:setup`.

5. Khởi động API và giao diện: `npm run dev`. Mở giao diện tại http://localhost:5173; kiểm tra API tại http://localhost:3001/health.

### Chạy bằng Docker

1. Cài và mở Docker Desktop, bảo đảm Docker Compose v2 hoạt động.
2. Tại thư mục gốc dự án, chạy một lệnh:

```bash
docker compose up --build
```

Compose tự tạo PostgreSQL, chờ database sẵn sàng, chạy migrations và seeds, sau đó khởi động ứng dụng. Mở http://localhost:3001. Dữ liệu database được giữ trong volume `du-lieu-postgres` khi container dừng. Nếu muốn chạy nền, thêm `-d` vào lệnh; dừng các container bằng `docker compose down`.

Compose mặc định dùng mật khẩu demo cục bộ `mekong_mobile_l2_dev`. Có thể tạo `.env` từ `.env.example` và thay `DB_PASSWORD` trước khi chạy Docker.

## 4. Cấu trúc thư mục

```text
.
├── frontend/                         # Tầng giao diện React
│   └── src/
│       ├── api/                       # Gọi API backend
│       ├── components/                # Màn hình và thành phần giao diện
│       └── styles.css                 # Kiểu dáng giao diện
├── src/                              # Backend Express, chia theo trách nhiệm
│   ├── routes/                        # Tầng HTTP: nhận request, gọi xử lý, trả response
│   ├── validators/                    # Kiểm tra cấu trúc và định dạng dữ liệu đầu vào
│   ├── services/                      # Tầng nghiệp vụ: tra cứu, kiểm tra và tạo phiếu
│   ├── repositories/                  # Tầng dữ liệu: truy vấn PostgreSQL
│   ├── errors/                        # Lỗi ứng dụng và xử lý response lỗi
│   ├── app.js                         # Lắp ráp ứng dụng và các route
│   ├── server.js                      # Khởi động API server
│   └── db.js                          # Cấu hình kết nối PostgreSQL
├── migrations/                        # Các bước tạo cấu trúc cơ sở dữ liệu
├── seeds/                             # Dữ liệu mẫu
├── scripts/                           # Chạy migration và seed
├── tests/                             # Kiểm thử nghiệp vụ bằng Node.js Test Runner
├── docs/                              # SRS, hợp đồng API, sơ đồ và thay đổi thiết kế
├── package.json                       # Scripts và khai báo thư viện của dự án
└── vite.config.js                     # Cấu hình Vite và proxy API khi phát triển
```

Backend đi theo luồng `routes → validators → services → repositories → PostgreSQL`: mỗi thư mục thể hiện một tầng trách nhiệm để dễ lần theo từ request đến dữ liệu.

Các lệnh dựng cơ sở dữ liệu là `npm run db:migrate`, `npm run db:seed` và `npm run db:setup`.

## 5. Kiểm thử

Chạy toàn bộ kiểm thử bằng một lệnh:

```bash
npm test
```

Bộ kiểm thử hiện có 9 ca `TC-01` đến `TC-09`, dùng dữ liệu/đối tượng giả nên không cần kết nối PostgreSQL. Kết quả thành công hiển thị số ca `pass` và `fail` trong terminal.

## 6. Trạng thái hiện tại

- [x] Module L2 tiếp nhận và phân loại: tra cứu khách hàng/thiết bị, kiểm tra dữ liệu, xem trước và tạo phiếu, tính hạn cam kết, xem/lọc danh sách, xem/sửa chi tiết và đóng phiếu ở mọi trạng thái trừ Đã đóng.
- [x] Dựng cơ sở dữ liệu bằng migrations, nạp dữ liệu mẫu bằng seeds và có bộ kiểm thử nghiệp vụ.
- [x] Có Dockerfile và Docker Compose để chạy ứng dụng cùng PostgreSQL bằng một lệnh.
