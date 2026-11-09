# **MỤC 1 – BẢN SRS RÚT GỌN**

## 1.1 Giới thiệu và phạm vi

### 1.1.1. Bối cảnh

**Công ty Cổ phần Bán lẻ & Dịch vụ Mekong Mobile** (gọi tắt: Mekong Mobile) là chuỗi bán lẻ điện thoại di động, máy tính bảng và phụ kiện, đồng thời cung cấp dịch vụ bảo hành – sửa chữa. Công ty thành lập năm 2015, hiện có:

- 24 cửa hàng bán lẻ: 14 tại TP. Hồ Chí Minh, 6 tại Cần Thơ, 4 tại Hà Nội.
- 6 trung tâm bảo hành: 3 tại TP. Hồ Chí Minh, 2 tại Cần Thơ, 1 tại Hà Nội.
- Khoảng 180 nhân viên, trong đó 38 kỹ thuật viên bảo hành và 12 nhân viên tiếp nhận.
- Khoảng 65.000 khách hàng đã từng mua hàng (theo dữ liệu ghi nhận rời rạc, chưa hợp nhất).
- Trung bình mỗi tháng: khoảng 900 đơn hàng và 260 yêu cầu bảo hành.

**Định hướng của ban giám đốc:** trong 12 tháng tới, xây dựng một hệ thống quản lý quan hệ khách hàng (Smart CRM) hợp nhất dữ liệu khách hàng, số hóa quy trình bảo hành và cung cấp báo cáo điều hành. Do nguồn lực hạn chế, công ty triển khai theo từng luồng nghiệp vụ thay vì làm toàn bộ cùng lúc — đây chính là lý do mỗi sinh viên đảm nhận một luồng.

### 1.1.2. Luồng nghiệp vụ L2

Nhân viên tiếp nhận tạo phiếu bảo hành, tra cứu khách hàng theo số điện thoại, ghi nhận thiết bị và mô tả lỗi, phân loại nhóm sự cố, xác định mức độ ưu tiên, sinh hạn cam kết.

### 1.1.3. Ngoài phạm vi (Out of scope)

Tạo mới và quản lý hồ sơ khách hàng

Phân công kỹ thuật viên và đặt lịch hẹn

Theo dõi và chuyển trạng thái phiếu sau trạng thái "Mới"

Quản lý kho linh kiện

Thu thập khảo sát hài lòng

Tự động phân loại bằng AI

### 1.1.4. Bảng thuật ngữ

| Thuật ngữ Thuật   | Định nghĩa                                                                                                      | Tên kỹ thuật gợi ý |
| ----------------- | --------------------------------------------------------------------------------------------------------------- | ------------------ |
| Khách hàng        | Cá nhân đã mua ít nhất một sản phẩm hoặc sử dụng dịch vụ của Mekong Mobile.                                     | customer           |
| Thiết bị          | Một máy cụ thể mà khách hàng sở hữu, xác định bằng số serial hoặc IMEI.                                         | device             |
| Phiếu bảo hành    | Một yêu cầu bảo hành hoặc sửa chữa được ghi nhận, có mã duy nhất và vòng đời trạng thái.                        | ticket             |
| Trạng thái phiếu  | Vị trí hiện tại của phiếu trong vòng đời: Mới → Đã phân công → Đang xử lý → Chờ linh kiện → Hoàn tất → Đã đóng. | ticket_status      |
| Hạn cam kết (SLA) | Thời điểm chậm nhất phải hoàn tất phiếu, tính từ lúc tiếp nhận theo mức ưu tiên.                                | due_date           |
| Nhóm sự cố        | Phân loại nguyên nhân bảo hành: màn hình, pin, sạc, phần mềm, nước vào, khác.                                   | issue_category     |
| Mức ưu tiên       | Mức khẩn của phiếu: Cao, Trung bình, Thấp. Quyết định hạn cam kết.                                              | priority           |
| Kỹ thuật viên     | Nhân viên thực hiện sửa chữa, có danh sách tay nghề và địa bàn làm việc.                                        | technician         |
| Lịch hẹn          | Khung thời gian đã hẹn giữa khách và kỹ thuật viên để giao – nhận thiết bị.                                     | appointment        |
| Mã thiết bị       | Số serial/IMEI của thiết bị                                                                                     | serial_no          |

## 1.2. Các bên liên quan và vai trò

| **Actor**                                   | **Vai trò**                                                                               | **Được làm**                                                                                                                                                              | **Không được làm**                                                                                                                |
| ------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Nhân viên tiếp nhận (`NHAN_VIEN_TIEP_NHAN`) | Nhân viên tại một trung tâm bảo hành, đăng nhập bằng tài khoản được cấp cho trung tâm đó. | Tra cứu khách hàng/thiết bị; xem phiếu của trung tâm mình; xem số điện thoại đã che; tạo phiếu; sửa hoặc đóng phiếu thuộc trung tâm mình nếu phiếu còn cho phép thao tác. | Xem phiếu trung tâm khác; xem số điện thoại đầy đủ; sửa/đóng phiếu ngoài trung tâm; tạo, sửa hoặc đóng phiếu với vai trò quản lý. |
| Quản lý (`QUAN_LY`)                         | Người giám sát hoạt động tiếp nhận.                                                       | Đăng nhập; xem danh sách và chi tiết phiếu.                                                                                                                               | Xem trước hoặc tạo phiếu; sửa hoặc đóng phiếu.                                                                                    |
| Khách hàng                                  | Người mua hàng và sử dụng dịch vụ bảo hành; không đăng nhập vào prototype này.            | Cung cấp thông tin mô tả lỗi và thông tin thiết bị cho nhân viên tiếp nhận.                                                                                               | Trực tiếp truy cập hoặc sửa phiếu trong hệ thống.                                                                                 |

## 1.3. User Story và Yêu cầu chức năng

### 1.3.1. User Story

| **Mã US** | **Mô tả**                                                                                                                       | **Acceptance criteria**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | **MoSCoW**  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| US1       | Là nhân viên tiếp nhận tôi muốn tra cứu khách hàng để sử dụng thông tin của khách hàng đã có khi tiếp nhận yêu cầu bảo hành.    | AC1.1: GIVEN nhân viên tiếp nhận đang ở màn hình tạo phiếu bảo hành. WHEN nhân viên nhập sđt vào thanh tìm kiếm và bấm Tìm kiếm. THEN hệ thống trả về thông tin khách hàng hiện có.<br><br>AC1.2: GIVEN hệ thống đã hiển thị thông tin tìm kiếm khách hàng. WHEN nhân viên tiếp nhận chọn khách hàng từ danh sách kết quả. THEN Hệ thống tự động điền các thông tin của khách hàng (Họ tên) vào form tiếp nhận bảo hành.                                                                                                                                                                                                                                                                                                                                                               | Must Have   |
| US2       | Là nhân viên tiếp nhận, tôi muốn tạo phiếu bảo hành mới để ghi nhận yêu cầu của khách.                                          | AC2.1: Given tôi đã đăng nhập với vai trò Nhân viên tiếp nhận, When tôi xác nhận dữ liệu hợp lệ, Then hệ thống tạo phiếu có mã duy nhất, trạng thái `MOI`, thời điểm tiếp nhận, hạn cam kết và trung tâm lấy từ tài khoản đăng nhập.<br><br>AC2.2: Given người dùng đăng nhập với vai trò Quản lý, When người đó thử xem trước hoặc tạo phiếu qua giao diện/API, Then nút tạo bị vô hiệu hóa trên giao diện và API trả `403 FORBIDDEN`.<br><br>AC2.3: Hệ thống ghi `user_id` của nhân viên thực hiện vào `ticket_status_log.changed_by` cho sự kiện khởi tạo; không lưu trường người tạo riêng trên `ticket`.                                                                                                                                                                          | Must Have   |
| US3       | Là nhân viên tiếp nhận tôi muốn ghi nhận thiết bị và mô tả lỗi để cung cấp đủ thông tin cho kỹ thuật viên tiếp nhận sửa chữa.   | AC3.1: GIVEN nhân viên tiếp nhận đã chọn đủ thông tin khách hàng trên phiếu bảo hành. WHEN nhân viên tiếp nhận nhập số Serial/IMEI của thiết bị, nhập mô tả lỗi bằng văn bản. THEN hệ thống tự động đối chiếu ngày mua với thời hạn bảo hành và xác định trạng thái "Còn bảo hành" hoặc "Hết bảo hành".<br><br>AC3.2: GIVEN nhân viên tiếp nhận đã chọn đủ thông tin khách hàng trên phiếu bảo hành. WHEN nhân viên tiếp nhận để trống trường mô tả lỗi và bấm Lưu. THEN hệ thống hiện yêu cầu nhập trường bắt buộc trước khi hoàn tất lưu.                                                                                                                                                                                                                                            | Must Have   |
| US4       | Là nhân viên tiếp nhận tôi muốn chọn nhóm sự cố và mức ưu tiên để phân loại phiếu bảo hành.                                     | AC4.1: GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo hành. WHEN nhân viên tiếp nhận chọn nhấp vào danh sách chọn Nhóm sự cố và chọn một giá trị phù hợp (ví dụ: MAN_HINH, PIN, SAC) và mức ưu tiên phù hợp (Cao, Trung bình, Thấp) rồi bấm Lưu. THEN hệ thống ghi nhận nhóm sự cố và mức ưu tiên đã chọn vào thông tin chi tiết của phiếu bảo hành.<br><br>AC4.2: GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo hành. WHEN nhân viên không chọn Nhóm sự cố từ danh sách chọn và không chọn mức ưu tiên, bấm Lưu. THEN hệ thống hiển thị thông báo yêu cầu chọn Mức ưu tiên trước khi hoàn tất lưu phiếu.                                                                                                                                                           | Must Have   |
| US5       | Là nhân viên tiếp nhận tôi muốn hệ thống tự sinh hạn để dự kiến ngày bàn giao thiết bị cho khách hàng.                          | AC5.1: GIVEN nhân viên tiếp nhận đã chọn Mức ưu tiên (ví dụ: Cao) cho phiếu bảo hành. WHEN nhân viên tiếp nhận chọn tạo phiếu phiếu bảo hành. THEN hệ thông tự động tính toán và gán giá trị hạn cam kết đã quy định theo mức ưu tiên đã được chọn (ví dụ: 24 giờ (chỉ tính ngày làm việc Thứ 2 - Thứ 7)) trên màn hình xác nhận tạo phiếu.<br><br>AC5.2: GIVEN nhân viên tiếp nhận đã chọn Mức ưu tiên (ví dụ: Cao) cho phiếu bảo hành. WHEN nhân viên tiếp nhận quay lại chọn Mức ưu tiên khác (ví dụ: Thấp) và chọn tạo phiếu bảo hành. THEN hệ thống ghi nhận Mức ưu tiên mới và tự động tính toán và gán giá trị hạn cam kết đã quy định theo mức ưu tiên đã được chọn lại (ví dụ: 24 giờ thành 120 giờ (chỉ tính ngày làm việc Thứ 2 - Thứ 7)) trên màn hình xác nhận tạo phiếu. | Should Have |
| US6       | Là nhân viên tiếp nhận hoặc quản lý, tôi muốn xem các phiếu mình được phép truy cập để theo dõi thông tin tiếp nhận.            | AC6.1: Nhân viên chỉ thấy phiếu thuộc trung tâm gắn với tài khoản; quản lý thấy phiếu ở mọi trung tâm.<br><br>AC6.2: Khi lọc theo trạng thái, danh sách chỉ gồm phiếu phù hợp và vẫn tuân thủ phạm vi trung tâm của vai trò.<br><br>AC6.3: Nhân viên chỉ thấy số điện thoại đã che trong chi tiết; quản lý thấy số đầy đủ trong chi tiết. Tra cứu khách hàng qua API luôn trả số đã che cho cả hai vai trò.<br><br>AC6.4: Nhân viên không thể xem chi tiết phiếu ngoài trung tâm; API trả `404 NOT_FOUND`.                                                                                                                                                                                                                                                                             | Should Have |
| US7       | Là nhân viên tiếp nhận hoặc quản lý, tôi muốn đăng nhập bằng tài khoản được cấp để sử dụng chức năng đúng với vai trò của mình. | AC7.1: Given tài khoản đang hoạt động và thông tin đăng nhập chính xác, When gửi tên đăng nhập và mật khẩu, Then hệ thống tạo phiên, đặt cookie `mekong_session` HttpOnly và trả `user_id`, `username`, `role`, `center_id` (quản lý có `center_id = null`).<br><br>AC7.2: Given tên đăng nhập/mật khẩu sai hoặc tài khoản không hoạt động, When đăng nhập, Then hệ thống trả `401 INVALID_CREDENTIALS` và không tạo phiên.                                                                                                                                                                                                                                                                                                                                                            | Must Have   |
| US8       | Là người dùng đã đăng nhập, tôi muốn đăng xuất để chấm dứt phiên làm việc hiện tại.                                             | AC8.1: When gọi đăng xuất, Then hệ thống thu hồi phiên tương ứng nếu cookie hợp lệ, xóa cookie phía client và trả `204 No Content`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Must Have   |
| US9       | Là nhân viên tiếp nhận hoặc quản lý, tôi muốn xem chi tiết phiếu được phép truy cập để kiểm tra thông tin tiếp nhận.            | AC9.1: Nhân viên chỉ xem phiếu thuộc trung tâm của mình; quản lý chỉ xem phiếu tại các trung tâm được gán.<br><br>AC9.2: Số điện thoại trong chi tiết được che với nhân viên và hiển thị đầy đủ với quản lý.<br><br>AC9.3: Phiếu ngoài phạm vi được trả `404 NOT_FOUND`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Must Have   |
| US10      | Là nhân viên tiếp nhận, tôi muốn sửa thông tin tiếp nhận của phiếu thuộc trung tâm mình để cập nhật dữ liệu chính xác.          | AC10.1: Nhân viên được sửa mô tả lỗi, nhóm sự cố và mức ưu tiên của phiếu chưa đóng hoặc chưa hủy thuộc trung tâm mình.<br><br>AC10.2: Hệ thống tính lại hạn cam kết theo mức ưu tiên mới và thời điểm tiếp nhận ban đầu; không đổi thời điểm tiếp nhận.<br><br>AC10.3: Quản lý, phiếu ngoài trung tâm và phiếu đã đóng hoặc đã hủy không được sửa.                                                                                                                                                                                                                                                                                                                                                                                                                                    | Should Have |
| US11      | Là nhân viên tiếp nhận, tôi muốn đóng phiếu khi hoàn tất xử lý tiếp nhận để ghi nhận kết thúc phiếu.                            | AC11.1: Nhân viên chỉ đóng được phiếu thuộc trung tâm mình; quản lý không được đóng phiếu.<br><br>AC11.2: Khi đóng phiếu, hệ thống chuyển trạng thái sang `DA_DONG`, ghi `closed_at` và ghi nhật ký trạng thái cùng người thực hiện.<br><br>AC11.3: Phiếu đã `DA_DONG` không thể đóng lại; yêu cầu này trả `409 INVALID_STATUS_TRANSITION`.                                                                                                                                                                                                                                                                                                                                                                                                                                            | Should Have |

### 1.3.2. Yêu cầu chức năng

FR1: Hệ thống cho phép nhân viên tiếp nhận tra cứu thông tin khách hàng theo số điện thoại để sử dụng thông tin khách hàng đã có khi tiếp nhận yêu cầu bảo hành.

FR2: Hệ thống cho phép Nhân viên tiếp nhận tạo phiếu bảo hành mới với mã phiếu duy nhất, trạng thái ban đầu `MOI`, thời điểm tiếp nhận và trung tâm lấy từ tài khoản đang đăng nhập. Người thực hiện sự kiện khởi tạo được ghi trong `ticket_status_log`.

FR3: Hệ thống cho phép Nhân viên tiếp nhận nhập số serial/IMEI để tra cứu thiết bị, tự động điền thông tin thiết bị, kiểm tra thiết bị có thuộc khách hàng đang chọn hay không và còn hạn bảo hành hay không (theo QT-05), đồng thời cho phép ghi nhận mô tả lỗi do khách cung cấp.

FR4: Hệ thống cho phép Nhân viên tiếp nhận chọn một nhóm sự cố từ danh mục cố định (Màn hình, Pin, Sạc, Phần mềm, Nước vào, Khác) và chọn lại mức ưu tiên phù hợp (Cao, Trung bình, Thấp) khi tạo phiếu bảo hành.

FR5: Hệ thống tự động tính toán và ghi nhận hạn cam kết (due_date) dựa trên mức ưu tiên đã chọn theo quy tắc QT-04: Cao = 24 giờ, Trung bình = 72 giờ, Thấp = 120 giờ làm việc (chỉ tính từ thứ Hai đến thứ Bảy).

FR6: Hệ thống cho phép nhân viên tiếp nhận xem danh sách phiếu thuộc trung tâm của mình và quản lý xem danh sách phiếu ở mọi trung tâm; người dùng có thể lọc theo trạng thái. Nhân viên không được xem phiếu ngoài trung tâm (API trả 404). Quản lý chỉ được xem phiếu, không được xem trước, tạo, sửa hoặc đóng phiếu (API trả 403).

FR7: Hệ thống cho phép nhân viên tiếp nhận và quản lý đăng nhập bằng username/password của tài khoản đang hoạt động để truy cập chức năng của hệ thống.

FR8: Hệ thống cho phép người dùng đăng xuất khi không còn muốn sử dụng.

FR9: Hệ thống cho phép nhân viên tiếp nhận và quản lý xem chi tiết phiếu trong phạm vi trung tâm được phép; số điện thoại được hiển thị theo vai trò.

FR10: Hệ thống cho phép nhân viên tiếp nhận sửa mô tả lỗi, nhóm sự cố và mức ưu tiên của phiếu thuộc trung tâm mình nếu phiếu chưa đóng hoặc chưa hủy. Hạn cam kết được tính lại theo thời điểm tiếp nhận ban đầu và mức ưu tiên mới.

FR11: Hệ thống cho phép nhân viên tiếp nhận đóng phiếu thuộc trung tâm mình. Khi đóng, hệ thống cập nhật trạng thái và thời điểm đóng, đồng thời ghi nhật ký; phiếu đã đóng không thể đóng lại.

## 1.4. Yêu cầu phi chức năng

NFR1: Danh sách phiếu bảo hành phải hiển thị trong dưới 5 giây với 1.000 bản ghi.

NFR2: 100% response chi tiết phiếu áp dụng quy tắc hiển thị theo vai trò: Quản lý thấy số điện thoại đầy đủ, Nhân viên tiếp nhận thấy 4 chữ số ở giữa được che (ví dụ `090****156`). API tra cứu khách hàng luôn trả số điện thoại đã che cho cả hai vai trò.

NFR3: 100% thao tác tạo phiếu bảo hành thất bại không được tạo phiếu mới trong cơ sở dữ liệu và phải giữ nguyên toàn bộ dữ liệu đã nhập trên biểu mẫu, cho phép nhân viên điều chỉnh thông tin và thử lại mà không cần nhập lại từ đầu.

## 1.5. Ràng buộc và quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ**                                                                                                                                                                                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| QT-01  | Số điện thoại khách hàng là duy nhất trong hệ thống. Khi nhập một số đã tồn tại, hệ thống phải hiển thị hồ sơ có sẵn thay vì tạo hồ sơ mới.                                                                                                                                     |
| QT-02  | Số điện thoại được chuẩn hóa về dạng 10 chữ số bắt đầu bằng 0 trước khi lưu. Các dạng +84…, 84…, có dấu cách hoặc dấu chấm đều phải quy về dạng chuẩn.                                                                                                                          |
| QT-03  | Thiết bị được xác định duy nhất bằng số serial hoặc IMEI. Một thiết bị chỉ thuộc về một khách hàng tại một thời điểm.                                                                                                                                                           |
| QT-04  | Hạn cam kết được sinh tự động từ thời điểm tiếp nhận theo mức ưu tiên: CAO = 24 giờ, TRUNG_BINH = 72 giờ, THAP = 120 giờ. Chỉ tính ngày làm việc (thứ Hai đến thứ Bảy).                                                                                                         |
| QT-05  | Thiết bị được coi là còn bảo hành nếu (ngày tiếp nhận − ngày mua) ≤ số tháng bảo hành của sản phẩm. Nếu không có ngày mua, phiếu phải được đánh dấu "chưa xác minh bảo hành" và cần quản lý phê duyệt.                                                                          |
| QT-06  | Phiếu chỉ được chuyển trạng thái theo đúng vòng đời ở Hình 6.2. Không được quay lại trạng thái trước. Mọi lần chuyển trạng thái đều phải ghi vào ticket_status_log.                                                                                                             |
| QT-07  | Không được xóa vật lý phiếu bảo hành, đơn hàng hay hồ sơ khách hàng. Chỉ đánh dấu ngừng sử dụng (soft delete) và giữ nguyên lịch sử.                                                                                                                                            |
| QT-08  | Nhân viên tiếp nhận chỉ được xem và thao tác với phiếu thuộc trung tâm gắn với tài khoản; phiếu ngoài trung tâm không được tiết lộ và API trả 404. Quản lý được xem phiếu ở mọi trung tâm nhưng không được tạo, sửa hoặc đóng phiếu. Phân quyền không dựa trên người tạo phiếu. |
| QT-09  | Số điện thoại trong chi tiết phiếu được che với nhân viên tiếp nhận (ví dụ `090****567`) và hiển thị đầy đủ với quản lý. API tra cứu khách hàng chỉ trả số đã che cho mọi vai trò.                                                                                              |

## 1.6. Bảng truy vết yêu cầu

| **Mã FR** | **Yêu cầu chức năng**                                                                                                                                                                | **User Story** | **Use Case** | **MoSCoW**  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------ | ----------- |
| FR1       | Nhân viên tiếp nhận tra cứu khách hàng theo số điện thoại đã có.                                                                                                                     | US1            | UC1          | Must Have   |
| FR2       | Nhân viên tạo phiếu có mã duy nhất, trạng thái ban đầu, thời điểm nhận và trung tâm tài khoản; người thực hiện khởi tạo được ghi ở log, không lưu trường người tạo riêng trên phiếu. | US2            | UC2          | Must Have   |
| FR3       | Nhân viên tra cứu thiết bị, xác minh khách hàng sở hữu, tình trạng bảo hành và ghi nhận mô tả lỗi.                                                                                   | US3            | UC3          | Must Have   |
| FR4       | Nhân viên phân loại nhóm sự cố và mức ưu tiên khi tạo phiếu.                                                                                                                         | US4            | UC4          | Must Have   |
| FR5       | Hệ thống tính hạn cam kết theo QT-04 và mức ưu tiên.                                                                                                                                 | US5            | UC5          | Should Have |
| FR6       | Nhân viên xem phiếu trong trung tâm; quản lý xem phiếu mọi trung tâm ở chế độ chỉ xem.                                                                                               | US6            | UC6          | Should Have |
| FR7       | Người dùng đăng nhập bằng username/password.                                                                                                                                         | US7            | UC7          | Must Have   |
| FR8       | Thu hồi phiên và xóa cookie khi đăng xuất.                                                                                                                                           | US8            | UC8          | Must Have   |
| FR9       | Xem chi tiết phiếu theo phạm vi trung tâm và quyền xem số điện thoại.                                                                                                                | US9            | UC9          | Must Have   |
| FR10      | Sửa thông tin tiếp nhận và tính lại hạn cam kết cho phiếu còn cho phép sửa.                                                                                                          | US10           | UC10         | Should Have |
| FR11      | Đóng phiếu, cập nhật thời điểm đóng và ghi nhật ký trạng thái.                                                                                                                       | US11           | UC11         | Should Have |
