CREATE TABLE IF NOT EXISTS customer (
    customer_id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(120),
    address VARCHAR(255),
    segment VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_customer_segment CHECK (
        segment IS NULL OR segment IN ('VIP', 'THUONG_XUYEN', 'MOI', 'NGU_DONG')
    )
);
