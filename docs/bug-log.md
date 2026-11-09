## BUG-01 — Critical

1. **Mã bug và mức độ:** BUG-01 — Critical
2. **Phát hiện bởi test case nào:** TC-13
3. **Triệu chứng — người dùng thấy gì:** Phiếu có thể được tạo với hạn cam kết rất xa hoặc không khớp thời điểm tiếp nhận và mức ưu tiên; danh sách/chi tiết phiếu hiển thị hạn sai.
4. **Cách tái lập — các bước tối thiểu:** Xem trước một phiếu hợp lệ, sau đó gửi yêu cầu xác nhận tạo phiếu với `received_at` lấy từ xem trước nhưng thay `due_date` bằng `2099-01-01T00:00:00.000Z`. Trước khi sửa, service giữ nguyên hạn năm 2099.
5. **Nguyên nhân — nguyên nhân thật:** `chuanBiDuLieuTaoPhieu` ưu tiên dùng `duLieu.due_date` từ request; chỉ tính hạn theo QT-04 khi trường này bị thiếu. Backend vì vậy tin giá trị do client gửi thay vì tự xác định hạn từ `received_at` và `priority`.
6. **Cách sửa — sửa gì, ở tệp nào:** Trong `src/services/ticketService.js`, luôn tính `due_date` bằng `tinhHanCamKet(thoiDiemNhan, mucUuTien)`; bỏ qua `due_date` client gửi. TC-13 được cập nhật xác nhận hành vi này.
7. **Link commit sửa bug + xác nhận test:** — đã chạy lại TC-13 bằng Node `v24.22.0`; **PASS**.
