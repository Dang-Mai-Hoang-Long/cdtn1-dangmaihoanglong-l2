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

### TD-09 Cho phép đóng phiếu từ mọi trạng thái

- Sinh viên tự đánh giá : Chức năng đóng phiếu trước đây chỉ áp dụng cho phiếu ở trạng thái `HOAN_TAT`, khiến nhân viên tiếp nhận không thể đóng phiếu từ các trạng thái khác.
- Quyết định : SỬA
- Lý do : Luồng hiện tại cần cho phép nhân viên đóng phiếu ở bất kỳ trạng thái nào; chỉ phiếu đã `DA_DONG` mới không thể đóng lại.
- Ảnh hưởng : Nút Đóng phiếu hiển thị cho mọi trạng thái trừ `DA_DONG`. Repository cập nhật trạng thái và `closed_at`, đồng thời ghi log với `from_status` lấy từ trạng thái thực tế của phiếu và `to_status = 'DA_DONG'` trong cùng transaction. Hợp đồng API và README được cập nhật cho hành vi mới. SRS mô tả chuỗi trạng thái vòng đời nhưng không nêu điều kiện bắt buộc phải ở `HOAN_TAT` mới được đóng; điều kiện cũ nằm trong `docs/api-contract.md` và ghi nhận triển khai TD-08.
- File thay đổi: `src/services/ticketService.js`, `src/repositories/ticketRepository.js`, `frontend/src/components/TicketDetail.jsx`, `frontend/src/api/tickets.api.js`, `docs/api-contract.md`, `docs/thay-doi-thiet-ke.md`, `README.md`.

## Bổ sung khi hiện thực BT3

### TD-10 Bổ sung chức năng phân quyền truy cập theo vai trò và trung tâm

- Yêu cầu: Quản lý chỉ xem phiếu, không tạo/sửa/đóng; nhân viên tiếp nhận chỉ xem và thao tác trên phiếu thuộc trung tâm của mình; quản lý xem số điện thoại đầy đủ còn nhân viên thấy số đã che.
- Quyết định: BỔ SUNG chức năng xác thực và phân quyền truy cập vào luồng L2.
- Lý do: Thực hiện kiểm soát truy cập ở cả giao diện và API để thao tác bị vô hiệu hóa trên giao diện vẫn không thể gọi trực tiếp.
- Ảnh hưởng: Thêm bảng `service_center`, `app_user`, `app_session` và migration `007_create_access_control.sql`; dùng `ticket.center_id` có sẵn, không thêm cột vào `ticket`. Tài khoản nhân viên gắn với một trung tâm; quản lý không gắn trung tâm và được xem phiếu ở mọi trung tâm. Backend lấy trung tâm của nhân viên từ phiên đăng nhập, giới hạn danh sách/chi tiết/cập nhật/đóng theo trung tâm; phiếu ngoài trung tâm được trả như không tồn tại. Giao diện vô hiệu hóa nút tạo phiếu với quản lý, API vẫn chặn thao tác này.
- Xác thực và bảo vệ dữ liệu: mật khẩu băm bằng scrypt với salt ngẫu nhiên; mã phiên ngẫu nhiên được lưu dưới dạng SHA-256 trong CSDL, hết hạn sau 8 giờ. Cookie phiên đặt `HttpOnly`, `SameSite=Strict`; thuộc tính `Secure` bật trong production hoặc theo `AUTH_COOKIE_SECURE`. Đăng nhập bị giới hạn sau 5 lần sai trong 15 phút theo địa chỉ IP; bộ đếm hiện lưu trong bộ nhớ một tiến trình. Lỗi hệ thống trả thông báo chung, chi tiết được ghi log phía máy chủ. Hiện không cấu hình CORS; giao diện dùng cùng origin/proxy trong cấu hình phát triển.
- Nhật ký và giới hạn quyền sở hữu: ghi `user_id` vào `ticket_status_log.changed_by` khi tạo/đóng phiếu; đây là người thực hiện sự kiện, không phải trường lưu người tạo phiếu. Phân quyền hiện theo vai trò và trung tâm, không phân biệt nhân viên nào tạo phiếu. Không có API xóa phiếu; do đó chưa thể kiểm tra quyền xóa qua API. Không bổ sung trường người tạo vào `ticket` trong quyết định này.
- Giới hạn dữ liệu: Hai trung tâm mẫu có ID 0 và 1 (Trung tâm A/B); migration giữ lại các ID trung tâm đã xuất hiện trên phiếu hiện hữu. Checklist Buổi 13 đánh giá A01 đạt theo phạm vi phân quyền theo trung tâm; dự án không phân biệt nhân viên tạo phiếu. A05 đạt một phần: đã thử payload qua API, chưa thử XSS trực tiếp trên trình duyệt.
- File thay đổi: `migrations/007_create_access_control.sql`, `scripts/seedDemoUsers.js`, `scripts/createUser.js`, `src/middleware/authMiddleware.js`, `src/repositories/userRepository.js`, `src/services/authService.js`, `src/routes/authRoute.js`, `src/routes/ticketRoute.js`, `src/services/ticketService.js`, `src/repositories/ticketRepository.js`, frontend, `docs/srs.md`, `docs/api-contract.md`, `docs/checklist-bao-mat.md`, README và `.env.example`.

### TD-11 Gán quản lý vào nhiều trung tâm

- Yêu cầu: Quản lý chỉ được xem phiếu thuộc một hoặc nhiều trung tâm được giao; không có quyền sửa, tạo hoặc đóng phiếu.
- Quyết định: BỔ SUNG bảng liên kết `user_center` giữa tài khoản quản lý và trung tâm.
- Lý do: Một trường `app_user.center_id` chỉ biểu diễn được một trung tâm, trong khi quản lý có thể phụ trách nhiều trung tâm. Không thêm cột vào `ticket` và không thay đổi quyền theo người tạo phiếu.
- Ảnh hưởng: Thêm migration `008_create_user_center.sql`; các quản lý đã tồn tại được gán các trung tâm hiện có để giữ phạm vi xem trước migration. Tài khoản demo `quanly` được gán Trung tâm A và B. Khi đăng nhập/xác thực, API trả thêm `center_ids`; danh sách và chi tiết phiếu của quản lý được giới hạn theo các ID này. Quản lý không được gán trung tâm nào không nhìn thấy phiếu nào. Nhân viên tiếp nhận vẫn bị giới hạn ở `app_user.center_id`.
- Thay đổi này thay thế hành vi ban đầu trong TD-10 cho phép quản lý xem tất cả trung tâm; kể từ TD-11, phạm vi xem được quyết định bởi các dòng phân công trong `user_center`.
- Tạo tài khoản quản lý tùy chỉnh cần biến `APP_USER_CENTER_IDS` chứa một hoặc nhiều ID trung tâm phân cách bằng dấu phẩy; script xác nhận các trung tâm tồn tại trước khi tạo tài khoản và liên kết.
- File thay đổi: `migrations/008_create_user_center.sql`, `src/repositories/userRepository.js`, `src/services/authService.js`, `src/services/ticketService.js`, `src/repositories/ticketRepository.js`, `scripts/createUser.js`, `scripts/seedDemoUsers.js`, `docs/api-contract.md`.
