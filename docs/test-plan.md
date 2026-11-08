# Test Plan — Luồng L2: Tiếp nhận thiết bị bảo hành (track SE)

## 1. Phạm vi

Kiểm: tra cứu khách hàng và che số điện thoại; xem trước và tạo phiếu; kiểm tra thiết bị thuộc khách hàng; bảo hành QT-05; hạn cam kết QT-04; chặn tạo phiếu trùng QT-03; phân quyền chủ sở hữu; tính tái lập an toàn của seed.

KHÔNG kiểm: quyền sửa phiếu theo người tạo; màn hình cấu hình; hiệu năng và tải (thuộc Chuyên đề tốt nghiệp 2).

## 2. Loại test và số lượng

12 test case (TC-01 đến TC-12): 6 Unit, 3 Integration với PostgreSQL, 3 API qua HTTP. TC-10 dùng service và repository thật trên PostgreSQL để kiểm tra phiếu trùng.

Kỹ thuật chọn dữ liệu: phân vùng tương đương; kiểm tra QT-04 với ưu tiên Trung bình qua cuối tuần; giá trị biên cho QT-05.

Đủ 5 loại BT3: luồng đúng ×4 · biên ×2 · dữ liệu sai ×4 · bảo mật/chất lượng dữ liệu ×1 · tái lập ×1.

## 3. Tiêu chí thành công

- Có đúng 12 test case, đánh số TC-01 đến TC-12; mỗi quy tắc nghiệp vụ thuộc phạm vi có ít nhất một test case.
- Các ca lỗi đối chiếu mã lỗi, thông báo và mã HTTP khi kiểm thử qua API; dữ liệu không hợp lệ không được lưu.
- Không còn bug Critical đang mở; bug Major còn lại có lý do và hướng xử lý.

## 4. Môi trường và dữ liệu thử

PostgreSQL thử riêng có hậu tố `_test`; helper dựng lại schema và seed trước các ca tích hợp. Chạy `npm test` sau khi cài đúng phiên bản Node.js và cấu hình `TEST_DATABASE_URL`.
