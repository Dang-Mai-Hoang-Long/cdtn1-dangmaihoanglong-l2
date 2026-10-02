Link Github:
<https://github.com/Dang-Mai-Hoang-Long/cdtn1-dangmaihoanglong-l2>

Bài tập 1: Phân tích và Thiết kế

Mã luồng nghiệp vụ: L2

Track: SE

<figure>
<img src="media/image1.png" style="width:1.375in;height:1.18542in" />
</figure>

**SVTH: Đặng Mai Hoàng Long**

**MSSV: 2374802013303**

**Lớp: 261_71ITGR40203_06**

**Ngày nộp:**

**CHUYÊN ĐỀ TỐT NGHIỆP 1**

NGÀNH: CÔNG NGHỆ THÔNG TIN

TP. Hồ Chí Minh – Năm 2026

# MỤC LỤC

[**MỤC 1 – BẢN SRS RÚT GỌN**
[3](#mục-1-bản-srs-rút-gọn)](#mục-1-bản-srs-rút-gọn)

[1.1 Giới thiệu và phạm vi
[3](#giới-thiệu-và-phạm-vi)](#giới-thiệu-và-phạm-vi)

[1.1.1. Bối cảnh: [3](#bối-cảnh)](#bối-cảnh)

[1.1.2. Luồng nghiệp vụ L2
[3](#luồng-nghiệp-vụ-l2)](#luồng-nghiệp-vụ-l2)

[1.1.3. Ngoài phạm vi (Out of scope)
[3](#ngoài-phạm-vi-out-of-scope)](#ngoài-phạm-vi-out-of-scope)

[1.1.4. Bảng thuật ngữ: [4](#bảng-thuật-ngữ)](#bảng-thuật-ngữ)

[1.2. Các bên liên quan và vai trò
[6](#các-bên-liên-quan-và-vai-trò)](#các-bên-liên-quan-và-vai-trò)

[1.3. User Story và Yêu cầu chức năng
[7](#user-story-và-yêu-cầu-chức-năng)](#user-story-và-yêu-cầu-chức-năng)

[1.3.1. User Story: [7](#user-story)](#user-story)

[1.3.2. Yêu cầu chức năng: [9](#yêu-cầu-chức-năng)](#yêu-cầu-chức-năng)

[1.4. Yêu cầu phi chức năng
[10](#yêu-cầu-phi-chức-năng)](#yêu-cầu-phi-chức-năng)

[1.5. Ràng buộc và quy tắc nghiệp vụ
[10](#ràng-buộc-và-quy-tắc-nghiệp-vụ)](#ràng-buộc-và-quy-tắc-nghiệp-vụ)

[1.6. Bảng truy vết yêu cầu
[11](#bảng-truy-vết-yêu-cầu)](#bảng-truy-vết-yêu-cầu)

[**MỤC 2 – USE CASE** [13](#mục-2-use-case)](#mục-2-use-case)

[2.1. Use Case Diagram [13](#use-case-diagram)](#use-case-diagram)

[2.2. Đặc tả chi tiết use case
[13](#đặc-tả-chi-tiết-use-case)](#đặc-tả-chi-tiết-use-case)

# **MỤC 1 – BẢN SRS RÚT GỌN**

## 1.1 Giới thiệu và phạm vi

### 1.1.1. Bối cảnh:

**Công ty Cổ phần Bán lẻ & Dịch vụ Mekong Mobile** (gọi tắt: Mekong
Mobile) là chuỗi bán lẻ điện thoại di động, máy tính bảng và phụ kiện,
đồng thời cung cấp dịch vụ bảo hành – sửa chữa. Công ty thành lập năm
2015, hiện có:

- 24 cửa hàng bán lẻ: 14 tại TP. Hồ Chí Minh, 6 tại Cần Thơ, 4 tại Hà
  Nội.

- 6 trung tâm bảo hành: 3 tại TP. Hồ Chí Minh, 2 tại Cần Thơ, 1 tại Hà
  Nội.

- Khoảng 180 nhân viên, trong đó 38 kỹ thuật viên bảo hành và 12 nhân
  viên tiếp nhận.

- Khoảng 65.000 khách hàng đã từng mua hàng (theo dữ liệu ghi nhận rời
  rạc, chưa hợp nhất).

- Trung bình mỗi tháng: khoảng 900 đơn hàng và 260 yêu cầu bảo hành.

**Định hướng của ban giám đốc:** trong 12 tháng tới, xây dựng một hệ
thống quản lý quan hệ khách hàng (Smart CRM) hợp nhất dữ liệu khách
hàng, số hóa quy trình bảo hành và cung cấp báo cáo điều hành. Do nguồn
lực hạn chế, công ty triển khai theo từng luồng nghiệp vụ thay vì làm
toàn bộ cùng lúc — đây chính là lý do mỗi sinh viên đảm nhận một luồng.

### 1.1.2. Luồng nghiệp vụ L2

Nhân viên tạo phiếu bảo hành, tra cứu khách hàng theo số điện thoại, ghi
nhận thiết bị và mô tả lỗi, phân loại nhóm sự cố, xác định mức độ ưu
tiên, sinh hạn cam kết và theo dõi trạng thái phiếu đến khi đóng.

### 1.1.3. Ngoài phạm vi (Out of scope)

Không xây dựng tính năng tạo và quản lý khách hàng

Hệ thống không tự động gợi ý phân loại bảo hành và mức ưu tiên

Không thực hiện tự động phân công kỹ thuật viên dựa trên nhóm sự cố hoặc
mức ưu tiên.

Không quản lý chi tiết quá trình sửa chữa thiết bị sau khi phiếu bảo
hành được tạo.

Không xử lý thanh toán hoặc chi phí phát sinh trong quá trình bảo hành.

### 1.1.4. Bảng thuật ngữ:

| **Thuật ngữ Thuật** | **Định nghĩa** | **Tên kỹ thuật gợi ý** |
|:--:|----|----|
| Khách hàng | Cá nhân đã mua ít nhất một sản phẩm hoặc sử dụng dịch vụ của Mekong Mobile. | customer |
| Thiết bị | Một máy cụ thể mà khách hàng sở hữu, xác định bằng số serial hoặc IMEI. | device |
| Đơn hàng | Một lần mua hàng tại một cửa hàng, gồm một hoặc nhiều sản phẩm. | order / order_item |
| Phiếu bảo hành | Một yêu cầu bảo hành hoặc sửa chữa được ghi nhận, có mã duy nhất và vòng đời trạng thái. | ticket |
| Trạng thái phiếu | Vị trí hiện tại của phiếu trong vòng đời: Mới → Đã phân công → Đang xử lý → Chờ linh kiện → Hoàn tất → Đã đóng. | ticket_status |
| Hạn cam kết (SLA) | Thời điểm chậm nhất phải hoàn tất phiếu, tính từ lúc tiếp nhận theo mức ưu tiên. | due_date |
| Nhóm sự cố | Phân loại nguyên nhân bảo hành: màn hình, pin, sạc, phần mềm, nước vào, khác. | issue_category |
| Mức ưu tiên | Mức khẩn của phiếu: Cao, Trung bình, Thấp. Quyết định hạn cam kết. | priority |
| Kỹ thuật viên | Nhân viên thực hiện sửa chữa, có danh sách tay nghề và địa bàn làm việc. | technician |
| Linh kiện | Bộ phận thay thế dùng trong sửa chữa, có mã và tồn kho theo trung tâm. | part / part_stock |
| Lịch hẹn | Khung thời gian đã hẹn giữa khách và kỹ thuật viên để giao – nhận thiết bị. | appointment |
| Phân khúc khách hàng | Nhóm khách được xếp theo giá trị và hành vi mua: VIP, Thường xuyên, Mới, Ngủ đông. | customer_segment |
| Khảo sát hài lòng | Phản hồi của khách sau khi phiếu được đóng, thang điểm 1–5 kèm nhận xét. | survey_response |
| Chiến dịch | Một đợt gửi thông tin khuyến mãi hoặc chăm sóc tới một nhóm khách hàng. | campaign |

## 1.2. Các bên liên quan và vai trò

| **Actor** | **Vai trò** | **Được làm** | **Không được làm** |
|:--:|----|----|----|
| Nhân viên tiếp nhận (trung tâm bảo hành) | Tiếp nhận yêu cầu bảo hành, ghi phiếu, hẹn khách | Tra cứu khách hàng, ghi nhận yêu cầu và thiết bị, phân loại sự cố, xác định mức độ ưu tiên, theo dõi trạng thái | Tiếp nhận sửa chữa, theo dõi doanh thu, tồn kho, nhân sự cửa hàng. |
| Khách hàng | Mua hàng và sử dụng dịch vụ bảo hành | Cung cấp thông tin mô tả lỗi và thông tin thiết bị | Sửa đổi thông tin phiếu bảo hành, phân loại sự cố, xác định mức độ ưu tiên. |

## 1.3. User Story và Yêu cầu chức năng

### 1.3.1. User Story:

<table>
<colgroup>
<col style="width: 10%" />
<col style="width: 30%" />
<col style="width: 59%" />
</colgroup>
<thead>
<tr>
<th style="text-align: center;"><p><strong>Mã US</strong></p></th>
<th style="text-align: center;"><p><strong>Mô tả</strong></p></th>
<th style="text-align: center;"><p><strong>AC</strong></p></th>
</tr>
</thead>
<tbody>
<tr>
<td style="text-align: center;"><p>US1</p></td>
<td><p>Là nhân viên tiếp nhận tôi muốn tra cứu khách hàng để tìm thông
tin và sử dụng thông tin của khách hàng khi tiếp nhận yêu cầu bảo
hành.</p></td>
<td><p>AC1.1: GIVEN nhân viên tiếp nhận đang ở màn hình tạo phiếu bảo
hành. WHEN nhân viên nhập sđt vào thanh tìm kiếm và bấm Tìm kiếm. THEN
hệ thống trả về thông tin khách hàng hiện có.</p>
<p>AC1.2: GIVEN hệ thông đã hiển thị thông tin tìm kiếm khách hàng. WHEN
nhân viên tiếp nhận chọn khách hàng từ danh sách kết quả. THEN Hệ thống
tự động điền các thông tin của khách hàng (Họ tên, Số điện thoại, Địa
chỉ) vào form tiếp nhận bảo hành.</p></td>
</tr>
<tr>
<td style="text-align: center;"><p>US2</p></td>
<td><p>Là nhân viên tiếp nhận tôi muốn ghi nhận thiết bị và mô tả lỗi để
tạo phiếu bảo hành cho khách hàng.</p></td>
<td><p>AC2.1: GIVEN nhân viên tiếp nhận đã chọn đủ thông tin khách hàng
trên phiếu bảo hành. WHEN nhân viên tiếp nhận nhập số Serial/IMEI của
thiết bị, nhập mô tả lỗi bằng văn bản. THEN hệ thông tự động đối chiếu
ngày mua với thời hạn bảo hành và xác định trạng thái “Còn bảo hành”
hoặc “Hết bảo hành”.</p>
<p>AC2.2: GIVEN nhân viên tiếp nhận đã chọn đủ thông tin khách hàng trên
phiếu bảo hành. WHEN nhân viên tiếp nhận để trống trường mô tả lỗi và
bấm Lưu. THEN hệ thống hiện yêu cầu nhập trường bắt buộc trước khi hoàn
tất lưu.</p></td>
</tr>
<tr>
<td style="text-align: center;"><p>US3</p></td>
<td><p>Là nhân viên tiếp nhận tôi muốn chọn nhóm sự cố để phân loại
nguyên nhân bảo hành.</p></td>
<td><p>AC3.1: GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo
hành. WHEN nhân viên tiếp nhận chọn nhấp vào danh sách chọn Nhóm sự cố
và chọn một giá trị phù hợp (ví dụ: MAN_HINH, PIN, SAC) và bấm Lưu. THEN
hệ thống ghi nhận nhóm sự cố đã chọn vào thông tin chi tiết của phiếu
bảo hành.</p>
<p>AC3.2: GIVEN GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo
hành. WHEN nhân viên không chọn Nhóm sự cố từ danh sách chọn và bấm Lưu.
THEN hệ thống hiển thị thông báo yêu cầu chọn Nhóm sự cố trước khi hoàn
tất lưu phiếu.</p></td>
</tr>
<tr>
<td style="text-align: center;"><p>US4</p></td>
<td><p>Là nhân viên tiếp nhận tôi muốn chọn mức ưu tiên để xác định mức
độ xử lý.</p></td>
<td><p>AC4.1: GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo
hành. WHEN. Nhân viên tiếp nhận chọn nhấp vào Mức ưu tiên và chọn một
mức ưu tiên phù hợp từ danh sách (ví dụ: Cao, Trung bình, Thấp) và bấm
Lưu. THEN hệ thống ghi nhận mức ưu tiên đã chọn vào thông tin chi tiết
của phiếu bảo hành.</p>
<p>AC4.2: GIVEN nhân viên tiếp nhận đang nhập thông tin phiếu bảo hành.
WHEN. Nhân viên tiếp nhận không chọn lại Mức ưu tiên và bấm Lưu. THEN hệ
thống ghi nhận mức ưu tiên mặc định (ví dụ: Thấp) vào thông tin chi tiết
của phiếu bảo hành.</p></td>
</tr>
<tr>
<td style="text-align: center;"><p>US5</p></td>
<td><p>Là nhân viên tiếp nhận tôi muốn hệ thống tự sinh hạn cam kết dựa
trên mức độ ưu tiên để xác định thời hạn xử lý yêu cầu.</p></td>
<td><p>AC5.1: GIVEN nhân viên tiếp nhận đã chọn Mức ưu tiên (ví dụ: Cao)
cho phiếu bảo hành. WHEN hệ thông ghi nhận thông tin phiếu bảo hành.
THEN hệ thông tự động tính toán và gán giá trị hạn cam kết đã quy định
theo mức ưu tiên đã được chọn (ví dụ: 24 giờ (chỉ tính ngày làm việc Thứ
2 - Thứ 7)).</p>
<p>AC5.2: GIVEN nhân viên tiếp nhận đã chọn Mức ưu tiên (ví dụ: Cao) cho
phiếu bảo hành. WHEN nhân viên tiếp nhận chọn lại Mức ưu tiên khác (ví
dụ Thấp) và hệ thông ghi nhận Mức ưu tiên mới. THEN hệ thông tự động
tính toán và gán giá trị hạn cam kết đã quy định theo mức ưu tiên đã
được chọn lại (ví dụ: 24 giờ thành 120 giờ (chỉ tính ngày làm việc Thứ 2
- Thứ 7)).</p></td>
</tr>
<tr>
<td style="text-align: center;"><p>US6</p></td>
<td><p>Là nhân viên tiếp nhận tôi muốn theo dõi trạng thái phiếu bảo
hành để biết tiến độ xử lý của yêu cầu.</p></td>
<td></td>
</tr>
</tbody>
</table>

### 1.3.2. Yêu cầu chức năng:

FR1: Hệ thống cho phép nhân viên tiếp nhận tra cứu thông tin khách hàng
theo số điện thoại để sử dụng thông tin khách hàng khi tiếp nhận yêu cầu
bảo hành

FR2: Hệ thống cho phép nhân viên tiếp nhận tạo một phiếu bảo hành mới
với các thông tin bắt buộc: khách hàng, thiết bị và mô tả lỗi.

FR3: Hệ thống cho phép nhân viên tiếp nhận chọn nhóm sự cố cho phiếu bảo
hành dựa trên thông tin mô tả lỗi và kinh nghiệm.

FR4: Hệ thống cho phép nhân viên tiếp nhận chọn mức ưu tiên cho phiếu
bảo hành để xác định mức độ xử lý.

FR5: Hệ thống tự động sinh hạn cam kết xử lý cho phiếu bảo hành dựa trên
mức ưu tiên (CAO = 24 giờ, TRUNG_BINH = 72 giờ, THAP = 120 giờ) đã được
nhân viên tiếp nhận xác định.

FR6: Hệ thống cho phép nhân viên tiếp nhận theo dõi trạng thái phiếu bảo
hành để biết tiến độ xử lý của yêu cầu.

## 1.4. Yêu cầu phi chức năng

NFR1: Danh sách phiếu bảo hành phải hiển thị trong dưới 5 giây với
10.000 bản ghi.

NFR2: Chỉ nhân viên có vai trò Quản lý xem được số điện thoại đầy đủ của
khách, các vai trò khác thấy dạng che 4 số ở giữa (ví dụ
090\*\*\*\*156).

NFR3: Nhân viên tiếp nhận mới tạo được một phiếu bảo hành đúng trong
dưới 3 phút, không cần hỏi đồng nghiệp.

## 1.5. Ràng buộc và quy tắc nghiệp vụ

| **Mã** | **Quy tắc nghiệp vụ** |
|:--:|----|
| QT-01 | Số điện thoại khách hàng là duy nhất trong hệ thống. Khi nhập một số đã tồn tại, hệ thống phải hiển thị hồ sơ có sẵn thay vì tạo hồ sơ mới. |
| QT-02 | Số điện thoại được chuẩn hóa về dạng 10 chữ số bắt đầu bằng 0 trước khi lưu. Các dạng +84…, 84…, có dấu cách hoặc dấu chấm đều phải quy về dạng chuẩn. |
| QT-03 | Thiết bị được xác định duy nhất bằng số serial hoặc IMEI. Một thiết bị chỉ thuộc về một khách hàng tại một thời điểm. |
| QT-04 | Hạn cam kết được sinh tự động từ thời điểm tiếp nhận theo mức ưu tiên: CAO = 24 giờ, TRUNG_BINH = 72 giờ, THAP = 120 giờ. Chỉ tính ngày làm việc (thứ Hai đến thứ Bảy). |
| QT-05 | Thiết bị được coi là còn bảo hành nếu (ngày tiếp nhận − ngày mua) ≤ số tháng bảo hành của sản phẩm. Nếu không có ngày mua, phiếu phải được đánh dấu "chưa xác minh bảo hành" và cần quản lý phê duyệt. |
| QT-06 | Phiếu chỉ được chuyển trạng thái theo đúng vòng đời ở Hình 6.2. Không được quay lại trạng thái trước. Mọi lần chuyển trạng thái đều phải ghi vào ticket_status_log. |
| QT-07 | Không được xóa vật lý phiếu bảo hành, đơn hàng hay hồ sơ khách hàng. Chỉ đánh dấu ngừng sử dụng (soft delete) và giữ nguyên lịch sử. |
| QT-08 | Nhân viên chỉ xem được dữ liệu của trung tâm hoặc cửa hàng mình làm việc. Quản lý xem được toàn bộ đơn vị mình phụ trách. Ban giám đốc xem được toàn công ty. |
| QT-09 | Số điện thoại khách hàng hiển thị dạng che (ví dụ 090\*\*\*\*567) với mọi vai trò trừ Quản lý và Ban giám đốc. |

## 1.6. Bảng truy vết yêu cầu

| **Mã FR** | **Yêu cầu chức năng** | **User Story** | **Use Case** | **MoSCoW** |
|:--:|----|----|----|----|
| FR1 | Hệ thống cho phép nhân viên tiếp nhận tra cứu thông tin khách hàng theo số điện thoại để sử dụng thông tin khách hàng khi tiếp nhận yêu cầu bảo hành. | US1 | UC1 | Must Have |
| FR2 | Hệ thống cho phép nhân viên tiếp nhận tạo một phiếu bảo hành mới với các thông tin bắt buộc: khách hàng, thiết bị và mô tả lỗi. | US2 | UC2 | Must Have |
| FR3 | Hệ thống cho phép nhân viên tiếp nhận chọn nhóm sự cố cho phiếu bảo hành dựa trên thông tin mô tả lỗi và kinh nghiệm. | US3 | UC3 | Must Have |
| FR4 | Hệ thống cho phép nhân viên tiếp nhận chọn mức ưu tiên cho phiếu bảo hành để xác định mức độ xử lý. | US4 | UC4 | Must Have |
| FR5 | Hệ thống tự động sinh hạn cam kết xử lý cho phiếu bảo hành dựa trên mức ưu tiên đã được nhân viên tiếp nhận xác định. | US5 | UC4 | Must Have |
| FR6 | Hệ thống cho phép nhân viên tiếp nhận theo dõi trạng thái phiếu bảo hành để biết tiến độ xử lý của yêu cầu. | US6 | UC5 | Should Have |

# **MỤC 2 – USE CASE**

## 2.1. Use Case Diagram

<img src="media/image2.png" style="width:6.5in;height:5.33333in" />

## 2.2. Đặc tả chi tiết use case

UC2 – TẠO PHIẾU BẢO HÀNH MỚI

Actor chính: Nhân viên tiếp nhận

Mục tiêu: Ghi nhận một yêu cầu bảo hành vào hệ thống để theo dõi đến khi
đóng.

Điều kiện trước: Nhân viên đã đăng nhập và có quyền tiếp nhận.

Điều kiện sau: Một phiếu bảo hành ở trạng thái MỚI đã được lưu, có mã
phiếu duy nhất.

Liên quan: US1, US2 \| Mức ưu tiên: MUST HAVE

LUỒNG CHÍNH (happy path)

1\. Nhân viên chọn chức năng “Tạo phiếu bảo hành mới”.

2\. Nhân viên nhập số điện thoại khách hàng.

3\. Hệ thống tra cứu và hiển thị thông tin khách + lịch sử mua hàng.
\[include UC1\]

4\. Nhân viên chọn thiết bị từ danh sách thiết bị khách đã mua.

5\. Nhân viên nhập mô tả lỗi.

6\. Nhân viên chọn nhóm sự cố và mức ưu tiên. \[include UC3, UC4\]

7\. Nhân viên xác nhận hoặc điều chỉnh, rồi bấm Lưu.

8\. Hệ thống sinh mã phiếu, lưu phiếu ở trạng thái MỚI, hiển thị mã
phiếu.

LUỒNG NGOẠI LỆ

5a. Mô tả lỗi để trống

→ Từ chối lưu, hiển thị thông báo nêu rõ trường còn thiếu. Không mất dữ
liệu đã nhập.

6a. Chưa chọn nhóm sự cố hoặc mức ưu tiên

→ Hệ thống thông báo các thông tin bắt buộc còn thiếu và yêu cầu nhân
viên bổ sung trước khi tiếp tục.

8a. Mất kết nối khi đang lưu

→ Giữ lại dữ liệu đã nhập trên giao diện, cho phép thử lưu lại. Không
tạo phiếu trùng.

# **Track SE: API contract**

**Danh sách endpoint**

| **Method** | **Endpoint** | **Mục đích** | **US** |
|:--:|----|----|----|
| GET | /api/customers?phone={phone} | Tra cứu khách hàng theo số điện thoại | **US1** |
| GET | /api/customers/{id}/devices | Lấy danh sách thiết bị của khách hàng để nhân viên chọn thiết bị | **US2** |
| POST | /api/tickets | Tạo phiếu bảo hành, ghi nhận thiết bị, mô tả lỗi, nhóm sự cố, mức ưu tiên và sinh hạn cam kết | **US2, US3, US4, US5** |
| GET | /api/tickets/{id}/status | Xem trạng thái hiện tại của phiếu bảo hành | **US6** |

**Quy ước chung**

- Định dạng trao đổi: JSON, mã hoá UTF-8. Header bắt buộc: Content-Type:
  application/json.

- Tên trường dùng snake_case, khớp đúng tên cột trong cơ sở dữ liệu để
  dễ truy vết.

- Thời gian dùng chuẩn ISO 8601 kèm múi giờ, ví dụ
  2026-09-08T14:30:00+07:00.

- Tiền tệ: số nguyên VND, không có phần thập phân, không có dấu phân
  cách.

- Phân trang: tham số page (bắt đầu từ 1) và size (mặc định 20, tối đa
  100). Response kèm total.

- Mọi lỗi trả về cùng một cấu trúc: { "error": { "code": "...",
  "message": "...", "fields": {...} } }

**Chi tiết endpoint**

**GET /api/customers?phone={phone}**

**REQUEST**

Query parameter:

phone={phone}

**RESPONSE 200 OK**

{

"customer_id": 1024,

"full_name": "Nguyen Van A",

"phone": "0901234567",

"address": "..."

}

**RESPONSE 400 Bad Request — số điện thoại không hợp lệ**

{

"error": {

"code": "INVALID_PHONE",

"message": "Số điện thoại không hợp lệ",

"fields": {

"phone": "Số điện thoại phải có định dạng hợp lệ"

}

}

}

**RESPONSE 404 Not Found — Không tìm thấy khách hàng**

**GET /api/customers/{id}/devices**

**REQUEST**

Path parameter:

id={customer_id}

**RESPONSE 200 OK**

{

"customer_id": 1024,

"devices": \[

{

"device_id": 3311,

"serial": "SN123456789",

"device_name": "Điện thoại",

"purchase_date": "2026-01-15"

}

\]

}

**RESPONSE 400 Bad Request — mã khách hàng không hợp lệ**

{

"error": {

"code": "INVALID_CUSTOMER_ID",

"message": "Mã khách hàng không hợp lệ",

"fields": {

"id": "Mã khách hàng phải là số nguyên dương"

}

}

}

**RESPONSE 404 Not Found — Không tìm thấy khách hàng**

**POST /api/tickets**

**REQUEST BODY**

{

"customer_id": 1024,

"device_id": 3311,

"issue_desc": "Máy sạc không vào, cắm sạc báo lỗi",

"category_id": 1,

"priority": "TRUNG_BINH"

}

**RESPONSE 201 Created**

{

"ticket_id": 88231,

"ticket_code": "BH-000231/2026",

"status": "MOI",

"category_id": 1,

"priority": "TRUNG_BINH",

"received_at": "2026-09-08T14:30:00+07:00",

"due_date": "2026-09-11T14:30:00+07:00"

}

**RESPONSE 400 Bad Request — dữ liệu không hợp lệ**

{

"error": {

"code": "VALIDATION_FAILED",

"message": "Dữ liệu không hợp lệ",

"fields": {

"issue_desc": "Trường bắt buộc, không được để trống"

}

}

}

**RESPONSE 404 Not Found — Không tìm thấy khách hàng hoặc thiết bị**

**RESPONSE 409 Conflict — Thiết bị đang có phiếu chưa đóng**

**RESPONSE 422 Unprocessable Entity — Thiết bị hết bảo hành, chưa được
phê duyệt**

**GET /api/tickets/{id}/status**

**REQUEST**

Path parameter:

id={ticket_id}

**RESPONSE 200 OK**

{

"ticket_id": 88231,

"ticket_code": "BH-000231/2026",

"status": "MOI"

}

**RESPONSE 400 Bad Request — mã phiếu không hợp lệ**

{

"error": {

"code": "INVALID_TICKET_ID",

"message": "Mã phiếu không hợp lệ",

"fields": {

"id": "Mã phiếu phải là số nguyên dương"

}

}

}

**RESPONSE 404 Not Found — Không tìm thấy phiếu bảo hành**

**Bảng validation**

**GET /api/customers?phone={phone}**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| phone | Có | Chuỗi; chuẩn hóa về 10 chữ số, bắt đầu bằng 0 theo QT-02 | Số điện thoại không hợp lệ |

**POST /api/customers/{id}/devices**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| id | Có | Số nguyên dương, là customer_id | Mã khách hàng không hợp lệ |

**POST /api/tickets**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| customer_id | Có | Số nguyên dương, phải tồn tại trong bảng customer | Không tìm thấy khách hàng |
| device_id | Có | Số nguyên dương, phải thuộc về customer_id theo QT-03 | Thiết bị không thuộc về khách hàng này |
| issue_desc | Có | Chuỗi, không được để trống | Mô tả lỗi không được để trống |
| category_id | Có | Số nguyên dương, phải tồn tại trong bảng issue_category | Nhóm sự cố không hợp lệ |
| priority | không | Một trong CAO / TRUNG_BINH / THAP | Mức ưu tiên không hợp lệ |

**GET /api/tickets/{id}/status**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| id | Có | Số nguyên dương, là ticket_id | Mã phiếu không hợp lệ |
