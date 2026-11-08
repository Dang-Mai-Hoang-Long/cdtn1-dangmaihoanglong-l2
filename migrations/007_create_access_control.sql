CREATE TABLE IF NOT EXISTS service_center (
    center_id BIGINT PRIMARY KEY,
    center_name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO service_center (center_id, center_name)
VALUES (0, 'Trung tâm A'), (1, 'Trung tâm B')
ON CONFLICT (center_id) DO NOTHING;

-- Giữ các center_id khác đã có trong dữ liệu hiện hữu để migration không làm mất phiếu.
INSERT INTO service_center (center_id, center_name)
SELECT DISTINCT t.center_id, 'Trung tâm ' || t.center_id::TEXT
FROM ticket t
ON CONFLICT (center_id) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_ticket_center'
          AND conrelid = 'ticket'::regclass
    ) THEN
        ALTER TABLE ticket
            ADD CONSTRAINT fk_ticket_center
            FOREIGN KEY (center_id) REFERENCES service_center(center_id);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS app_user (
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(200) NOT NULL,
    role VARCHAR(40) NOT NULL,
    center_id BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_app_user_center FOREIGN KEY (center_id)
        REFERENCES service_center(center_id),
    CONSTRAINT chk_app_user_role CHECK (
        role IN ('NHAN_VIEN_TIEP_NHAN', 'QUAN_LY')
    ),
    CONSTRAINT chk_app_user_center_by_role CHECK (
        (role = 'NHAN_VIEN_TIEP_NHAN' AND center_id IS NOT NULL)
        OR (role = 'QUAN_LY' AND center_id IS NULL)
    )
);

CREATE TABLE IF NOT EXISTS app_session (
    session_hash CHAR(64) PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_app_session_user
    ON app_session(user_id);

CREATE INDEX IF NOT EXISTS idx_app_session_expiry
    ON app_session(expires_at);
