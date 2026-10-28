-- Nhom co dinh co day du cac moc trang thai; nhom tu sinh co log khoi tao MOI.
-- Tong log mau la 1.078 dong, khong vuot gioi han 1.500 dong.
WITH phieu_mau AS (
    SELECT
        ticket_id,
        received_at,
        status,
        CASE status
            WHEN 'MOI' THEN 0
            WHEN 'DA_PHAN_CONG' THEN 1
            WHEN 'DANG_XU_LY' THEN 2
            WHEN 'CHO_LINH_KIEN' THEN 3
            WHEN 'HOAN_TAT' THEN 4
            ELSE 5
        END AS cap_trang_thai
    FROM ticket
    WHERE ticket_id BETWEEN 1 AND 1020
), moc_trang_thai AS (
    SELECT *
    FROM (VALUES
        (0, CAST(NULL AS VARCHAR), CAST('MOI' AS VARCHAR)),
        (1, CAST('MOI' AS VARCHAR), CAST('DA_PHAN_CONG' AS VARCHAR)),
        (2, CAST('DA_PHAN_CONG' AS VARCHAR), CAST('DANG_XU_LY' AS VARCHAR)),
        (3, CAST('DANG_XU_LY' AS VARCHAR), CAST('CHO_LINH_KIEN' AS VARCHAR)),
        (4, CAST('CHO_LINH_KIEN' AS VARCHAR), CAST('HOAN_TAT' AS VARCHAR)),
        (5, CAST('HOAN_TAT' AS VARCHAR), CAST('DA_DONG' AS VARCHAR))
    ) AS moc(thu_tu, trang_thai_truoc, trang_thai_sau)
), cac_su_kien AS (
    SELECT
        phieu_mau.ticket_id,
        phieu_mau.received_at + moc.thu_tu * INTERVAL '30 minutes' AS changed_at,
        moc.trang_thai_truoc AS from_status,
        moc.trang_thai_sau AS to_status
    FROM phieu_mau
    CROSS JOIN moc_trang_thai moc
    WHERE moc.thu_tu <= phieu_mau.cap_trang_thai
)
INSERT INTO ticket_status_log (
    ticket_id, from_status, to_status, changed_at, changed_by, note
)
SELECT
    ticket_id,
    from_status,
    to_status,
    changed_at,
    0,
    'Dữ liệu mẫu L2.'
FROM cac_su_kien su
WHERE NOT EXISTS (
    SELECT 1
    FROM ticket_status_log da_co
    WHERE da_co.ticket_id = su.ticket_id
      AND da_co.from_status IS NOT DISTINCT FROM su.from_status
      AND da_co.to_status = su.to_status
      AND da_co.changed_at = su.changed_at
      AND da_co.note = 'Dữ liệu mẫu L2.'
)
ORDER BY su.ticket_id, su.changed_at;
