export default class TicketRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async list() {
    const { rows } = await this.pool.query(`
      SELECT
        t.ticket_id AS "ticketId",
        t.ticket_code AS "ticketCode",
        c.full_name AS "customerName",
        d.serial_no AS "serialNo",
        t.status,
        t.priority,
        ic.category_name AS "categoryName",
        t.issue_desc AS "issueDescription",
        t.received_at AS "receivedAt",
        t.due_date AS "dueDate"
      FROM ticket t
      JOIN customer c ON c.customer_id = t.customer_id
      JOIN device d ON d.device_id = t.device_id
      LEFT JOIN issue_category ic ON ic.category_id = t.category_id
      ORDER BY t.received_at DESC, t.ticket_id DESC
    `);

    return rows;
  }
}
