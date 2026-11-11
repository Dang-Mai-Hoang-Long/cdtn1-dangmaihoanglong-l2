# Mekong Mobile L2 API Reference

This document describes the API routes currently implemented by the project. The request and response examples below show the implemented JSON shape and use synthetic sample values; they are not raw captures from a live deployment. See [`../test-report.md`](../test-report.md) and [`../screenshots/`](../screenshots/) for recorded test evidence. Do not treat an example as an additional test result.

## Base URL and conventions

- Local Docker base URL: `http://localhost:3001`.
- Requests and responses use JSON. Send `Content-Type: application/json` when a request has a JSON body.
- Timestamps use ISO 8601 with a timezone, normally UTC (`Z`).
- Authenticated requests use the `mekong_session` cookie set by the login endpoint. The cookie is `HttpOnly`, `SameSite=Strict`, scoped to `/api`, and expires after eight hours.
- Errors use `{ "error": { "code": "...", "message": "...", "fields": {} } }`. Validation errors may include field-specific messages in `fields`.
- There is no bearer-token authentication. The frontend and API use the same origin in the Docker setup.

## Endpoint reference

| Method and path                                                        | Description                                                                        | Authentication                        | Parameters / request                                                                                                                                  | Success response                                                                                            | Error responses                                                                                                                                                                                                               | Limits and behavior                                                                                                                                                                                             |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health`                                                          | Checks API and database readiness.                                                 | None                                  | No parameters or body.                                                                                                                                | `200` `{ "status": "ok", "db": "up" }` when database query succeeds.                                        | `503` `{ "status": "error", "db": "down" }` when database is unavailable.                                                                                                                                                     | Lightweight readiness check; does not require a session.                                                                                                                                                        |
| `POST /api/auth/login`                                                 | Authenticates a user and creates a session cookie.                                 | None                                  | JSON `{ "username": string, "password": string }`.                                                                                                    | `200` `{ "user": { "user_id", "username", "role", "center_id", "center_ids" } }`; sets `mekong_session`.    | `400 INVALID_JSON`; `401 INVALID_CREDENTIALS`; `429 TOO_MANY_LOGIN_ATTEMPTS`; `500 INTERNAL_SERVER_ERROR`.                                                                                                                    | After five failed attempts from an IP during a 15-minute window, another attempt is rejected. Counter is process-local.                                                                                         |
| `GET /api/auth/me`                                                     | Returns the current authenticated user.                                            | Valid session cookie.                 | No parameters or body.                                                                                                                                | `200` `{ "user": { "user_id", "username", "role", "center_id", "center_ids" } }`.                           | `401 UNAUTHENTICATED`; `500 INTERNAL_SERVER_ERROR`.                                                                                                                                                                           | Session expires after eight hours. Response is not cached.                                                                                                                                                      |
| `POST /api/auth/logout`                                                | Revokes the cookie session, if present, and clears the client cookie.              | Optional session cookie.              | No parameters or body.                                                                                                                                | `204 No Content`; sends an expired cookie.                                                                  | `400 INVALID_JSON`; `500 INTERNAL_SERVER_ERROR`.                                                                                                                                                                              | Safe to call without a valid session.                                                                                                                                                                           |
| `GET /api/customers?phone={phone}`                                     | Looks up a customer by normalized phone number.                                    | Valid session cookie.                 | Query `phone`; separators are removed and `84`/`+84` prefixes normalize to `0`.                                                                       | `200` customer object with `customer_id`, `full_name`, `phone_masked`, and `address`.                       | `400 INVALID_PHONE`; `401 UNAUTHENTICATED`; `404 CUSTOMER_NOT_FOUND`; `500 INTERNAL_SERVER_ERROR`.                                                                                                                            | Normalized phone must contain ten digits and start with `0`. Phone is masked for both roles.                                                                                                                    |
| `GET /api/devices?serial={serial}&customer_id={customer_id}`           | Looks up a device and verifies its owner and warranty status.                      | Valid session cookie.                 | Query `serial` and positive integer `customer_id`.                                                                                                    | `200` device object with `device_id`, `customer_id`, `serial_no`, `purchase_date`, and `warranty_approved`. | `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `404 CUSTOMER_NOT_FOUND`; `404 DEVICE_NOT_FOUND`; `422 DEVICE_CUSTOMER_MISMATCH`; `500 INTERNAL_SERVER_ERROR`.                                                                | A device without a purchase date or outside warranty can still be returned with `warranty_approved: false`. No center filter is applied to this lookup.                                                         |
| `GET /api/tickets/categories`                                          | Lists active issue categories and default priorities.                              | Valid session cookie.                 | No parameters or body.                                                                                                                                | `200` array of `{ "category_id", "category_name", "default_priority" }`.                                    | `401 UNAUTHENTICATED`; `500 INTERNAL_SERVER_ERROR`.                                                                                                                                                                           | Returns active categories only.                                                                                                                                                                                 |
| `POST /api/tickets/preview`                                            | Validates an intake request and calculates preview values without saving a ticket. | Intake staff (`NHAN_VIEN_TIEP_NHAN`). | JSON requires `customer_id`, `device_id`, `category_id`, and non-empty `issue_desc`; `priority` is optional. Do not send `received_at` or `due_date`. | `200` `{ "priority", "is_warranty", "received_at", "due_date" }`.                                           | `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 CUSTOMER_NOT_FOUND` / `DEVICE_NOT_FOUND`; `409 TICKET_CONFLICT`; `422 DEVICE_CUSTOMER_MISMATCH` / `WARRANTY_NOT_APPROVED`; `500 INTERNAL_SERVER_ERROR`. | `center_id` is taken from the authenticated user. Preview does not write a ticket or status log.                                                                                                                |
| `POST /api/tickets`                                                    | Creates a ticket after the user confirms the preview.                              | Intake staff (`NHAN_VIEN_TIEP_NHAN`). | Same business fields as preview, plus `received_at` and `due_date` from the preview response.                                                         | `201` ticket object including `ticket_id`, `ticket_code`, `status`, category, priority, and time fields.    | `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 CUSTOMER_NOT_FOUND` / `DEVICE_NOT_FOUND`; `409 TICKET_CONFLICT`; `422 DEVICE_CUSTOMER_MISMATCH` / `WARRANTY_NOT_APPROVED`; `500 INTERNAL_SERVER_ERROR`. | Center is taken from the session. Ticket and initial `MOI` status log are written in one transaction. The service recalculates `due_date` from `received_at` and priority.                                      |
| `GET /api/tickets?status={status}&page={page}&size={size}&sort={sort}` | Lists tickets with optional filtering, pagination, and ordering.                   | Valid session cookie.                 | Optional `status`, `page`, `size`, `sort`.                                                                                                            | `200` `{ "data": [...], "page", "size", "total" }`.                                                         | `400 INVALID_STATUS`; `400 INVALID_PAGE_SIZE`; `400 INVALID_SORT_ORDER`; `401 UNAUTHENTICATED`; `500 INTERNAL_SERVER_ERROR`.                                                                                                  | Page defaults to `1`; size defaults to `20` and must be `1–100`. Sort accepts `ticket_code_asc` or `ticket_code_desc`; default is newest received first. Results are restricted to the user's assigned centers. |
| `GET /api/tickets/{ticket_id}`                                         | Returns ticket details visible to the user.                                        | Valid session cookie.                 | Path `ticket_id` must be a positive integer.                                                                                                          | `200` ticket detail object including customer, device, center, issue, status, and timestamps.               | `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `404 NOT_FOUND`; `500 INTERNAL_SERVER_ERROR`.                                                                                                                                 | Ticket outside the user's assigned centers returns `404`. Customer phone is full for managers and masked for intake staff.                                                                                      |
| `PUT /api/tickets/{ticket_id}`                                         | Updates issue description, category, and priority.                                 | Intake staff (`NHAN_VIEN_TIEP_NHAN`). | Path `ticket_id`; JSON `{ "issue_desc", "category_id", "priority" }`.                                                                                 | `200` updated ticket detail object.                                                                         | `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 NOT_FOUND`; `409 TICKET_NOT_EDITABLE`; `500 INTERNAL_SERVER_ERROR`.                                                                                     | Only tickets in the user's assigned centers can be updated. Closed or cancelled tickets cannot be edited. `received_at` remains unchanged; `due_date` is recalculated for the new priority.                     |
| `PATCH /api/tickets/{ticket_id}/status`                                | Closes a ticket and records a status log.                                          | Intake staff (`NHAN_VIEN_TIEP_NHAN`). | Path `ticket_id`; JSON `{ "status": "DA_DONG" }`.                                                                                                     | `200` `{ "ticket_id", "status": "DA_DONG", "closed_at" }`.                                                  | `400 VALIDATION_FAILED`; `401 UNAUTHENTICATED`; `403 FORBIDDEN`; `404 NOT_FOUND`; `409 INVALID_STATUS_TRANSITION`; `500 INTERNAL_SERVER_ERROR`.                                                                               | Only the `DA_DONG` target status is accepted. Closing updates the ticket and status log in one transaction.                                                                                                     |

## Endpoint request and response examples

All examples use fictional seeded records. Replace IDs and values with those returned by your own database. The sample session value is deliberately a placeholder; never commit a real password or session cookie. Error messages shown here are the API's current Vietnamese messages.

### `GET /health`

Request:

```http
GET /health HTTP/1.1
Host: localhost:3001
```

Response (`200 OK`):

```json
{ "status": "ok", "db": "up" }
```

### `POST /api/auth/login`

Request:

```http
POST /api/auth/login HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{ "username": "nv.trungtam-a.1", "password": "<demo-password>" }
```

Response (`200 OK`; also sets the `mekong_session` cookie):

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

### `GET /api/auth/me`

Request:

```http
GET /api/auth/me HTTP/1.1
Host: localhost:3001
Cookie: mekong_session=<session-cookie>
```

Response (`200 OK`):

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

### `POST /api/auth/logout`

Request:

```http
POST /api/auth/logout HTTP/1.1
Host: localhost:3001
Cookie: mekong_session=<session-cookie>
```

Response: `204 No Content`; the response expires the `mekong_session` cookie and has no JSON body.

### `GET /api/customers?phone=0999000001`

Request:

```http
GET /api/customers?phone=0999000001 HTTP/1.1
Host: localhost:3001
Cookie: mekong_session=<session-cookie>
```

Response (`200 OK`):

```json
{
  "customer_id": 1,
  "full_name": "Nguyễn Minh An",
  "phone_masked": "099****001",
  "address": "12 Đường Mẫu, Quận 1"
}
```

### `GET /api/devices?serial=DEMO-IMEI-L2-001&customer_id=1`

Request:

```http
GET /api/devices?serial=DEMO-IMEI-L2-001&customer_id=1 HTTP/1.1
Host: localhost:3001
Cookie: mekong_session=<session-cookie>
```

Response (`200 OK`):

```json
{
  "device_id": 1,
  "customer_id": 1,
  "serial_no": "DEMO-IMEI-L2-001",
  "purchase_date": "2026-01-15",
  "warranty_approved": true
}
```

### `GET /api/tickets/categories`

Request:

```http
GET /api/tickets/categories HTTP/1.1
Host: localhost:3001
Cookie: mekong_session=<session-cookie>
```

Response (`200 OK`):

```json
[
  { "category_id": 1, "category_name": "Màn hình", "default_priority": "CAO" },
  { "category_id": 2, "category_name": "Pin", "default_priority": "TRUNG_BINH" }
]
```

### `POST /api/tickets/preview`

Request:

```http
POST /api/tickets/preview HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Cookie: mekong_session=<session-cookie>

{
  "customer_id": 1,
  "device_id": 1,
  "category_id": 2,
  "priority": "TRUNG_BINH",
  "issue_desc": "Máy không nhận sạc khi dùng bộ sạc chính hãng."
}
```

Response (`200 OK`; timestamps depend on the time the preview is requested):

```json
{
  "priority": "TRUNG_BINH",
  "is_warranty": true,
  "received_at": "2026-10-23T02:00:00.000Z",
  "due_date": "2026-10-27T02:00:00.000Z"
}
```

### `POST /api/tickets`

Request (send the `received_at` and `due_date` returned by the preceding preview):

```http
POST /api/tickets HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Cookie: mekong_session=<session-cookie>

{
  "customer_id": 1,
  "device_id": 1,
  "category_id": 2,
  "priority": "TRUNG_BINH",
  "issue_desc": "Máy không nhận sạc khi dùng bộ sạc chính hãng.",
  "received_at": "2026-10-23T02:00:00.000Z",
  "due_date": "2026-10-27T02:00:00.000Z"
}
```

Response (`201 Created`; identifiers and timestamps are generated by the running system):

```json
{
  "ticket_id": 1021,
  "ticket_code": "BH-001021/2026",
  "status": "MOI",
  "category_id": 2,
  "priority": "TRUNG_BINH",
  "received_at": "2026-10-23T02:00:00.000Z",
  "due_date": "2026-10-27T02:00:00.000Z"
}
```

The server derives `center_id` from the authenticated staff account, recalculates `due_date`, and records the initial status log in the same transaction.

### `GET /api/tickets?status=MOI&page=1&size=20`

Request:

```http
GET /api/tickets?status=MOI&page=1&size=20 HTTP/1.1
Host: localhost:3001
Cookie: mekong_session=<session-cookie>
```

Response (`200 OK`):

```json
{
  "data": [
    {
      "ticket_id": 1021,
      "ticket_code": "BH-001021/2026",
      "customer_id": 1,
      "customer_name": "Nguyễn Minh An",
      "device_id": 1,
      "serial_no": "DEMO-IMEI-L2-001",
      "status": "MOI",
      "priority": "TRUNG_BINH",
      "category_name": "Pin",
      "received_at": "2026-10-23T02:00:00.000Z",
      "due_date": "2026-10-27T02:00:00.000Z"
    }
  ],
  "page": 1,
  "size": 20,
  "total": 1
}
```

### `GET /api/tickets/1021`

Request:

```http
GET /api/tickets/1021 HTTP/1.1
Host: localhost:3001
Cookie: mekong_session=<session-cookie>
```

Response (`200 OK`; staff see the customer's phone masked, managers see it in full):

```json
{
  "ticket_id": 1021,
  "ticket_code": "BH-001021/2026",
  "customer_id": 1,
  "customer_name": "Nguyễn Minh An",
  "customer_phone": "099****001",
  "device_id": 1,
  "serial_no": "DEMO-IMEI-L2-001",
  "center_id": 0,
  "issue_desc": "Máy không nhận sạc khi dùng bộ sạc chính hãng.",
  "category_id": 2,
  "category_name": "Pin",
  "priority": "TRUNG_BINH",
  "status": "MOI",
  "received_at": "2026-10-23T02:00:00.000Z",
  "due_date": "2026-10-27T02:00:00.000Z",
  "closed_at": null
}
```

### `PUT /api/tickets/1021`

Request:

```http
PUT /api/tickets/1021 HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Cookie: mekong_session=<session-cookie>

{
  "issue_desc": "Máy không nhận sạc với bộ sạc chính hãng.",
  "category_id": 2,
  "priority": "TRUNG_BINH"
}
```

Response (`200 OK`):

```json
{
  "ticket_id": 1021,
  "ticket_code": "BH-001021/2026",
  "customer_id": 1,
  "customer_name": "Nguyễn Minh An",
  "customer_phone": "099****001",
  "device_id": 1,
  "serial_no": "DEMO-IMEI-L2-001",
  "center_id": 0,
  "issue_desc": "Máy không nhận sạc với bộ sạc chính hãng.",
  "category_id": 2,
  "category_name": "Pin",
  "priority": "TRUNG_BINH",
  "status": "MOI",
  "received_at": "2026-10-23T02:00:00.000Z",
  "due_date": "2026-10-27T02:00:00.000Z",
  "closed_at": null
}
```

### `PATCH /api/tickets/1021/status`

Request:

```http
PATCH /api/tickets/1021/status HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Cookie: mekong_session=<session-cookie>

{ "status": "DA_DONG" }
```

Response (`200 OK`):

```json
{
  "ticket_id": 1021,
  "status": "DA_DONG",
  "closed_at": "2026-10-23T03:15:00.000Z"
}
```

## Error response example

Request with the required `issue_desc` omitted:

```http
POST /api/tickets/preview HTTP/1.1
Host: localhost:3001
Content-Type: application/json
Cookie: mekong_session=<session-cookie>

{ "customer_id": 1, "device_id": 1, "category_id": 2 }
```

Response (`400 Bad Request`):

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Dữ liệu không hợp lệ",
    "fields": { "issue_desc": "Mô tả lỗi không được để trống" }
  }
}
```

For complete business rules and the full error-code list, see [`../api-contract.md`](../api-contract.md). The examples in this reference document illustrate response shapes; for coursework evidence of executed cases, use the test report and its screenshots.
