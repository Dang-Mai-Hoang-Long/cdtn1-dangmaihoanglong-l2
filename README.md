# Thông tin dự án

Sinh viên: Đặng Mai Hoàng Long - 2374802013303 - Track SE
Học phần: Chuyên đề Tốt nghiệp 1, HK1 2026-2027
Luồng nghiệp vụ: L2 – Tiếp nhận và phân loại yêu cầu bảo hành

## 1. Mục tiêu

Mô tả: Nhân viên tiếp nhận tra cứu khách hàng và thiết bị, ghi nhận mô tả lỗi, phân loại nhóm sự cố, xác định mức ưu tiên, xem hạn cam kết và tạo phiếu ở trạng thái ban đầu. Luồng hiện tại tập trung vào tiếp nhận và phân loại; không xử lý phân công kỹ thuật viên hoặc vòng đời phiếu sau trạng thái ban đầu.

## 2. Yêu cầu môi trường

- Node.js 20 trở lên
- PostgreSQL 16
- Biến kết nối PostgreSQL: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` trong `.env`. Có thể dùng `DATABASE_URL` thay cho các biến kết nối riêng.
- Cổng API mặc định là `3001`; giao diện Vite mặc định ở `5173`. Có thể đổi cổng API bằng `PORT`.
- Không đưa thông tin kết nối thật hoặc khóa bí mật vào Git.

## 3. Hướng dẫn chạy

1. Tạo `.env` từ mẫu bằng PowerShell: `Copy-Item .env.example .env` (hoặc dùng `cp .env.example .env` trên macOS/Linux), rồi điền thông tin PostgreSQL.
2. Cài các gói cần thiết: `npm install`.
3. Khi PostgreSQL đang chạy, tạo bảng và nạp dữ liệu mẫu: `npm run db:setup`.
4. Khởi động API và giao diện: `npm run dev`. Mở giao diện tại http://localhost:5173; kiểm tra API tại http://localhost:3001/health.

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

Bộ kiểm thử hiện có 10 ca `TC-01` đến `TC-09`, dùng dữ liệu/đối tượng giả nên không cần kết nối PostgreSQL. Kết quả thành công hiển thị số ca `pass` và `fail` trong terminal.

## 6. Trạng thái hiện tại

- [x] Module L2 tiếp nhận và phân loại: tra cứu khách hàng/thiết bị, kiểm tra dữ liệu, xem trước và tạo phiếu, tính hạn cam kết, xem danh sách và lọc trạng thái.
- [x] Dựng cơ sở dữ liệu bằng migrations, nạp dữ liệu mẫu bằng seeds và có bộ kiểm thử nghiệp vụ.
- [ ] Đóng gói bằng docker
