export default class KhoKhachHang {
  constructor(boKetNoi) {
    this.boKetNoi = boKetNoi;
  }

  async timTheoSoDienThoai(soDienThoai) {
    const { rows } = await this.boKetNoi.query(
      `
      SELECT customer_id, full_name, phone, address
      FROM customer WHERE phone = $1
    `,
      [soDienThoai],
    );
    return rows[0] || null;
  }

  async tonTai(maKhachHang) {
    const { rows } = await this.boKetNoi.query(
      "SELECT customer_id FROM customer WHERE customer_id = $1",
      [maKhachHang],
    );
    return Boolean(rows[0]);
  }
}
