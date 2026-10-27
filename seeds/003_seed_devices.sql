-- Nhom co dinh: 30 thiet bi de demo; 10 dau chua co phieu, 20 sau co phieu.
WITH du_lieu_co_dinh AS (
    SELECT mau.*, kh.customer_id
    FROM (VALUES
        (1, 'DEMO-IMEI-L2-001', '0999000001', 1, 400, 24),
        (2, 'DEMO-IMEI-L2-002', '0999000002', 2, 250, 12),
        (3, 'DEMO-IMEI-L2-003', '0999000003', 3, 165, 6),
        (4, 'DEMO-IMEI-L2-004', '0999000004', 1, 280, 12),
        (5, 'DEMO-IMEI-L2-005', '0999000005', 2, 500, 24),
        (6, 'DEMO-IMEI-L2-006', '0999000006', 3, 160, 6),
        (7, 'DEMO-IMEI-L2-007', '0999000007', 1, 300, 12),
        (8, 'DEMO-IMEI-L2-008', '0999000008', 2, 520, 24),
        (9, 'DEMO-IMEI-L2-009', '0999000009', 3, 150, 6),
        (10, 'DEMO-IMEI-L2-010', '0999000010', 1, 330, 12),
        (11, 'DEMO-IMEI-L2-011', '0999000011', 2, 600, 24),
        (12, 'DEMO-IMEI-L2-012', '0999000012', 3, 170, 6),
        (13, 'DEMO-IMEI-L2-013', '0999000013', 1, 260, 12),
        (14, 'DEMO-IMEI-L2-014', '0999000014', 2, 550, 24),
        (15, 'DEMO-IMEI-L2-015', '0999000015', 3, 160, 6),
        (16, 'DEMO-IMEI-L2-016', '0999000016', 1, 230, 12),
        (17, 'DEMO-IMEI-L2-017', '0999000017', 2, 700, 24),
        (18, 'DEMO-IMEI-L2-018', '0999000018', 3, 175, 6),
        (19, 'DEMO-IMEI-L2-019', '0999000019', 1, 320, 12),
        (20, 'DEMO-IMEI-L2-020', '0999000020', 2, 410, 24),
        (21, 'DEMO-L2-DEVICE-0021', '0999000001', 3, 160, 6),
        (22, 'DEMO-L2-DEVICE-0022', '0999000001', 1, 300, 12),
        (23, 'DEMO-L2-FIXED-0023', '0999000021', 2, 240, 12),
        (24, 'DEMO-L2-FIXED-0024', '0999000022', 3, 260, 12),
        (25, 'DEMO-L2-FIXED-0025', '0999000023', 1, 280, 12),
        (26, 'DEMO-L2-FIXED-0026', '0999000024', 2, 300, 12),
        (27, 'DEMO-L2-FIXED-0027', '0999000025', 3, 220, 12),
        (28, 'DEMO-L2-FIXED-0028', '0999000026', 1, 250, 12),
        (29, 'DEMO-L2-FIXED-0029', '0999000027', 2, 270, 12),
        (30, 'DEMO-L2-FIXED-0030', '0999000028', 3, 290, 12)
    ) AS mau(so_thu_tu, serial_no, phone, product_id, so_ngay_tu_ngay_mua, warranty_months)
    JOIN customer kh ON kh.phone = mau.phone
)
INSERT INTO device (customer_id, product_id, serial_no, purchase_date, warranty_months)
SELECT
    customer_id, product_id, serial_no,
    CURRENT_DATE - so_ngay_tu_ngay_mua,
    warranty_months
FROM du_lieu_co_dinh
ON CONFLICT (serial_no) DO NOTHING;

-- Nhom tu sinh: 1.000 thiet bi co cung product, thoi han va tuoi bao hanh.
WITH mau AS (
    SELECT so_thu_tu
    FROM generate_series(1, 1000) AS du_lieu(so_thu_tu)
), du_lieu AS (
    SELECT
        mau.so_thu_tu,
        kh.customer_id,
        'DEMO-L2-DEVICE-' || LPAD((mau.so_thu_tu + 22)::TEXT, 4, '0') AS serial_no,
        12 AS warranty_months
    FROM mau
    JOIN customer kh
      ON kh.email = 'tu_dong' || LPAD(mau.so_thu_tu::TEXT, 4, '0') || '@example.test'
)
INSERT INTO device (customer_id, product_id, serial_no, purchase_date, warranty_months)
SELECT
    customer_id,
    1,
    serial_no,
    CURRENT_DATE - 30,
    warranty_months
FROM du_lieu
ORDER BY so_thu_tu
ON CONFLICT (serial_no) DO NOTHING;
