# Hợp đồng API — Luồng L2 tiếp nhận và phân loại phiếu bảo hành

## Danh sách endpoint

| Method | Endpoint | Mục đích |
|:--:|---|---|
| GET | `/api/customers?phone={phone}` | Tra cứu khách hàng theo số điện thoại |
| GET | `/api/devices?serial={serial}&customer_id={customer_id}` | Tra cứu thiết bị, xác nhận chủ sở hữu và trả trạng thái bảo hành |
| GET | `/api/tickets/categories` | Lấy danh mục sự cố và mức ưu tiên mặc định |
| POST | `/api/tickets/preview` | Kiểm tra nghiệp vụ, tính hạn cam kết; không lưu phiếu |
| POST | `/api/tickets` | Lưu phiếu cùng thời điểm và hạn đã xem trước |
| GET | `/api/tickets?status={status}&page={page}&size={size}&sort={sort}` | Xem danh sách phiếu, lọc trạng thái, phân trang và sắp xếp theo mã phiếu |

## Quy ước chung

- API trao đổi JSON UTF-8. Request có body JSON gửi `Content-Type: application/json`; response JSON dùng `application/json`.
- Tên trường request/response dùng `snake_case`.
- Thời gian dùng chuỗi ISO 8601 có múi giờ, ví dụ `2026-09-08T14:30:00.000Z`.
- Lỗi API dùng cấu trúc `{ "error": { "code": "...", "message": "...", "fields": {} } }`.
- `GET /api/tickets` mặc định `page=1`, `size=20`; `size` tối đa 100. `sort` tùy chọn nhận `ticket_code_asc` hoặc `ticket_code_desc`; nếu bỏ qua, kết quả sắp theo thời điểm nhận mới nhất. Response có `data`, `page`, `size`, `total`.

**Lỗi dùng chung**

| HTTP | Mã lỗi | Khi nào |
|:--:|---|---|
| 400 | `INVALID_JSON` | Body JSON không phân tích được |
| 404 | `NOT_FOUND` | Đường dẫn API không tồn tại |
| 500 | `INTERNAL_SERVER_ERROR` | Lỗi chưa được ánh xạ thành lỗi ứng dụng cụ thể |

## Chi tiết endpoint

### GET /api/customers?phone={phone}

Tra cứu hồ sơ khách hàng hiện có. Service chuẩn hóa số điện thoại bằng cách bỏ dấu cách, dấu chấm, dấu ngoặc và dấu gạch nối; dạng `84...` hoặc `+84...` được đổi về dạng bắt đầu bằng `0`. Số điện thoại phải có 10 chữ số.

**Response 200 OK**

```json
{
  "customer_id": 1024,
  "full_name": "Nguyen Van A",
  "phone_masked": "090****567",
  "address": "Can Tho"
}
```

API chỉ trả `phone_masked`, không trả số điện thoại đầy đủ.

**Lỗi có thể trả về**

| HTTP | Mã lỗi | Khi nào |
|:--:|---|---|
| 400 | `INVALID_PHONE` | Số điện thoại thiếu hoặc sai định dạng; `fields.phone` mô tả lỗi |
| 404 | `CUSTOMER_NOT_FOUND` | Không tìm thấy hồ sơ với số điện thoại đã chuẩn hóa |

### GET /api/devices?serial={serial}&customer_id={customer_id}

Tra cứu thiết bị theo serial/IMEI và kiểm tra thiết bị thuộc khách hàng đang chọn. Thiết bị hết hạn hoặc thiếu ngày mua vẫn được trả về để nhân viên tra cứu; `warranty_approved` sẽ là `false`. Bước xem trước tạo phiếu mới từ chối các thiết bị này. Tên `warranty_approved` hiện được dùng để biểu diễn kết quả kiểm tra bảo hành: `true` là còn hạn, `false` là hết hạn hoặc chưa xác minh.

**Response 200 OK — còn hạn bảo hành**

```json
{
  "device_id": 3311,
  "customer_id": 1024,
  "serial_no": "SN123456789",
  "purchase_date": "2025-03-15",
  "warranty_approved": true
}
```

Với thiết bị hết hạn hoặc thiếu `purchase_date`, response vẫn có cùng cấu trúc nhưng `warranty_approved` là `false` và `purchase_date` có thể là `null`.

**Lỗi có thể trả về**

| HTTP | Mã lỗi | Khi nào |
|:--:|---|---|
| 400 | `VALIDATION_FAILED` | `serial` trống hoặc `customer_id` không phải số nguyên dương; chi tiết ở `error.fields` |
| 404 | `CUSTOMER_NOT_FOUND` | Không tìm thấy khách hàng |
| 404 | `DEVICE_NOT_FOUND` | Không tìm thấy thiết bị theo serial/IMEI |
| 422 | `DEVICE_CUSTOMER_MISMATCH` | Thiết bị không thuộc khách hàng đang chọn; `fields.serial` mô tả lỗi |

### GET /api/tickets/categories

Không cần query hoặc body. Trả danh mục sự cố đang hoạt động cùng mức ưu tiên mặc định.

**Response 200 OK**

```json
[
  { "category_id": 1, "category_name": "Sạc", "default_priority": "TRUNG_BINH" }
]
```

### POST /api/tickets/preview

Kiểm tra dữ liệu và điều kiện nghiệp vụ trước khi hiện màn hình xác nhận. Không ghi phiếu hoặc log vào cơ sở dữ liệu. Request gồm `customer_id`, `device_id`, `center_id`, `issue_desc`, `category_id`; `priority` có thể bỏ qua để dùng mức mặc định của danh mục. Không gửi `received_at` và `due_date` ở bước này.

**Request body**

```json
{
  "customer_id": 1024,
  "device_id": 3311,
  "center_id": 0,
  "issue_desc": "Máy sạc không vào, cắm sạc báo lỗi",
  "category_id": 1,
  "priority": "TRUNG_BINH"
}
```

**Response 200 OK**

```json
{
  "priority": "TRUNG_BINH",
  "is_warranty": true,
  "received_at": "2026-09-08T14:30:00.000Z",
  "due_date": "2026-09-11T14:30:00.000Z"
}
```

**Lỗi có thể trả về**

| HTTP | Mã lỗi | Khi nào |
|:--:|---|---|
| 400 | `VALIDATION_FAILED` | Trường bắt buộc sai/thiếu hoặc dữ liệu đầu vào sai định dạng |
| 404 | `CUSTOMER_NOT_FOUND`, `DEVICE_NOT_FOUND` | Không tìm thấy khách hàng hoặc thiết bị |
| 409 | `TICKET_CONFLICT` | Thiết bị đang có phiếu chưa đóng |
| 422 | `DEVICE_CUSTOMER_MISMATCH` | Thiết bị không thuộc khách hàng đã chọn |
| 422 | `WARRANTY_NOT_APPROVED` | Thiết bị hết hạn hoặc chưa xác minh bảo hành |

### POST /api/tickets

Lưu phiếu sau khi người dùng xác nhận. Các trường đầu vào giống preview và phải gửi thêm `received_at`, `due_date` nhận từ response preview. Server kiểm tra hai mốc thời gian rồi lưu nguyên giá trị đã xác nhận, không tính hạn cam kết lần nữa.

Việc thêm phiếu và log trạng thái ban đầu nằm trong cùng transaction. Log khởi tạo có `from_status = NULL`, `to_status = 'MOI'`, `changed_at = received_at`; `changed_by = 0` đại diện tác nhân hệ thống trong luồng hiện chưa có danh tính nhân viên.

**Response 201 Created**

```json
{
  "ticket_id": 88231,
  "ticket_code": "BH-000231/2026",
  "status": "MOI",
  "category_id": 1,
  "priority": "TRUNG_BINH",
  "received_at": "2026-09-08T14:30:00.000Z",
  "due_date": "2026-09-11T14:30:00.000Z"
}
```

**Lỗi có thể trả về**

Ngoài các lỗi `VALIDATION_FAILED`, `CUSTOMER_NOT_FOUND`, `DEVICE_NOT_FOUND`, `TICKET_CONFLICT`, `DEVICE_CUSTOMER_MISMATCH` và `WARRANTY_NOT_APPROVED` như endpoint preview, lỗi dữ liệu đầu vào còn có thể chỉ ra từng trường như `received_at` hoặc `due_date`. Request hợp lệ nhưng lỗi hệ thống không dự kiến trả `500 INTERNAL_SERVER_ERROR` theo cấu trúc lỗi chung.

### GET /api/tickets?status={status}&page={page}&size={size}&sort={sort}

Các query đều tùy chọn. `status` nếu có phải là một trong `MOI`, `DA_PHAN_CONG`, `DANG_XU_LY`, `CHO_LINH_KIEN`, `HOAN_TAT`, `DA_DONG`. `sort` nếu có nhận `ticket_code_asc` (mã phiếu tăng dần) hoặc `ticket_code_desc` (mã phiếu giảm dần). Nếu không truyền `sort`, kết quả được sắp xếp theo thời điểm nhận mới nhất.

**Response 200 OK**

```json
{
  "data": [
    {
      "ticket_id": 88231,
      "ticket_code": "BH-000231/2026",
      "customer_id": 1024,
      "customer_name": "Nguyen Van A",
      "device_id": 3311,
      "serial_no": "SN123456789",
      "status": "MOI",
      "priority": "TRUNG_BINH",
      "category_name": "Sạc",
      "received_at": "2026-09-08T14:30:00.000Z",
      "due_date": "2026-09-11T14:30:00.000Z"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1
}
```

**Lỗi có thể trả về**

| HTTP | Mã lỗi | Khi nào |
|:--:|---|---|
| 400 | `INVALID_STATUS` | Trạng thái không thuộc danh sách hỗ trợ; lỗi ở `fields.status` |
| 400 | `INVALID_PAGE_SIZE` | `page` không phải số nguyên dương hoặc `size` ngoài 1–100; trường sai nằm trong `fields` |
| 400 | `INVALID_SORT_ORDER` | `sort` không thuộc các giá trị được hỗ trợ; lỗi nằm trong `fields.sort` |

## Tóm tắt validation theo endpoint

| Endpoint | Trường/điều kiện chính | Nơi kiểm tra hiện tại |
|---|---|---|
| `GET /api/customers` | `phone` được chuẩn hóa và phải là số 10 chữ số bắt đầu bằng 0 | `customerService` |
| `GET /api/devices` | `serial` không trống; `customer_id` là số nguyên dương; thiết bị thuộc khách hàng | Validator và `deviceService` |
| `POST /api/tickets/preview` | ID là số nguyên hợp lệ; `center_id` không âm; mô tả lỗi không trống; ưu tiên hợp lệ nếu được gửi | Validator; điều kiện tồn tại/sở hữu/bảo hành ở service |
| `POST /api/tickets` | Các trường preview và `received_at`, `due_date` hợp lệ; hạn phải sau thời điểm nhận | Validator; điều kiện nghiệp vụ ở service |
| `GET /api/tickets` | Trạng thái hợp lệ; `page` dương; `size` từ 1 đến 100; `sort` thuộc danh sách giá trị hỗ trợ | Validator |
