CREATE TABLE IF NOT EXISTS device (
    device_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    serial_no VARCHAR(50) NOT NULL UNIQUE,
    purchase_date DATE,
    warranty_months SMALLINT NOT NULL DEFAULT 12,
    CONSTRAINT fk_device_customer FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),
    CONSTRAINT chk_device_warranty_months CHECK (warranty_months > 0)
);
