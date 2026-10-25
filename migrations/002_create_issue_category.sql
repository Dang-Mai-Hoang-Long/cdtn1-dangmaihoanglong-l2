CREATE TABLE IF NOT EXISTS issue_category (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(60) NOT NULL UNIQUE,
    default_priority VARCHAR(10) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_issue_category_priority CHECK (
        default_priority IN ('CAO', 'TRUNG_BINH', 'THAP')
    )
);
