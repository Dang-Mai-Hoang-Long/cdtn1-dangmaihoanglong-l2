Danh sách endpoint

| **Method** | **Endpoint** | **Mục đích** | **US** |
|:--:|----|----|----|
| GET | /api/customers?phone={phone} | Tra cứu khách hàng theo số điện thoại | US-01 |
| GET | /api/devices?serial={serial} &customer_id={customer_id} | Tra cứu thiết bị theo số serial/IMEI và kiểm tra thuộc khách hàng + còn hạn bảo hành | US-03 |
| POST | /api/tickets | Tạo phiếu bảo hành mới (ghi nhận mô tả lỗi, nhóm sự cố, mức ưu tiên, sinh hạn cam kết) | US-02, US-04, US-05, |
| GET | /api/tickets?status={status} | Xem danh sách phiếu bảo hành | US-06 |

Quy ước chung

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

Chi tiết endpoint

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

**GET /api/devices?serial={serial} &customer_id={customer_id}**

**REQUEST**

QUERY PARAM

serial=SN123456789&customer_id=1024

**RESPONSE 200 OK**

{

"device_id": 3311,

"customer_id": 1024,

"serial_no": "SN123456789",

"purchase_date": "2025-03-15"

}

**RESPONSE 400 Bad Request — mã khách hàng không hợp lệ**

{

"error": {

"code": "VALIDATION_FAILED",

"message": "Dữ liệu không hợp lệ",

"fields": {

"serial": "Trường bắt buộc, không được để trống",

"customer_id": "Phải là số nguyên dương"

}

}

}

**RESPONSE 404 Not Found — Không tìm thấy thiết bị/ Không tìm thấy khách
hàng**

**POST /api/tickets**

**REQUEST BODY**

{

"customer_id": 1024,

"device_id": 3311,

"center_id": 2,

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

**GET /api/tickets?status={status}**

**REQUEST**

**QUERY PARAM**

status=MOI

**RESPONSE 200 OK**

{

"data": \[

{

"ticket_id": 88231,

"ticket_code": "BH-000231/2026",

"customer_id": 1024,

"device_id": 3311,

"status": "MOI",

"priority": "TRUNG_BINH",

"received_at": "2026-09-08T14:30:00+07:00",

"due_date": "2026-09-11T14:30:00+07:00"

},

{

"ticket_id": 88232,

"ticket_code": "BH-000232/2026",

"customer_id": 1025,

"device_id": 3312,

"status": "MOI",

"priority": "CAO",

"received_at": "2026-09-08T15:00:00+07:00",

"due_date": "2026-09-09T15:00:00+07:00"

}

\],

"page": 1,

"size": 20,

"total": 2

}

**RESPONSE 400 Bad Request**

{

"error": {

"code": "INVALID_STATUS",

"message": "Trạng thái phiếu bảo hành không hợp lệ",

"fields": {

"status": "Giá trị trạng thái không được hỗ trợ"

}

}

}

**Bảng validation**

**GET /api/customers?phone={phone}**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| phone | Có | Chuỗi; chuẩn hóa về 10 chữ số, bắt đầu bằng 0 theo QT-02 | Số điện thoại không hợp lệ |

**POST /api/devices?serial={serial} &customer_id={customer_id}**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| customer_id | Có | Số nguyên dương, là customer_id | Mã khách hàng không hợp lệ |
| serial | có | Chuỗi là serial_no | Mã thiết bị không hợp lệ |

**POST /api/tickets**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| customer_id | Có | Số nguyên dương, phải tồn tại trong bảng customer | Không tìm thấy khách hàng |
| device_id | Có | Số nguyên dương, phải thuộc về customer_id theo QT-03 | Thiết bị không thuộc về khách hàng này |
| issue_desc | Có | Chuỗi, không được để trống | Mô tả lỗi không được để trống |
| category_id | Có | Số nguyên dương, phải tồn tại trong bảng issue_category | Nhóm sự cố không hợp lệ |
| priority | không | Một trong CAO / TRUNG_BINH / THAP. Mặc định mức ưu tiên theo nhóm sự cố | Mức ưu tiên không hợp lệ |

**GET /api/tickets?status={status}**

| **Trường** | **Bắt buộc** | **Kiểu / ràng buộc** | **Thông báo lỗi khi vi phạm** |
|:--:|----|----|----|
| status | Không | Một trong MOI/ DA_PHAN_CONG/ DANG_XU_LY/ CHO_LINH_KIEN/ HOAN_TAT/ DA_DONG | Không tìm thấy phiếu bảo hành có trạng thái phù hợp |
