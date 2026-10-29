# Nhật ký thay đổi thiết kế

## Sau phản hồi Bài tập 1 (buổi 8, ngày 15/10/2026)

### TD-01 Chỉnh sửa lại 2 NFR và cập nhật lập luận lý do lựa chọn kiến trúc

- Phản hồi của GV : NFR2 và NFR3 không có ngưỡng số đo được (ví dụ cần "100% phản hồi cho vai trò khác Quản lý che số điện thoại", "thêm nhóm sự cố trong dưới 5 phút, 0 dòng mã sửa"). Vì vậy câu lập luận 3 cũng thiếu ngưỡng.
- Quyết định : SỬA
- Lý do : BT1 yêu cầu các NFR phải có ngưỡng số đo được. Lấy ngưỡng số làm căn cứ cho quá trình kiểm thử.
- Ảnh hưởng : Bổ sung thêm ngưỡng số cho NFR2, thay đổi NFR3 sang yêu cầu phi chức năng mới có ngưỡng số có thể đo được, cập nhật lại câu lập luận thứ hai và thứ ba ở phần thiết kế kiến trúc.
- File thay đổi: srs.md.

### TD-02 Nhất quán thuật ngữ và lược bỏ các trường không tồn tại trong ERD ở wireframe.

- Phản hồi của GV : Thuật ngữ chưa nhất quán: SRS gọi "mô tả lỗi", wireframe ghi "Mô tả sự cố". Màn hình xác nhận có "Tình trạng bảo hành", "Xử lý bảo hành" nhưng ERD không có cột tương ứng.
- Quyết định : SỬA
- Lý do : Cần nhất quán thuật ngữ và thể hiện các trường thông tin cần thiết thuộc ERD để dễ dàng theo dõi và truy vết.
- Ảnh hưởng : Sửa lại tên trường Mô tả sự cố thành Mô tả lỗi trong wireframe Tạo phiếu và Xác nhận tạo phiếu. Lược bỏ các trường "Tình trạng bảo hành", "Xử lý bảo hành" không có cột tương ứng trong ERD.
- File thay đổi: wireframe.

### TD-03 Chỉnh sửa ERD

- Phản hồi của GV : ERD có FK technician_id nhưng không có bảng technician.
- Quyết định : SỬA
- Lý do : Trường thông tin chưa đóng vai trò chính trong quá trình tạo và phân loại phiếu bảo hành trong luồng nghiệp vụ Tiếp nhận và phân loại phiếu bảo hành.
- Ảnh hưởng : Lược bỏ trường technician_id trong bảng ticket của ERD trong phiên bản này. Xóa thiết lập trường technician_id của bảng ticket trong SQL DDL skeleton của trường changed_by.
- File thay đổi: schema.sql, erd.drawio.

### TD-04 Chỉnh sửa Bảng thuật ngữ trong mục SRS

- Phản hồi của GV : Bảng thuật ngữ chép cả đơn hàng, chiến dịch, khảo sát hài lòng, không thuộc L2.
- Quyết định : SỬA
- Lý do : Thuật ngữ chưa đóng góp giải thích cho các nội dung có trong tài liệu thuộc .
- Ảnh hưởng : Lược bỏ các thuật ngữ đơn hàng, chiến dịch, khảo sát hài lòng ra khỏi bảng thuật ngữ.
- File thay đổi: srs.md.

### TD-05 Chỉnh sửa trường dữ liệu của bảng ticket_status_log

- Sinh viên tự đánh giá : Trường changed_by đang mang khóa ngoại tuy nhiên chưa không có bảng liên kết
- Quyết định : GIỮ
- Lý do : Trường changed_by phục vụ cho QT-06 để truy vết hành động của người dùng khi trạng thái phiếu thay đổi.
- Ảnh hưởng : Tạm thời lược bỏ khóa ngoại của trường changed_by trong phiên bản này. Xóa thiết lập khóa ngoại trong SQL DDL skeleton của trường changed_by.
- File thay đổi: schema.sql.

## Bổ sung khi hiện thực BT2

### TD-06 Tách migration và seed thành các tệp SQL có thứ tự

- Sinh viên tự đánh giá : DDL ban đầu nằm trong một tệp tổng hợp, chưa có runner theo dõi migration và quy trình riêng để nạp dữ liệu mẫu.
- Quyết định : SỬA
- Lý do : BT2 và tài liệu Buổi 7 yêu cầu dựng được cơ sở dữ liệu từ trạng thái trống, có dữ liệu mẫu và chạy lại được.
- Ảnh hưởng : Tách DDL thành các migration đánh số; thêm runner ghi nhận migration đã chạy; thêm seed dữ liệu mẫu có thể chạy lại và các lệnh `db:migrate`, `db:seed`, `db:setup`.
- File thay đổi: `migrations/`, `seeds/001_seed_demo.sql`, `scripts/migrate.js`, `scripts/seed.js`, `package.json`, `README.md`.

### TD-07 Cập nhật hợp đồng API theo endpoint đang triển khai

- Sinh viên tự đánh giá : Hợp đồng API mô tả chưa đúng response tra cứu khách hàng/thiết bị và chưa liệt kê đầy đủ quy tắc phân trang cùng các lỗi trả về.
- Quyết định : SỬA
- Lý do : Tài liệu API cần khớp với route, validator, service và dữ liệu mà frontend đang sử dụng để người tích hợp có thể dựa vào một hợp đồng thống nhất.
- Ảnh hưởng : Cập nhật tài liệu cho các API đã được triển khai, không thêm endpoint mới và không thay đổi hành vi backend:
  - `GET /api/customers?phone={phone}`: mô tả dữ liệu khách hàng trả về với số điện thoại đã che trong trường `phone_masked`.
  - `GET /api/devices?serial={serial}&customer_id={customer_id}`: mô tả việc tra cứu thiết bị theo số serial và khách hàng, cùng trạng thái bảo hành trả về trong `warranty_approved`.
  - `GET /api/tickets/categories`: mô tả danh sách nhóm sự cố và mức ưu tiên mặc định.
  - `POST /api/tickets/preview`: mô tả request kiểm tra trước khi tạo phiếu, response xem trước gồm thông tin phân loại và hạn cam kết; API này không lưu phiếu.
  - `POST /api/tickets`: mô tả request xác nhận tạo phiếu và response sau khi lưu, sử dụng thời điểm tiếp nhận và hạn cam kết đã xem trước.
  - `GET /api/tickets?status={status}&page={page}&size={size}`: mô tả lọc danh sách theo trạng thái, phân trang, cấu trúc response và giá trị mặc định/giới hạn phân trang.
  - Bổ sung, làm rõ cấu trúc lỗi và mã lỗi áp dụng cho các API trên.
- File thay đổi: `docs/api-contract.md`.

### TD-08 Bổ sung xem/sửa chi tiết và đóng phiếu

- Sinh viên tự đánh giá : Nút Chi tiết chưa hoạt động; nhân viên chưa thể điều chỉnh thông tin tiếp nhận hoặc đóng phiếu đã hoàn tất trong giao diện.
- Quyết định : MỞ RỘNG
- Lý do : Bổ sung thao tác hoàn thiện dữ liệu tiếp nhận và kết thúc phiếu, tận dụng màn hình danh sách, biểu mẫu và bảng log hiện có.
- Ảnh hưởng : Bổ sung `GET /api/tickets/{ticket_id}` để xem chi tiết; `PUT /api/tickets/{ticket_id}` để sửa `issue_desc`, `category_id`, `priority` và tính lại `due_date` theo `received_at` ban đầu; `PATCH /api/tickets/{ticket_id}/status` chỉ cho phép chuyển `HOAN_TAT` sang `DA_DONG`. Thao tác đóng cập nhật `closed_at` và ghi `ticket_status_log` cùng transaction. Phiếu đã đóng/hủy không cho sửa. Seed chỉ gán `closed_at` cho phiếu `DA_DONG`. Đây là phần mở rộng ngoài phạm vi L2 được mô tả trong SRS gốc; không thêm quản lý phân công hoặc các trạng thái trung gian.
- File thay đổi: `src/routes/ticketRoute.js`, `src/validators/ticketValidator.js`, `src/services/ticketService.js`, `src/repositories/ticketRepository.js`, `src/errors/errorHandler.js`, `frontend/src/api/tickets.api.js`, `frontend/src/components/TicketList.jsx`, `frontend/src/components/TicketForm.jsx`, `frontend/src/components/TicketDetail.jsx`, `frontend/src/components/App.jsx`, `frontend/src/styles.css`, `seeds/004_seed_tickets.sql`, `docs/api-contract.md`.
