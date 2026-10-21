export default class KhoPhieu {
  constructor(boKetNoi) {
    this.boKetNoi = boKetNoi;
  }

  async layDanhSach({ trangThai, trang = 1, kichThuoc = 20 } = {}) {
    const cacThamSoLoc = [];
    let dieuKienTrangThai = '';
    if (trangThai) {
      cacThamSoLoc.push(trangThai);
      dieuKienTrangThai = 'WHERE t.status = $1';
    }
    const ketQuaDem = await this.boKetNoi.query(`
      SELECT COUNT(*)::int AS total
      FROM ticket t
      ${dieuKienTrangThai}
    `, cacThamSoLoc);

    const viTriKichThuoc = cacThamSoLoc.length + 1;
    const viTriBatDau = cacThamSoLoc.length + 2;
    const cacThamSoDanhSach = [
      ...cacThamSoLoc,
      kichThuoc,
      (trang - 1) * kichThuoc
    ];

    const { rows: cacDong } = await this.boKetNoi.query(`
      SELECT
        t.ticket_id AS ticket_id,
        t.ticket_code AS ticket_code,
        t.customer_id AS customer_id,
        c.full_name AS customer_name,
        t.device_id AS device_id,
        d.serial_no AS serial_no,
        t.status,
        t.priority,
        ic.category_name AS category_name,
        t.received_at AS received_at,
        t.due_date AS due_date
      FROM ticket t
      JOIN customer c ON c.customer_id = t.customer_id
      JOIN device d ON d.device_id = t.device_id
      LEFT JOIN issue_category ic ON ic.category_id = t.category_id
      ${dieuKienTrangThai}
      ORDER BY t.received_at DESC, t.ticket_id DESC
      LIMIT $${viTriKichThuoc} OFFSET $${viTriBatDau}
    `, cacThamSoDanhSach);

    return {
      data: cacDong,
      page: trang,
      size: kichThuoc,
      total: ketQuaDem.rows[0].total
    };
  }
}
