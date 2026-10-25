CREATE TABLE IF NOT EXISTS ticket (
    ticket_id BIGSERIAL PRIMARY KEY,
    ticket_code VARCHAR(20) NOT NULL UNIQUE,
    customer_id BIGINT NOT NULL,
    device_id BIGINT NOT NULL,
    center_id BIGINT NOT NULL,
    issue_desc TEXT NOT NULL,
    category_id INT,
    priority VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'MOI',
    received_at TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    closed_at TIMESTAMP,
    is_warranty BOOLEAN NOT NULL,
    CONSTRAINT fk_ticket_customer FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),
    CONSTRAINT fk_ticket_device FOREIGN KEY (device_id)
        REFERENCES device(device_id),
    CONSTRAINT fk_ticket_category FOREIGN KEY (category_id)
        REFERENCES issue_category(category_id),
    CONSTRAINT chk_ticket_priority CHECK (
        priority IN ('CAO', 'TRUNG_BINH', 'THAP')
    ),
    CONSTRAINT chk_ticket_status CHECK (
        status IN (
            'MOI', 'DA_PHAN_CONG', 'DANG_XU_LY', 'CHO_LINH_KIEN',
            'HOAN_TAT', 'DA_DONG', 'DA_HUY'
        )
    )
);
