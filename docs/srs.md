**MỤC 1 – BẢN SRS RÚT GỌN**

1.1 Giới thiệu và phạm vi

1.1.1. Bối cảnh:

**Công ty Cổ phần Bán lẻ & Dịch vụ Mekong Mobile** (gọi tắt: Mekong Mobile) là chuỗi bán lẻ điện thoại di động, máy tính bảng và phụ kiện, đồng thời cung cấp dịch vụ bảo hành – sửa chữa. Công ty thành lập năm 2015, hiện có:

- 24 cửa hàng bán lẻ: 14 tại TP. Hồ Chí Minh, 6 tại Cần Thơ, 4 tại Hà Nội.
- 6 trung tâm bảo hành: 3 tại TP. Hồ Chí Minh, 2 tại Cần Thơ, 1 tại Hà Nội.
- Khoảng 180 nhân viên, trong đó 38 kỹ thuật viên bảo hành và 12 nhân viên tiếp nhận.
- Khoảng 65.000 khách hàng đã từng mua hàng (theo dữ liệu ghi nhận rời rạc, chưa hợp nhất).
- Trung bình mỗi tháng: khoảng 900 đơn hàng và 260 yêu cầu bảo hành.

**Định hướng của ban giám đốc:** trong 12 tháng tới, xây dựng một hệ thống quản lý quan hệ khách hàng (Smart CRM) hợp nhất dữ liệu khách hàng, số hóa quy trình bảo hành và cung cấp báo cáo điều hành. Do nguồn lực hạn chế, công ty triển khai theo từng luồng nghiệp vụ thay vì làm toàn bộ cùng lúc — đây chính là lý do mỗi sinh viên đảm nhận một luồng.

1.1.2. Luồng nghiệp vụ L2

Nhân viên tiếp nhận tạo phiếu bảo hành, tra cứu khách hàng theo số điện thoại, ghi nhận thiết bị và mô tả lỗi, phân loại nhóm sự cố, xác định mức độ ưu tiên, sinh hạn cam kết.

1.1.3. Ngoài phạm vi (Out of scope)

Tạo mới và quản lý hồ sơ khách hàng

Phân công kỹ thuật viên và đặt lịch hẹn

Theo dõi và chuyển trạng thái phiếu sau trạng thái "Mới"

Quản lý kho linh kiện

Thu thập khảo sát hài lòng

Tự động phân loại bằng AI

1.1.4. Bảng thuật ngữ:

| **Thuật ngữ Thuật**  | **Định nghĩa**                                                                                                  | **Tên kỹ thuật gợi ý** |
| -------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Khách hàng           | Cá nhân đã mua ít nhất một sản phẩm hoặc sử dụng dịch vụ của Mekong Mobile.                                     | customer               |
| Thiết bị             | Một máy cụ thể mà khách hàng sở hữu, xác định bằng số serial hoặc IMEI.                                         | device                 |
| Đơn hàng             | Một lần mua hàng tại một cửa hàng, gồm một hoặc nhiều sản phẩm.                                                 | order / order_item     |
| Phiếu bảo hành       | Một yêu cầu bảo hành hoặc sửa chữa được ghi nhận, có mã duy nhất và vòng đời trạng thái.                        | ticket                 |
| Trạng thái phiếu     | Vị trí hiện tại của phiếu trong vòng đời: Mới → Đã phân công → Đang xử lý → Chờ linh kiện → Hoàn tất → Đã đóng. | ticket_status          |
| Hạn cam kết (SLA)    | Thời điểm chậm nhất phải hoàn tất phiếu, tính từ lúc tiếp nhận theo mức ưu tiên.                                | due_date               |
| Nhóm sự cố           | Phân loại nguyên nhân bảo hành: màn hình, pin, sạc, phần mềm, nước vào, khác.                                   | issue_category         |
| Mức ưu tiên          | Mức khẩn của phiếu: Cao, Trung bình, Thấp. Quyết định hạn cam kết.                                              | priority               |
| Kỹ thuật viên        | Nhân viên thực hiện sửa chữa, có danh sách tay nghề và địa bàn làm việc.                                        | technician             |
| Linh kiện            | Bộ phận thay thế dùng trong sửa chữa, có mã và tồn kho theo trung tâm.                                          | part / part_stock      |
| Lịch hẹn             | Khung thời gian đã hẹn giữa khách và kỹ thuật viên để giao – nhận thiết bị.                                     | appointment            |
| Phân khúc khách hàng | Nhóm khách được xếp theo giá trị và hành vi mua: VIP, Thường xuyên, Mới, Ngủ đông.                              | customer_segment       |
| Khảo sát hài lòng    | Phản hồi của khách sau khi phiếu được đóng, thang điểm 1–5 kèm nhận xét.                                        | survey_response        |
| Chiến dịch           | Một đợt gửi thông tin khuyến mãi hoặc chăm sóc tới một nhóm khách hàng.                                         | campaign               |
| Mã thiết bị          | Số serial/IMEI của thiết bị                                                                                     | serial_no              |

1.2. Các bên liên quan và vai trò

| **Actor**                                | **Vai trò**                                       | **Được làm**                                                                                                             | **Không được làm**                                                          |
| ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| Nhân viên tiếp nhận (trung tâm bảo hành) | Tiếp nhận yêu cầu bảo hành, ghi phiếu, hẹn khách. | Tra cứu khách hàng, ghi nhận yêu cầu và thiết bị, phân loại sự cố, xác định mức độ ưu tiên để hệ thống sinh hạn cam kết. | Tiếp nhận sửa chữa, theo dõi doanh thu, tồn kho, nhân sự cửa hàng.          |
| Khách hàng                               | Mua hàng và sử dụng dịch vụ bảo hành              | Cung cấp thông tin mô tả lỗi và thông tin thiết bị                                                                       | Sửa đổi thông tin phiếu bảo hành, phân loại sự cố, xác định mức độ ưu tiên. |

1.3. User Story và Yêu cầu chức năng

1.3.1. User Story:

| **Mã US** | **Mô tả**                                                                                                                     | **Acceptance criteria**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US1       | Là nhân viên tiếp nhận tôi muốn tra cứu khách hàng để sử dụng thông tin của khách hàng đã có khi tiếp nhận yêu cầu bảo hành.  | AC1.1: GIVEN nhân viên tiếp nhận đang ở màn hình tạo phiếu bảo hành. WHEN nhân viên nhập sđt vào thanh tìm kiếm và bấm Tìm kiếm. THEN hệ thống trả về thông tin khách hàng hiện có.<br><br>AC1.2: GIVEN hệ thông đã hiển thị thông tin tìm kiếm khách hàng. WHEN nhân viên tiếp nhận chọn khách hàng từ danh sách kết quả. THEN Hệ thống tự động điền các thông tin của khách hàng (Họ tên) vào form tiếp nhận bảo hành.                                                                                                                                                                                                                                                                                                                                                              |
| US2       | Là nhân viên tiếp nhận, tôi muốn tạo một phiếu bảo hành mới để ghi nhận bảo hành của khách.                                   | AC2.1: Given tôi đã đăng nhập với quyền Nhân viên tiếp nhận, When tôi chọn chức năng "Tạo phiếu bảo hành" và lưu thành công, Then hệ thống tạo phiếu mới với mã phiếu duy nhất dạng BH-xxxxxx/2026, trạng thái "Mới", đồng thời ghi nhận người tạo, thời điểm tạo và trung tâm tiếp nhận vào phiếu.<br><br>AC2.2: Given người dùng đã đăng nhập với một vai trò khác Nhân viên tiếp nhận (ví dụ Kỹ thuật viên), When người dùng cố gắng truy cập chức năng "Tạo phiếu bảo hành", Then hệ thống từ chối truy cập và hiển thị thông báo không có quyền thực hiện chức năng này.                                                                                                                                                                                                         |
| US3       | Là nhân viên tiếp nhận tôi muốn ghi nhận thiết bị và mô tả lỗi để cung cấp đủ thông tin cho kỹ thuật viên tiếp nhận sửa chữa. | AC3.1: GIVEN nhân viên tiếp nhận đã chọn đủ thông tin khách hàng trên phiếu bảo hành. WHEN nhân viên tiếp nhận nhập số Serial/IMEI của thiết bị, nhập mô tả lỗi bằng văn bản. THEN hệ thông tự động đối chiếu ngày mua với thời hạn bảo hành và xác định trạng thái "Còn bảo hành" hoặc "Hết bảo hành".<br><br>AC3.2: GIVEN nhân viên tiếp nhận đã chọn đủ thông tin khách hàng trên phiếu bảo hành. WHEN nhân viên tiếp nhận để trống trường mô tả lỗi và bấm Lưu. THEN hệ thống hiện yêu cầu nhập trường bắt buộc trước khi hoàn tất lưu.                                                                                                                                                                                                                                           |
| US4       | Là nhân viên tiếp nhận tôi muốn chọn nhóm sự cố và mức ưu tiến để phân loại phiếu bảo hành.                                   | AC4.1: GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo hành. WHEN nhân viên tiếp nhận chọn nhấp vào danh sách chọn Nhóm sự cố và chọn một giá trị phù hợp (ví dụ: MAN_HINH, PIN, SAC) và mức ưu tiên phù hợp (Cao, Trung bình, Thấp) rồi bấm Lưu. THEN hệ thống ghi nhận nhóm sự cố và mức ưu tiên đã chọn vào thông tin chi tiết của phiếu bảo hành.<br><br>AC4.2: GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo hành. WHEN nhân viên không chọn Nhóm sự cố từ danh sách chọn và không chọn mức ưu tiên, bấm Lưu. THEN hệ thống hiển thị thông báo yêu cầu chọn Mức ưu tiên trước khi hoàn tất lưu phiếu.                                                                                                                                                          |
| US5       | Là nhân viên tiếp nhận tôi muốn hệ thống tự sinh hạn để dự kiến ngày bàn giao thiết bị cho khách hàng.                        | AC5.1: GIVEN nhân viên tiếp nhận đã chọn Mức ưu tiên (ví dụ: Cao) cho phiếu bảo hành. WHEN nhân viên tiếp nhận chọn tạo phiếu phiếu bảo hành. THEN hệ thông tự động tính toán và gán giá trị hạn cam kết đã quy định theo mức ưu tiên đã được chọn (ví dụ: 24 giờ (chỉ tính ngày làm việc Thứ 2 - Thứ 7)) trên màn hình xác nhận tạo phiếu.<br><br>AC5.2: GIVEN nhân viên tiếp nhận đã chọn Mức ưu tiên (ví dụ: Cao) cho phiếu bảo hành. WHEN nhân viên tiếp nhận quay lại chọn Mức ưu tiên khác (ví dụ Thấp) và chọn tạo phiếu bảo hành. THEN hệ thông ghi nhận Mức ưu tiên mới và tự động tính toán và gán giá trị hạn cam kết đã quy định theo mức ưu tiên đã được chọn lại (ví dụ: 24 giờ thành 120 giờ (chỉ tính ngày làm việc Thứ 2 - Thứ 7)) trên màn hình xác nhận tạo phiếu. |
| US6       | Là nhân viên tiếp nhận tôi muốn xem danh sách phiếu bảo hành kèm trạng thái để biết tiến độ xử lý của các phiếu bảo hành.     | AC6.1: Given nhân viên tiếp nhận đã đăng nhập và có quyền xem phiếu bảo hành, When nhân viên truy cập chức năng xem danh sách phiếu bảo hành, Then hệ thống hiển thị danh sách các phiếu bảo hành kèm trạng thái tương ứng của từng phiếu.<br><br>AC6.2: Given danh sách phiếu bảo hành có các trạng thái khác nhau, When nhân viên chọn một trạng thái để lọc (ví dụ: Mới), Then hệ thống chỉ hiển thị các phiếu bảo hành có trạng thái đã chọn.                                                                                                                                                                                                                                                                                                                                     |

1.3.2. Yêu cầu chức năng:

FR1: Hệ thống cho phép nhân viên tiếp nhận tra cứu thông tin khách hàng theo số điện thoại để sử dụng thông tin khách hàng đã có khi tiếp nhận yêu cầu bảo hành.

FR2: Hệ thống cho phép Nhân viên tiếp nhận tạo phiếu bảo hành mới với mã phiếu duy nhất, trạng thái ban đầu "Mới", đồng thời ghi nhận người tạo, thời điểm tạo và trung tâm tiếp nhận.

FR3: Hệ thống cho phép Nhân viên tiếp nhận nhập số serial/IMEI để tra cứu thiết bị, tự động điền thông tin thiết bị, kiểm tra thiết bị có thuộc khách hàng đang chọn hay không và còn hạn bảo hành hay không (theo QT-05), đồng thời cho phép ghi nhận mô tả lỗi do khách cung cấp.

FR4: Hệ thống cho phép Nhân viên tiếp nhận chọn một nhóm sự cố từ danh mục cố định (Màn hình, Pin, Sạc, Phần mềm, Nước vào, Khác) và chọn lại mức ưu tiên phù hợp (Cao, Trung bình, Thấp) khi tạo phiếu bảo hành.

FR5: Hệ thống tự động tính toán và ghi nhận hạn cam kết (due_date) dựa trên mức ưu tiên đã chọn theo quy tắc QT-04: Cao = 24 giờ, Trung bình = 72 giờ, Thấp = 120 giờ làm việc (chỉ tính từ thứ Hai đến thứ Bảy).

FR6: Hệ thống cho phép nhân viên tiếp nhận xem danh sách phiếu bảo hành kèm trạng thái của mỗi phiếu trên mỗi hàng và xem danh sách phiếu theo trạng thái.

1.4. Yêu cầu phi chức năng

NFR1: Danh sách phiếu bảo hành phải hiển thị trong dưới 5 giây với 1.000 bản ghi.

NFR2: Chỉ nhân viên có vai trò Quản lý xem được số điện thoại đầy đủ của khách, các vai trò khác thấy dạng che 4 số ở giữa (ví dụ 090\*\*\*\*156).

NFR3: Thêm một nhóm sự cố mới chỉ cần sửa dữ liệu cấu hình, không cần sửa mã nguồn và không cần triển khai lại.

1.5. Ràng buộc và quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ**                                                                                                                                                                                  |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| QT-01  | Số điện thoại khách hàng là duy nhất trong hệ thống. Khi nhập một số đã tồn tại, hệ thống phải hiển thị hồ sơ có sẵn thay vì tạo hồ sơ mới.                                                            |
| QT-02  | Số điện thoại được chuẩn hóa về dạng 10 chữ số bắt đầu bằng 0 trước khi lưu. Các dạng +84…, 84…, có dấu cách hoặc dấu chấm đều phải quy về dạng chuẩn.                                                 |
| QT-03  | Thiết bị được xác định duy nhất bằng số serial hoặc IMEI. Một thiết bị chỉ thuộc về một khách hàng tại một thời điểm.                                                                                  |
| QT-04  | Hạn cam kết được sinh tự động từ thời điểm tiếp nhận theo mức ưu tiên: CAO = 24 giờ, TRUNG_BINH = 72 giờ, THAP = 120 giờ. Chỉ tính ngày làm việc (thứ Hai đến thứ Bảy).                                |
| QT-05  | Thiết bị được coi là còn bảo hành nếu (ngày tiếp nhận − ngày mua) ≤ số tháng bảo hành của sản phẩm. Nếu không có ngày mua, phiếu phải được đánh dấu "chưa xác minh bảo hành" và cần quản lý phê duyệt. |
| QT-06  | Phiếu chỉ được chuyển trạng thái theo đúng vòng đời ở Hình 6.2. Không được quay lại trạng thái trước. Mọi lần chuyển trạng thái đều phải ghi vào ticket_status_log.                                    |
| QT-07  | Không được xóa vật lý phiếu bảo hành, đơn hàng hay hồ sơ khách hàng. Chỉ đánh dấu ngừng sử dụng (soft delete) và giữ nguyên lịch sử.                                                                   |
| QT-08  | Nhân viên chỉ xem được dữ liệu của trung tâm hoặc cửa hàng mình làm việc. Quản lý xem được toàn bộ đơn vị mình phụ trách. Ban giám đốc xem được toàn công ty.                                          |
| QT-09  | Số điện thoại khách hàng hiển thị dạng che (ví dụ 090\*\*\*\*567) với mọi vai trò trừ Quản lý và Ban giám đốc.                                                                                         |

1.6. Bảng truy vết yêu cầu

| **Mã FR** | **Yêu cầu chức năng**                                                                                                                                                                                                                                                          | **User Story** | **Use Case** | **MoSCoW**  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ------------ | ----------- |
| FR1       | Hệ thống cho phép nhân viên tiếp nhận tra cứu thông tin khách hàng theo số điện thoại để sử dụng thông tin khách hàng đã có khi tiếp nhận yêu cầu bảo hành.                                                                                                                    | US1            | UC1          | Must Have   |
| FR2       | Hệ thống cho phép Nhân viên tiếp nhận tạo phiếu bảo hành mới với mã phiếu duy nhất, trạng thái ban đầu "Mới", đồng thời ghi nhận người tạo, thời điểm tạo và trung tâm tiếp nhận.                                                                                              | US2            | UC2          | Must Have   |
| FR3       | Hệ thống cho phép Nhân viên tiếp nhận nhập số serial/IMEI để tra cứu thiết bị, tự động điền thông tin thiết bị, kiểm tra thiết bị có thuộc khách hàng đang chọn hay không và còn hạn bảo hành hay không (theo QT-05), đồng thời cho phép ghi nhận mô tả lỗi do khách cung cấp. | US3            | UC3          | Must Have   |
| FR4       | Hệ thống cho phép Nhân viên tiếp nhận chọn một nhóm sự cố từ danh mục cố định (Màn hình, Pin, Sạc, Phần mềm, Nước vào, Khác) và mức ưu tiên phù hợp (Cao, Trung bình, Thấp) khi tạo phiếu bảo hành.                                                                            | US4            | UC4          | Must Have   |
| FR5       | Hệ thống tự động tính toán và ghi nhận hạn cam kết (due_date) dựa trên mức ưu tiên đã chọn theo quy tắc QT-04: Cao = 24 giờ, Trung bình = 72 giờ, Thấp = 120 giờ làm việc (chỉ tính từ thứ Hai đến thứ Bảy).                                                                   | US5            | UC5          | Should Have |
| FR6       | Hệ thống cho phép nhân viên tiếp nhận xem danh sách phiếu bảo hành kèm trạng thái của mỗi phiếu trên mỗi hàng và xem danh sách phiếu theo trạng thái.                                                                                                                          | US6            | UC6          | Should Have |
