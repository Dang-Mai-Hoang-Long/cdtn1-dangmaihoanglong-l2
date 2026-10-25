-- Danh mục là dữ liệu chuẩn của nghiệp vụ nên có đủ sáu loại trong BT1.
-- Đồng bộ trước khi INSERT để xử lý DB từng được nạp ID thủ công.
SELECT setval(pg_get_serial_sequence('public.customer', 'customer_id'), COALESCE(MAX(customer_id), 1), MAX(customer_id) IS NOT NULL) FROM customer;
SELECT setval(pg_get_serial_sequence('public.device', 'device_id'), COALESCE(MAX(device_id), 1), MAX(device_id) IS NOT NULL) FROM device;
SELECT setval(pg_get_serial_sequence('public.issue_category', 'category_id'), COALESCE(MAX(category_id), 1), MAX(category_id) IS NOT NULL) FROM issue_category;
SELECT setval(pg_get_serial_sequence('public.ticket', 'ticket_id'), COALESCE(MAX(ticket_id), 1), MAX(ticket_id) IS NOT NULL) FROM ticket;
SELECT setval(pg_get_serial_sequence('public.ticket_status_log', 'log_id'), COALESCE(MAX(log_id), 1), MAX(log_id) IS NOT NULL) FROM ticket_status_log;

INSERT INTO issue_category (category_name, default_priority, is_active)
VALUES
    ('Màn hình', 'CAO', TRUE),
    ('Pin', 'TRUNG_BINH', TRUE),
    ('Sạc', 'TRUNG_BINH', TRUE),
    ('Phần mềm', 'THAP', TRUE),
    ('Nước vào', 'CAO', TRUE),
    ('Khác', 'THAP', TRUE)
ON CONFLICT (category_name) DO NOTHING;

-- Sinh 20 khách hàng mẫu với số điện thoại giả lập, ổn định giữa các lần chạy.
INSERT INTO customer (full_name, phone, email, address, segment)
SELECT
    'Khách hàng mẫu ' || LPAD(so_thu_tu::TEXT, 2, '0'),
    '09990000' || LPAD(so_thu_tu::TEXT, 2, '0'),
    'khach' || LPAD(so_thu_tu::TEXT, 2, '0') || '@example.test',
    CASE WHEN so_thu_tu % 2 = 0 THEN 'Cần Thơ' ELSE 'TP. Hồ Chí Minh' END,
    CASE so_thu_tu % 4
        WHEN 0 THEN 'VIP'
        WHEN 1 THEN 'MOI'
        WHEN 2 THEN 'THUONG_XUYEN'
        ELSE 'NGU_DONG'
    END
FROM generate_series(1, 20) AS mau(so_thu_tu)
ON CONFLICT (phone) DO NOTHING;

-- Mỗi khách hàng mẫu có một thiết bị mẫu, mã serial không đổi khi chạy lại.
INSERT INTO device (customer_id, product_id, serial_no, purchase_date, warranty_months)
SELECT
    c.customer_id,
    1 + (so_thu_tu % 3),
    'DEMO-IMEI-L2-' || LPAD(so_thu_tu::TEXT, 3, '0'),
    CURRENT_DATE - (so_thu_tu * 7),
    12
FROM generate_series(1, 20) AS mau(so_thu_tu)
JOIN customer c
  ON c.phone = '09990000' || LPAD(so_thu_tu::TEXT, 2, '0')
ON CONFLICT (serial_no) DO NOTHING;

-- 20 phiếu minh họa danh sách, lọc trạng thái và quan hệ giữa các bảng.
INSERT INTO ticket (
    ticket_code, customer_id, device_id, center_id, issue_desc,
    category_id, priority, status, received_at, due_date, is_warranty
)
SELECT
    'BH-' || LPAD((990000 + mau.so_thu_tu)::TEXT, 6, '0') || '/'
        || EXTRACT(YEAR FROM CURRENT_DATE)::INT,
    c.customer_id,
    d.device_id,
    0,
    CASE mau.so_thu_tu % 4
        WHEN 0 THEN 'Màn hình thiết bị hoạt động chập chờn.'
        WHEN 1 THEN 'Pin giảm nhanh trong quá trình sử dụng.'
        WHEN 2 THEN 'Thiết bị không nhận sạc.'
        ELSE 'Thiết bị cần kiểm tra phần mềm.'
    END,
    ic.category_id,
    ic.default_priority,
    CASE WHEN mau.so_thu_tu % 5 = 0 THEN 'DA_PHAN_CONG' ELSE 'MOI' END,
    mau.thoi_diem_nhan,
    mau.thoi_diem_nhan + CASE ic.default_priority
        WHEN 'CAO' THEN INTERVAL '24 hours'
        WHEN 'TRUNG_BINH' THEN INTERVAL '72 hours'
        ELSE INTERVAL '120 hours'
    END,
    TRUE
FROM (
    SELECT so_thu_tu, CURRENT_TIMESTAMP - (so_thu_tu * INTERVAL '3 hours') AS thoi_diem_nhan
    FROM generate_series(1, 20) AS mau(so_thu_tu)
) AS mau
JOIN customer c
  ON c.phone = '09990000' || LPAD(mau.so_thu_tu::TEXT, 2, '0')
JOIN device d
  ON d.serial_no = 'DEMO-IMEI-L2-' || LPAD(mau.so_thu_tu::TEXT, 3, '0')
JOIN issue_category ic
  ON ic.category_name = CASE mau.so_thu_tu % 6
      WHEN 0 THEN 'Màn hình'
      WHEN 1 THEN 'Pin'
      WHEN 2 THEN 'Sạc'
      WHEN 3 THEN 'Phần mềm'
      WHEN 4 THEN 'Nước vào'
      ELSE 'Khác'
  END
ON CONFLICT (ticket_code) DO NOTHING;

-- Mỗi phiếu mẫu có một log trạng thái khởi tạo; điều kiện NOT EXISTS chống trùng.
INSERT INTO ticket_status_log (
    ticket_id, from_status, to_status, changed_at, changed_by, note
)
SELECT t.ticket_id, NULL, 'MOI', t.received_at, 0, 'Dữ liệu mẫu Buổi 7.'
FROM ticket t
WHERE t.ticket_code LIKE 'BH-9900%/' || EXTRACT(YEAR FROM CURRENT_DATE)::INT
  AND NOT EXISTS (
      SELECT 1
      FROM ticket_status_log l
      WHERE l.ticket_id = t.ticket_id
        AND l.from_status IS NULL
        AND l.to_status = 'MOI'
        AND l.note = 'Dữ liệu mẫu Buổi 7.'
  );

-- Bốn phiếu mẫu đã phân công có log chuyển tiếp từ trạng thái Mới.
INSERT INTO ticket_status_log (
    ticket_id, from_status, to_status, changed_at, changed_by, note
)
SELECT
    t.ticket_id,
    'MOI',
    'DA_PHAN_CONG',
    t.received_at + INTERVAL '30 minutes',
    0,
    'Dữ liệu mẫu Buổi 7: phân công.'
FROM ticket t
WHERE t.status = 'DA_PHAN_CONG'
  AND t.ticket_code LIKE 'BH-9900%/' || EXTRACT(YEAR FROM CURRENT_DATE)::INT
  AND NOT EXISTS (
      SELECT 1
      FROM ticket_status_log l
      WHERE l.ticket_id = t.ticket_id
        AND l.from_status = 'MOI'
        AND l.to_status = 'DA_PHAN_CONG'
        AND l.note = 'Dữ liệu mẫu Buổi 7: phân công.'
  );

