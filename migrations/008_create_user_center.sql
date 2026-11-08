CREATE TABLE IF NOT EXISTS user_center (
    user_id BIGINT NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    center_id BIGINT NOT NULL REFERENCES service_center(center_id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, center_id)
);

CREATE INDEX IF NOT EXISTS idx_user_center_center
    ON user_center(center_id, user_id);

-- Preserve existing manager access by assigning each existing manager
-- to every service center known when this migration is applied.
INSERT INTO user_center (user_id, center_id)
SELECT u.user_id, sc.center_id
FROM app_user u
CROSS JOIN service_center sc
WHERE u.role = 'QUAN_LY'
ON CONFLICT (user_id, center_id) DO NOTHING;
