-- =========================================
-- SMART CRM - MEKONG MOBILE
-- L2: TIẾP NHẬN VÀ PHÂN LOẠI YÊU CẦU BẢO HÀNH
-- PostgreSQL DDL SKELETON
-- =========================================


-- =========================================
-- 1. CUSTOMER
-- =========================================

CREATE TABLE customer (
    customer_id     BIGSERIAL PRIMARY KEY,
    full_name       VARCHAR(120) NOT NULL,
    phone           VARCHAR(20) NOT NULL UNIQUE,
    email           VARCHAR(120),
    address         VARCHAR(255),
    segment         VARCHAR(20),
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_customer_segment
        CHECK (
            segment IS NULL
            OR segment IN (
                'VIP',
                'THUONG_XUYEN',
                'MOI',
                'NGU_DONG'
            )
        )
);


-- =========================================
-- 2. DEVICE
-- =========================================

CREATE TABLE device (
    device_id        BIGSERIAL PRIMARY KEY,
    customer_id      BIGINT NOT NULL,
    product_id       BIGINT NOT NULL,
    serial_no        VARCHAR(50) NOT NULL UNIQUE,
    purchase_date    DATE,
    warranty_months  SMALLINT NOT NULL DEFAULT 12,

    CONSTRAINT fk_device_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT chk_device_warranty_months
        CHECK (warranty_months > 0)
);


-- =========================================
-- 3. ISSUE CATEGORY
-- =========================================

CREATE TABLE issue_category (
    category_id       SERIAL PRIMARY KEY,
    category_name     VARCHAR(60) NOT NULL UNIQUE,
    default_priority  VARCHAR(10) NOT NULL,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_issue_category_priority
        CHECK (
            default_priority IN (
                'CAO',
                'TRUNG_BINH',
                'THAP'
            )
        )
);


-- =========================================
-- 4. TICKET
-- =========================================

CREATE TABLE ticket (
    ticket_id       BIGSERIAL PRIMARY KEY,
    ticket_code     VARCHAR(20) NOT NULL UNIQUE,

    customer_id     BIGINT NOT NULL,
    device_id       BIGINT NOT NULL,
    center_id       BIGINT NOT NULL,

    issue_desc      TEXT NOT NULL,
    category_id     INT,

    priority        VARCHAR(10) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'MOI',

    technician_id   BIGINT,

    received_at     TIMESTAMP NOT NULL,
    due_date        TIMESTAMP NOT NULL,
    closed_at       TIMESTAMP,

    is_warranty     BOOLEAN NOT NULL,

    CONSTRAINT fk_ticket_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(customer_id),

    CONSTRAINT fk_ticket_device
        FOREIGN KEY (device_id)
        REFERENCES device(device_id),

    CONSTRAINT fk_ticket_category
        FOREIGN KEY (category_id)
        REFERENCES issue_category(category_id),

    CONSTRAINT chk_ticket_priority
        CHECK (
            priority IN (
                'CAO',
                'TRUNG_BINH',
                'THAP'
            )
        ),

    CONSTRAINT chk_ticket_status
        CHECK (
            status IN (
                'MOI',
                'DA_PHAN_CONG',
                'DANG_XU_LY',
                'CHO_LINH_KIEN',
                'HOAN_TAT',
                'DA_DONG',
                'DA_HUY'
            )
        )
);


-- =========================================
-- 5. TICKET STATUS LOG
-- =========================================

CREATE TABLE ticket_status_log (
    log_id        BIGSERIAL PRIMARY KEY,

    ticket_id     BIGINT NOT NULL,

    from_status   VARCHAR(20),
    to_status     VARCHAR(20) NOT NULL,

    changed_at    TIMESTAMP NOT NULL,
    changed_by    BIGINT NOT NULL,

    note          VARCHAR(255),

    CONSTRAINT fk_status_log_ticket
        FOREIGN KEY (ticket_id)
        REFERENCES ticket(ticket_id),

    CONSTRAINT chk_status_log_to_status
        CHECK (
            to_status IN (
                'MOI',
                'DA_PHAN_CONG',
                'DANG_XU_LY',
                'CHO_LINH_KIEN',
                'HOAN_TAT',
                'DA_DONG',
                'DA_HUY'
            )
        )
);

-- Tra cứu khách hàng theo số điện thoại
CREATE INDEX idx_customer_phone
    ON customer(phone);


-- Xem danh sách phiếu theo trạng thái và hạn cam kết
CREATE INDEX idx_ticket_status_due
    ON ticket(status, due_date);


-- Tra cứu lịch sử trạng thái của một phiếu
CREATE INDEX idx_ticket_status_log_ticket
    ON ticket_status_log(ticket_id);
