-- Danh muc su co co dinh theo BT1; seed moi khong can ID tu co so du lieu cu.
INSERT INTO issue_category (category_name, default_priority, is_active)
VALUES
    ('Màn hình', 'CAO', TRUE),
    ('Pin', 'TRUNG_BINH', TRUE),
    ('Sạc', 'TRUNG_BINH', TRUE),
    ('Phần mềm', 'THAP', TRUE),
    ('Nước vào', 'CAO', TRUE),
    ('Khác', 'THAP', TRUE)
ON CONFLICT (category_name) DO NOTHING;
