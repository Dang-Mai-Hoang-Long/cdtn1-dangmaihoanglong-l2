CREATE INDEX IF NOT EXISTS idx_customer_phone
    ON customer(phone);

CREATE INDEX IF NOT EXISTS idx_ticket_status_due
    ON ticket(status, due_date);

CREATE INDEX IF NOT EXISTS idx_ticket_status_log_ticket
    ON ticket_status_log(ticket_id);
