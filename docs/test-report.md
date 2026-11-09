# Test Report — Luồng L2 tiếp nhận và phân loại phiếu bảo hành

## TC-01

**1. Mã test case:** TC-01 tra cứu số +84 được chuẩn hóa và số điện thoại trả về được che.

**2. Tiền điều kiện:** Unit test dùng repository giả có khách hàng ID `1`, số điện thoại `0999000001`.

**3. Các bước thực hiện:** 1. Gọi service tra cứu bằng số `+84 999.000.001`. 2. Đối chiếu số service gửi repository. 3. Kiểm tra response không chứa số đầy đủ.

**4. Dữ liệu thử:** Số nhập `+84 999.000.001`; số sau chuẩn hóa `0999000001`; tên `Nguyễn Minh An`.

**5. Kết quả mong đợi:** Repository nhận `0999000001`; response có `phone_masked = 099****001`, không có trường `phone` và không chứa số đầy đủ.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — repository nhận `0999000001`; response có `phone_masked = 099****001`, không có `phone` và không chứa số đầy đủ.

**8. PASS / FAIL:** PASS

## TC-02

**1. Mã test case:** TC-02 tính hạn cam kết 72 giờ và bỏ qua Chủ nhật.

**2. Tiền điều kiện:** Unit test dùng repository giả; khách hàng ID `1`, thiết bị ID `2` còn bảo hành, danh mục ID `3` hợp lệ. Thời điểm tiếp nhận là thứ Sáu 23/10/2026 lúc 09:00, múi giờ Asia/Bangkok.

**3. Các bước thực hiện:** 1. Gọi service chuẩn bị dữ liệu với ưu tiên `TRUNG_BINH`. 2. Đối chiếu thời điểm nhận và hạn cam kết trả về.

**4. Dữ liệu thử:** `customer_id = 1`; `device_id = 2`; `center_id = 0`; `category_id = 3`; `issue_desc = Máy không nhận sạc`; `priority = TRUNG_BINH`; `received_at = 2026-10-23T02:00:00.000Z` (thứ Sáu 09:00, Asia/Bangkok).

**5. Kết quả mong đợi:** `priority = TRUNG_BINH`; thời điểm nhận được giữ nguyên; hạn cam kết là `2026-10-27T02:00:00.000Z` (thứ Ba 09:00, Asia/Bangkok), tương ứng 72 giờ SLA và không tính 24 giờ Chủ nhật.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — service trả `priority = TRUNG_BINH`, giữ `received_at = 2026-10-23T02:00:00.000Z` và tính `due_date = 2026-10-27T02:00:00.000Z`; Chủ nhật được bỏ qua.

**8. PASS / FAIL:** PASS

## TC-03

**1. Mã test case:** TC-03 nhân viên tạo phiếu thành công trả về 201 và có ticket_code.

**2. Tiền điều kiện:** PostgreSQL database `_test` dựng từ migration và seed; thiết bị `DEMO-IMEI-L2-001` chưa có phiếu chưa đóng; API test xác thực nhân viên trung tâm `0`.

**3. Các bước thực hiện:** 1. Gửi `POST /api/tickets/preview` với dữ liệu hợp lệ. 2. Dùng `received_at` và `due_date` từ response để gửi `POST /api/tickets`. 3. Đọc response HTTP. 4. Truy vấn log khởi tạo của phiếu vừa tạo.

**4. Dữ liệu thử:** `customer_id = 1`; `device_id = 1`; `center_id = 0`; `category_id = 1`; `priority = TRUNG_BINH`; `issue_desc = Máy không nhận sạc khi dùng bộ sạc chính hãng.`; `received_at` là thời điểm hiện tại; `due_date` sau `received_at` 72 giờ.

**5. Kết quả mong đợi:** HTTP `201`; response có `ticket_id`, `ticket_code` dạng `BH-000000/YYYY`, `status = MOI`, `priority = TRUNG_BINH`; có đúng một log chuyển khởi tạo sang `MOI` cho phiếu mới.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — xem trước trả HTTP `200`; xác nhận tạo phiếu trả HTTP `201`; `ticket_code` đúng định dạng, status `MOI`, priority `TRUNG_BINH`; phiếu có một log khởi tạo `MOI`.

**8. PASS / FAIL:** PASS

## TC-04

**1. Mã test case:** TC-04 repository lọc phiếu MOI và trả trang 2 theo mã tăng dần.

**2. Tiền điều kiện:** PostgreSQL database `_test` đã dựng từ migration và seed có ít nhất 10 phiếu trạng thái `MOI` tại trung tâm `0`.

**3. Các bước thực hiện:** 1. Gọi `KhoPhieu.layDanhSach` với bộ lọc và phân trang quy định. 2. Kiểm tra tổng số, trang, kích thước, trạng thái từng dòng và thứ tự mã.

**4. Dữ liệu thử:** `trangThai = MOI`; `trang = 2`; `kichThuoc = 5`; `thuTuMaPhieu = ticket_code_asc`; `centerId = 0`.

**5. Kết quả mong đợi:** `page = 2`; `size = 5`; có đúng 5 dòng; `total >= 10`; mọi phiếu là `MOI`; `ticket_code` tăng dần.

**6. Mức ưu tiên:** Trung bình.

**7. Kết quả thực tế:** PASS — `page = 2`, `size = 5`, có 5 phiếu `MOI`, tổng đã lọc `1006`; mã phiếu tăng dần.

**8. PASS / FAIL:** PASS

## TC-05

**1. Mã test case:** TC-05 thiết bị còn bảo hành tại mili giây cuối của thời hạn.

**2. Tiền điều kiện:** Unit test kiểm tra quy tắc QT-05; thiết bị mua ngày `2025-01-31`, thời hạn một tháng.

**3. Các bước thực hiện:** 1. Gọi `conHanBaoHanh` tại `2025-02-28T23:59:59.999Z`. 2. Đối chiếu kết quả.

**4. Dữ liệu thử:** `purchase_date = 2025-01-31`; `warranty_months = 1`; thời điểm kiểm tra `2025-02-28T23:59:59.999Z`.

**5. Kết quả mong đợi:** Hàm trả `true`; thiết bị còn bảo hành tại mili giây cuối của ngày hết hạn.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — hàm trả `true` tại `2025-02-28T23:59:59.999Z`.

**8. PASS / FAIL:** PASS

## TC-06

**1. Mã test case:** TC-06 thiết bị hết bảo hành ngay sau ngày cuối của thời hạn.

**2. Tiền điều kiện:** Unit test kiểm tra phía còn lại của biên QT-05; thiết bị mua ngày `2025-01-31`, thời hạn một tháng, hết hạn ngày `2025-02-28`.

**3. Các bước thực hiện:** 1. Gọi `conHanBaoHanh` tại `2025-03-01T00:00:00.000Z`. 2. Đối chiếu kết quả.

**4. Dữ liệu thử:** `purchase_date = 2025-01-31`; `warranty_months = 1`; thời điểm kiểm tra `2025-03-01T00:00:00.000Z`.

**5. Kết quả mong đợi:** Hàm trả `false`; thiết bị đã hết bảo hành.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — hàm trả `false` tại `2025-03-01T00:00:00.000Z`.

**8. PASS / FAIL:** PASS

## TC-07

**1. Mã test case:** TC-07 từ chối xem trước khi thiết bị không thuộc khách hàng.

**2. Tiền điều kiện:** Unit test dùng repository giả; thiết bị ID `2` thuộc khách hàng ID `1`; khách hàng ID `99` tồn tại.

**3. Các bước thực hiện:** 1. Gọi service xem trước với `customer_id = 99` và `device_id = 2`. 2. Đối chiếu mã lỗi, thông báo và chi tiết trường.

**4. Dữ liệu thử:** `customer_id = 99`; `device_id = 2`; các trường khác hợp lệ; chủ thiết bị thực tế `customer_id = 1`.

**5. Kết quả mong đợi:** Service trả lỗi `DEVICE_CUSTOMER_MISMATCH`, message `Thiết bị không thuộc khách hàng này.` và trường `device_id` mô tả thiết bị không thuộc khách hàng đang chọn; không tạo phiếu.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — service trả `DEVICE_CUSTOMER_MISMATCH` cùng message và chi tiết trường `device_id` như mong đợi; không tạo phiếu.

**8. PASS / FAIL:** PASS

## TC-08

**1. Mã test case:** TC-08 từ chối xem trước khi không tìm thấy khách hàng hoặc thiết bị.

**2. Tiền điều kiện:** Unit test dùng repository giả; khách hàng ID `1` và thiết bị ID `2` tồn tại; ID `404` không tồn tại ở cả hai kho.

**3. Các bước thực hiện:** 1. Gọi service xem trước với `customer_id = 404`. 2. Đối chiếu mã lỗi và thông báo. 3. Gọi service xem trước với `device_id = 404` và khách hàng hợp lệ. 4. Đối chiếu mã lỗi và thông báo. 5. Kiểm tra không tạo phiếu.

**4. Dữ liệu thử:** Trường hợp 1: `customer_id = 404`, `device_id = 2`. Trường hợp 2: `customer_id = 1`, `device_id = 404`. Dữ liệu còn lại: `center_id = 0`; `category_id = 3`; `issue_desc = Máy không nhận sạc`.

**5. Kết quả mong đợi:** Trường hợp 1 trả `CUSTOMER_NOT_FOUND`, message `Không tìm thấy khách hàng.`; trường hợp 2 trả `DEVICE_NOT_FOUND`, message `Không tìm thấy thiết bị.`; cả hai trường hợp đều không tạo phiếu.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — trường hợp khách hàng không tồn tại trả `CUSTOMER_NOT_FOUND`; trường hợp thiết bị không tồn tại trả `DEVICE_NOT_FOUND`; repository không tạo phiếu.

**8. PASS / FAIL:** PASS

## TC-09

**1. Mã test case:** TC-09 thiếu mô tả sự cố trả về HTTP 400 VALIDATION_FAILED.

**2. Tiền điều kiện:** Express API dùng repository giả; các ID bắt buộc hợp lệ; validator phải chặn trước khi truy vấn repository.

**3. Các bước thực hiện:** 1. Gửi `POST /api/tickets/preview` không có `issue_desc`. 2. Đối chiếu HTTP response và lỗi trường.

**4. Dữ liệu thử:** Body có `customer_id = 1`; `device_id = 2`; `center_id = 0`; `category_id = 3`; thiếu `issue_desc`.

**5. Kết quả mong đợi:** HTTP `400`; `error.code = VALIDATION_FAILED`; message `Dữ liệu không hợp lệ`; `error.fields.issue_desc = Mô tả lỗi không được để trống`; không truy vấn repository.

**6. Mức ưu tiên:** Trung bình.

**7. Kết quả thực tế:** PASS — HTTP `400`; `VALIDATION_FAILED`; message `Dữ liệu không hợp lệ`; `fields.issue_desc` nêu rõ mô tả lỗi không được để trống.

**8. PASS / FAIL:** PASS

## TC-10

**1. Mã test case:** TC-10 không tạo được phiếu khi thiết bị đã có phiếu chưa đóng.

**2. Tiền điều kiện:** PostgreSQL database `_test` được dựng từ migration và seed; thiết bị `DEMO-IMEI-L2-011` đã có phiếu ở trạng thái chưa đóng. TC gọi service và repository thật.

**3. Các bước thực hiện:** 1. Đếm số phiếu và log thuộc thiết bị `DEMO-IMEI-L2-011`. 2. Gọi service xác nhận tạo phiếu mới cho chính thiết bị đó. 3. Đối chiếu mã lỗi và thông báo. 4. Đếm lại phiếu và log của thiết bị đó, rồi so sánh trước/sau.

**4. Dữ liệu thử:** Serial `DEMO-IMEI-L2-011` (customer/device ID đọc từ seed); `center_id = 0`; `category_id = 1`; `priority = TRUNG_BINH`; `issue_desc = Máy không nhận sạc, yêu cầu tạo phiếu trùng.`; `received_at` là thời điểm chạy; `due_date` sau `received_at` 72 giờ.

**5. Kết quả mong đợi:** Trước khi gọi service, thiết bị có `1` phiếu và `1` log trạng thái. Service trả `TICKET_CONFLICT`, message `Thiết bị đang có phiếu chưa đóng.`; sau thao tác, số phiếu và log gắn với đúng thiết bị vẫn lần lượt là `1` và `1`.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — thiết bị có `1` phiếu chưa đóng và `1` log trước thao tác; service trả `TICKET_CONFLICT` với message `Thiết bị đang có phiếu chưa đóng.`; sau thao tác số phiếu/log của thiết bị vẫn là `1`/`1`.

**8. PASS / FAIL:** PASS

## TC-11

**1. Mã test case:** TC-11 quản lý gọi API tạo phiếu nhận HTTP 403 và không phát sinh phiếu/log.

**2. Tiền điều kiện:** PostgreSQL database `_test` đã dựng từ migration và seed; tài khoản kiểm thử có role `QUAN_LY`, `center_id = NULL`; chưa có session đăng nhập.

**3. Các bước thực hiện:** 1. Tạo tài khoản quản lý kiểm thử. 2. Đăng nhập qua `POST /api/auth/login`. 3. Dùng cookie phiên gọi `POST /api/tickets`. 4. Đếm phiếu và log trước/sau.

**4. Dữ liệu thử:** Username `quanly-test-tc11`; password `MatKhauKiemThu!2026`; role `QUAN_LY`; body tạo phiếu cho khách hàng ID `1`, thiết bị ID `1`, trung tâm `0`, nhóm sự cố ID `1`.

**5. Kết quả mong đợi:** Đăng nhập HTTP `200`; tạo phiếu HTTP `403`; `error.code = FORBIDDEN`; message `Bạn không có quyền thực hiện thao tác này.`; số khách hàng, thiết bị, phiếu và log trước/sau không đổi.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — đăng nhập HTTP `200`; gọi tạo phiếu HTTP `403`, `FORBIDDEN`, message đúng; số lượng khách hàng, thiết bị, phiếu và log trước/sau không đổi.

**8. PASS / FAIL:** PASS

## TC-12

**1. Mã test case:** TC-12 chạy lại seed không làm tăng số khách hàng, thiết bị, phiếu và log.

**2. Tiền điều kiện:** PostgreSQL database `_test` đã dựng schema, migration và dữ liệu seed lần đầu.

**3. Các bước thực hiện:** 1. Đếm bản ghi trong `customer`, `device`, `ticket`, `ticket_status_log`. 2. Chạy lại `scripts/seed.js` trỏ tới database `_test`. 3. Đếm lại các bảng. 4. So sánh hai bộ số liệu.

**4. Dữ liệu thử:** Bộ seed hiện hành; bốn số lượng bản ghi trước và sau lần chạy seed thứ hai.

**5. Kết quả mong đợi:** Seed chạy thành công; số lượng từng bảng sau chạy bằng số lượng trước chạy, không phát sinh dữ liệu trùng.

**6. Mức ưu tiên:** Trung bình.

**7. Kết quả thực tế:** PASS — chạy seed lần hai thành công; số lượng khách hàng, thiết bị, phiếu và log trước/sau bằng nhau.

**8. PASS / FAIL:** PASS

## TC-13

**1. Mã test case:** TC-13 tính lại hạn cam kết thay vì lấy `due_date` mới do client gửi.

**2. Tiền điều kiện:** Unit test dùng repository giả; khách hàng, thiết bị còn bảo hành và nhóm sự cố đều hợp lệ.

**3. Các bước thực hiện:** 1. Gọi service chuẩn bị dữ liệu phiếu với ưu tiên `TRUNG_BINH`. 2. Gửi `received_at = 2030-01-01T00:00:00.000Z` và `due_date = 2099-01-01T00:00:00.000Z`. 3. So sánh hạn service trả về với hạn theo QT-04.

**4. Dữ liệu thử:** `customer_id = 1`; `device_id = 2`; `category_id = 3`; `priority = TRUNG_BINH`; thời điểm nhận `2030-01-01T00:00:00.000Z`; hạn client gửi `2099-01-01T00:00:00.000Z`.

**5. Kết quả mong đợi:** Service tính hạn từ thời điểm nhận theo SLA 72 giờ làm việc, bỏ qua Chủ nhật; không sử dụng hạn tùy ý do client gửi.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** PASS — service bỏ qua hạn năm 2099 do client gửi và tính lại hạn theo thời điểm tiếp nhận cùng mức ưu tiên. Ca riêng chạy bằng Node `v24.22.0`.

**8. PASS / FAIL:** PASS

## TC-14

**1. Mã test case:** TC-14 chấp nhận thiết bị còn bảo hành tại thời điểm tiếp nhận dù hiện tại đã hết hạn.

**2. Tiền điều kiện:** Unit test dùng repository giả; thiết bị có ngày mua và thời hạn bảo hành một tháng.

**3. Các bước thực hiện:** 1. Đặt ngày mua vào ngày đầu tháng cách hiện tại hai tháng. 2. Đặt `received_at` vào ngày 16 của tháng mua, khi thiết bị vẫn trong hạn. 3. Gọi service chuẩn bị dữ liệu tạo phiếu và kiểm tra kết quả bảo hành.

**4. Dữ liệu thử:** `purchase_date` là ngày đầu tháng cách hiện tại hai tháng; `warranty_months = 1`; `received_at` là ngày 16 của tháng mua.

**5. Kết quả mong đợi:** Theo QT-05, service xác định thiết bị còn bảo hành tại `received_at` và tiếp tục chuẩn bị phiếu.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** FAIL — lỗi được tái hiện. Service so sánh với thời điểm hiện tại, trả `WARRANTY_NOT_APPROVED` dù thiết bị còn hạn tại ngày tiếp nhận. Ca riêng chạy bằng Node `v24.22.0`.

**8. PASS / FAIL:** FAIL

## TC-15

**1. Mã test case:** TC-15 từ chối tạo phiếu mới khi thiết bị có phiếu `HOAN_TAT` chưa đóng.

**2. Tiền điều kiện:** PostgreSQL test database có thiết bị với phiếu `HOAN_TAT` và `closed_at IS NULL`.

**3. Các bước thực hiện:** 1. Tìm thiết bị có phiếu `HOAN_TAT` chưa đóng. 2. Gọi service xác nhận tạo phiếu mới cho thiết bị đó. 3. Kiểm tra mã lỗi và dữ liệu sau thao tác.

**4. Dữ liệu thử:** Thiết bị tìm được trong test database; ưu tiên `TRUNG_BINH`; nhóm sự cố ID `1`.

**5. Kết quả mong đợi:** Service trả `TICKET_CONFLICT`; không tạo phiếu mới.

**6. Mức ưu tiên:** Cao.

**7. Kết quả thực tế:** CHƯA CHẠY ĐƯỢC — kết nối PostgreSQL test database tại `localhost:5432` bị từ chối (`EACCES`). Chưa xác minh dữ liệu seed có tình huống cần thiết.

**8. PASS / FAIL:** FAIL
