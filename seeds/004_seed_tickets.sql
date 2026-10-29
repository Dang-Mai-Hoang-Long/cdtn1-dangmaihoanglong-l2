-- Nhom co dinh: bo qua 10 thiet bi dau; 10 phieu chua dong va 10 phieu hoan tat/dong.
-- Khong co phieu dang mang trang thai DA_PHAN_CONG de demo ket qua loc rong.
-- Nhom tu sinh: 1.000 phieu MOI dung cung mot mau du lieu.
WITH RECURSIVE so_phieu_co_dinh AS (
    SELECT so_thu_tu
    FROM (VALUES
        (11), (12), (13), (14), (15), (16), (17), (18), (19), (20),
        (21), (22), (23), (24), (25), (26), (27), (28), (29), (30)
    ) AS mau(so_thu_tu)
), phieu_co_dinh AS (
    SELECT
        'CO_DINH'::TEXT AS nhom_du_lieu,
        mau.so_thu_tu,
        CASE
            WHEN mau.so_thu_tu <= 20
                THEN 'DEMO-IMEI-L2-' || LPAD(mau.so_thu_tu::TEXT, 3, '0')
            WHEN mau.so_thu_tu = 21 THEN 'DEMO-L2-DEVICE-0021'
            WHEN mau.so_thu_tu = 22 THEN 'DEMO-L2-DEVICE-0022'
            WHEN mau.so_thu_tu <= 30
                THEN 'DEMO-L2-FIXED-' || LPAD(mau.so_thu_tu::TEXT, 4, '0')
        END AS serial_no,
        CASE
            WHEN mau.so_thu_tu <= 13 THEN 'MOI'
            WHEN mau.so_thu_tu <= 16 THEN 'MOI'
            WHEN mau.so_thu_tu <= 18 THEN 'DANG_XU_LY'
            WHEN mau.so_thu_tu <= 20 THEN 'CHO_LINH_KIEN'
            WHEN mau.so_thu_tu <= 25 THEN 'HOAN_TAT'
            ELSE 'DA_DONG'
        END AS status,
        (ARRAY['CAO', 'TRUNG_BINH', 'THAP'])[MOD(mau.so_thu_tu - 1, 3) + 1] AS priority,
        (ARRAY['Màn hình', 'Pin', 'Sạc', 'Phần mềm', 'Nước vào', 'Khác'])[
            MOD(mau.so_thu_tu - 1, 6) + 1
        ] AS category_name,
        (ARRAY[
            'Màn hình hiển thị chập chờn khi sử dụng.',
            'Pin giảm nhanh và cần được kiểm tra.',
            'Thiết bị không nhận sạc ổn định.',
            'Ứng dụng thường thoát khi khởi động.',
            'Thiết bị có dấu hiệu vào nước ở cổng kết nối.'
        ])[MOD(mau.so_thu_tu - 1, 5) + 1] AS issue_desc,
        20 + MOD(mau.so_thu_tu * 3, 80) AS so_ngay_truoc,
        MOD(mau.so_thu_tu * 5, 8) AS gio_nhan
    FROM so_phieu_co_dinh mau
), phieu_tu_sinh AS (
    SELECT
        'TU_SINH'::TEXT AS nhom_du_lieu,
        mau.so_thu_tu,
        'DEMO-L2-DEVICE-' || LPAD((mau.so_thu_tu + 22)::TEXT, 4, '0') AS serial_no,
        'MOI'::TEXT AS status,
        'TRUNG_BINH'::TEXT AS priority,
        'Sạc'::TEXT AS category_name,
        'Phiếu tự sinh dùng để bổ sung dữ liệu danh sách.'::TEXT AS issue_desc,
        7 AS so_ngay_truoc,
        9 AS gio_nhan
    FROM generate_series(1, 1000) AS mau(so_thu_tu)
), ban_nhap AS (
    SELECT * FROM phieu_co_dinh
    UNION ALL
    SELECT * FROM phieu_tu_sinh
), co_thoi_gian AS (
    SELECT
        ban_nhap.*,
        (CURRENT_DATE - so_ngay_truoc)::TIMESTAMP
            + gio_nhan * INTERVAL '1 hour' AS received_at,
        CASE priority
            WHEN 'CAO' THEN 24
            WHEN 'TRUNG_BINH' THEN 72
            ELSE 120
        END AS gio_cam_ket
    FROM ban_nhap
), tinh_han AS (
    SELECT
        nhom_du_lieu,
        so_thu_tu,
        received_at AS moc_hien_tai,
        gio_cam_ket AS gio_con_lai
    FROM co_thoi_gian
    UNION ALL
    SELECT
        tinh_han.nhom_du_lieu,
        tinh_han.so_thu_tu,
        CASE
            WHEN EXTRACT(ISODOW FROM tinh_han.moc_hien_tai) = 7
                THEN tinh_han.moc_hien_tai + INTERVAL '1 day'
            ELSE tinh_han.moc_hien_tai + INTERVAL '1 hour'
        END,
        tinh_han.gio_con_lai - CASE
            WHEN EXTRACT(ISODOW FROM tinh_han.moc_hien_tai) = 7 THEN 0
            ELSE 1
        END
    FROM tinh_han
    WHERE gio_con_lai > 0
), han_cam_ket AS (
    SELECT nhom_du_lieu, so_thu_tu, MAX(moc_hien_tai) AS due_date
    FROM tinh_han
    WHERE gio_con_lai = 0
    GROUP BY nhom_du_lieu, so_thu_tu
), du_lieu_phieu AS (
    SELECT
        co_thoi_gian.*,
        han_cam_ket.due_date,
        device.customer_id,
        device.device_id,
        category.category_id
    FROM co_thoi_gian
    JOIN han_cam_ket USING (nhom_du_lieu, so_thu_tu)
    JOIN device ON device.serial_no = co_thoi_gian.serial_no
    JOIN issue_category category ON category.category_name = co_thoi_gian.category_name
), phieu_co_id AS (
    SELECT
        ROW_NUMBER() OVER (
            ORDER BY
                CASE nhom_du_lieu WHEN 'CO_DINH' THEN 1 ELSE 2 END,
                so_thu_tu
        )::BIGINT AS ticket_id,
        du_lieu_phieu.*
    FROM du_lieu_phieu
), phieu_co_ma AS (
    SELECT
        'BH-' || LPAD(ticket_id::TEXT, 6, '0') || '/'
            || EXTRACT(YEAR FROM received_at)::INTEGER::TEXT AS ticket_code,
        phieu_co_id.*
    FROM phieu_co_id
)
INSERT INTO ticket (
    ticket_id, ticket_code, customer_id, device_id, center_id, issue_desc,
    category_id, priority, status, received_at, due_date, closed_at, is_warranty
)
SELECT
    ticket_id,
    ticket_code,
    customer_id,
    device_id,
    0,
    issue_desc,
    category_id,
    priority,
    status,
    received_at,
    due_date,
    CASE
        WHEN status IN ('HOAN_TAT', 'DA_DONG') THEN due_date
        ELSE NULL
    END,
    TRUE
FROM phieu_co_ma
ORDER BY ticket_id
ON CONFLICT (ticket_id) DO NOTHING;

-- Dong bo sequence de phieu tiep theo do ung dung tao tiep tuc tu ID lon nhat.
SELECT setval(
    pg_get_serial_sequence('ticket', 'ticket_id'),
    COALESCE(MAX(ticket_id), 1),
    MAX(ticket_id) IS NOT NULL
)
FROM ticket;
