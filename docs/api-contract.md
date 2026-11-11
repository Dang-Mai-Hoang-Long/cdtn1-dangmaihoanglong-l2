# Hợp đồng API — Luồng L2 tiếp nhận và phân loại phiếu bảo hành

Tài liệu này mô tả API hiện được triển khai trong dự án. Các ví dụ dùng dữ liệu minh họa; response thực tế phản ánh dữ liệu trong CSDL.

## Danh sách endpoint

| Method | Endpoint                                                           |      Xác thực       | Mục đích                                                     |
| :----: | ------------------------------------------------------------------ | :-----------------: | ------------------------------------------------------------ |
|  GET   | `/health`                                                          |        Không        | Kiểm tra API và kết nối PostgreSQL                           |
|  POST  | `/api/auth/login`                                                  |        Không        | Đăng nhập, cấp cookie phiên                                  |
|  GET   | `/api/auth/me`                                                     |         Có          | Lấy tài khoản đang đăng nhập                                 |
|  POST  | `/api/auth/logout`                                                 |   Không bắt buộc    | Thu hồi phiên hiện tại và xóa cookie                         |
|  GET   | `/api/customers?phone={phone}`                                     |         Có          | Tra cứu khách hàng theo số điện thoại                        |
|  GET   | `/api/devices?serial={serial}&customer_id={customer_id}`           |         Có          | Tra cứu thiết bị, kiểm tra khách hàng sở hữu và bảo hành     |
|  GET   | `/api/tickets/categories`                                          |         Có          | Lấy danh mục sự cố đang hoạt động                            |
|  POST  | `/api/tickets/preview`                                             | Nhân viên tiếp nhận | Kiểm tra nghiệp vụ, tính thông tin xác nhận; không lưu phiếu |
|  POST  | `/api/tickets`                                                     | Nhân viên tiếp nhận | Tạo phiếu sau khi xác nhận thông tin xem trước               |
|  GET   | `/api/tickets?status={status}&page={page}&size={size}&sort={sort}` |         Có          | Xem danh sách, lọc, phân trang và sắp xếp                    |
|  GET   | `/api/tickets/{ticket_id}`                                         |         Có          | Xem chi tiết phiếu                                           |
|  PUT   | `/api/tickets/{ticket_id}`                                         | Nhân viên tiếp nhận | Cập nhật mô tả, nhóm sự cố và mức ưu tiên                    |
| PATCH  | `/api/tickets/{ticket_id}/status`                                  | Nhân viên tiếp nhận | Đóng phiếu và ghi nhật ký trạng thái                         |

## Quy ước chung

- API trao đổi JSON UTF-8. Request có body JSON gửi `Content-Type: application/json`; response có body dùng `application/json`.
- Tên trường request/response dùng `snake_case`.
- Thời gian dùng chuỗi ISO 8601 có múi giờ, ví dụ `2026-09-08T14:30:00.000Z`.
- Lỗi ứng dụng có cấu trúc `{ "error": { "code": "...", "message": "...", "fields": {} } }`. `fields` là object rỗng nếu lỗi không gắn với trường cụ thể.
- Các endpoint `/api` trừ `POST /api/auth/login` và `POST /api/auth/logout` yêu cầu phiên đăng nhập. `/health` không yêu cầu đăng nhập.
- Ứng dụng không cấu hình CORS; frontend phát triển dùng Vite proxy và cùng origin khi triển khai theo cấu hình hiện tại.

## Xác thực và quyền truy cập

- Đăng nhập thành công cấp cookie `mekong_session` với `HttpOnly`, `SameSite=Strict`, `Path=/api`, thời hạn 8 giờ. Thuộc tính `Secure` bật trong production, trừ khi được cấu hình khác qua `AUTH_COOKIE_SECURE`.
- `POST /api/auth/login` nhận `{ "username", "password" }`. Sai thông tin hoặc tài khoản không hoạt động trả `401 INVALID_CREDENTIALS`. Sau 5 lần đăng nhập sai trong 15 phút từ cùng IP, request tiếp theo bị từ chối với `429 TOO_MANY_LOGIN_ATTEMPTS`; bộ đếm lưu trong bộ nhớ của một tiến trình.
- `GET /api/auth/me` trả tài khoản hiện tại; thiếu phiên hoặc phiên không hợp lệ/hết hạn trả `401 UNAUTHENTICATED`. Phiên hết hạn sau 8 giờ.
- `POST /api/auth/logout` xóa phiên nếu cookie hợp lệ, xóa cookie ở client và trả `204`; endpoint không yêu cầu phiên hợp lệ.
- Hai vai trò hiện có: `NHAN_VIEN_TIEP_NHAN` và `QUAN_LY`. Login response chỉ trả `user_id`, `username`, `role`, `center_id`, `center_ids`; không trả mật khẩu hoặc password hash. Với nhân viên, `center_ids` chứa một ID giống `center_id`; với quản lý, `center_id` là `null`, còn `center_ids` là danh sách trung tâm được gán.
- Nhân viên tiếp nhận chỉ xem danh sách/chi tiết, sửa và đóng phiếu thuộc trung tâm gắn với tài khoản. Danh sách được lọc theo trung tâm; phiếu ngoài trung tâm trả `404 NOT_FOUND` như không tồn tại. Khi tạo phiếu, backend lấy `center_id` từ tài khoản đăng nhập, không dùng giá trị trung tâm do client gửi.
- Quản lý chỉ xem được danh sách và chi tiết phiếu tại các trung tâm có trong `center_ids`. Quản lý không được xem trước, tạo, sửa hoặc đóng phiếu; các thao tác đó trả `403 FORBIDDEN`. Giao diện cũng vô hiệu hóa nút tạo phiếu cho vai trò này. Quản lý chưa được gán trung tâm nào sẽ không thấy phiếu nào.
- Trong chi tiết phiếu, quản lý nhận `customer_phone` đầy đủ; nhân viên nhận số đã che theo dạng `090****567`. API tra cứu khách hàng chỉ trả `phone_masked` cho cả hai vai trò. Tra cứu khách hàng và thiết bị yêu cầu đăng nhập nhưng hiện không lọc theo trung tâm.
- Phân quyền phiếu hiện dựa trên vai trò và trung tâm, không dựa trên nhân viên cụ thể đã tạo phiếu. Dự án không có API xóa phiếu.
- Người thực hiện tạo/đóng phiếu được ghi vào `ticket_status_log.changed_by`. Đây là nhật ký người thao tác, không phải trường `created_by` trên `ticket`.

## Lỗi dùng chung

| HTTP | Mã lỗi                    | Khi nào                                                                                 |
| :--: | ------------------------- | --------------------------------------------------------------------------------------- |
| 400  | `INVALID_JSON`            | Body JSON sai cú pháp                                                                   |
| 401  | `UNAUTHENTICATED`         | Thiếu phiên hoặc phiên không hợp lệ/hết hạn                                             |
| 403  | `FORBIDDEN`               | Vai trò không được phép thực hiện thao tác                                              |
| 404  | `NOT_FOUND`               | API hoặc phiếu không tồn tại/không thuộc trung tâm người dùng                           |
| 429  | `TOO_MANY_LOGIN_ATTEMPTS` | Vượt giới hạn đăng nhập sai                                                             |
| 500  | `INTERNAL_SERVER_ERROR`   | Lỗi không được ánh xạ thành lỗi ứng dụng cụ thể; response không tiết lộ chi tiết nội bộ |

## Chi tiết endpoint

### GET /health

Không cần đăng nhập.

**Response `200 OK` — truy vấn PostgreSQL thành công**

```json
{ "status": "ok", "db": "up" }
```

**Response `503 Service Unavailable` — không truy vấn được PostgreSQL**

```json
{ "status": "error", "db": "down" }
```

### POST /api/auth/login

**Request body**

```json
{ "username": "nv.trungtam-a.1", "password": "<password>" }
```

**Response `200 OK`** — đồng thời thiết lập cookie phiên `mekong_session`

```json
{
  "user": {
    "user_id": 1,
    "username": "nv.trungtam-a.1",
    "role": "NHAN_VIEN_TIEP_NHAN",
    "center_id": 0,
    "center_ids": [0]
  }
}
```

Tài khoản quản lý có `role: "QUAN_LY"`, `center_id: null` và `center_ids` chứa các trung tâm được giao, ví dụ `[0, 1]`.

**Lỗi có thể trả về:** `401 INVALID_CREDENTIALS`; `429 TOO_MANY_LOGIN_ATTEMPTS`.

### GET /api/auth/me

Yêu cầu cookie phiên hợp lệ.

**Response `200 OK`** có cùng cấu trúc `{ "user": { ... } }` như đăng nhập thành công.

**Lỗi có thể trả về:** `401 UNAUTHENTICATED`.

### POST /api/auth/logout

Không yêu cầu phiên hợp lệ. Nếu có cookie phiên, server thu hồi phiên tương ứng; luôn yêu cầu client xóa cookie bằng response header.

**Response:** `204 No Content`.

### GET /api/customers?phone={phone}

Yêu cầu đăng nhập. Chuẩn hóa số điện thoại bằng cách bỏ dấu cách, dấu chấm, dấu ngoặc và dấu gạch nối; dạng `84...` hoặc `+84...` được chuyển về dạng bắt đầu bằng `0`. Số điện thoại sau chuẩn hóa phải có 10 chữ số. API luôn che số điện thoại, kể cả khi người gọi là quản lý.

**Response `200 OK`**

```json
{
  "customer_id": 1024,
  "full_name": "Nguyen Van A",
  "phone_masked": "090****567",
  "address": "Can Tho"
}
```

**Lỗi có thể trả về:** `400 INVALID_PHONE` (chi tiết tại `error.fields.phone`); `404 CUSTOMER_NOT_FOUND`.

### GET /api/devices?serial={serial}&customer_id={customer_id}

Yêu cầu đăng nhập. Tra cứu theo serial/IMEI và mã khách hàng; xác minh thiết bị thuộc khách hàng đã chọn. Endpoint hiện không giới hạn kết quả theo trung tâm của tài khoản. Thiết bị hết hạn hoặc thiếu ngày mua vẫn được trả về; `warranty_approved` là `false` nếu hết hạn hoặc chưa xác minh.

**Response `200 OK` — ví dụ còn hạn bảo hành**

```json
{
  "device_id": 3311,
  "customer_id": 1024,
  "serial_no": "SN123456789",
  "purchase_date": "2025-03-15",
  "warranty_approved": true
}
```

**Lỗi có thể trả về:** `400 VALIDATION_FAILED` (query không hợp lệ, chi tiết ở `error.fields`); `404 CUSTOMER_NOT_FOUND`; `404 DEVICE_NOT_FOUND`; `422 DEVICE_CUSTOMER_MISMATCH` (chi tiết tại `error.fields.serial`).

### GET /api/tickets/categories

Yêu cầu đăng nhập với một trong hai vai trò. Không cần query hoặc body. Trả các nhóm sự cố đang hoạt động cùng mức ưu tiên mặc định.

**Response `200 OK`**

```json
[{ "category_id": 1, "category_name": "Sạc", "default_priority": "TRUNG_BINH" }]
```

### POST /api/tickets/preview

Chỉ nhân viên tiếp nhận. Kiểm tra dữ liệu và nghiệp vụ trước màn hình xác nhận; không lưu phiếu hoặc log. Request gồm `customer_id`, `device_id`, `issue_desc`, `category_id`; `priority` tùy chọn và mặc định theo danh mục. `center_id` do backend lấy từ tài khoản, client không cần gửi. Không gửi `received_at` và `due_date` ở bước này.

**Request body**

```json
{
  "customer_id": 1024,
  "device_id": 3311,
  "issue_desc": "Máy sạc không vào, cắm sạc báo lỗi",
  "category_id": 1,
  "priority": "TRUNG_BINH"
}
```

**Response `200 OK`**

```json
{
  "priority": "TRUNG_BINH",
  "is_warranty": true,
  "received_at": "2026-09-08T14:30:00.000Z",
  "due_date": "2026-09-11T14:30:00.000Z"
}
```

**Lỗi có thể trả về:** `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 CUSTOMER_NOT_FOUND` hoặc `DEVICE_NOT_FOUND`; `409 TICKET_CONFLICT` nếu thiết bị đang có phiếu chưa đóng; `422 DEVICE_CUSTOMER_MISMATCH`; `422 WARRANTY_NOT_APPROVED` nếu thiết bị hết hạn hoặc chưa xác minh bảo hành.

### POST /api/tickets

Chỉ nhân viên tiếp nhận. Lưu phiếu sau khi người dùng xác nhận. Request có các trường như preview và phải gửi thêm `received_at`, `due_date` nhận từ response preview. Backend dùng trung tâm của tài khoản, không dùng `center_id` client gửi. Server kiểm tra định dạng hai mốc thời gian và lưu giá trị đã xác nhận.

Tạo phiếu và log trạng thái ban đầu nằm trong cùng transaction. Log có `from_status = NULL`, `to_status = 'MOI'`, `changed_at = received_at`, `changed_by` là `user_id` đang đăng nhập. Không có trường ghi người tạo trên bản ghi `ticket`.

**Response `201 Created`**

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

**Lỗi có thể trả về:** `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 CUSTOMER_NOT_FOUND` hoặc `DEVICE_NOT_FOUND`; `409 TICKET_CONFLICT`; `422 DEVICE_CUSTOMER_MISMATCH`; `422 WARRANTY_NOT_APPROVED`; `500 INTERNAL_SERVER_ERROR` nếu có lỗi hệ thống không dự kiến.

### GET /api/tickets?status={status}&page={page}&size={size}&sort={sort}

Yêu cầu đăng nhập. Các query tùy chọn. `status` nhận một trong `MOI`, `DA_PHAN_CONG`, `DANG_XU_LY`, `CHO_LINH_KIEN`, `HOAN_TAT`, `DA_DONG`. `page` mặc định 1; `size` mặc định 20 và nhận giá trị từ 1 đến 100. `sort` nhận `ticket_code_asc` hoặc `ticket_code_desc`; nếu bỏ qua, sắp theo thời điểm nhận mới nhất. Nhân viên chỉ nhận phiếu thuộc trung tâm mình; quản lý chỉ nhận phiếu thuộc các trung tâm được gán.

**Response `200 OK`**

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

**Lỗi có thể trả về:** `400 INVALID_STATUS`; `400 INVALID_PAGE_SIZE`; `400 INVALID_SORT_ORDER`; `401 UNAUTHENTICATED`.

### GET /api/tickets/{ticket_id}

Yêu cầu đăng nhập. Trả chi tiết nếu phiếu tồn tại và người gọi được phép xem. Phiếu ngoài trung tâm nhân viên hoặc ngoài danh sách trung tâm được gán cho quản lý trả `404 NOT_FOUND`. Response gồm `ticket_id`, `ticket_code`, `customer_id`, `customer_name`, `customer_phone`, `device_id`, `serial_no`, `center_id`, `issue_desc`, `category_id`, `category_name`, `priority`, `status`, `received_at`, `due_date`, `closed_at`. `customer_phone` đầy đủ với quản lý và được che với nhân viên.

**Lỗi có thể trả về:** `400 VALIDATION_FAILED` nếu `ticket_id` không phải số nguyên dương; `401 UNAUTHENTICATED`; `404 NOT_FOUND` nếu không tồn tại hoặc nằm ngoài trung tâm của nhân viên.

### PUT /api/tickets/{ticket_id}

Chỉ nhân viên tiếp nhận và chỉ áp dụng cho phiếu thuộc trung tâm tài khoản. Cập nhật `issue_desc`, `category_id`, `priority`; không đổi khách hàng, thiết bị, mã phiếu, trung tâm hoặc `received_at`. `due_date` được tính lại từ `received_at` ban đầu theo mức ưu tiên mới. Phiếu `DA_DONG` hoặc `DA_HUY` không sửa được.

**Request body**

```json
{
  "issue_desc": "Máy sạc không vào, đã kiểm tra lại cáp",
  "category_id": 1,
  "priority": "CAO"
}
```

**Response `200 OK`** trả chi tiết phiếu sau cập nhật theo cùng quy tắc che số điện thoại của endpoint GET detail.

**Lỗi có thể trả về:** `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 NOT_FOUND` nếu phiếu không tồn tại/ngoài trung tâm; `409 TICKET_NOT_EDITABLE` nếu phiếu đã đóng hoặc hủy.

### PATCH /api/tickets/{ticket_id}/status

Chỉ nhân viên tiếp nhận và chỉ áp dụng cho phiếu thuộc trung tâm tài khoản. Chuyển phiếu từ mọi trạng thái hiện tại sang `DA_DONG`, ngoại trừ phiếu đã đóng. Cập nhật `closed_at` và ghi log `from_status`, `to_status = 'DA_DONG'`, `changed_at`, `changed_by` (user đang đăng nhập) trong cùng transaction.

**Request body**

```json
{ "status": "DA_DONG" }
```

**Response `200 OK`**

```json
{
  "ticket_id": 88231,
  "status": "DA_DONG",
  "closed_at": "2026-09-11T14:30:00.000Z"
}
```

**Lỗi có thể trả về:** `400 VALIDATION_FAILED` nếu trạng thái đích không phải `DA_DONG`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 NOT_FOUND` nếu phiếu không tồn tại/ngoài trung tâm; `409 INVALID_STATUS_TRANSITION` nếu phiếu đã đóng.

## Tóm tắt validation theo endpoint

| Endpoint                                | Trường/điều kiện chính                                                                                                                         | Nơi kiểm tra hiện tại                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `POST /api/auth/login`                  | Tài khoản tồn tại, đang hoạt động và mật khẩu đúng                                                                                             | `authService`; giới hạn lần sai tại `authRoute`        |
| `GET /api/customers`                    | Số điện thoại chuẩn hóa thành 10 chữ số bắt đầu bằng 0                                                                                         | `customerService`                                      |
| `GET /api/devices`                      | `serial` không trống; `customer_id` là số nguyên dương; thiết bị thuộc khách hàng                                                              | `deviceValidator`, `deviceService`                     |
| `POST /api/tickets/preview`             | ID hợp lệ, mô tả không trống, ưu tiên hợp lệ nếu gửi; kiểm tra khách hàng, thiết bị, quyền sở hữu thiết bị và bảo hành; trung tâm lấy từ phiên | `ticketValidator`, `ticketService`                     |
| `POST /api/tickets`                     | Các trường preview cùng `received_at`, `due_date` hợp lệ; kiểm tra trùng phiếu khi ghi                                                         | `ticketValidator`, `ticketService`, `ticketRepository` |
| `GET /api/tickets`                      | Trạng thái hợp lệ; `page` dương; `size` từ 1 đến 100; `sort` hỗ trợ; lọc trung tâm theo vai trò                                                | `ticketValidator`, `ticketService`, `ticketRepository` |
| `GET /api/tickets/{ticket_id}`          | Mã phiếu là số nguyên dương; kiểm tra phạm vi trung tâm và che số theo vai trò                                                                 | `ticketValidator`, `ticketService`, `ticketRepository` |
| `PUT /api/tickets/{ticket_id}`          | Mô tả không trống; nhóm sự cố/ưu tiên hợp lệ; trạng thái phiếu cho phép sửa                                                                    | `ticketValidator`, `ticketService`, `ticketRepository` |
| `PATCH /api/tickets/{ticket_id}/status` | Chỉ nhận trạng thái đích `DA_DONG`; kiểm tra phạm vi trung tâm và trạng thái hiện tại                                                          | `ticketValidator`, `ticketService`, `ticketRepository` |
