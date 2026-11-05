# Test Plan — Luồng L2: Tiếp nhận thiết bị bảo hành (track SE)

## 1. Phạm vi

Kiểm: tiếp nhận phiếu, kiểm bảo hành QT-05, sinh hạn cam kết QT-04, chặn phiếu trùng QT-03, đăng nhập và giới hạn tạo phiếu của quản lý (TC-13).

KHÔNG kiểm: màn hình cấu hình (chỉ đọc, không có quy tắc nghiệp vụ); hiệu năng và tải (thuộc Chuyên đề tốt nghiệp 2)

## 2. Loại test và số lượng

13 test case: kiểm thử service/validator, API qua HTTP và tích hợp PostgreSQL. TC-13 đăng nhập tài khoản quản lý thật rồi gọi API tạo phiếu; các kiểm thử PostgreSQL chạy khi có `TEST_DATABASE_URL` trỏ tới database hậu tố `_test`.
Kỹ thuật chọn dữ liệu: phân vùng tương đương; giá trị biên cho QT-04, QT-05.
Đủ 5 loại BT3: luồng đúng ×4 · biên ×2 · dữ liệu sai ×4 · bảo mật/ chất lượng dữ liệu ×1 · tái lập ×1.

## 3. Tiêu chí thành công

- 13 test case được định danh TC-01 đến TC-13; mọi QT đã hiện thực có >= 1 test. TC-13 phải nhận HTTP 403 `FORBIDDEN` và không làm tăng số phiếu hoặc log.
- Không còn bug Critical đang mở; bug Major còn lại có lý do và hướng xử lý.

## 4. Môi trường và dữ liệu thử

PostgreSQL thử riêng có hậu tố `_test`; helper dựng lại migration và seed trước mỗi ca tích hợp. Chạy `npm test` sau khi cài đúng phiên bản Node.js và cấu hình `TEST_DATABASE_URL`.
