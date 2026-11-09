## BUG-01 — Critical

1. **Mã bug và mức độ:** BUG-01 — Critical
2. **Phát hiện bởi test case nào:** TC-13
3. **Triệu chứng — người dùng thấy gì:** Phiếu có thể được tạo với hạn cam kết rất xa hoặc không khớp thời điểm tiếp nhận và mức ưu tiên; danh sách/chi tiết phiếu hiển thị hạn sai.
4. **Cách tái lập — các bước tối thiểu:** Xem trước một phiếu hợp lệ, sau đó gửi yêu cầu xác nhận tạo phiếu với `received_at` lấy từ xem trước nhưng thay `due_date` bằng `2099-01-01T00:00:00.000Z`. Trước khi sửa, service giữ nguyên hạn năm 2099.
5. **Nguyên nhân — nguyên nhân thật:** `chuanBiDuLieuTaoPhieu` ưu tiên dùng `duLieu.due_date` từ request; chỉ tính hạn theo QT-04 khi trường này bị thiếu. Backend vì vậy tin giá trị do client gửi thay vì tự xác định hạn từ `received_at` và `priority`.
6. **Cách sửa — sửa gì, ở tệp nào:** Trong `src/services/ticketService.js`, luôn tính `due_date` bằng `tinhHanCamKet(thoiDiemNhan, mucUuTien)`; bỏ qua `due_date` client gửi. TC-13 được cập nhật xác nhận hành vi này.
7. **Link commit sửa bug + xác nhận test:**https://github.com/Dang-Mai-Hoang-Long/cdtn1-dangmaihoanglong-l2/commit/4b443173b510ca4c798f043170de3fc8a12b582a — đã chạy lại TC-13 bằng Node `v24.22.0`; **PASS**.

## BUG-02 — Major

1. **Mã bug và mức độ:** BUG-02 — Major
2. **Phát hiện bởi test case nào:** TC-14
3. **Triệu chứng — người dùng thấy gì:** Phiếu tiếp nhận đúng lúc thiết bị còn bảo hành có thể bị từ chối nếu thời điểm hệ thống kiểm tra đã qua ngày hết hạn.
4. **Cách tái lập — các bước tối thiểu:** Dùng thiết bị có thời hạn bảo hành một tháng; đặt `received_at` vào ngày 16 của tháng mua; chạy yêu cầu sau khi thời hạn đó đã kết thúc. Trước khi sửa, service trả `WARRANTY_NOT_APPROVED` dù thiết bị còn hạn tại ngày tiếp nhận.
5. **Nguyên nhân — nguyên nhân thật:** Service gọi `conHanBaoHanh(thietBi)` không truyền mốc tiếp nhận, khiến hàm dùng `new Date()` hiện tại thay vì ngày tiếp nhận như QT-05 quy định.
6. **Cách sửa — sửa gì, ở tệp nào:** Trong `src/services/ticketService.js`, xác định `thoiDiemNhan` trước bước kiểm tra bảo hành và truyền mốc đó vào `conHanBaoHanh(thietBi, thoiDiemNhan)`.
7. **Link commit sửa bug + xác nhận test:** https://github.com/Dang-Mai-Hoang-Long/cdtn1-dangmaihoanglong-l2/commit/817f7a1a5a2a99e0a093a93c9eda6c69577a4a6e, Đã chạy TC-14 và TC-13 bằng Node `v24.22.0`; cả hai **PASS**.

## BUG-03 — Major

1. **Mã bug và mức độ:** BUG-03 — Major
2. **Phát hiện bởi test case nào:** TC-15
3. **Triệu chứng — người dùng thấy gì:** Nhân viên có thể tạo thêm phiếu cho thiết bị đang có phiếu `HOAN_TAT` nhưng chưa chuyển sang `DA_DONG`, khiến một thiết bị có nhiều yêu cầu chưa kết thúc.
4. **Cách tái lập — các bước tối thiểu:** Dùng thiết bị có phiếu trạng thái `HOAN_TAT` và `closed_at IS NULL`; xác nhận tạo phiếu mới cho cùng thiết bị. Trước khi sửa, bước kiểm tra trước và bước ghi nhận đều cho phép tạo.
5. **Nguyên nhân — nguyên nhân thật:** Hai truy vấn trong `ticketRepository.js` loại `HOAN_TAT` khỏi các trạng thái được xem là chưa đóng, dù phiếu chỉ thực sự kết thúc khi được đóng (`DA_DONG`) hoặc hủy (`DA_HUY`).
6. **Cách sửa — sửa gì, ở tệp nào:** Trong `src/repositories/ticketRepository.js`, bỏ `HOAN_TAT` khỏi danh sách trạng thái loại trừ ở cả `coPhieuChuaDong` và truy vấn kiểm tra nguyên tử trong `taoPhieu`.
7. **Link commit sửa bug + xác nhận test:** Chưa có commit. Đã chạy TC-15 bằng Node `v24.22.0` với PostgreSQL test database; **PASS**.
