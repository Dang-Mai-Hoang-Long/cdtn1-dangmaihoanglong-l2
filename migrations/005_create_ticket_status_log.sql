CREATE TABLE IF NOT EXISTS ticket_status_log (
    log_id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_at TIMESTAMP NOT NULL,
    changed_by BIGINT NOT NULL,
    note VARCHAR(255),
    CONSTRAINT fk_status_log_ticket FOREIGN KEY (ticket_id)
        REFERENCES ticket(ticket_id),
    CONSTRAINT chk_status_log_to_status CHECK (
        to_status IN (
            'MOI', 'DA_PHAN_CONG', 'DANG_XU_LY', 'CHO_LINH_KIEN',
            'HOAN_TAT', 'DA_DONG', 'DA_HUY'
        )
    )
);
